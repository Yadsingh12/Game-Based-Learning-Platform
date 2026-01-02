// This game is only for numerals - arranging numbers in order
import React, { useState, useMemo } from 'react';

export default function SequenceGame({ data, pack, category, onExit }) {
  const [shuffledSigns, setShuffledSigns] = useState(() => 
    [...data].sort(() => Math.random() - 0.5)
  );
  const [userSequence, setUserSequence] = useState([]);
  const [completed, setCompleted] = useState(false);

  const correctSequence = useMemo(() => 
    [...data].sort((a, b) => a.number - b.number),
    [data]
  );

  const handleSignClick = (sign) => {
    if (userSequence.find(s => s.id === sign.id)) return;
    
    const newSequence = [...userSequence, sign];
    setUserSequence(newSequence);

    if (newSequence.length === data.length) {
      // Check if sequence is correct
      const isCorrect = newSequence.every((sign, idx) => 
        sign.id === correctSequence[idx].id
      );
      
      if (isCorrect) {
        setCompleted(true);
        setTimeout(() => onExit(100), 1500);
      } else {
        setTimeout(() => {
          setUserSequence([]);
        }, 1000);
      }
    }
  };

  const handleReset = () => {
    setUserSequence([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-600 to-yellow-600 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Sequence Game</h2>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                {category.name} - {pack.name}
              </p>
              <p className="text-gray-600">
                Arrange in order: {userSequence.length} / {data.length}
              </p>
            </div>
          </div>

          <p className="text-center text-gray-700 mb-6 text-lg">
            Click the signs in numerical order!
          </p>

          {/* User's sequence */}
          <div className="mb-6 p-4 bg-gray-100 rounded-lg min-h-24">
            <p className="text-sm text-gray-600 mb-2">Your sequence:</p>
            <div className="flex gap-2 flex-wrap">
              {userSequence.map(sign => (
                <div key={sign.id} className="bg-blue-500 text-white px-4 py-2 rounded-lg font-bold">
                  {sign.name}
                </div>
              ))}
            </div>
          </div>

          {/* Available signs */}
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mb-6">
            {shuffledSigns.map(sign => {
              const isSelected = userSequence.find(s => s.id === sign.id);
              return (
                <div
                  key={sign.id}
                  onClick={() => handleSignClick(sign)}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center cursor-pointer transition transform ${
                    isSelected
                      ? 'bg-gray-200 opacity-50 cursor-not-allowed'
                      : 'bg-gradient-to-br from-purple-500 to-pink-500 hover:scale-105'
                  }`}
                >
                  <img 
                    src={sign.thumbnailUrl} 
                    alt={sign.name}
                    className="w-20 h-20 object-cover rounded mb-2"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <p className={`font-bold text-2xl ${isSelected ? 'text-gray-500' : 'text-white'}`}>
                    {sign.name}
                  </p>
                </div>
              );
            })}
          </div>

          {completed && (
            <div className="text-center p-4 bg-green-100 rounded-lg">
              <p className="text-green-700 text-xl font-bold">Perfect! 🎉</p>
            </div>
          )}

          <button
            onClick={handleReset}
            className="w-full px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition"
          >
            Reset Sequence
          </button>
        </div>
      </div>
    </div>
  );
}