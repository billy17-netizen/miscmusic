'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  ArrowLeft, 
  Volume2,
  Heart,
  Share,
  Download,
  Repeat,
  FileText
} from 'lucide-react';
import { Track } from '@/types/music';
import { fetchTracksFromCloudinary, formatDuration } from '@/lib/cloudinary';
import { useMusicPlayer } from '@/lib/useMusicPlayer';

export default function TrackDetailPage() {
  const params = useParams();
  const router = useRouter();
  const trackId = params.id as string;
  
  const [track, setTrack] = useState<Track | null>(null);
  const [videoBackground, setVideoBackground] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoBuffering, setVideoBuffering] = useState(false);
  const [videoCanPlay, setVideoCanPlay] = useState(false);
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [lyricsType, setLyricsType] = useState<'text' | 'lrc' | 'json'>('text');
  const [showLyrics, setShowLyrics] = useState(false);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [parsedLyrics, setParsedLyrics] = useState<Array<{time: number, text: string}>>([]);
  const [activeLyricIndex, setActiveLyricIndex] = useState(-1);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const videoRetryCount = useRef<number>(0);
  
  // Visual Pan Simulation states
  const [visualPan, setVisualPan] = useState(0); // -1 to 1
  const [isAutoPanning, setIsAutoPanning] = useState(false);
  
  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlayPause,
    volume,
    setVolume,
    currentTime,
    duration,
    seek,
    repeatMode,
    toggleRepeat,
    isMuted,
    toggleMute,
    setPan,
    toggleWebAudio,
    isWebAudioActive
  } = useMusicPlayer();

  // Load track data
  useEffect(() => {
    const loadTrack = async () => {
      try {
        // Reset video states when loading new track
        setVideoBackground(null);
        setVideoLoaded(false);
        setVideoCanPlay(false);
        setVideoBuffering(false);
        videoRetryCount.current = 0;
        
        const tracks = await fetchTracksFromCloudinary();
        const foundTrack = tracks.find(t => t.id === trackId);
        
        if (foundTrack) {
          setTrack(foundTrack);
          // Load video background and lyrics
          await loadVideoBackground(foundTrack);
          await loadLyrics(foundTrack);
        } else {
          // Track not found, redirect back
          router.push('/');
        }
      } catch {
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    loadTrack();
  }, [trackId, router]);

  // Function untuk parse LRC format
  const parseLRCLyrics = (lrcContent: string) => {
    const lines = lrcContent.split('\n');
    const parsedLines: Array<{time: number, text: string}> = [];
    
    lines.forEach(line => {
      // Match format [mm:ss.xx]lyrics text
      const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2})\](.*)/);
      if (match) {
        const minutes = parseInt(match[1]);
        const seconds = parseInt(match[2]);
        const centiseconds = parseInt(match[3]);
        const text = match[4].trim();
        
        // Convert to total seconds
        const totalSeconds = minutes * 60 + seconds + centiseconds / 100;
        
        if (text) { // Only add non-empty lyrics
          parsedLines.push({
            time: totalSeconds,
            text: text
          });
        }
      }
    });
    
    // Sort by time
    return parsedLines.sort((a, b) => a.time - b.time);
  };

  // Function untuk find active lyric index berdasarkan currentTime
  const findActiveLyricIndex = (currentTime: number, lyrics: Array<{time: number, text: string}>) => {
    let activeIndex = -1;
    
    for (let i = 0; i < lyrics.length; i++) {
      if (currentTime >= lyrics[i].time) {
        activeIndex = i;
      } else {
        break;
      }
    }
    
    return activeIndex;
  };

  // Function untuk load lyrics
  const loadLyrics = async (trackData: Track) => {
    try {
      setLyricsLoading(true);
      
      const response = await fetch('/api/cloudinary/lyrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          trackName: trackData.title,
          trackId: trackData.id,
          filename: trackData.url.split('/').pop()?.split('.')[0]
        })
      });
      
      const data = await response.json();
      
      if (data.success && data.lyrics) {
        setLyrics(data.lyrics);
        setLyricsType(data.lyricsType);
        
        // Parse LRC format jika tersedia
        if (data.lyricsType === 'lrc') {
          const parsed = parseLRCLyrics(data.lyrics);
          setParsedLyrics(parsed);
        } else {
          setParsedLyrics([]);
        }
      }
    } catch {
      // No lyrics found, not a problem
    } finally {
      setLyricsLoading(false);
    }
  };

  // Function untuk load video background dengan fallback system
  const loadVideoBackground = async (trackData: Track) => {
    try {
      const response = await fetch('/api/cloudinary/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          trackName: trackData.title,
          trackId: trackData.id,
          filename: trackData.url.split('/').pop()?.split('.')[0]
        })
      });
      
      const data = await response.json();
      
      if (data.success && data.videoUrls) {
        // Reset state
        setVideoLoaded(false);
        setVideoCanPlay(false);
        setVideoBuffering(true);
        
        // Start with original video for best compatibility (no transformations)
        // If transformations cause 423 errors, this avoids the issue entirely
        const videoUrl = data.videoUrls.original || data.videoUrls.basic || data.videoUrls.hd || data.videoUrls.hd2k;
        setVideoBackground(videoUrl);
        
        // Preload video in background for smoother experience
        if (videoUrl) {
          const video = document.createElement('video');
          video.preload = 'metadata';
          video.src = videoUrl;
          video.onerror = (e) => {
            console.log('Preload failed, will fallback during main load:', e);
          };
          video.load(); // Start preloading
        }
      }
    } catch {
      // No video background, use gradient fallback
      setVideoBackground(null);
      setVideoLoaded(false);
      setVideoCanPlay(false);
      setVideoBuffering(false);
    }
  };

  // Function untuk generate gradient fallback
  const getGradientFallback = (track: Track) => {
    const colors = [
      ['#FF6B9D', '#C44AC0', '#8B5CF6'], // Pink to Purple
      ['#3B82F6', '#06B6D4', '#14B8A6'], // Blue to Teal
      ['#8B5CF6', '#EC4899', '#F59E0B'], // Purple to Yellow
      ['#10B981', '#059669', '#047857'], // Green variants
      ['#F59E0B', '#EF4444', '#DC2626'], // Orange to Red
      ['#6366F1', '#8B5CF6', '#EC4899'], // Indigo to Pink
    ];
    
    const colorIndex = track.title.length % colors.length;
    return colors[colorIndex];
  };

  // Calculate values for hooks (must be before conditional returns)
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isCurrentTrack = currentTrack?.id === track?.id;

  // Effect untuk synchronized lyrics highlighting dengan auto-scroll
  useEffect(() => {
    if (parsedLyrics.length > 0 && isCurrentTrack) {
      const newActiveIndex = findActiveLyricIndex(currentTime, parsedLyrics);
      
      // Always update active index
      if (newActiveIndex >= 0 && newActiveIndex !== activeLyricIndex) {
        setActiveLyricIndex(newActiveIndex);
      }
    }
  }, [currentTime, parsedLyrics, isCurrentTrack, activeLyricIndex]);
  
  // Separate effect untuk auto-scroll agar lebih reliable
  useEffect(() => {
    if (activeLyricIndex >= 0 && lyricsContainerRef.current && parsedLyrics.length > 0) {
      // Use setTimeout to ensure DOM is updated
      const timeoutId = setTimeout(() => {
        const container = lyricsContainerRef.current;
        if (!container) return;
        
        // Find the active element (account for the top padding div)
        const lyricElements = container.querySelectorAll('[data-lyric-index]');
        const activeElement = lyricElements[activeLyricIndex] as HTMLElement;
        
        if (activeElement) {
          // Simple scrollIntoView approach
          activeElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
        }
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [activeLyricIndex, parsedLyrics]);

  // Effect untuk sinkronisasi video dengan musik
  useEffect(() => {
    if (videoRef && isCurrentTrack && track) {
      // Sinkronkan waktu video dengan musik
      if (Math.abs(videoRef.currentTime - currentTime) > 1) {
        videoRef.currentTime = currentTime;
      }
      
      if (isPlaying) {
        videoRef.play().catch(() => {
          // Video gagal play, tidak masalah
        });
      } else {
        videoRef.pause();
      }
    } else if (videoRef && !isCurrentTrack) {
      // Jika bukan track yang sedang aktif, pause video
      videoRef.pause();
    }
  }, [isPlaying, isCurrentTrack, videoRef, track, currentTime]);

  // Cleanup effect - hanya untuk cleanup video, tidak pause music
  useEffect(() => {
    return () => {
      // Cleanup video saat component unmount
      if (videoRef) {
        videoRef.pause();
      }
    };
  }, [videoRef]);

  // Auto Pan Effect - Visual + Audio dengan Debug
  useEffect(() => {
    let panInterval: NodeJS.Timeout;
    
    if (isAutoPanning && isCurrentTrack && isPlaying) {
      // Enable Web Audio API untuk real audio panning (async)
      const enableWebAudioAsync = async () => {
        await toggleWebAudio();
      };
      
      enableWebAudioAsync();
      
      panInterval = setInterval(() => {
        const time = Date.now() / 1000;
        const baseFreq = 0.3; // Base frequency
        const musicSync = Math.sin(time * baseFreq) * 0.7; // Main wave
        const accent = Math.sin(time * baseFreq * 2) * 0.3; // Accent beat
        const newPanValue = Math.max(-1, Math.min(1, musicSync + accent));
        
        // Update visual pan
        setVisualPan(newPanValue);
        
        // Update real audio pan jika Web Audio aktif
        const isWebAudioCurrentlyActive = isWebAudioActive();
        if (isWebAudioCurrentlyActive) {
          setPan(newPanValue);
        }
      }, 50); // Update every 50ms for smooth animation
    } else if (!isAutoPanning) {
      // Reset to center dan disable Web Audio jika tidak auto panning
      setVisualPan(0);
      setPan(0);
      
      // Disable Web Audio jika aktif (back to standard audio)
      if (isWebAudioActive()) {
        toggleWebAudio();
      }
    }
    
    return () => {
      if (panInterval) clearInterval(panInterval);
    };
  }, [isAutoPanning, isCurrentTrack, isPlaying, toggleWebAudio, isWebAudioActive, setPan]);

  const handlePlay = () => {
    if (track) {
      if (currentTrack?.id === track.id) {
        togglePlayPause();
      } else {
        playTrack(track);
      }
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-neon-pink to-neon-blue rounded-full flex items-center justify-center"
          >
            <Play className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="font-kulture text-2xl font-bold text-white mb-2">Loading Track...</h2>
        </motion.div>
      </div>
    );
  }

  if (!track) {
    return null;
  }

  return (
    <div className="min-h-screen relative overflow-hidden pb-20">
      {/* Video Background */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-0"
        >
          {videoBackground ? (
            <video
              ref={setVideoRef}
              src={videoBackground}
              loop
              muted
              playsInline
              autoPlay
              preload="auto"
              className="w-full h-full object-cover transition-all duration-500"
              style={{
                imageRendering: '-webkit-optimize-contrast',
                filter: `contrast(1.1) saturate(1.2) ${
                  visualPan !== 0 ? `hue-rotate(${visualPan * 30}deg) brightness(${1 + Math.abs(visualPan) * 0.1})` : ''
                }`,
                opacity: videoCanPlay && !videoBuffering ? 1 : 0.3,
                transform: `translateX(${visualPan * 10}px) scale(${1 + Math.abs(visualPan) * 0.02})`,
              }}
              onLoadStart={() => {
                setVideoLoaded(false);
                setVideoCanPlay(false);
                setVideoBuffering(true);
              }}
              onLoadedData={() => {
                setVideoLoaded(true);
                if (videoRef && isCurrentTrack) {
                  videoRef.currentTime = currentTime;
                  if (isPlaying) {
                    videoRef.play().catch(() => {});
                  }
                }
              }}
              onCanPlay={() => {
                setVideoCanPlay(true);
                setVideoBuffering(false);
              }}
              onCanPlayThrough={() => {
                setVideoCanPlay(true);
                setVideoBuffering(false);
              }}
              onWaiting={() => {
                setVideoBuffering(true);
              }}
              onPlaying={() => {
                setVideoBuffering(false);
              }}
              onProgress={() => {
                // Check buffered amount to reduce buffering interruptions
                if (videoRef) {
                  const buffered = videoRef.buffered;
                  const currentTime = videoRef.currentTime;
                  
                  if (buffered.length > 0) {
                    const bufferedEnd = buffered.end(buffered.length - 1);
                    const bufferedAhead = bufferedEnd - currentTime;
                    
                    // If we have enough buffer, reduce buffering state
                    if (bufferedAhead > 3) { // 3 seconds ahead
                      setVideoBuffering(false);
                    }
                  }
                }
              }}
              onError={async (e) => {
                const target = e.target as HTMLVideoElement;
                const error = target.error;
                
                console.log('Video error:', error?.code, error?.message, 'URL:', videoBackground);
                
                setVideoLoaded(false);
                setVideoCanPlay(false);
                setVideoBuffering(false);
                
                // Handle HTTP 423 (Locked) error - typically quota/access issues
                // This error appears as MEDIA_ERR_SRC_NOT_SUPPORTED (error code 4)
                if (error?.code === 4 || (target.src && target.src.includes('423'))) {
                  console.log('Detected 423 Locked error or unsupported source, skipping transformations');
                  
                  // For 423 errors, immediately try original video without any transformations
                  if (videoBackground?.includes('vc_auto') || videoBackground?.includes('q_auto')) {
                    const originalUrl = videoBackground.replace(/\/upload\/[^\/]*\//, '/upload/');
                    console.log('Fallback to original due to 423:', originalUrl);
                    setVideoBackground(originalUrl);
                    return;
                  }
                  
                  // If original also fails, disable video
                  console.log('Original video also locked, using gradient fallback');
                  setVideoBackground(null);
                  videoRetryCount.current = 0;
                  return;
                }
                
                // Handle 416 error (Range Not Satisfiable) - try cache busting and raw video
                if (error?.code === 3) {
                  // First try cache busting for 416 errors
                  if (!videoBackground?.includes('?t=')) {
                    const cacheBustedUrl = videoBackground + '?t=' + Date.now();
                    console.log('Trying cache busted URL for 416 error:', cacheBustedUrl);
                    setVideoBackground(cacheBustedUrl);
                    return;
                  }
                  
                  // If cache busting doesn't work, try raw video
                  const rawVideoUrl = videoBackground?.replace(/\/upload\/[^\/]*\//, '/upload/').replace(/\?t=\d+/, '');
                  if (rawVideoUrl && !rawVideoUrl.includes('vc_auto')) {
                    console.log('Trying raw video URL due to 416 error:', rawVideoUrl);
                    setVideoBackground(rawVideoUrl);
                    return;
                  }
                }
                
                // Progressive fallback: 2K -> HD -> Basic -> Raw -> None
                if (videoBackground?.includes('w_2560,h_1440')) {
                  // Fallback dari 2K ke HD
                  const hdUrl = videoBackground.replace(/vc_auto,q_auto,w_2560,h_1440,c_scale,br_2000k-8000k\//, 'vc_auto,q_auto,w_1920,h_1080,c_scale/');
                  console.log('Fallback to HD:', hdUrl);
                  setVideoBackground(hdUrl);
                } else if (videoBackground?.includes('w_1920,h_1080')) {
                  // Fallback dari HD ke basic
                  const basicUrl = videoBackground.replace(/vc_auto,q_auto,w_1920,h_1080,c_scale\//, 'vc_auto,q_auto/');
                  console.log('Fallback to basic quality:', basicUrl);
                  setVideoBackground(basicUrl);
                } else if (videoBackground?.includes('vc_auto,q_auto')) {
                  // Fallback ke original video tanpa transformasi
                  const originalUrl = videoBackground.replace(/\/upload\/[^\/]*\//, '/upload/');
                  console.log('Fallback to original:', originalUrl);
                  setVideoBackground(originalUrl);
                } else {
                  // If we've tried multiple times, wait and retry original video (might be processing)
                  if (videoRetryCount.current < 2) {
                    videoRetryCount.current++;
                    console.log(`Retry attempt ${videoRetryCount.current}/2 in 3 seconds...`);
                    setTimeout(() => {
                      // Try the original video URL again
                      setVideoBackground(videoBackground?.replace(/\?t=\d+/, '') + '?retry=' + videoRetryCount.current);
                    }, 3000);
                    return;
                  }
                  
                  // Final fallback: no video, use gradient
                  console.log('No more fallbacks after retries, using gradient');
                  setVideoBackground(null);
                  videoRetryCount.current = 0; // Reset for next track
                }
              }}
            />
          ) : (
            /* Gradient Fallback */
            <motion.div
              className="w-full h-full"
              style={{
                background: `linear-gradient(45deg, ${getGradientFallback(track).join(', ')})`
              }}
              animate={{
                background: [
                  `linear-gradient(45deg, ${getGradientFallback(track)[0]}, ${getGradientFallback(track)[1]})`,
                  `linear-gradient(135deg, ${getGradientFallback(track)[1]}, ${getGradientFallback(track)[2]})`,
                  `linear-gradient(225deg, ${getGradientFallback(track)[2]}, ${getGradientFallback(track)[0]})`,
                  `linear-gradient(315deg, ${getGradientFallback(track)[0]}, ${getGradientFallback(track)[1]})`
                ]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
          
          {/* Video Buffering Indicator - Subtle and Smart */}
          {videoBackground && videoBuffering && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-4 right-4 z-20"
            >
              <motion.div
                className="bg-black/70 backdrop-blur-sm rounded-full p-3 flex items-center space-x-2"
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                exit={{ y: -20 }}
              >
                <motion.div
                  className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span className="text-white text-xs font-medium">Buffering...</span>
              </motion.div>
            </motion.div>
          )}
          
          {/* Initial Loading Indicator - Only when video not loaded at all */}
          {videoBackground && !videoLoaded && !videoCanPlay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center z-10 bg-black/20"
            >
              <motion.div
                className="bg-black/60 backdrop-blur-sm rounded-2xl p-8 flex flex-col items-center space-y-4"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
              >
                <motion.div
                  className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <div className="text-white text-center">
                  <p className="text-lg font-medium mb-1">Loading Video</p>
                  <p className="text-sm text-white/70">Preparing HD experience...</p>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Visual Pan Particles */}
          {isAutoPanning && (
            <motion.div className="absolute inset-0 overflow-hidden pointer-events-none z-5">
              {/* Left Channel Particles */}
              <motion.div
                className="absolute left-0 top-0 w-32 h-full"
                animate={{
                  opacity: visualPan < 0 ? Math.abs(visualPan) * 0.8 : 0.2,
                  x: visualPan * -20,
                }}
                transition={{ duration: 0.1 }}
              >
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={`left-${i}`}
                    className="absolute w-3 h-3 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full"
                    style={{
                      top: `${(i * 8) + 10}%`,
                      left: `${Math.random() * 80}%`,
                    }}
                    animate={{
                      scale: [0.5, 1.2, 0.5],
                      opacity: [0.3, 0.8, 0.3],
                      x: [0, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </motion.div>

              {/* Right Channel Particles */}
              <motion.div
                className="absolute right-0 top-0 w-32 h-full"
                animate={{
                  opacity: visualPan > 0 ? visualPan * 0.8 : 0.2,
                  x: visualPan * 20,
                }}
                transition={{ duration: 0.1 }}
              >
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={`right-${i}`}
                    className="absolute w-3 h-3 bg-gradient-to-r from-red-400 to-pink-400 rounded-full"
                    style={{
                      top: `${(i * 8) + 10}%`,
                      right: `${Math.random() * 80}%`,
                    }}
                    animate={{
                      scale: [0.5, 1.2, 0.5],
                      opacity: [0.3, 0.8, 0.3],
                      x: [0, 10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </motion.div>

              {/* Center Sound Wave */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{
                  x: visualPan * 30,
                }}
                transition={{ duration: 0.1 }}
              >
                <motion.div
                  className="w-1 bg-gradient-to-t from-transparent via-white to-transparent rounded-full"
                  animate={{
                    height: [20, 60, 20],
                    opacity: [0.5, 0.9, 0.5],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
            </motion.div>
          )}

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 sm:p-6"
        >
          <motion.button
            onClick={handleBack}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-sm sm:text-base">Back to Library</span>
          </motion.button>
        </motion.header>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-4xl w-full"
          >
            {/* New Integrated Layout */}
            <div className="bg-black/40 backdrop-blur-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10">
              
              {/* Header Section dengan Cover di kiri dan Track Info */}
              <div className="flex items-start gap-6 mb-6">
                {/* Cover Art - Kecil di pojok kiri atas */}
                <motion.div
                  className="relative flex-shrink-0"
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 rounded-xl overflow-hidden shadow-xl">
                    <img
                      src={track.coverImage}
                      alt={track.title}
                      className="w-full h-full object-cover"
                      style={{
                        imageRendering: '-webkit-optimize-contrast',
                      }}
                      loading="eager"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src.includes('q_auto')) {
                          target.src = target.src.replace(/\/upload\/[^\/]*\//, '/upload/');
                        }
                      }}
                    />
                  </div>
                  
                  {/* Glow Effect - smaller */}
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    animate={{
                      boxShadow: [
                        '0 0 0 rgba(255, 107, 157, 0)',
                        '0 0 20px rgba(255, 107, 157, 0.3)',
                        '0 0 0 rgba(255, 107, 157, 0)'
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </motion.div>

                {/* Track Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex-1 min-w-0"
                >
                  <h1 className="font-kulture text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 leading-tight">
                    {track.title}
                  </h1>
                  <p className="font-kulture text-gray-300 text-lg sm:text-xl mb-4">{track.artist}</p>
                  
                  {/* Toggle Lyrics Button */}
                  <motion.button
                    onClick={() => setShowLyrics(!showLyrics)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium ${
                      showLyrics 
                        ? 'bg-neon-purple text-white shadow-lg shadow-neon-purple/25' 
                        : lyrics 
                          ? 'bg-white/10 text-gray-300 hover:text-white hover:bg-white/20'
                          : 'bg-white/5 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!lyrics}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>{showLyrics ? 'Hide Lyrics' : 'Show Lyrics'}</span>
                      {lyricsLoading && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full" />
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                </motion.div>
              </div>

              {/* Lyrics Display Area (Conditional) */}
              <AnimatePresence>
                {showLyrics && lyrics && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-6 bg-black/20 rounded-xl p-4 border border-white/10"
                  >
                    <div className="max-h-64 overflow-y-auto scroll-smooth" ref={lyricsContainerRef}>
                                              {lyricsType === 'lrc' && parsedLyrics.length > 0 ? (
                          // Synchronized LRC lyrics - Simple highlighting
                          <div className="space-y-2 py-8">
                            {/* Top padding untuk better scrolling */}
                            <div className="h-16"></div>
                            
                            {parsedLyrics.map((lyric, index) => (
                              <div
                                key={index}
                                data-lyric-index={index}
                                className={`py-2 px-3 rounded-lg cursor-pointer text-center transition-all duration-300 ${
                                  index === activeLyricIndex 
                                    ? 'text-white bg-gradient-to-r from-neon-purple/30 to-neon-pink/30 font-semibold scale-105 shadow-lg' 
                                    : index < activeLyricIndex
                                      ? 'text-gray-400'
                                      : 'text-gray-500'
                                }`}
                                onClick={() => {
                                  if (isCurrentTrack && seek) {
                                    seek(lyric.time);
                                  }
                                }}
                              >
                                {lyric.text}
                              </div>
                            ))}
                            
                            {/* Bottom padding untuk better scrolling */}
                            <div className="h-16"></div>
                          </div>
                      ) : (
                        // Plain text lyrics
                        <div className="text-white text-center leading-relaxed whitespace-pre-line">
                          {lyrics}
                        </div>
                      )}
                    </div>
                    
                    {/* Progress indicator untuk LRC */}
                    {lyricsType === 'lrc' && parsedLyrics.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-white/10">
                        <div className="text-xs text-gray-400 text-center mb-2">
                          {activeLyricIndex + 1} / {parsedLyrics.length}
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1">
                          <motion.div
                            className="bg-gradient-to-r from-neon-purple to-neon-pink h-1 rounded-full"
                            animate={{ width: `${((activeLyricIndex + 1) / parsedLyrics.length) * 100}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Progress Bar - Simple & Clean */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mb-6"
              >
                {/* Progress Track */}
                <div className="relative w-full bg-white/20 rounded-full h-1 mb-2 cursor-pointer group">
                  {/* Progress Fill */}
                  <motion.div
                    className="h-full bg-neon-purple rounded-full relative"
                    style={{ width: `${isCurrentTrack ? progress : 0}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${isCurrentTrack ? progress : 0}%` }}
                    transition={{ duration: 0.1, ease: "linear" }}
                  />
                  
                  {/* Progress Thumb/Indicator */}
                  <motion.div
                    className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-neon-purple opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ 
                      left: `${isCurrentTrack ? progress : 0}%`, 
                      marginLeft: '-8px',
                      zIndex: 10
                    }}
                    animate={{ left: `${isCurrentTrack ? progress : 0}%` }}
                    transition={{ duration: 0.1, ease: "linear" }}
                  />
                  
                  {/* Always Visible Small Dot */}
                  {isCurrentTrack && (
                    <motion.div
                      className="absolute top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-md"
                      style={{ 
                        left: `${progress}%`, 
                        marginLeft: '-4px',
                        zIndex: 5
                      }}
                      animate={{ left: `${progress}%` }}
                      transition={{ duration: 0.1, ease: "linear" }}
                    />
                  )}
                </div>
                
                {/* Time Display */}
                <div className="flex justify-between text-sm text-gray-400 font-kulture">
                  <span>{isCurrentTrack ? formatDuration(currentTime) : '0:00'}</span>
                  <span>{formatDuration(track.duration)}</span>
                </div>
              </motion.div>

              {/* Control Buttons - Mirip Gambar */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex items-center justify-center space-x-4 sm:space-x-6 lg:space-x-8 mb-6"
              >
                {/* Repeat Button */}
                <motion.button
                  onClick={toggleRepeat}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-2 transition-colors relative ${
                    repeatMode !== 'none' 
                      ? 'text-neon-purple hover:text-neon-pink' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Repeat className="w-5 h-5 sm:w-6 sm:h-6" />
                  {repeatMode === 'one' && (
                    <span className="absolute -top-1 -right-1 text-xs font-bold text-neon-pink">1</span>
                  )}
                </motion.button>

                {/* Previous Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </motion.button>

                {/* Play/Pause Button */}
                <motion.button
                  onClick={handlePlay}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-3 text-white transition-colors"
                >
                  {isCurrentTrack && isPlaying ? (
                    <Pause className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                  ) : (
                    <Play className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                  )}
                </motion.button>

                {/* Next Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <div className="w-6 h-6 transform rotate-180">
                    <ArrowLeft className="w-6 h-6" />
                  </div>
                </motion.button>

                {/* Heart Button */}
                <motion.button
                  onClick={() => setIsLiked(!isLiked)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-2 transition-colors ${
                    isLiked ? 'text-neon-pink' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                </motion.button>
              </motion.div>

              {/* Volume Control */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex items-center justify-center space-x-4 mb-4"
              >
                <motion.button
                  onClick={toggleMute}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`transition-colors ${
                    isMuted || volume === 0 
                      ? 'text-red-400 hover:text-red-300' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {isMuted || volume === 0 ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </motion.button>
                <div className="flex-1 max-w-32">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => {
                      const newVolume = parseFloat(e.target.value);
                      setVolume(newVolume);
                    }}
                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, ${
                        isMuted ? '#EF4444' : '#8B5CF6'
                      } 0%, ${
                        isMuted ? '#EF4444' : '#8B5CF6'
                      } ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%, rgba(255,255,255,0.2) 100%)`
                    }}
                  />
                </div>
                <span className={`font-kulture text-xs w-8 text-center ${
                  isMuted ? 'text-red-400' : 'text-gray-500'
                }`}>
                  {isMuted ? 'Mute' : `${Math.round(volume * 100)}%`}
                </span>
              </motion.div>

              {/* Auto Pan Control */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85 }}
                className="flex items-center justify-center mb-4"
              >
                {/* Auto Pan Toggle dengan Web Audio Status */}
                <motion.button
                  onClick={() => setIsAutoPanning(!isAutoPanning)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium ${
                    isAutoPanning 
                      ? 'bg-gradient-to-r from-green-500 to-cyan-500 text-white shadow-lg shadow-green-500/25' 
                      : 'bg-white/10 text-gray-300 hover:text-white hover:bg-white/20'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <span>{isAutoPanning ? '🎵 Auto Pan' : '⏸️ Static'}</span>
                    {isAutoPanning && (
                      <span className="text-xs opacity-80">
                        {isWebAudioActive() ? '🔊 Audio' : '👁️ Visual'}
                      </span>
                    )}
                  </div>
                </motion.button>
              </motion.div>

              {/* Bottom Row - Extra Controls */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="flex items-center justify-center space-x-6"
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 text-gray-500 hover:text-gray-400 transition-colors"
                >
                  <Share className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 text-gray-500 hover:text-gray-400 transition-colors"
                >
                  <Download className="w-5 h-5" />
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

    </div>
  );
} 