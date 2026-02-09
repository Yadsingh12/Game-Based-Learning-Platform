//content page component displaying games within a selected pack

import React from 'react';
import { Lock, Star, CheckCircle, Book, Brain, Gamepad2, Zap, MessageSquare, Repeat, Clock, Droplet, Gamepad, Search } from 'lucide-react';
import gameTemplatesData from '../data/gameTemplates.json';
import { getProgress, isGameUnlocked } from '../utils/storage';

const iconMap = {
  Book: Book,
  Brain: Brain,
  Gamepad2: Gamepad2,
  Zap: Zap,
  MessageSquare: MessageSquare,
  Repeat: Repeat,
  Clock: Clock,
  Droplet: Droplet,
  Gamepad: Gamepad,
  Search: Search,
};

// Filter games based on category
const getAvailableGamesForCategory = (categoryId, allGames) => {
  return allGames.filter(game => 
    game.applicableCategories.includes(categoryId)
  );
};

export default function ContentPage({ category, pack, packData, onSelectGame, onBack }) {
  // Get only games applicable to this category
  const availableGames = getAvailableGamesForCategory(
    category.id, 
    gameTemplatesData.games
  );

  return (
    <div className={`min-h-screen bg-gradient-to-br ${category.colorScheme.gradient} p-6`}>
      <div className="max-w-6xl mx-auto">
        <button
          onClick={onBack}
          className="mb-4 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition"
        >
          ← Back
        </button>

        <h2 className="text-3xl font-bold text-white mb-2">
          {pack.name}
        </h2>
        <p className="text-white/90 mb-6">
          {packData.length} signs loaded from {category.name}
        </p>
        
        {availableGames.length === 0 ? (
          <div className="bg-white/20 rounded-xl p-8 text-center">
            <p className="text-white text-lg">No games available for this pack yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {availableGames.map(game => {
              const unlocked = isGameUnlocked(pack.id, game);
              const progress = getProgress(pack.id, game.id);
              const Icon = iconMap[game.icon];

              return (
                <div
                  key={game.id}
                  onClick={() => unlocked && onSelectGame(game)}
                  className={`card ${unlocked ? 'card-interactive' : 'card-disabled'}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <Icon 
                      style={{ color: unlocked ? category.colorScheme.primary : '#9ca3af' }}
                      size={32} 
                    />
                    {unlocked ? (
                      progress.completed ? (
                        <CheckCircle className="text-green-500" size={24} />
                      ) : null
                    ) : (
                      <Lock className="text-gray-400" size={24} />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {game.name}
                  </h3>
                  <p className="text-gray-600 mb-3 text-sm">
                    {game.description}
                  </p>
                  {progress.completed && (
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="text-yellow-500" size={16} />
                      <span className="text-gray-700">
                        Best: {progress.score}%
                      </span>
                    </div>
                  )}
                  {!unlocked && game.unlockRequirement && (
                    <p className="text-xs text-red-500 mt-2">
                      Unlock: Score {game.unlockRequirement.minScore}% in {game.unlockRequirement.game}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}