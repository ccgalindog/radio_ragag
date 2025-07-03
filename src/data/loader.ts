import { Song } from '../types';

// Cache for discovered song IDs
let discoveredSongIds: string[] | null = null;

// Discover available song IDs by trying to load song info files
const discoverSongIds = async (): Promise<string[]> => {
  if (discoveredSongIds) {
    return discoveredSongIds;
  }

  const songIds: string[] = [];
  const maxAttempts = 50; // Reasonable upper limit for song discovery
  
  // Try to load song info files starting from ID 1
  for (let i = 1; i <= maxAttempts; i++) {
    const songId = i.toString();
    try {
      const response = await fetch(`/data/songs_info/info_${songId}.json`);
      if (response.ok) {
        songIds.push(songId);
      } else {
        // If we get a 404, we've likely reached the end of available songs
        // But we'll continue for a few more attempts to be sure
        if (response.status === 404 && i > 10) {
          // If we've found some songs and get a 404, we're probably done
          break;
        }
      }
    } catch (error) {
      // If we can't fetch at all, we're probably done
      if (i > 10) {
        break;
      }
    }
  }
  
  discoveredSongIds = songIds;
  console.log(`Discovered ${songIds.length} songs:`, songIds);
  return songIds;
};

// Get song IDs (cached after first discovery)
export const getSongIds = async (): Promise<string[]> => {
  return await discoverSongIds();
};

// Load song information dynamically
export const loadSongInfo = async (songId: string): Promise<Song> => {
  try {
    const response = await fetch(`/data/songs_info/info_${songId}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load song info for ID: ${songId}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading song info for ID ${songId}:`, error);
    throw error;
  }
};

// Load lyrics for a song
export const loadLyrics = async (songId: string): Promise<{ english: any[], spanish: any[] }> => {
  try {
    const response = await fetch(`/data/lyrics/lyrics_${songId}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load lyrics for ID: ${songId}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading lyrics for ID ${songId}:`, error);
    throw error;
  }
};

// Load all songs for the playlist
export const loadPlaylist = async (): Promise<Song[]> => {
  const songIds = await getSongIds();
  const songs: Song[] = [];
  
  for (const songId of songIds) {
    try {
      const songInfo = await loadSongInfo(songId);
      songs.push(songInfo);
    } catch (error) {
      console.error(`Failed to load song ${songId}:`, error);
    }
  }
  
  return songs;
};

// Load all lyrics data
export const loadAllLyrics = async (): Promise<Record<string, { english: any[], spanish: any[] }>> => {
  const songIds = await getSongIds();
  const lyricsData: Record<string, { english: any[], spanish: any[] }> = {};
  
  for (const songId of songIds) {
    try {
      const lyrics = await loadLyrics(songId);
      lyricsData[songId] = lyrics;
    } catch (error) {
      console.error(`Failed to load lyrics for song ${songId}:`, error);
      lyricsData[songId] = { english: [], spanish: [] };
    }
  }
  
  return lyricsData;
}; 