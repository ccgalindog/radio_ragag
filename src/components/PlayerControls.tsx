import React from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Shuffle,
  Maximize,
  Minimize
} from 'lucide-react';

interface PlayerControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onShuffle: () => void;
  onFullScreen: () => void;
  isFullScreen: boolean;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  currentTime,
  duration,
  volume,
  onPlayPause,
  onPrevious,
  onNext,
  onSeek,
  onVolumeChange,
  onShuffle,
  onFullScreen,
  isFullScreen,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimelineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    onSeek(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    onVolumeChange(newVolume);
  };

  return (
    <div className="w-full p-4 glass-effect rounded-lg">
      {/* Timeline */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm text-white/70 w-12">
          {formatTime(currentTime)}
        </span>
        <div className="flex-1 relative">
          {/* Custom timeline background */}
          <div className="w-full h-2 bg-white/20 rounded-lg absolute top-0 left-0" />
          
          {/* Progress bar */}
          <div 
            className="absolute top-0 left-0 h-2 bg-primary-500 rounded-lg pointer-events-none transition-all duration-100"
            style={{ 
              width: `${duration ? (currentTime / duration) * 100 : 0}%`
            }}
          />
          
          {/* Invisible slider on top */}
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.1"
            value={currentTime}
            onChange={handleTimelineChange}
            className="w-full h-2 appearance-none cursor-pointer slider absolute top-0 left-0 bg-transparent z-10"
          />
        </div>
        <span className="text-sm text-white/70 w-12">
          {formatTime(duration)}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center relative">
        {/* Centered Play Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={onPrevious}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <SkipBack className="w-5 h-5" />
          </button>
          
          <button
            onClick={onPlayPause}
            className="p-3 rounded-full bg-primary-500 hover:bg-primary-600 transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" />
            )}
          </button>
          
          <button
            onClick={onNext}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <SkipForward className="w-5 h-5" />
          </button>

          {/* Shuffle Button */}
          <button
            onClick={onShuffle}
            className="p-2 rounded-full hover:bg-white/10 transition-colors ml-2"
            title="Shuffle playlist"
          >
            <Shuffle className="w-5 h-5" />
          </button>

          {/* Full Screen Button */}
          <button
            onClick={onFullScreen}
            className="p-2 rounded-full hover:bg-white/10 transition-colors ml-2"
            title={isFullScreen ? "Exit full screen" : "Enter full screen"}
          >
            {isFullScreen ? (
              <Minimize className="w-5 h-5" />
            ) : (
              <Maximize className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Volume Control - Positioned absolutely on the right */}
        <div className="absolute right-0 flex items-center gap-2">
          <button
            onClick={() => onVolumeChange(volume > 0 ? 0 : 1)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            {volume > 0 ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>
          <div className="relative w-20">
            {/* Custom volume background */}
            <div className="w-full h-2 bg-white/20 rounded-lg absolute top-0 left-0" />
            
            {/* Volume progress bar */}
            <div 
              className="absolute top-0 left-0 h-2 bg-primary-500 rounded-lg pointer-events-none transition-all duration-100"
              style={{ 
                width: `${volume * 100}%`
              }}
            />
            
            {/* Invisible volume slider on top */}
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full h-2 appearance-none cursor-pointer slider absolute top-0 left-0 bg-transparent z-10"
            />
          </div>
        </div>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider:focus {
          outline: none;
        }
        
        .slider:focus::-webkit-slider-thumb {
          background: #2563eb;
          transform: scale(1.1);
        }
        
        .slider:focus::-moz-range-thumb {
          background: #2563eb;
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
};

export default PlayerControls; 