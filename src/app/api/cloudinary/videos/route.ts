import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const { trackName, filename } = await request.json();

    // Search for video files in Cloudinary
    const videoSearchResult = await cloudinary.search
      .expression('resource_type:video AND (format:mp4 OR format:webm OR format:mov OR format:avi)')
      .sort_by('created_at', 'desc')
      .max_results(100)
      .execute();

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

    // Find matching video
    let bestMatch = null;
    let bestScore = 0;

    for (const video of videoSearchResult.resources) {
      const videoName = (video.filename || video.public_id).toLowerCase();
      const videoNameClean = videoName.replace(/\.(mp4|webm|mov|avi)$/i, '');
      
      // Try different matching strategies
      const trackNameClean = trackName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const filenameClean = filename ? filename.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
      
      // 1. Exact match with track name
      const trackScore = calculateSimilarity(trackNameClean, videoNameClean);
      
      // 2. Exact match with filename
      const filenameScore = filenameClean ? calculateSimilarity(filenameClean, videoNameClean) : 0;
      
      // 3. Partial matches
      const partialScore = (
        trackNameClean.includes(videoNameClean) || 
        videoNameClean.includes(trackNameClean) ||
        (filenameClean && (filenameClean.includes(videoNameClean) || videoNameClean.includes(filenameClean)))
      ) ? 0.7 : 0;
      
      const finalScore = Math.max(trackScore, filenameScore, partialScore);
      
      if (finalScore > bestScore && finalScore > 0.5) { // Minimum 50% similarity
        bestScore = finalScore;
        bestMatch = video;
      }
    }

    if (bestMatch) {
      // Generate multiple video URLs dengan berbagai kualitas untuk fallback
      const originalVideoUrl = bestMatch.secure_url;
      
      // Basic HD video URL (untuk video, gunakan transformasi video yang benar)
      const hdVideoUrl = bestMatch.secure_url.replace(
        '/upload/', 
        '/upload/vc_auto,q_auto/'
      );
      
      // Enhanced HD with 1080p resolution
      const enhancedHdVideoUrl = bestMatch.secure_url.replace(
        '/upload/', 
        '/upload/vc_auto,q_auto,w_1920,h_1080,c_scale/'
      );
      
      // 2K version dengan bitrate optimization untuk video
      const hd2kVideoUrl = bestMatch.secure_url.replace(
        '/upload/', 
        '/upload/vc_auto,q_auto,w_2560,h_1440,c_scale,br_2000k-8000k/'
      );
      

      
      return NextResponse.json({
        success: true,
        videoUrl: originalVideoUrl, // Start with original for best compatibility 
        videoUrls: {
          original: originalVideoUrl,
          basic: hdVideoUrl,
          hd: enhancedHdVideoUrl,
          hd2k: hd2kVideoUrl
        },
        matchScore: bestScore,
        videoInfo: {
          publicId: bestMatch.public_id,
          filename: bestMatch.filename,
          format: bestMatch.format,
          duration: bestMatch.duration,
          quality: 'Original (fallback-compatible)',
          bitrate: 'original'
        }
      });
    }



    return NextResponse.json({
      success: false,
      message: `No matching video found for track: ${trackName}`,
      videoUrl: null,
      debug: {
        searchedFor: trackName,
        filename: filename,
        availableVideos: videoSearchResult.resources.length
      }
    });

  } catch (error: unknown) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      videoUrl: null
    });
  }
} 