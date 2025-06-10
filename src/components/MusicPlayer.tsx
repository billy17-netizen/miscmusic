'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  Repeat, 
  Shuffle,
  Heart,
  MoreHorizontal
} from 'lucide-react';
import { useMusicPlayer } from '@/lib/useMusicPlayer';
import { formatDuration, getPlaceholderCover } from '@/lib/cloudinary';
import { Track } from '@/types/music';

interface MusicPlayerProps {
  tracks: Track[];
}

export default function MusicPlayer({ tracks }: MusicPlayerProps) {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    isShuffled,
    // playTrack,
    togglePlayPause,
    nextTrack,
    previousTrack,
    setVolume,
    toggleMute,
    seek,
    toggleRepeat,
    toggleShuffle,
    setPlaylist,
  } = useMusicPlayer();

  const [isLiked, setIsLiked] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  useEffect(() => {
    setPlaylist(tracks);
  }, [tracks, setPlaylist]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    seek(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  if (!currentTrack) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-900/95 to-black/95 backdrop-blur-lg border-t border-gray-700 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-center">
          <p className="text-gray-400 animate-pulse">Pilih lagu untuk mulai memutar musik...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-900/95 via-pink-900/95 to-blue-900/95 backdrop-blur-lg border-t border-white/20 shadow-2xl"
      style={{
        background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.95) 0%, rgba(236, 72, 153, 0.95) 50%, rgba(59, 130, 246, 0.95) 100%)',
      }}
    >
      {/* Progress Bar */}
      <div 
        className="h-1 bg-white/20 cursor-pointer relative group"
        onClick={handleSeek}
      >
        <motion.div 
          className="h-full bg-gradient-to-r from-neon-pink to-neon-blue"
          style={{ width: `${progress}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
        <div 
          className="absolute top-0 h-full w-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-neon"
          style={{ left: `${progress}%`, transform: 'translateX(-50%)' }}
        />
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <div className="flex items-center justify-between">
          {/* Track Info */}
          <div className="flex items-center space-x-4 flex-1">
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <img
                src={currentTrack.coverImage || getPlaceholderCover(currentTrack.title)}
                alt={currentTrack.title}
                className="w-16 h-16 rounded-lg object-cover shadow-anime border border-white/20"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = getPlaceholderCover(currentTrack.title);
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/20 rounded-lg" />
            </motion.div>
            
            <div className="min-w-0 flex-1">
              <motion.h3 
                className="text-white text-lg font-semibold truncate"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                key={currentTrack.id}
              >
                {currentTrack.title}
              </motion.h3>
              <motion.p 
                className="text-gray-300 text-sm truncate"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                key={`${currentTrack.id}-artist`}
              >
                {currentTrack.artist}
              </motion.p>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsLiked(!isLiked)}
              className={`p-2 rounded-full transition-colors ${
                isLiked 
                  ? 'text-neon-pink shadow-neon' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </motion.button>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleShuffle}
                className={`p-2 rounded-full transition-colors ${
                  isShuffled 
                    ? 'text-neon-blue shadow-neon' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Shuffle className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={previousTrack}
                className="text-white hover:text-neon-pink transition-colors"
              >
                <SkipBack className="w-6 h-6" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={togglePlayPause}
                className="bg-gradient-to-r from-neon-pink to-neon-blue p-4 rounded-full text-white shadow-neon-lg hover:shadow-neon-lg transition-all"
              >
                <AnimatePresence mode="wait">
                  {isPlaying ? (
                    <motion.div
                      key="pause"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Pause className="w-6 h-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="play"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Play className="w-6 h-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={nextTrack}
                className="text-white hover:text-neon-blue transition-colors"
              >
                <SkipForward className="w-6 h-6" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleRepeat}
                className={`p-2 rounded-full transition-colors ${
                  repeatMode !== 'none' 
                    ? 'text-neon-green shadow-neon' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Repeat className="w-5 h-5" />
                {repeatMode === 'one' && (
                  <span className="absolute -top-1 -right-1 text-xs bg-neon-green text-black rounded-full w-4 h-4 flex items-center justify-center">
                    1
                  </span>
                )}
              </motion.button>
            </div>

            {/* Time Display */}
            <div className="text-white text-sm font-mono">
              {formatDuration(currentTime)} / {formatDuration(duration)}
            </div>

            {/* Volume Control */}
            <div className="flex items-center space-x-2 relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleMute}
                onMouseEnter={() => setShowVolumeSlider(true)}
                className="text-white hover:text-neon-cyan transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </motion.button>

              <AnimatePresence>
                {showVolumeSlider && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    onMouseLeave={() => setShowVolumeSlider(false)}
                    className="absolute right-0 bottom-full mb-2 bg-black/80 backdrop-blur-sm p-3 rounded-lg border border-white/20"
                  >
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-20 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer volume-slider"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .volume-slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(45deg, #FF10F0, #10D7FF);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(255, 16, 240, 0.5);
        }
        
        .volume-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(45deg, #FF10F0, #10D7FF);
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(255, 16, 240, 0.5);
        }
      `}</style>
    </motion.div>
  );
} 