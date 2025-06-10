'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Headphones } from 'lucide-react';
import TrackList from '@/components/TrackList';
import MiniPlayer from '@/components/MiniPlayer';

import { useMusicPlayer } from '@/lib/useMusicPlayer';
import { fetchTracksFromCloudinary } from '@/lib/cloudinary';
import { Track } from '@/types/music';

// Background particles component
const BackgroundParticles = () => {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    delay: Math.random() * 20,
  }));

  return (
    <div className="bg-particles">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.x}%`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

export default function HomePage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    currentTrack,
    isPlaying,
    playTrack,
  } = useMusicPlayer();

  useEffect(() => {
    const loadTracks = async () => {
      try {
        const fetchedTracks = await fetchTracksFromCloudinary();
        setTracks(fetchedTracks);
      } catch {
        // Error loading tracks
      } finally {
        setLoading(false);
      }
    };

    loadTracks();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <BackgroundParticles />
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
            <Headphones className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">Memuat Musik...</h2>
          <p className="text-gray-400">Mengambil lagu-lagu terbaik untuk Anda</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      <BackgroundParticles />
      


      {/* Main Content - Only Track List */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <TrackList 
            tracks={tracks}
            currentTrack={currentTrack || undefined}
            isPlaying={isPlaying}
            onTrackSelect={playTrack}
          />
        </motion.div>
      </main>

      {/* Music Player */}
      {/* <MusicPlayer tracks={tracks} /> */}

      {/* Mini Player Footer */}
      <MiniPlayer />

      
    </div>
  );
}
