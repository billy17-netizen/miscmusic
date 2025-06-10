import { Track } from '@/types/music';
import { getPublicAudioUrl } from './audioUtils';

// Konfigurasi Cloudinary - ganti dengan cloud name Anda
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo';
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}`;

// Demo tracks untuk fallback jika tidak ada tracks dari Cloudinary

// Function untuk generate Cloudinary URL dengan transformasi HD
export function getCloudinaryImageUrl(
  publicId: string, 
  transformations?: string
): string {
  const baseUrl = `${CLOUDINARY_BASE_URL}/image/upload`;
  
  if (transformations) {
    return `${baseUrl}/${transformations}/${publicId}`;
  }
  
  // Gunakan transformasi yang lebih aman dan kompatibel dengan semua format
  const safeHDTransforms = 'q_auto:good,f_auto,w_1200,h_1200,c_fill';
  return `${baseUrl}/${safeHDTransforms}/${publicId}`;
}

// Function untuk mengoptimalkan URL gambar yang sudah ada
export function optimizeExistingImageUrl(existingUrl: string): string {
  // Jika URL sudah memiliki transformasi, gunakan yang lebih aman
  if (existingUrl.includes('/upload/')) {
    // Ganti transformasi yang ada dengan yang lebih kompatibel
    return existingUrl.replace(/\/upload\/[^\/]*\//, '/upload/q_auto:good,f_auto,w_1200,h_1200,c_fill/');
  }
  
  return existingUrl;
}

export function getCloudinaryAudioUrl(
  publicId: string,
  format: string = 'mp3'
): string {
  return `${CLOUDINARY_BASE_URL}/video/upload/${publicId}.${format}`;
}

// Function baru untuk generate HD 2K Video URL
export function getCloudinaryVideoUrl(
  publicId: string,
  format: string = 'mp4',
  quality: 'HD' | '2K' | '4K' = '2K'
): string {
  const baseUrl = `${CLOUDINARY_BASE_URL}/video/upload`;
  
  let transformations = '';
  
  switch (quality) {
    case '4K':
      transformations = 'q_auto:best,f_auto,w_3840,h_2160,c_fill,br_5000k-15000k,fps_60';
      break;
    case '2K':
      transformations = 'q_auto:best,f_auto,w_2560,h_1440,c_fill,br_2000k-8000k,fps_60';
      break;
    case 'HD':
    default:
      transformations = 'q_auto:best,f_auto,w_1920,h_1080,c_fill,br_1000k-4000k,fps_30';
      break;
  }
  
  return `${baseUrl}/${transformations}/${publicId}.${format}`;
}

// ✅ FUNCTION UTAMA - SEPENUHNYA DYNAMIC DARI CLOUDINARY
export async function fetchTracksFromCloudinary(): Promise<Track[]> {
  try {
    // GUNAKAN DYNAMIC FETCH - TIDAK ADA HARDCODED TRACKS LAGI
    const response = await fetch('/api/cloudinary/tracks', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (data.success && data.tracks && data.tracks.length > 0) {
      // ✅ BERHASIL - SEMUA TRACKS OTOMATIS DARI CLOUDINARY
      return data.tracks;
    }
    
    // Jika API berhasil tapi tidak ada tracks
    if (data.success) {
      return [];
    }
    
    // Jika API gagal, return demo tracks dengan instruksi
    throw new Error(`API failed: ${data.error || 'Unknown error'}`);
    
  } catch {
    // FALLBACK KE DEMO TRACKS DENGAN INSTRUKSI SETUP
    return demoTracks.map((track: Track) => ({
      ...track,
      url: getPublicAudioUrl(track.id),
    }));
  }
}

// Function untuk format durasi
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Function untuk generate placeholder cover image dengan styling anime
export function getPlaceholderCover(title: string): string {
  const colors = ['FF6B9D', 'C44AC0', '3B82F6', '06B6D4', '8B5CF6', 'F59E0B'];
  const colorIndex = title.length % colors.length;
  const color = colors[colorIndex];
  
  // Generate simple data URL placeholder dengan warna solid
  const initials = title.split(' ').map(word => word[0]?.toUpperCase() || '').join('').substring(0, 2) || '🎵';
  
  // URL encode SVG untuk data URL
  const svg = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="400" fill="%23${color}"/><text x="200" y="220" font-family="Arial,sans-serif" font-size="80" font-weight="bold" text-anchor="middle" fill="white" opacity="0.9">${encodeURIComponent(initials)}</text></svg>`;
  
  return `data:image/svg+xml,${svg}`;
}

// Demo tracks untuk fallback jika API gagal
const demoTracks: Track[] = [
  {
    id: 'demo1',
    title: 'Setup Cloudinary API',
    artist: 'Music Player',
    album: 'Demo Album',
    duration: 180,
    url: '',
    coverImage: getPlaceholderCover('Setup Cloudinary API'),
    genre: 'Demo',
    year: 2024,
  },
]; 