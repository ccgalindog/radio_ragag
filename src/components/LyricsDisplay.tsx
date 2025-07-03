import React, { useMemo } from 'react';

interface LyricsDisplayProps {
  songId: string;
  currentTime: number;
  lyricsData: Record<string, { english: any[], spanish: any[] }>;
}

const LyricsDisplay: React.FC<LyricsDisplayProps> = ({ songId, currentTime, lyricsData }) => {
  const songLyrics = lyricsData[songId];
  const lyrics = songLyrics?.english || [];
  const lyricsSpanish = songLyrics?.spanish || [];

  // Find the current lyric line based on the current time
  const currentLineIndex = useMemo(() => {
    if (!lyrics.length) return -1;
    for (let i = lyrics.length - 1; i >= 0; i--) {
      if (currentTime >= lyrics[i].time) {
        return i;
      }
    }
    return -1;
  }, [lyrics, currentTime]);

  return (
    <div className="w-full py-4 px-2 flex flex-col items-center min-h-[48px]">
      {lyrics.length === 0 ? (
        <span className="text-white/50 italic">No lyrics available for this song.</span>
      ) : (
        <div className="text-center">
          {/* English lyrics */}
          <div className="text-lg font-semibold text-white transition-all duration-300 min-h-[32px]">
            {currentLineIndex >= 0 ? lyrics[currentLineIndex].text : ''}
          </div>
          
          {/* Spanish lyrics */}
          {currentLineIndex >= 0 && lyricsSpanish[currentLineIndex] && (
            <div className="mt-2 text-base font-medium text-yellow-300 transition-all duration-300">
              {lyricsSpanish[currentLineIndex].text}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LyricsDisplay; 