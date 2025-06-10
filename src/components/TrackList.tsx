'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Headphones
} from 'lucide-react';
import { Track } from '@/types/music';
import { getPlaceholderCover } from '@/lib/cloudinary';

interface TrackListProps {
  tracks: Track[];
  currentTrack?: Track;
  isPlaying: boolean;
  onTrackSelect?: (track: Track) => void; // Made optional since we'll use router instead
}

export default function TrackList({ tracks, currentTrack, isPlaying, onTrackSelect }: TrackListProps) {
  const router = useRouter();
  const [videoBackground, setVideoBackground] = useState<string | null>(null);

  // Function untuk mencari video yang match dengan track dari Cloudinary
  const findMatchingVideo = async (track: Track): Promise<string | null> => {
    try {
      const response = await fetch('/api/cloudinary/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          trackName: track.title,
          trackId: track.id,
          filename: track.url.split('/').pop()?.split('.')[0] // extract filename from URL
        })
      });
      
      const data = await response.json();
      
      if (data.success && data.videoUrl) {
        return data.videoUrl;
      }
      
      return null;
    } catch {
      return null;
    }
  };

  // Function untuk generate gradient fallback jika video tidak ada
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

  const handleTrackHover = async (track: Track | null) => {
    if (track) {
      // Coba cari video yang match dengan track
      const videoUrl = await findMatchingVideo(track);
      
      if (videoUrl) {
        // Jika ada video, gunakan video URL
        setVideoBackground(videoUrl);
      } else {
        // Fallback ke gradient
        const colors = getGradientFallback(track);
        setVideoBackground(`gradient:${colors.join(',')}`);
      }
    } else {
      setVideoBackground(null);
    }
  };

  // Equalizer Animation Component
  const EqualizerAnimation = () => (
    <div className="flex items-center space-x-1">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-gradient-to-t from-neon-purple to-neon-violet rounded-full"
          animate={{
            height: [4, 16, 8, 20, 6],
            opacity: [0.4, 1, 0.6, 0.9, 0.5]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );

  if (tracks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-12 text-center"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-neon-pink/20 to-neon-blue/20 rounded-full flex items-center justify-center"
        >
          <Headphones className="w-12 h-12 text-neon-blue" />
        </motion.div>
        <h3 className="font-kulture text-2xl font-bold text-white mb-2">Koleksi Musik Kosong</h3>
        <p className="font-kulture text-gray-400">Upload musik ke Cloudinary untuk mulai mendengarkan</p>
      </motion.div>
    );
  }

  return (
    <div className="relative">
      {/* Animated Background Overlay */}
      <AnimatePresence>
        {videoBackground && (
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="fixed inset-0 z-0 pointer-events-none"
          >
            {/* Video atau Gradient Background */}
            {videoBackground.startsWith('gradient:') ? (
              /* Animated Gradient Background sebagai fallback */
              <motion.div
                className="w-full h-full"
                style={{
                  background: `linear-gradient(45deg, ${videoBackground.replace('gradient:', '').split(',')[0]}, ${videoBackground.replace('gradient:', '').split(',')[1]}, ${videoBackground.replace('gradient:', '').split(',')[2]})`
                }}
                animate={{
                  background: [
                    `linear-gradient(45deg, ${videoBackground.replace('gradient:', '').split(',')[0]}, ${videoBackground.replace('gradient:', '').split(',')[1]})`,
                    `linear-gradient(135deg, ${videoBackground.replace('gradient:', '').split(',')[1]}, ${videoBackground.replace('gradient:', '').split(',')[2]})`,
                    `linear-gradient(225deg, ${videoBackground.replace('gradient:', '').split(',')[2]}, ${videoBackground.replace('gradient:', '').split(',')[0]})`,
                    `linear-gradient(315deg, ${videoBackground.replace('gradient:', '').split(',')[0]}, ${videoBackground.replace('gradient:', '').split(',')[1]})`
                  ]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ) : (
              /* Video Background dari Cloudinary */
              <video
                src={videoBackground}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
                width="2560"
                height="1440"
                crossOrigin="anonymous"
                style={{
                  imageRendering: '-webkit-optimize-contrast',
                  filter: 'contrast(1.1) saturate(1.2)',
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden',
                }}
                onError={() => {
                  // Jika video gagal dimuat, hide video background
                  console.log('Video failed to load');
                }}
              />
            )}
            
            {/* Floating Particles */}
            <div className="absolute inset-0">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white/20 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -50, 0],
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0]
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
            
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/50" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="space-y-6"
      >
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <h2 className="font-kulture text-2xl sm:text-3xl font-bold text-white mb-2">Daftar Lagu</h2>
          <p className="font-kulture text-gray-400 text-sm sm:text-base">{tracks.length} lagu tersedia</p>
        </motion.div>

        {/* Track List - Linktree Style */}
        <div className="space-y-3 sm:space-y-4">
          <AnimatePresence>
            {tracks.map((track, index) => {
              const isCurrentTrack = currentTrack?.id === track.id;

              return (
                <motion.div
                  key={track.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`
                    group cursor-pointer transition-all duration-300 relative overflow-hidden
                    glass rounded-xl p-4 sm:p-5 border border-white/10
                    ${isCurrentTrack 
                      ? 'bg-gradient-to-r from-neon-purple/20 via-neon-violet/20 to-neon-indigo/20 border-neon-purple/30' 
                      : 'hover:bg-white/5 hover:border-white/20'
                    }
                  `}
                  onMouseEnter={() => handleTrackHover(track)}
                  onMouseLeave={() => handleTrackHover(null)}
                  onClick={() => router.push(`/track/${track.id}`)}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Linktree Style Content */}
                  <div className="flex items-center space-x-4">
                    {/* Cover Image */}
                    <motion.div
                      className="relative flex-shrink-0"
                      whileHover={{ scale: 1.05 }}
                    >
                      <img
                        src={track.coverImage || getPlaceholderCover(track.title)}
                        alt={track.title}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover shadow-lg border border-white/20"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = getPlaceholderCover(track.title);
                        }}
                      />
                      {isCurrentTrack && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-tr from-neon-purple/30 to-neon-violet/30 rounded-lg"
                          animate={{ opacity: [0.3, 0.7, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </motion.div>
                    
                    {/* Track Info */}
                    <div className="min-w-0 flex-1">
                      <h4 className={`font-kulture text-base sm:text-lg font-semibold truncate mb-1 ${
                        isCurrentTrack ? 'text-white text-glow' : 'text-white group-hover:text-neon-purple'
                      } transition-colors`}>
                        {track.title}
                      </h4>
                      <p className="font-kulture text-sm sm:text-base text-gray-400 truncate group-hover:text-gray-300">
                        {track.artist}
                      </p>
                    </div>

                    {/* Play Indicator */}
                    <div className="flex-shrink-0">
                      {isCurrentTrack && isPlaying ? (
                        <EqualizerAnimation />
                      ) : (
                        <motion.button
                          className="p-2 rounded-full bg-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onTrackSelect) {
                              onTrackSelect(track);
                            }
                          }}
                        >
                          <Play className="w-4 h-4" />
                        </motion.button>
                      )}
                    </div>
                  </div>

                  {/* Progress bar for current track */}
                  {isCurrentTrack && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-neon-purple to-neon-violet rounded-b-xl"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.5 }}
                      style={{ transformOrigin: 'left' }}
                    />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
} 