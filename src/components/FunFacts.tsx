import React from 'react';
import { Lightbulb } from 'lucide-react';

interface FunFactsProps {
  funFacts: string;
  songTitle: string;
  artist: string;
}

// Utility function to parse and highlight entities
const parseAndHighlightEntities = (text: string) => {
  const entityRegex = /\[(date|artist|album|song):([^\]]+)\]/g;
  const parts: (string | { type: string; value: string })[] = [];
  let lastIndex = 0;
  let match;

  while ((match = entityRegex.exec(text)) !== null) {
    // Add text before the entity
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    
    // Add the entity
    parts.push({
      type: match[1],
      value: match[2]
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  
  return parts;
};

// Function to get color class for entity type
const getEntityColorClass = (type: string) => {
  switch (type) {
    case 'date':
      return 'text-blue-400 font-semibold';
    case 'artist':
      return 'text-green-400 font-semibold';
    case 'album':
      return 'text-purple-400 font-semibold';
    case 'song':
      return 'text-yellow-400 font-semibold';
    default:
      return 'text-white/90';
  }
};

const FunFacts: React.FC<FunFactsProps> = ({ funFacts, songTitle, artist }) => {
  const highlightedParts = parseAndHighlightEntities(funFacts);

  return (
    <div className="h-full flex flex-col bg-white/5 rounded-lg overflow-hidden">
      {/* Fixed Header */}
      <div className="p-4 border-b border-white/10 bg-white/5 flex-shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-semibold text-gradient">
            Fun Facts
          </h3>
        </div>
        
        <div className="mb-3">
          <h4 className="text-white font-medium">
            {songTitle}
          </h4>
          <p className="text-white/70 text-sm">
            by {artist}
          </p>
        </div>
      </div>

      {/* Scrollable Content with Fixed Height */}
      <div className="flex-1 overflow-y-auto max-h-96">
        <div className="p-4">
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
              {highlightedParts.map((part, index) => {
                if (typeof part === 'string') {
                  return <span key={index}>{part}</span>;
                } else {
                  return (
                    <span 
                      key={index} 
                      className={`${getEntityColorClass(part.type)} cursor-help`}
                      title={`${part.type}: ${part.value}`}
                    >
                      {part.value}
                    </span>
                  );
                }
              })}
            </p>
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

export default FunFacts; 