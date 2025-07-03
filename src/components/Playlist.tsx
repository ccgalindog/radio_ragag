import React, { useState, useMemo } from 'react';
import { Song } from '../types';
import { Music, Play, Search, Circle, CheckCircle } from 'lucide-react';

interface PlaylistProps {
  songs: Song[];
  currentSongIndex: number;
  onSongSelect: (index: number) => void;
  onQueueSelect: (songId: string) => void;
  queuedSongs: string[];
}

const Playlist: React.FC<PlaylistProps> = ({ 
  songs, 
  currentSongIndex, 
  onSongSelect,
  onQueueSelect,
  queuedSongs
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSongs = useMemo(() => {
    if (!searchQuery.trim()) {
      return songs;
    }
    
    const query = searchQuery.toLowerCase();
    return songs.filter(song => 
      song.title.toLowerCase().includes(query) ||
      song.artist.toLowerCase().includes(query)
    );
  }, [songs, searchQuery]);

  const orderedSongs = useMemo(() => {
    const currentSong = songs[currentSongIndex];
    const currentSongId = currentSong?.id;
    
    // Get queued songs in order
    const queuedSongIds = queuedSongs;
    const queuedSongsList = queuedSongIds
      .map(songId => songs.find(song => song.id === songId))
      .filter(Boolean) as Song[];
    
    // Get remaining songs (excluding current and queued)
    const remainingSongs = songs.filter(song => 
      song.id !== currentSongId && !queuedSongIds.includes(song.id)
    );
    
    // Order: current song first, then queued songs, then remaining songs
    const ordered = [];
    
    // Add current song if it exists and matches search
    if (currentSong && (!searchQuery.trim() || 
        currentSong.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        currentSong.artist.toLowerCase().includes(searchQuery.toLowerCase()))) {
      ordered.push(currentSong);
    }
    
    // Add queued songs
    queuedSongsList.forEach(song => {
      if (!searchQuery.trim() || 
          song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.artist.toLowerCase().includes(searchQuery.toLowerCase())) {
        ordered.push(song);
      }
    });
    
    // Add remaining songs
    remainingSongs.forEach(song => {
      if (!searchQuery.trim() || 
          song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.artist.toLowerCase().includes(searchQuery.toLowerCase())) {
        ordered.push(song);
      }
    });
    
    return ordered;
  }, [songs, currentSongIndex, queuedSongs, searchQuery]);

  const formatDuration = (duration: string) => {
    return duration;
  };

  const handleSongSelect = (song: Song) => {
    const originalIndex = songs.findIndex(s => s.id === song.id);
    onSongSelect(originalIndex);
  };

  const handleQueueSelect = (e: React.MouseEvent, songId: string) => {
    e.stopPropagation(); // Prevent triggering song selection
    onQueueSelect(songId);
  };

  const isQueued = (songId: string) => {
    return queuedSongs.includes(songId);
  };

  const getQueuePosition = (songId: string) => {
    return queuedSongs.indexOf(songId) + 1;
  };

  return (
    <div className="h-full flex flex-col bg-white/5 rounded-lg">
      {/* Fixed Header */}
      <div className="p-4 border-b border-white/10 bg-white/5 flex-shrink-0">
        <h2 className="text-xl font-bold text-gradient mb-4 flex items-center gap-2">
          <Music className="w-5 h-5" />
          Playlist
        </h2>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="text"
            placeholder="Search songs or artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>
        
        {/* Results count */}
        <div className="mt-2 text-sm text-white/60">
          {filteredSongs.length} of {songs.length} songs
        </div>
      </div>

      {/* Scrollable Songs List with Fixed Height */}
      <div className="flex-1 overflow-y-auto max-h-96">
        <div className="p-4">
          <div className="space-y-2">
            {orderedSongs.length > 0 ? (
              orderedSongs.map((song, displayIndex) => {
                const originalIndex = songs.findIndex(s => s.id === song.id);
                const isCurrentSong = originalIndex === currentSongIndex;
                const isQueuedSong = isQueued(song.id);
                
                // Determine display position
                let displayPosition: string;
                if (isCurrentSong) {
                  displayPosition = "Now";
                } else if (isQueuedSong) {
                  displayPosition = `Next ${getQueuePosition(song.id)}`;
                } else {
                  // For remaining songs, show their position in the overall order
                  displayPosition = `${displayIndex + 1}`;
                }
                
                return (
                  <div
                    key={song.id}
                    onClick={() => handleSongSelect(song)}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-white/10 ${
                      isCurrentSong
                        ? 'bg-primary-500/20 border border-primary-500/50'
                        : 'glass-effect hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Queue Selector */}
                        <button
                          onClick={(e) => handleQueueSelect(e, song.id)}
                          className="p-1 hover:bg-white/10 rounded-full transition-colors"
                          title={isQueued(song.id) ? "Remove from queue" : "Add to queue"}
                        >
                          {isQueued(song.id) ? (
                            <div className="relative">
                              <CheckCircle className="w-4 h-4 text-primary-400" />
                              <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                                {getQueuePosition(song.id)}
                              </span>
                            </div>
                          ) : (
                            <Circle className="w-4 h-4 text-white/50 hover:text-white/70" />
                          )}
                        </button>
                        
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCurrentSong 
                            ? 'bg-primary-500 text-white' 
                            : 'bg-white/10 text-white/70'
                        }`}>
                          {isCurrentSong ? (
                            <Play className="w-4 h-4 ml-0.5" />
                          ) : (
                            <span className="text-xs font-medium">{displayPosition}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-medium truncate ${
                            isCurrentSong ? 'text-primary-400' : 'text-white'
                          }`}>
                            {song.title}
                          </h3>
                          <p className="text-sm text-white/70 truncate">
                            {song.artist}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-white/60 ml-2">
                        {formatDuration(song.duration)}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-white/50">
                <Music className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No songs found</p>
                <p className="text-sm">Try a different search term</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
};

export default Playlist; 