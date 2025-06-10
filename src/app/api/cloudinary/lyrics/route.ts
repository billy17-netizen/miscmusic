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

    // Search for lyrics files in Cloudinary
    const lyricsSearchResult = await cloudinary.search
      .expression('resource_type:raw AND (format:txt OR format:lrc OR format:json)')
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

    // Find matching lyrics file
    let bestMatch = null;
    let bestScore = 0;

    for (const lyricFile of lyricsSearchResult.resources) {
      const fileName = (lyricFile.filename || lyricFile.public_id).toLowerCase();
      const fileNameClean = fileName.replace(/\.(txt|lrc|json)$/i, '');
      
      // Try different matching strategies
      const trackNameClean = trackName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const filenameClean = filename ? filename.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
      
      // 1. Exact match with track name
      const trackScore = calculateSimilarity(trackNameClean, fileNameClean);
      
      // 2. Exact match with filename
      const filenameScore = filenameClean ? calculateSimilarity(filenameClean, fileNameClean) : 0;
      
      // 3. Partial matches
      const partialScore = (
        trackNameClean.includes(fileNameClean) || 
        fileNameClean.includes(trackNameClean) ||
        (filenameClean && (filenameClean.includes(fileNameClean) || fileNameClean.includes(filenameClean)))
      ) ? 0.7 : 0;
      
      const finalScore = Math.max(trackScore, filenameScore, partialScore);
      
      if (finalScore > bestScore && finalScore > 0.5) { // Minimum 50% similarity
        bestScore = finalScore;
        bestMatch = lyricFile;
      }
    }

    if (bestMatch) {
      // Fetch lyrics content from Cloudinary
      try {
        const response = await fetch(bestMatch.secure_url);
        const lyricsContent = await response.text();
        
        // Determine lyrics type based on file extension
        const isLrcFormat = bestMatch.format === 'lrc';
        const isJsonFormat = bestMatch.format === 'json';
        
        return NextResponse.json({
          success: true,
          lyrics: lyricsContent,
          lyricsType: isLrcFormat ? 'lrc' : isJsonFormat ? 'json' : 'text',
          matchScore: bestScore,
          lyricsInfo: {
            publicId: bestMatch.public_id,
            filename: bestMatch.filename,
            format: bestMatch.format,
            url: bestMatch.secure_url
          }
        });
      } catch {
        return NextResponse.json({
          success: false,
          error: 'Failed to fetch lyrics content',
          message: `Found lyrics file but failed to fetch content: ${bestMatch.secure_url}`
        });
      }
    }

    return NextResponse.json({
      success: false,
      message: `No matching lyrics found for track: ${trackName}`,
      lyrics: null,
      debug: {
        searchedFor: trackName,
        filename: filename,
        availableLyrics: lyricsSearchResult.resources.length
      }
    });

  } catch (error: unknown) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      lyrics: null
    });
  }
} 