import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { Track } from '@/types/music';
import { optimizeExistingImageUrl } from '@/lib/cloudinary';

interface CloudinaryResource {
  public_id: string;
  filename?: string;
  secure_url: string;
  created_at: string;
  duration?: number;
  format: string;
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function untuk extract metadata dari filename
function extractMetadataFromFilename(filename: string) {
  // Remove extension
  const nameWithoutExt = filename.replace(/\.(mp3|wav|m4a|flac|ogg)$/i, '');
  
  // Try to parse format: "Artist - Title" or "Title - Artist" 
  const parts = nameWithoutExt.split(' - ');
  
  if (parts.length >= 2) {
    return {
      title: parts[1].trim(),
      artist: parts[0].trim(),
    };
  }
  
  // Fallback: use filename as title
  return {
    title: nameWithoutExt.replace(/_/g, ' ').trim(),
    artist: 'Unknown Artist',
  };
}



export async function GET() {
  try {
    // Search for audio files in Cloudinary
    const audioSearchResult = await cloudinary.search
      .expression('resource_type:video AND (format:mp3 OR format:wav OR format:m4a OR format:flac OR format:ogg)')
      .sort_by('created_at', 'desc')
      .max_results(50)
      .execute();

    // Search for image files that could be covers
    const imageSearchResult = await cloudinary.search
      .expression('resource_type:image AND (format:jpg OR format:jpeg OR format:png OR format:webp OR format:avif)')
      .sort_by('created_at', 'desc')
      .max_results(100)
      .execute();

    // Create a map of potential cover images dengan lebih detail
    const imageMap = new Map();
    const imageList: Array<{
      publicId: string;
      filename: string;
      url: string;
      originalName: string;
    }> = [];
    
    imageSearchResult.resources.forEach((image: CloudinaryResource) => {
      const imageData = {
        publicId: image.public_id,
        filename: image.filename || '',
        url: image.secure_url,
        originalName: (image.filename || image.public_id).toLowerCase()
      };
      imageList.push(imageData);
      
      // Map dengan berbagai variasi nama
      imageMap.set(image.public_id.toLowerCase(), image.secure_url);
      if (image.filename) {
        imageMap.set(image.filename.toLowerCase(), image.secure_url);
        // Tanpa extension
        const nameWithoutExt = image.filename.replace(/\.(jpg|jpeg|png|webp|avif)$/i, '').toLowerCase();
        imageMap.set(nameWithoutExt, image.secure_url);
      }
    });

    // Enhanced function untuk mencari cover image yang matching
    function findCoverImage(audioResource: CloudinaryResource): string {
      const audioName = (audioResource.filename || audioResource.public_id).toLowerCase();
      const audioNameClean = audioName.replace(/\.(mp3|wav|m4a|flac|ogg)$/i, '').toLowerCase();
      
             // 1. Exact match dengan public_id
       if (imageMap.has(audioResource.public_id.toLowerCase())) {
         const imageUrl = imageMap.get(audioResource.public_id.toLowerCase());
         return optimizeExistingImageUrl(imageUrl);
       }
       
       // 2. Exact match dengan filename tanpa extension
       if (imageMap.has(audioNameClean)) {
         const imageUrl = imageMap.get(audioNameClean);
         return optimizeExistingImageUrl(imageUrl);
       }
      
      // 3. Advanced matching dengan scoring
      let bestMatch = null;
      let bestScore = 0;
      
      for (const image of imageList) {
        const imageNameClean = image.originalName.replace(/\.(jpg|jpeg|png|webp|avif)$/i, '');
        
                 // Similarity scoring
         const score = calculateSimilarity(audioNameClean, imageNameClean);
         
         if (score > bestScore && score > 0.5) { // Minimum 50% similarity
           bestScore = score;
           // Generate safe HD image URL using optimize function
           bestMatch = optimizeExistingImageUrl(image.url);
         }
       }
       
       if (bestMatch) {
         return bestMatch;
       }
      
      // Fallback: Gunakan placeholder yang bagus
      return `data:image/svg+xml,<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="400" fill="%23FF6B9D"/><text x="200" y="200" font-family="Arial,sans-serif" font-size="40" font-weight="bold" text-anchor="middle" fill="white">🎵</text><text x="200" y="250" font-family="Arial,sans-serif" font-size="16" text-anchor="middle" fill="white">${encodeURIComponent(extractMetadataFromFilename(audioResource.filename || audioResource.public_id).title.substring(0, 15))}</text></svg>`;
    }
    
    // Function untuk calculate similarity antara dua string
    function calculateSimilarity(str1: string, str2: string): number {
      const normalize = (s: string) => s.replace(/[^a-z0-9]/g, '').toLowerCase();
      const a = normalize(str1);
      const b = normalize(str2);
      
      if (a === b) return 1.0;
      if (a.includes(b) || b.includes(a)) return 0.8;
      
      // Levenshtein distance based similarity
      const longer = a.length > b.length ? a : b;
      const shorter = a.length > b.length ? b : a;
      
      if (longer.length === 0) return 1.0;
      
      const distance = levenshteinDistance(longer, shorter);
      return (longer.length - distance) / longer.length;
    }
    
    // Levenshtein distance calculation
    function levenshteinDistance(str1: string, str2: string): number {
      const matrix = [];
      for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
      }
      for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
      }
      for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
          if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
          }
        }
      }
      return matrix[str2.length][str1.length];
    }

    // Convert Cloudinary resources to Track objects
    const tracks: Track[] = audioSearchResult.resources.map((resource: CloudinaryResource, index: number) => {
      const metadata = extractMetadataFromFilename(resource.filename || resource.public_id);
      
      return {
        id: (index + 1).toString(),
        title: metadata.title,
        artist: metadata.artist,
        album: 'Cloudinary Collection',
        duration: Math.round(resource.duration || 180), // Duration in seconds
        url: resource.secure_url,
        coverImage: findCoverImage(resource),
        genre: 'Music',
        year: new Date(resource.created_at).getFullYear(),
      };
    });
    
    return NextResponse.json({
      success: true,
      tracks,
      totalFound: audioSearchResult.resources.length,
      imagesFound: imageSearchResult.resources.length,
    });

  } catch (error: unknown) {
    // Return fallback response with instructions
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      tracks: [],
      instructions: {
        message: 'Gagal mengambil musik dari Cloudinary. Setup API credentials diperlukan.',
        steps: [
          'Tambahkan CLOUDINARY_API_KEY dan CLOUDINARY_API_SECRET ke .env.local',
          'Pastikan musik sudah diupload ke Cloudinary',
          'Format file yang didukung: MP3, WAV, M4A, FLAC, OGG'
        ]
      }
    });
  }
} 