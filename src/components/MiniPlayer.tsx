'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, SkipForward, SkipBack } from 'lucide-react';
import { useMusicPlayer } from '@/lib/useMusicPlayer';
import { formatDuration, getPlaceholderCover } from '@/lib/cloudinary';
import { useRouter } from 'next/navigation';

export default function MiniPlayer() {
  const router = useRouter();
  const {
    currentTrack,
    isPlaying,
    togglePlayPause,
    currentTime,
    duration,
    volume,
    setVolume,
    nextTrack,
    previousTrack,
  } = useMusicPlayer();

  if (!currentTrack) {
    return null;
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleTrackClick = () => {
    router.push(`/track/${currentTrack.id}`);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md border-t border-white/10"
        style={{ zIndex: 99999 }}
      >
        {/* Progress Bar at Top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
          <motion.div
            className="h-full bg-neon-purple"
            style={{ width: `${progress}%` }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1, ease: "linear" }}
          />
        </div>

        <div className="px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between max-w-screen-xl mx-auto">
            {/* Left Side - Track Info */}
            <motion.div
              className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0 cursor-pointer"
              onClick={handleTrackClick}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Album Art */}
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden shadow-lg flex-shrink-0">
                <img
                  src={currentTrack.coverImage || getPlaceholderCover(currentTrack.title)}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = getPlaceholderCover(currentTrack.title);
                  }}
                />
                
                {/* Play Indicator */}
                {isPlaying && (
                  <motion.div
                    className="absolute inset-0 bg-black/30 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div
                      className="w-2 h-2 bg-white rounded-full"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  </motion.div>
                )}
              </div>

              {/* Track Info */}
              <div className="min-w-0 flex-1">
                <h4 className="font-kulture text-white font-medium text-xs sm:text-sm truncate">
                  {currentTrack.title}
                </h4>
                <p className="font-kulture text-gray-400 text-xs truncate">
                  {currentTrack.artist}
                </p>
              </div>
            </motion.div>

            {/* Center - Controls */}
            <div className="flex items-center space-x-2 sm:space-x-4 mx-3 sm:mx-6">
              {/* Previous Button */}
              <motion.button
                onClick={previousTrack}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>

              {/* Play/Pause Button */}
              <motion.button
                onClick={togglePlayPause}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 bg-white text-black rounded-full hover:bg-gray-200 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />
                )}
              </motion.button>

              {/* Next Button */}
              <motion.button
                onClick={nextTrack}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            </div>

            {/* Right Side - Volume & Time */}
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              {/* Time Display */}
              <div className="hidden sm:flex items-center space-x-2 text-xs text-gray-400 font-kulture">
                <span>{formatDuration(currentTime)}</span>
                <span>/</span>
                <span>{formatDuration(duration)}</span>
              </div>

              {/* Volume Control */}
              <div className="hidden md:flex items-center space-x-2">
                <Volume2 className="w-4 h-4 text-gray-400" />
                <div className="w-20">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%, rgba(255,255,255,0.2) 100%)`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
} 