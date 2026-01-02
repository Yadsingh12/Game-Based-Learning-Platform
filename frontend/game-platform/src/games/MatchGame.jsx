import React, { useState, useMemo } from 'react';

export default function MatchGame({ data, pack, category, onExit }) {
  const [matches, setMatches] = useState([]);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);

  const gameData = useMemo(() => {
    return data.slice(0, 6).flatMap(item => [
      { 
        id: `${item.id}_video`, 
        type: 'video', 
        content: item, 
        pairId: item.id 
      },
      { 
        id: `${item.id}_text`, 
        type: 'text', 
        content: item, 
        pairId: item.id 
      }
    ]).sort(() => Math.random() - 0.5);
  }, [data]);

  const handleCardClick = (card) => {
    if (matches.includes(card.id) || selected?.id === card.id) return;

    if (!selected) {
      setSelected(card);
    } else {
      if (selected.pairId === card.pairId) {
        const newMatches = [...matches, selected.id, card.id];
        setMatches(newMatches);
        setScore(score + 1);
        setSelected(null);
        
        if (newMatches.length === gameData.length) {
          setTimeout(() => {
            const finalScore = Math.round((score + 1) / (gameData.length / 2) * 100);
            onExit(finalScore);
          }, 500);
        }
      } else {
        setTimeout(() => setSelected(null), 1000);
      }
    }
  };

  return (
    <div className={`game-container bg-gradient-to-br ${category.colorScheme.gradient}`}>
      <div className="game-card max-w-6xl">
        <div className="game-header">
          <h2 className="text-2xl font-bold text-gray-800">Match Game</h2>
          <div className="text-right">
            <p className="text-sm text-gray-500">
              {category.name} - {pack.name}
            </p>
            <div 
              className="badge"
              style={{ 
                backgroundColor: `${category.colorScheme.light}40`,
                color: category.colorScheme.dark
              }}
            >
              Matches: {score} / {gameData.length / 2}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
          {gameData.map(card => {
            let className = 'match-card ';
            if (matches.includes(card.id)) {
              className += 'match-card-matched';
            } else if (selected?.id === card.id) {
              className += 'match-card-selected';
            } else {
              className += 'match-card-default';
            }

            const bgStyle = !matches.includes(card.id) && selected?.id !== card.id
              ? { background: `linear-gradient(135deg, ${category.colorScheme.primary}, ${category.colorScheme.secondary})` }
              : {};

            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(card)}
                className={className}
                style={bgStyle}
              >
                {card.type === 'video' ? (
                  <div className="text-center p-2">
                    <img 
                      src={card.content.thumbnailUrl} 
                      alt="Sign"
                      className="w-16 h-16 object-cover rounded mx-auto mb-1"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-16 h-16 bg-gray-400 rounded mx-auto mb-1 items-center justify-center" style={{display: 'none'}}>
                      <p className="text-xs text-white">Video</p>
                    </div>
                  </div>
                ) : (
                  <p className={`font-bold text-center px-2 text-sm ${
                    matches.includes(card.id) ? 'text-gray-700' : 'text-white'
                  }`}>
                    {card.content.name}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}