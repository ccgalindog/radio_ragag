import React from 'react';
import YouTube from 'react-youtube';

interface VideoPlayerProps {
  videoId: string;
  onReady?: (event: any) => void;
  onStateChange?: (event: any) => void;
  onError?: (event: any) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoId, 
  onReady, 
  onStateChange, 
  onError 
}) => {
  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 0,
      controls: 1,
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
      iv_load_policy: 3,
      fs: 1,
    },
  };

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden glass-effect">
      <YouTube
        videoId={videoId}
        opts={opts}
        onReady={onReady}
        onStateChange={onStateChange}
        onError={onError}
        className="w-full h-full"
        iframeClassName="w-full h-full rounded-lg"
      />
    </div>
  );
};

export default VideoPlayer; 