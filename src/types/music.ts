export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number; // in seconds
  url: string; // Cloudinary URL
  coverImage: string; // Cloudinary image URL
  genre?: string;
  year?: number;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  tracks: Track[];
  coverImage: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  pan: number; // -1 (left) to 1 (right), 0 is center
  repeatMode: 'none' | 'one' | 'all';
  isShuffled: boolean;
  playlist: Track[];
  currentIndex: number;
}

export interface CloudinaryResponse {
  public_id: string;
  secure_url: string;
  resource_type: string;
  duration?: number;
  format: string;
  bytes: number;
}

export type PlayerAction = 
  | { type: 'PLAY_TRACK'; payload: Track }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'NEXT_TRACK' }
  | { type: 'PREVIOUS_TRACK' }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'SET_PAN'; payload: number }
  | { type: 'SET_CURRENT_TIME'; payload: number }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'TOGGLE_REPEAT' }
  | { type: 'TOGGLE_SHUFFLE' }
  | { type: 'SET_PLAYLIST'; payload: Track[] }; 