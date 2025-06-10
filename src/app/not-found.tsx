'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Home, 
  Music, 
  Play,
  Search,
  Headphones
} from 'lucide-react';

export default function NotFound() {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const floatingAnimation = {
    y: [-10, 10, -10],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  const pulseAnimation = {
    scale: [1, 1.1, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 flex items-center justify-center px-4">
      {/* Background Animated Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Music Notes */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-white/10"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${20 + Math.random() * 30}px`
            }}
            animate={{
              y: [-20, 20, -20],
              rotate: [0, 360],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          >
            ♪ ♫ ♬
          </motion.div>
        ))}

        {/* Gradient Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      {/* Main Content */}
      <motion.div
        className="relative z-10 text-center max-w-2xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 404 Number with Musical Elements */}
        <motion.div
          className="mb-8"
          variants={itemVariants}
        >
          <motion.div
            className="relative inline-block"
            animate={pulseAnimation}
          >
            <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-neon-purple via-neon-pink to-cyan-400 bg-clip-text text-transparent mb-4">
              404
            </h1>
            
            {/* Musical Staff Lines */}
            <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-full h-0.5 bg-white/20 my-2"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Error Message */}
        <motion.div
          className="mb-8"
          variants={itemVariants}
        >
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4 font-kulture">
            Track Not Found!
          </h2>
          <p className="text-gray-300 text-lg mb-2">
            Sepertinya halaman yang Anda cari telah hilang dalam harmoni...
          </p>
          <p className="text-gray-400">
            Mungkin track ini sedang tidak tersedia atau URL salah.
          </p>
        </motion.div>

        {/* Floating Headphones Icon */}
        <motion.div
          className="mb-8 flex justify-center"
          variants={itemVariants}
          animate={floatingAnimation}
        >
          <div className="relative">
            <motion.div
              className="w-24 h-24 bg-gradient-to-r from-neon-purple to-neon-pink rounded-full flex items-center justify-center"
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Headphones className="w-12 h-12 text-white" />
            </motion.div>
            
            {/* Sound waves */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 border-2 border-white/20 rounded-full"
                animate={{
                  scale: [1, 1.5 + i * 0.3],
                  opacity: [0.6, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          variants={itemVariants}
        >
          {/* Back to Home */}
          <Link href="/">
            <motion.button
              className="group relative px-8 py-4 bg-gradient-to-r from-neon-purple to-neon-pink rounded-xl text-white font-medium transition-all duration-300 overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-neon-pink to-neon-purple opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
              <div className="relative flex items-center gap-2">
                <Home className="w-5 h-5" />
                <span>Kembali ke Beranda</span>
              </div>
            </motion.button>
          </Link>

          {/* Browse Music */}
          <Link href="/">
            <motion.button
              className="group px-8 py-4 border-2 border-white/20 rounded-xl text-white font-medium hover:bg-white/10 transition-all duration-300"
              whileHover={{ scale: 1.05, borderColor: "rgba(139, 92, 246, 0.5)" }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5" />
                <span>Jelajahi Musik</span>
              </div>
            </motion.button>
          </Link>
        </motion.div>

        {/* Quick Navigation */}
        <motion.div
          className="mt-12 pt-8 border-t border-white/10"
          variants={itemVariants}
        >
          <p className="text-gray-400 mb-4">Atau coba navigasi cepat:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link 
              href="/" 
              className="text-neon-purple hover:text-neon-pink transition-colors duration-200 flex items-center gap-1"
            >
              <Play className="w-4 h-4" />
              Playlist Utama
            </Link>
            <span className="text-gray-600">•</span>
            <Link 
              href="/" 
              className="text-neon-purple hover:text-neon-pink transition-colors duration-200 flex items-center gap-1"
            >
              <Search className="w-4 h-4" />
              Pencarian
            </Link>
            <span className="text-gray-600">•</span>
            <Link 
              href="/" 
              className="text-neon-purple hover:text-neon-pink transition-colors duration-200 flex items-center gap-1"
            >
              <Music className="w-4 h-4" />
              Lagu Terbaru
            </Link>
          </div>
        </motion.div>

        {/* Fun Message */}
        <motion.div
          className="mt-8"
          variants={itemVariants}
        >
          <motion.p
            className="text-gray-500 text-sm italic"
            animate={{
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            &quot;Musik tidak pernah hilang, hanya berpindah ke nada yang berbeda...&quot; 🎵
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
} 