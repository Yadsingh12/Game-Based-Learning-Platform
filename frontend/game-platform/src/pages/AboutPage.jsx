// src/pages/AboutPage.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12">

          <div className="text-center mb-10">
            <div className="text-6xl mb-4">🤟</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Sign Language Learning Platform
            </h1>
            <p className="text-gray-500">
              Learn Indian Sign Language through interactive games
            </p>
          </div>

          <div className="space-y-8 text-gray-600">

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-3">What is this?</h2>
              <p>
                An interactive platform to learn Indian Sign Language (ISL) through
                games, quizzes, and visual aids. Designed to make learning accessible
                and engaging for everyone.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-3">How it works</h2>
              <p>
                Pick a category — alphabets, numbers, colors, fruits, and more.
                Choose a pack, then play through a variety of games that reinforce
                recognition and recall. Progress is saved locally in your browser.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-3">Games</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  ['📖', 'Learn'],
                  ['🧠', 'Quiz'],
                  ['🃏', 'Match'],
                  ['🔍', 'Find in Image'],
                  ['🔤', 'Word Search'],
                  ['🔀', 'Word Scramble'],
                  ['✏️', 'Crossword'],
                  ['🏓', 'Breakout'],
                  ['🪣', 'Bucket Sort'],
                ].map(([icon, name]) => (
                  <div key={name} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl text-sm font-medium text-gray-700">
                    <span>{icon}</span> {name}
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-3">Offline support</h2>
              <p>
                Once a pack is loaded, all videos and images are cached in memory.
                You can play games without an internet connection for the rest of
                that session.
              </p>
            </section>

          </div>

          <div className="mt-10 text-center">
            <button
              onClick={() => navigate('/')}
              className="px-8 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition"
            >
              Start Learning
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}