export interface Song {
  id: string;
  title: string;
  artist: string;
  duration: string;
  youtubeId: string;
  funFacts: string;
  album?: string;
  year?: number;
}

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
}

export interface PlayerState {
  currentSongIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
}

export interface QueueItem {
  songId: string;
  addedAt: number; // timestamp for ordering
} 