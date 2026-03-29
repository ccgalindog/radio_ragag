import React, { useState, useRef, useEffect } from 'react';
import VideoPlayer from './components/VideoPlayer';
import Playlist from './components/Playlist';
import PlayerControls from './components/PlayerControls';
import FunFacts from './components/FunFacts';
import LyricsDisplay from './components/LyricsDisplay';
import { loadPlaylist, loadAllLyrics } from './data/loader';
import { PlayerState, Song, QueueItem } from './types';

const App: React.FC = () => {
  const [playerState, setPlayerState] = useState<PlayerState>({
    currentSongIndex: 0,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
  });

  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [lyricsData, setLyricsData] = useState<Record<string, { english: any[], spanish: any[] }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showFullScreenControls, setShowFullScreenControls] = useState(false);
  const [lastRecordedTime, setLastRecordedTime] = useState<number>(0);
  const [activePlayerMode, setActivePlayerMode] = useState<'normal' | 'fullscreen'>('normal');
  const youtubePlayerRef = useRef<any>(null);
  const timeUpdateIntervalRef = useRef<number | null>(null);
  const currentSong = playlist[playerState.currentSongIndex];

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [playlistData, lyricsData] = await Promise.all([
          loadPlaylist(),
          loadAllLyrics()
        ]);
        setPlaylist(playlistData);
        setLyricsData(lyricsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Listen for full-screen changes
  useEffect(() => {
    const handleFullScreenChange = () => {
      const wasFullScreen = isFullScreen;
      const isNowFullScreen = !!document.fullscreenElement;

      setIsFullScreen(isNowFullScreen);

      // If exiting full-screen (via Escape key or other methods)
      if (wasFullScreen && !isNowFullScreen) {
        setShowFullScreenControls(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, [isFullScreen, playerState.isPlaying]);

  // Handle mouse movement in full-screen mode
  const handleFullScreenMouseMove = (e: React.MouseEvent) => {
    if (!isFullScreen) return;

    const windowHeight = window.innerHeight;
    const mouseY = e.clientY;
    const threshold = 200; // Increased from 100px to 200px for easier access

    if (mouseY > windowHeight - threshold) {
      setShowFullScreenControls(true);
    } else {
      setShowFullScreenControls(false);
    }
  };

  const handleFullScreenMouseLeave = () => {
    if (isFullScreen) {
      setShowFullScreenControls(false);
    }
  };

  const handleSongSelect = (index: number) => {
    // Destroy current player if it exists
    if (youtubePlayerRef.current) {
      youtubePlayerRef.current.destroy();
      youtubePlayerRef.current = null;
    }

    // Reset recorded time for new song
    setLastRecordedTime(0);

    setPlayerState(prev => ({
      ...prev,
      currentSongIndex: index,
      currentTime: 0,
      duration: 0,
      isPlaying: false
    }));
  };

  const handlePlayPause = () => {
    if (youtubePlayerRef.current) {
      if (playerState.isPlaying) {
        youtubePlayerRef.current.pauseVideo();
      } else {
        youtubePlayerRef.current.playVideo();
      }
    }
  };

  const handlePrevious = () => {
    // Destroy current player if it exists
    if (youtubePlayerRef.current) {
      youtubePlayerRef.current.destroy();
      youtubePlayerRef.current = null;
    }

    // Reset recorded time for new song
    setLastRecordedTime(0);

    setPlayerState(prev => ({
      ...prev,
      currentSongIndex: prev.currentSongIndex === 0 ? playlist.length - 1 : prev.currentSongIndex - 1,
      currentTime: 0,
      duration: 0,
      isPlaying: false
    }));
  };

  const handleNext = () => {
    // Destroy current player if it exists
    if (youtubePlayerRef.current) {
      youtubePlayerRef.current.destroy();
      youtubePlayerRef.current = null;
    }

    // Reset recorded time for new song
    setLastRecordedTime(0);

    // Check if there are queued songs
    if (queue.length > 0) {
      // Play the first queued song
      const nextQueuedSong = queue[0];
      const queuedSongIndex = playlist.findIndex(song => song.id === nextQueuedSong.songId);

      if (queuedSongIndex !== -1) {
        // Remove the song from queue and play it
        setQueue(prevQueue => prevQueue.slice(1));
        setPlayerState(prev => ({
          ...prev,
          currentSongIndex: queuedSongIndex,
          currentTime: 0,
          duration: 0,
          isPlaying: false
        }));
        return;
      }
    }

    // If no queued songs, play next song in playlist
    setPlayerState(prev => ({
      ...prev,
      currentSongIndex: (prev.currentSongIndex + 1) % playlist.length,
      currentTime: 0,
      duration: 0,
      isPlaying: false
    }));
  };

  const handleShuffle = () => {
    console.log('Shuffle pressed - Current playlist order:', playlist.map(song => song.title));

    // Create a copy of the current playlist
    let shuffledPlaylist = [...playlist];
    let attempts = 0;
    const maxAttempts = 10;

    // Keep shuffling until we get a different order or reach max attempts
    do {
      // Fisher-Yates shuffle algorithm
      for (let i = shuffledPlaylist.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledPlaylist[i], shuffledPlaylist[j]] = [shuffledPlaylist[j], shuffledPlaylist[i]];
      }
      attempts++;
    } while (
      attempts < maxAttempts &&
      JSON.stringify(shuffledPlaylist.map(s => s.id)) === JSON.stringify(playlist.map(s => s.id))
    );

    console.log('Shuffled playlist order:', shuffledPlaylist.map(song => song.title));
    console.log('Shuffle attempts:', attempts);

    // Find the current song in the new shuffled playlist
    const currentSongId = currentSong.id;
    const newIndex = shuffledPlaylist.findIndex(song => song.id === currentSongId);

    console.log('Current song:', currentSong.title, 'New index:', newIndex);

    // Update the playlist and set the current song index
    setPlaylist(shuffledPlaylist);
    setPlayerState(prev => ({
      ...prev,
      currentSongIndex: newIndex >= 0 ? newIndex : 0,
    }));
  };

  const handleFullScreen = () => {
    if (!document.fullscreenElement) {
      // Switch to fullscreen mode
      setActivePlayerMode('fullscreen');

      // Enter full-screen mode
      document.documentElement.requestFullscreen().then(() => {
        setIsFullScreen(true);
      }).catch((err) => {
        console.error('Error entering full-screen mode:', err);
        // Revert mode if fullscreen fails
        setActivePlayerMode('normal');
      });
    } else {
      // Switch to normal mode
      setActivePlayerMode('normal');

      // Exit full-screen mode
      document.exitFullscreen().then(() => {
        setIsFullScreen(false);
      }).catch((err) => {
        console.error('Error exiting full-screen mode:', err);
        // Revert mode if exit fails
        setActivePlayerMode('fullscreen');
      });
    }
  };

  const handleQueueSelect = (songId: string) => {
    setQueue(prevQueue => {
      const isAlreadyQueued = prevQueue.some(item => item.songId === songId);

      if (isAlreadyQueued) {
        // Remove from queue
        return prevQueue.filter(item => item.songId !== songId);
      } else {
        // Add to queue
        const newQueueItem: QueueItem = {
          songId,
          addedAt: Date.now()
        };
        return [...prevQueue, newQueueItem];
      }
    });
  };

  const getQueuedSongIds = () => {
    return queue.map(item => item.songId);
  };

  const handleSeek = (time: number) => {
    if (youtubePlayerRef.current) {
      youtubePlayerRef.current.seekTo(time);
      // Immediately update the current time state for lyrics synchronization
      setPlayerState(prev => ({ ...prev, currentTime: time }));

      // Restart the time tracking interval if it was stopped
      if (!timeUpdateIntervalRef.current && playerState.isPlaying) {
        timeUpdateIntervalRef.current = setInterval(() => {
          if (youtubePlayerRef.current) {
            const currentTime = youtubePlayerRef.current.getCurrentTime();
            setPlayerState(prev => ({ ...prev, currentTime }));
          }
        }, 100);
      }
    }
  };

  const handleVolumeChange = (volume: number) => {
    if (youtubePlayerRef.current) {
      youtubePlayerRef.current.setVolume(volume * 100);
    }
    setPlayerState(prev => ({ ...prev, volume }));
  };

  const onYouTubeReady = (event: any) => {
    youtubePlayerRef.current = event.target;
    event.target.setVolume(playerState.volume * 100);

    // Get initial duration
    const duration = event.target.getDuration();
    setPlayerState(prev => ({ ...prev, duration }));

    // Seek to the last recorded time if available
    if (lastRecordedTime > 0) {
      console.log('Seeking to recorded time:', lastRecordedTime);
      event.target.seekTo(lastRecordedTime);
      setPlayerState(prev => ({ ...prev, currentTime: lastRecordedTime }));

      // Auto-play if the player state indicates it should be playing
      if (playerState.isPlaying) {
        event.target.playVideo();
      }

      // Reset the recorded time
      setLastRecordedTime(0);
    } else {
      // Auto-play if the player state indicates it should be playing
      if (playerState.isPlaying) {
        event.target.playVideo();
      }
    }
  };

  const onYouTubeStateChange = (event: any) => {
    const state = event.target.getPlayerState();
    // YouTube states: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)

    if (state === 1) { // Playing
      setPlayerState(prev => ({ ...prev, isPlaying: true }));
      // Start time tracking
      if (!timeUpdateIntervalRef.current) {
        timeUpdateIntervalRef.current = setInterval(() => {
          if (youtubePlayerRef.current) {
            const currentTime = youtubePlayerRef.current.getCurrentTime();
            setPlayerState(prev => ({ ...prev, currentTime }));
          }
        }, 100); // Update every 100ms for smooth timeline
      }
    } else if (state === 2) { // Paused
      setPlayerState(prev => ({ ...prev, isPlaying: false }));
      // Don't stop time tracking on pause, just update the playing state
    } else if (state === 0) { // Ended
      setPlayerState(prev => ({ ...prev, isPlaying: false }));
      // Stop time tracking
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
        timeUpdateIntervalRef.current = null;
      }
      // Auto-advance to next song (will check queue first)
      handleNext();
    } else if (state === 5) { // Video cued
      // Get duration when video is loaded
      const duration = event.target.getDuration();
      setPlayerState(prev => ({ ...prev, duration }));

      // Auto-play if the player state indicates it should be playing
      if (playerState.isPlaying) {
        event.target.playVideo();
      }
    } else if (state === 3) { // Buffering
      // Keep the interval running during buffering
      if (!timeUpdateIntervalRef.current && playerState.isPlaying) {
        timeUpdateIntervalRef.current = setInterval(() => {
          if (youtubePlayerRef.current) {
            const currentTime = youtubePlayerRef.current.getCurrentTime();
            setPlayerState(prev => ({ ...prev, currentTime }));
          }
        }, 100);
      }
    }
  };

  const onYouTubeError = (event: any) => {
    console.error('YouTube player error:', event);
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className={`${isFullScreen ? 'fixed inset-0 z-50 bg-dark-900' : 'min-h-screen bg-dark-900 p-4'}`}>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-white/70">Loading Radio RAGAG...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Main Layout Container */}
          <div className="max-w-7xl mx-auto">
            {/* Header - Hidden in full-screen */}
            <div className={`text-center mb-6 ${isFullScreen ? 'hidden' : ''}`}>
              <div className="flex items-center justify-center gap-4 mb-2">
                <img
                  src="/images/logo.png"
                  alt="Radio RAGAG Logo"
                  className="w-12 h-12 object-contain"
                />
                <h1 className="text-4xl font-bold text-gradient">
                  Radio RAGAG
                </h1>
              </div>
              <p className="text-white/70">
                Your Personal Music Companion
              </p>
            </div>

            {/* Main Content Grid */}
            <div className={isFullScreen ? "" : "grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-280px)]"}>
              {/* Left Column - Fun Facts - Hidden in full-screen */}
              <div className={`lg:col-span-1 ${isFullScreen ? 'hidden' : ''}`}>
                <FunFacts
                  funFacts={currentSong.funFacts}
                  songTitle={currentSong.title}
                  artist={currentSong.artist}
                />
              </div>

              {/* Center Column - Video Player and Lyrics */}
              <div className={isFullScreen ? "fixed inset-0 z-0 bg-dark-900" : "lg:col-span-2 flex flex-col h-full"}>
                <div className="h-full rounded-lg overflow-hidden flex-1">
                  <VideoPlayer
                    videoId={currentSong.youtubeId}
                    onReady={onYouTubeReady}
                    onStateChange={onYouTubeStateChange}
                    onError={onYouTubeError}
                  />
                </div>
                {/* Lyrics Display below the video - Hidden in full-screen (moved to overlay) */}
                <div className={`w-full ${isFullScreen ? 'hidden' : ''}`}>
                  <LyricsDisplay
                    songId={currentSong.id}
                    currentTime={playerState.currentTime}
                    lyricsData={lyricsData}
                  />
                </div>
              </div>

              {/* Right Column - Playlist - Hidden in full-screen */}
              <div className={`lg:col-span-1 h-full ${isFullScreen ? 'hidden' : ''}`}>
                <Playlist
                  songs={playlist}
                  currentSongIndex={playerState.currentSongIndex}
                  onSongSelect={handleSongSelect}
                  onQueueSelect={handleQueueSelect}
                  queuedSongs={getQueuedSongIds()}
                />
              </div>
            </div>

            {/* Player Controls - Fixed at bottom - Hidden in full-screen (moved to overlay) */}
            <div className={`mt-4 ${isFullScreen ? 'hidden' : ''}`}>
              <PlayerControls
                isPlaying={playerState.isPlaying}
                currentTime={playerState.currentTime}
                duration={playerState.duration}
                volume={playerState.volume}
                onPlayPause={handlePlayPause}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onSeek={handleSeek}
                onVolumeChange={handleVolumeChange}
                onShuffle={handleShuffle}
                onFullScreen={handleFullScreen}
                isFullScreen={isFullScreen}
              />
            </div>
          </div>

          {/* Full Screen Overlays */}
          {isFullScreen && activePlayerMode === 'fullscreen' && (
            <>
              {/* Lyrics Overlay */}
              <div className="absolute bottom-4 left-4 right-4 z-10">
                <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4">
                  <LyricsDisplay
                    songId={currentSong.id}
                    currentTime={playerState.currentTime}
                    lyricsData={lyricsData}
                  />
                </div>
              </div>

              {/* Controls Overlay */}
              <div
                className="absolute inset-0 z-20 pointer-events-none"
                onMouseMove={handleFullScreenMouseMove}
                onMouseLeave={handleFullScreenMouseLeave}
              >
                <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent transition-all duration-300 pointer-events-auto ${showFullScreenControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
                  }`}>
                  <div
                    className="px-4 pb-4"
                    onMouseEnter={() => setShowFullScreenControls(true)}
                    onMouseLeave={() => setShowFullScreenControls(false)}
                  >
                    <PlayerControls
                      isPlaying={playerState.isPlaying}
                      currentTime={playerState.currentTime}
                      duration={playerState.duration}
                      volume={playerState.volume}
                      onPlayPause={handlePlayPause}
                      onPrevious={handlePrevious}
                      onNext={handleNext}
                      onSeek={handleSeek}
                      onVolumeChange={handleVolumeChange}
                      onShuffle={handleShuffle}
                      onFullScreen={handleFullScreen}
                      isFullScreen={isFullScreen}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default App; 