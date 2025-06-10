'use client';

import { useReducer, useRef, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { PlayerState, PlayerAction, Track } from '@/types/music';

interface AudioContextWindow extends Window {
  webkitAudioContext?: typeof AudioContext;
}

const initialState: PlayerState = {
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  isMuted: false,
  pan: 0, // Center
  repeatMode: 'none',
  isShuffled: false,
  playlist: [],
  currentIndex: -1,
};

// Enable Web Audio API hanya untuk auto panning
const USE_WEB_AUDIO = true;

function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case 'PLAY_TRACK':
      const trackIndex = state.playlist.findIndex(track => track.id === action.payload.id);
      return {
        ...state,
        currentTrack: action.payload,
        isPlaying: true,
        currentIndex: trackIndex !== -1 ? trackIndex : state.currentIndex,
      };
    
    case 'PAUSE':
      return { ...state, isPlaying: false };
    
    case 'RESUME':
      return { ...state, isPlaying: true };
    
    case 'NEXT_TRACK':
      if (state.playlist.length === 0) return state;
      
      let nextIndex;
      if (state.isShuffled) {
        nextIndex = Math.floor(Math.random() * state.playlist.length);
      } else {
        nextIndex = (state.currentIndex + 1) % state.playlist.length;
      }
      
      return {
        ...state,
        currentTrack: state.playlist[nextIndex],
        currentIndex: nextIndex,
        currentTime: 0,
      };
    
    case 'PREVIOUS_TRACK':
      if (state.playlist.length === 0) return state;
      
      let prevIndex;
      if (state.currentTime > 3) {
        // If more than 3 seconds into the song, restart current track
        return { ...state, currentTime: 0 };
      } else {
        prevIndex = state.currentIndex === 0 
          ? state.playlist.length - 1 
          : state.currentIndex - 1;
      }
      
      return {
        ...state,
        currentTrack: state.playlist[prevIndex],
        currentIndex: prevIndex,
        currentTime: 0,
      };
    
    case 'SET_VOLUME':
      const newVolume = Math.max(0, Math.min(1, action.payload));
      return { 
        ...state, 
        volume: newVolume,
        // Auto unmute ketika volume dinaikkan dari 0, auto mute ketika volume 0
        isMuted: newVolume === 0 ? true : newVolume > 0 ? false : state.isMuted,
      };
    
    case 'TOGGLE_MUTE':
      return { ...state, isMuted: !state.isMuted };
    
    case 'SET_PAN':
      return { 
        ...state, 
        pan: Math.max(-1, Math.min(1, action.payload)) 
      };
    
    case 'SET_CURRENT_TIME':
      return { ...state, currentTime: action.payload };
    
    case 'SET_DURATION':
      return { ...state, duration: action.payload };
    
    case 'TOGGLE_REPEAT':
      const repeatModes: Array<'none' | 'one' | 'all'> = ['none', 'one', 'all'];
      const currentIndex = repeatModes.indexOf(state.repeatMode);
      const nextRepeatMode = repeatModes[(currentIndex + 1) % repeatModes.length];
      return { ...state, repeatMode: nextRepeatMode };
    
    case 'TOGGLE_SHUFFLE':
      return { ...state, isShuffled: !state.isShuffled };
    
    case 'SET_PLAYLIST':
      return { 
        ...state, 
        playlist: action.payload,
        currentIndex: action.payload.length > 0 ? 0 : -1,
      };
    
    default:
      return state;
  }
}

// Create Context
interface MusicPlayerContextType {
  state: PlayerState;
  playTrack: (track: Track) => void;
  togglePlayPause: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setPan: (pan: number) => void;
  seek: (time: number) => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  setPlaylist: (tracks: Track[]) => void;
  toggleWebAudio: () => Promise<boolean>;
  isWebAudioActive: () => boolean;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

// Provider Component
export function MusicPlayerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(playerReducer, initialState);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Web Audio API untuk stereo panning
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const pannerNodeRef = useRef<StereoPannerNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const isWebAudioActiveRef = useRef<boolean>(false);

  // Create ref untuk akses state terbaru di event handlers
  const stateRef = useRef(state);
  stateRef.current = state;

  // Initialize audio element dan Web Audio API (hanya sekali)
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = state.volume;
    
    // CRITICAL: Add crossorigin for Web Audio API CORS compatibility
    audioRef.current.crossOrigin = 'anonymous';
    console.log('🔒 Audio element created with crossorigin="anonymous" for Web Audio API');
    
    // Function untuk enable Web Audio API on-demand
    const enableWebAudio = async () => {
      if (!USE_WEB_AUDIO || !audioRef.current || isWebAudioActiveRef.current) {
        console.log('❌ Cannot enable Web Audio:', {
          USE_WEB_AUDIO,
          hasAudioRef: !!audioRef.current,
          alreadyActive: isWebAudioActiveRef.current
        });
        return false;
      }
      
      try {
        console.log('🔄 Enabling Web Audio API for pan control...');
        
        // Create AudioContext jika belum ada
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as AudioContextWindow).webkitAudioContext)();
          console.log('✅ AudioContext created');
          
          // Store for debugging
          (window as unknown as Record<string, unknown>).webAudioContext = audioContextRef.current;
          
          // Store gain node for debugging too
          if (gainNodeRef.current) {
            (window as unknown as Record<string, unknown>).webAudioGainNode = gainNodeRef.current;
          }
        }
        
        const audioContext = audioContextRef.current;
        console.log('🎵 AudioContext state:', audioContext.state);
        
        // Resume context jika suspended - harus menunggu selesai
        if (audioContext.state === 'suspended') {
          console.log('🔄 Resuming suspended AudioContext...');
          await audioContext.resume();
          console.log('✅ AudioContext resumed, state:', audioContext.state);
        }
        
        // Pastikan AudioContext benar-benar running
        if (audioContext.state !== 'running') {
          console.log('⚠️ AudioContext not running:', audioContext.state);
          // Try manual resume
          await audioContext.resume();
          console.log('🔄 After manual resume, state:', audioContext.state);
        }
        
        // Create nodes jika belum ada
        if (!sourceNodeRef.current && audioRef.current) {
          console.log('🔧 Creating Web Audio nodes...');
          
          // Wait for audio to be ready
          if (audioRef.current.readyState < 2) {
            console.log('⏳ Audio not ready, readyState:', audioRef.current.readyState);
            audioRef.current.addEventListener('canplay', () => {
              console.log('✅ Audio ready, retrying Web Audio setup...');
              enableWebAudio();
            }, { once: true });
            return false;
          }
          
          // Log audio element state
          console.log('🎵 Audio element state:', {
            readyState: audioRef.current.readyState,
            paused: audioRef.current.paused,
            volume: audioRef.current.volume,
            currentTime: audioRef.current.currentTime,
            duration: audioRef.current.duration,
            src: audioRef.current.src.substring(0, 50) + '...'
          });
          
          // IMPORTANT: createMediaElementSource can only be called once per audio element
          // If it fails, the audio element becomes "tainted" and unusable
          try {
            // Check if we already have a source node for this audio element
            if (sourceNodeRef.current) {
              console.log('⚠️ MediaElementSource already exists, reusing...');
            } else {
              sourceNodeRef.current = audioContext.createMediaElementSource(audioRef.current);
              console.log('✅ MediaElementSource created successfully');
              
              // IMPORTANT: Once MediaElementSource is created, ALL audio must go through Web Audio
              console.log('⚠️ Audio element is now routed through Web Audio - standard playback disabled');
            }
          } catch (error) {
            console.log('❌ Failed to create MediaElementSource:', error);
            console.log('This usually means the audio element is already connected to Web Audio');
            
            // Check if this is a CORS error
            if (error instanceof DOMException && error.message.includes('CORS')) {
              console.log('🚨 CORS Error detected - Cloudinary audio not accessible for Web Audio API');
              console.log('🔄 Falling back to visual-only panning...');
              throw new Error('CORS_ERROR');
            }
            
            // If we get here, audio element might already be connected somewhere
            // Try to use existing source if available
            if (sourceNodeRef.current) {
              console.log('🔄 Using existing MediaElementSource...');
            } else {
              throw error;
            }
          }
          
          pannerNodeRef.current = audioContext.createStereoPanner();
          gainNodeRef.current = audioContext.createGain();
          
          // Connect nodes with error handling
          try {
            sourceNodeRef.current.connect(pannerNodeRef.current);
            console.log('✅ Source -> Panner connected');
            
            pannerNodeRef.current.connect(gainNodeRef.current);
            console.log('✅ Panner -> Gain connected');
            
            gainNodeRef.current.connect(audioContext.destination);
            console.log('✅ Gain -> Destination connected');
            
            console.log('🔗 All nodes connected successfully');
          } catch (connectionError) {
            console.log('❌ Node connection failed:', connectionError);
            throw connectionError;
          }
          
          // Set initial values with debugging
          pannerNodeRef.current.pan.value = state.pan;
          
          // CRITICAL: Make sure gain is not 0
          const targetGain = state.isMuted ? 0 : Math.max(state.volume, 0.1); // Minimum 0.1 for testing
          gainNodeRef.current.gain.value = targetGain;
          
          console.log('🎛️ Initial values set - pan:', state.pan, 'target volume:', targetGain);
          console.log('🔊 GainNode actual value:', gainNodeRef.current.gain.value);
          
          // Force gain to be audible for testing
          if (gainNodeRef.current.gain.value < 0.1) {
            console.log('⚠️ Gain too low, forcing to 0.5 for testing...');
            gainNodeRef.current.gain.value = 0.5;
          }
          
          // Test koneksi dengan membuat test tone sesaat
          console.log('🔊 Testing audio path...');
          
          // Pastikan audio element masih bisa diputar
          if (audioRef.current.paused && stateRef.current.isPlaying) {
            console.log('🔄 Audio was paused, restarting...');
            audioRef.current.play().catch(err => {
              console.log('❌ Failed to restart audio:', err);
            });
          }
          
          // Switch to Web Audio control
          audioRef.current.volume = 1;
          isWebAudioActiveRef.current = true;
          
          // Test audio destination connection
          console.log('🔍 Testing audio destination connection...');
          console.log('AudioContext destination:', {
            maxChannelCount: audioContext.destination.maxChannelCount,
            channelCount: audioContext.destination.channelCount,
            channelCountMode: audioContext.destination.channelCountMode,
            channelInterpretation: audioContext.destination.channelInterpretation
          });
          
          // Verify connection chain
          console.log('🔗 Verifying connection chain...');
          console.log('Source -> Panner -> Gain -> Destination');
          console.log('Source connected:', !!sourceNodeRef.current);
          console.log('Panner connected:', !!pannerNodeRef.current);
          console.log('Gain connected:', !!gainNodeRef.current);
          
          // Log final state
          console.log('✅ Web Audio API enabled successfully');
          console.log('🔍 Final state check:', {
            audioContextState: audioContext.state,
            audioElementVolume: audioRef.current.volume,
            gainNodeValue: gainNodeRef.current.gain.value,
            panNodeValue: pannerNodeRef.current.pan.value,
            audioPlaying: !audioRef.current.paused,
            audioCurrentTime: audioRef.current.currentTime,
            audioSrc: audioRef.current.src ? 'present' : 'missing'
          });
          
          // Critical: Ensure AudioContext is really running and connected
          if (audioContext.state !== 'running') {
            console.log('⚠️ AudioContext not running, forcing resume...');
            await audioContext.resume();
            console.log('🔄 After forced resume:', audioContext.state);
          }
          
          // CRITICAL FIX: Force audio to flow through Web Audio graph
          if (audioRef.current && stateRef.current.isPlaying) {
            console.log('🔄 Forcing audio through Web Audio graph...');
            const currentTime = audioRef.current.currentTime;
            const isPlaying = !audioRef.current.paused;
            
            console.log('📊 Before restart state:', {
              currentTime,
              paused: audioRef.current.paused,
              volume: audioRef.current.volume,
              readyState: audioRef.current.readyState,
              src: audioRef.current.src ? 'present' : 'missing'
            });
            
            // Method 1: Complete pause and reload
            audioRef.current.pause();
            audioRef.current.load(); // Force reload the audio
            
            setTimeout(() => {
              if (audioRef.current) {
                console.log('🔄 Setting time and playing...');
                audioRef.current.currentTime = currentTime;
                
                if (isPlaying) {
                  audioRef.current.play().then(() => {
                    console.log('✅ Audio restarted after load() - checking if audible...');
                    
                    // Check if audio is flowing through Web Audio
                    setTimeout(() => {
                      console.log('📊 After restart state:', {
                        currentTime: audioRef.current?.currentTime,
                        paused: audioRef.current?.paused,
                        volume: audioRef.current?.volume,
                        gainValue: gainNodeRef.current?.gain.value,
                        panValue: pannerNodeRef.current?.pan.value
                      });
                    }, 500);
                    
                  }).catch(err => {
                    console.log('❌ Failed to restart audio after load:', err);
                  });
                }
              }
            }, 200); // Give more time for load
          }
          
          // Test if audio is actually flowing by checking if audio is playing
          setTimeout(() => {
            if (audioRef.current) {
              console.log('🎵 Audio element final check:', {
                paused: audioRef.current.paused,
                currentTime: audioRef.current.currentTime,
                volume: audioRef.current.volume,
                readyState: audioRef.current.readyState,
                duration: audioRef.current.duration,
                networkState: audioRef.current.networkState
              });
              
              if (gainNodeRef.current && pannerNodeRef.current && sourceNodeRef.current) {
                console.log('🔊 Web Audio nodes final check:', {
                  gainValue: gainNodeRef.current.gain.value,
                  panValue: pannerNodeRef.current.pan.value,
                  sourceConnected: !!sourceNodeRef.current,
                  audioContextState: audioContextRef.current?.state
                });
                
                // Test if audio is time-progressing (indicates audio is playing through source)
                const initialTime = audioRef.current.currentTime;
                setTimeout(() => {
                  const newTime = audioRef.current?.currentTime || 0;
                  const isProgressing = newTime > initialTime;
                  console.log('🕒 Audio time progression test:', {
                    initialTime,
                    newTime,
                    progressing: isProgressing,
                    difference: newTime - initialTime
                  });
                  
                  if (isProgressing) {
                    console.log('✅ Audio is flowing through MediaElementSource!');
                  } else {
                    console.log('❌ Audio is NOT flowing - MediaElementSource issue');
                  }
                }, 500);
              }
              
              // Final test: Check if we can hear the music
              console.log('🔊 If you can hear music now, Web Audio pan is working!');
            }
          }, 1000);
          
          return true;
        } else if (sourceNodeRef.current) {
          // Nodes already exist, just activate
          isWebAudioActiveRef.current = true;
          audioRef.current.volume = 1;
          console.log('✅ Web Audio nodes already exist, activated');
          return true;
        }
        
      } catch (error) {
        console.log('❌ Failed to enable Web Audio API:', error);
        
        // Handle CORS error specifically
        if (error instanceof Error && error.message === 'CORS_ERROR') {
          console.log('🚨 CORS issue: Audio panning will be visual-only');
          console.log('💡 To fix: Cloudinary needs proper CORS headers for Web Audio API');
          return false;
        }
        
        console.log('💡 Web Audio API not available, continuing with visual effects only');
        return false;
      }
    };
    
    // Function untuk disable Web Audio API
    const disableWebAudio = () => {
      if (!isWebAudioActiveRef.current) {
        console.log('🔇 Web Audio already disabled');
        return;
      }
      
      try {
        console.log('🔇 Disabling Web Audio API, back to standard audio...');
        
        // Save current playback state
        const currentTime = audioRef.current?.currentTime || 0;
        const isPlaying = audioRef.current ? !audioRef.current.paused : false;
        const currentSrc = audioRef.current?.src || '';
        
        console.log('💾 Saving current state:', {
          currentTime,
          isPlaying,
          src: currentSrc ? 'present' : 'missing'
        });
        
        // Disconnect nodes but keep them for reuse - hati-hati dengan urutan
        try {
          if (gainNodeRef.current) {
            gainNodeRef.current.disconnect();
            console.log('🔌 GainNode disconnected');
          }
          if (pannerNodeRef.current) {
            pannerNodeRef.current.disconnect();
            console.log('🔌 PannerNode disconnected');
          }
          if (sourceNodeRef.current) {
            sourceNodeRef.current.disconnect();
            console.log('🔌 SourceNode disconnected');
          }
        } catch (disconnectError) {
          console.log('⚠️ Error disconnecting nodes (not critical):', disconnectError);
        }
        
        isWebAudioActiveRef.current = false;
        
        // CRITICAL: Recreate audio element to break Web Audio connection
        if (audioRef.current) {
          console.log('🔄 Recreating audio element to restore standard playback...');
          
          // Remove old audio element
          const oldAudio = audioRef.current;
          oldAudio.pause();
          
          // Create new audio element
          audioRef.current = new Audio();
          audioRef.current.crossOrigin = 'anonymous';
          audioRef.current.volume = stateRef.current.isMuted ? 0 : stateRef.current.volume;
          
          // Re-register event listeners for new audio element
          const newAudio = audioRef.current;
          
          const handleLoadedMetadata = () => {
            dispatch({ type: 'SET_DURATION', payload: newAudio.duration });
          };
          
          const handleEnded = () => {
            const currentState = stateRef.current;
            if (currentState.repeatMode === 'one') {
              newAudio.currentTime = 0;
              newAudio.play();
            } else if (currentState.repeatMode === 'all' || currentState.currentIndex < currentState.playlist.length - 1) {
              dispatch({ type: 'NEXT_TRACK' });
            } else {
              dispatch({ type: 'PAUSE' });
            }
          };
          
          newAudio.addEventListener('loadedmetadata', handleLoadedMetadata);
          newAudio.addEventListener('ended', handleEnded);
          
          // Store event handlers for cleanup
          (newAudio as HTMLAudioElement & { handleLoadedMetadata?: () => void; handleEnded?: () => void }).handleLoadedMetadata = handleLoadedMetadata;
          (newAudio as HTMLAudioElement & { handleLoadedMetadata?: () => void; handleEnded?: () => void }).handleEnded = handleEnded;
          
          // Re-attach Web Audio functions to new audio element
          (newAudio as HTMLAudioElement & { enableWebAudio?: () => Promise<boolean | undefined>; disableWebAudio?: () => void }).enableWebAudio = enableWebAudio;
          (newAudio as HTMLAudioElement & { enableWebAudio?: () => Promise<boolean | undefined>; disableWebAudio?: () => void }).disableWebAudio = disableWebAudio;
          
          console.log('🔗 Event listeners and Web Audio functions re-attached to new audio element');
          
          // Restore source and state
          if (currentSrc) {
            audioRef.current.src = currentSrc;
            audioRef.current.load();
            
            // Wait for audio to be ready, then restore playback
            audioRef.current.addEventListener('canplay', () => {
              if (audioRef.current) {
                audioRef.current.currentTime = currentTime;
                
                if (isPlaying) {
                  console.log('▶️ Resuming playback with standard audio...');
                  audioRef.current.play().then(() => {
                    console.log('✅ Standard audio playback restored successfully');
                  }).catch(err => {
                    console.log('❌ Failed to resume standard audio playback:', err);
                  });
                }
              }
            }, { once: true });
          }
          
          console.log('🔊 Audio volume reset to:', audioRef.current.volume);
        }
        
        // Clear Web Audio nodes references (they're now disconnected)
        sourceNodeRef.current = null;
        
        console.log('✅ Web Audio API disabled, using standard audio');
        
      } catch (error) {
        console.log('❌ Error disabling Web Audio API:', error);
        // Force disable anyway
        isWebAudioActiveRef.current = false;
        if (audioRef.current) {
          audioRef.current.volume = stateRef.current.isMuted ? 0 : stateRef.current.volume;
        }
      }
    };
    
    // Store references
    (audioRef.current as HTMLAudioElement & { enableWebAudio?: () => Promise<boolean | undefined>; disableWebAudio?: () => void }).enableWebAudio = enableWebAudio;
    (audioRef.current as HTMLAudioElement & { enableWebAudio?: () => Promise<boolean | undefined>; disableWebAudio?: () => void }).disableWebAudio = disableWebAudio;
    
    const audio = audioRef.current;
    
    const handleLoadedMetadata = () => {
      dispatch({ type: 'SET_DURATION', payload: audio.duration });
    };
    
    const handleEnded = () => {
      const currentState = stateRef.current;
      if (currentState.repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else if (currentState.repeatMode === 'all' || currentState.currentIndex < currentState.playlist.length - 1) {
        dispatch({ type: 'NEXT_TRACK' });
      } else {
        dispatch({ type: 'PAUSE' });
      }
    };
    
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      audio.src = '';
      
      // Cleanup Web Audio API
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []); // Hapus dependencies agar audio element tidak ter-recreate

  // Update audio source when track changes
  useEffect(() => {
    if (audioRef.current && state.currentTrack) {
      audioRef.current.src = state.currentTrack.url;
      audioRef.current.load();
    }
  }, [state.currentTrack]);

  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current) return;
    
    if (state.isPlaying && state.currentTrack) {
      // Resume AudioContext jika Web Audio aktif dan suspended
      if (isWebAudioActiveRef.current && audioContextRef.current?.state === 'suspended') {
        console.log('Resuming AudioContext...');
        audioContextRef.current.resume().then(() => {
          console.log('AudioContext resumed successfully');
        }).catch((error) => {
          console.log('Failed to resume AudioContext:', error);
        });
      }
      
      audioRef.current.play().catch((error) => {
        console.log('Audio play failed:', error);
      });
      
      // Start progress tracking with more frequent updates
      progressIntervalRef.current = setInterval(() => {
        if (audioRef.current) {
          dispatch({ 
            type: 'SET_CURRENT_TIME', 
            payload: audioRef.current.currentTime 
          });
        }
      }, 100); // Update every 100ms for smooth progress
    } else {
      audioRef.current.pause();
      
      // Clear progress tracking
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }
    
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [state.isPlaying, state.currentTrack]);

  // Handle volume dan pan changes
  useEffect(() => {
    if (audioRef.current) {
      if (isWebAudioActiveRef.current && gainNodeRef.current) {
        // Jika Web Audio aktif, kontrol volume lewat GainNode
        try {
          gainNodeRef.current.gain.value = state.isMuted ? 0 : state.volume;
        } catch (error) {
          console.log('❌ Error updating volume via GainNode:', error);
          // Fallback to standard audio
          audioRef.current.volume = state.isMuted ? 0 : state.volume;
        }
      } else {
        // Standard HTML audio control
        audioRef.current.volume = state.isMuted ? 0 : state.volume;
      }
    }
    
    // Update pan hanya jika Web Audio aktif
    if (isWebAudioActiveRef.current && pannerNodeRef.current) {
      try {
        pannerNodeRef.current.pan.value = state.pan;
      } catch (error) {
        console.log('❌ Error updating pan:', error);
      }
    }
  }, [state.volume, state.isMuted, state.pan]);

  const playTrack = useCallback((track: Track) => {
    dispatch({ type: 'PLAY_TRACK', payload: track });
  }, []);

  const togglePlayPause = useCallback(() => {
    if (state.isPlaying) {
      dispatch({ type: 'PAUSE' });
    } else {
      dispatch({ type: 'RESUME' });
    }
  }, [state.isPlaying]);

  const nextTrack = useCallback(() => {
    dispatch({ type: 'NEXT_TRACK' });
  }, []);

  const previousTrack = useCallback(() => {
    dispatch({ type: 'PREVIOUS_TRACK' });
  }, []);

  const setVolume = useCallback((volume: number) => {
    dispatch({ type: 'SET_VOLUME', payload: volume });
  }, []);

  const toggleMute = useCallback(() => {
    dispatch({ type: 'TOGGLE_MUTE' });
  }, []);

  const setPan = useCallback((pan: number) => {
    dispatch({ type: 'SET_PAN', payload: pan });
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      dispatch({ type: 'SET_CURRENT_TIME', payload: time });
    }
  }, []);

  const toggleRepeat = useCallback(() => {
    dispatch({ type: 'TOGGLE_REPEAT' });
  }, []);

  const toggleShuffle = useCallback(() => {
    dispatch({ type: 'TOGGLE_SHUFFLE' });
  }, []);

  const setPlaylist = useCallback((tracks: Track[]) => {
    dispatch({ type: 'SET_PLAYLIST', payload: tracks });
  }, []);

  const toggleWebAudio = useCallback(async () => {
    if (!audioRef.current) return false;
    
    if (isWebAudioActiveRef.current) {
      (audioRef.current as HTMLAudioElement & { disableWebAudio?: () => void })?.disableWebAudio?.();
      return false;
    } else {
      return await (audioRef.current as HTMLAudioElement & { enableWebAudio?: () => Promise<boolean | undefined> })?.enableWebAudio?.() || false;
    }
  }, []);

  const isWebAudioActive = useCallback(() => {
    return isWebAudioActiveRef.current;
  }, []);

  const contextValue: MusicPlayerContextType = {
    state,
    playTrack,
    togglePlayPause,
    nextTrack,
    previousTrack,
    setVolume,
    toggleMute,
    setPan,
    seek,
    toggleRepeat,
    toggleShuffle,
    setPlaylist,
    toggleWebAudio,
    isWebAudioActive,
  };

  return (
    <MusicPlayerContext.Provider value={contextValue}>
      {children}
    </MusicPlayerContext.Provider>
  );
}

// Hook untuk menggunakan Context
export function useMusicPlayer() {
  const context = useContext(MusicPlayerContext);
  
  if (context === undefined) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }

  // Return state properties directly for easier access
  return {
    currentTrack: context.state.currentTrack,
    isPlaying: context.state.isPlaying,
    currentTime: context.state.currentTime,
    duration: context.state.duration,
    volume: context.state.volume,
    isMuted: context.state.isMuted,
    pan: context.state.pan,
    repeatMode: context.state.repeatMode,
    isShuffled: context.state.isShuffled,
    playlist: context.state.playlist,
    currentIndex: context.state.currentIndex,
    playTrack: context.playTrack,
    togglePlayPause: context.togglePlayPause,
    nextTrack: context.nextTrack,
    previousTrack: context.previousTrack,
    setVolume: context.setVolume,
    toggleMute: context.toggleMute,
    setPan: context.setPan,
    seek: context.seek,
    toggleRepeat: context.toggleRepeat,
    toggleShuffle: context.toggleShuffle,
    setPlaylist: context.setPlaylist,
    toggleWebAudio: context.toggleWebAudio,
    isWebAudioActive: context.isWebAudioActive,
  };
}