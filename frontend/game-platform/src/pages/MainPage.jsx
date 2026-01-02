//main page component displaying categories of sign language topics

import React from 'react';
import categoriesData from '../data/categories.json';

export default function MainPage({ onSelectCategory }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Sign Language Learning
          </h1>
          <p className="text-white/90">
            Master sign language through interactive games
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categoriesData.categories.map(category => (
            <div
              key={category.id}
              onClick={() => onSelectCategory(category)}
              className="bg-white rounded-xl p-8 cursor-pointer hover:shadow-2xl hover:scale-105 transition transform"
            >
              <div className="text-6xl mb-4 text-center">
                {category.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 text-center mb-2">
                {category.name}
              </h3>
              <p className="text-gray-600 text-center">
                {category.packs.length} packs available
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}