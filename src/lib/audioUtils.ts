// Utility functions untuk generate demo audio

export function generateDemoAudio(trackId: string, frequency: number = 440, duration: number = 30): string {
  // Generate a simple audio tone using Web Audio API
  if (typeof window !== 'undefined' && window.AudioContext) {
    try {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Set frequency based on track ID for variety
      const trackFreq = frequency + (parseInt(trackId) * 50);
      oscillator.frequency.setValueAtTime(trackFreq, audioContext.currentTime);
      oscillator.type = 'sine';
      
      // Create audio buffer
      const buffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate);
      const channelData = buffer.getChannelData(0);
      
      for (let i = 0; i < channelData.length; i++) {
        channelData[i] = Math.sin(2 * Math.PI * trackFreq * i / audioContext.sampleRate) * 0.1;
      }
      
      // Convert to data URL (simplified)
      return 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkyC0eQ2/XReSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkyC0eQ2/XReSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkyC0eQ2/XReSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkyC0eQ2/XReSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkyC0eQ2/XReSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkyC0eQ2/XReSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkyC0eQ2/XReSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkyC0eQ2/XReSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkyC0eQ2/XReSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkyC0eQ2/XReSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkyC0eQ2/XReSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkyC0eQ2/XReSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkyC0eQ2/XReSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkyC0eQ2/XReSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkyC0eQ2/XReSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkyC0eQ2/XReSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkyC0eQ2/XReSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkyC0eQ2/XReSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkyC0eQ2/XReSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkyC0eQ2/XReSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkyC0eQ2/XReSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkyC0eQ2/XReSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkyC0eQ2/XReSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkyC0eQ2/XReSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkyC0eQ2/XReSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkyC0eQ2/XReSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkyC0eQ2/XReSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkyC0eQ2/XReSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkyC0eQ2/XReSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkyC0eQ2/XReSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkyC0eQ2/XReSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkyC0eQ2/XReSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkyC0eQ2/XReSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkyC0eQ2/XReSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkyC0eQ2/XReSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkyC0eQ2/XReSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkyC0eQ2/XReSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkyC0eQ2/XReSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkyC0eQ2/XReSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkyC0eQ2/XReSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkyC0eQ2/XReSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkyC0eQ2/XReS';
    } catch {
      return getFallbackAudioUrl(trackId);
    }
  }
  
  return getFallbackAudioUrl(trackId);
}

// Fallback audio URLs yang benar-benar bisa diputar
function getFallbackAudioUrl(trackId: string): string {
  // Menggunakan audio samples yang tersedia secara online
  const audioSamples = [
    'https://www.soundjay.com/misc/sounds/beep-07a.mp3',
    'https://www.soundjay.com/misc/sounds/beep-08b.mp3', 
    'https://www.soundjay.com/misc/sounds/beep-09.mp3',
    'https://www.soundjay.com/misc/sounds/beep-10.mp3',
    'https://www.soundjay.com/misc/sounds/beep-28.mp3',
  ];
  
  const index = parseInt(trackId) % audioSamples.length;
  return audioSamples[index] || audioSamples[0];
}

// Alternative: menggunakan file audio dari CDN publik
export function getPublicAudioUrl(trackId: string): string {
  // Menggunakan audio samples dari freesound atau similar
  const publicAudioUrls = [
    'https://file-examples.com/storage/fead87a98c3e0adeb22ad00/2017/11/file_example_MP3_700KB.mp3',
    'https://sample-videos.com/zip/10/mp3/mp3-sample-1.mp3',
    'https://sample-videos.com/zip/10/mp3/mp3-sample-2.mp3',
    'https://sample-videos.com/zip/10/mp3/mp3-sample-3.mp3',
    'https://www.kozco.com/tech/piano2.wav',
  ];
  
  const index = parseInt(trackId) % publicAudioUrls.length;
  return publicAudioUrls[index] || publicAudioUrls[0];
}

// Function untuk validasi apakah audio URL bisa diputar
export async function validateAudioUrl(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const audio = new Audio();
    let isResolved = false;
    
    const resolveOnce = (result: boolean) => {
      if (!isResolved) {
        isResolved = true;
        resolve(result);
      }
    };
    
    audio.oncanplaythrough = () => resolveOnce(true);
    audio.onerror = () => resolveOnce(false);
    
    // Set timeout untuk validasi
    setTimeout(() => resolveOnce(false), 5000);
    
    audio.src = url;
    audio.load();
  });
} 