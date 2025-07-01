// src/pages/Home.jsx

import React from "react";
import GameCard from "../components/GameCard";
import { gamesMap } from "../games";
import "./Home.css";

export default function Home() {
  const gamesByCategory = {};

  Object.entries(gamesMap).forEach(([key, game]) => {
    if (!gamesByCategory[game.category]) {
      gamesByCategory[game.category] = [];
    }
    gamesByCategory[game.category].push({
      id: key,
      ...game
    });
  });

  return (
    <div className="home-container">
      <h1>Welcome to Game-Based Learning Platform!</h1>

      {Object.entries(gamesByCategory).map(([category, games]) => (
        <section className="category-section" key={category}>
          <h2>{category}</h2>
          <div className="game-list">
            {games.map((game) => (
              <GameCard
                key={game.id}
                imagePath={game.logoPath}
                alt={game.alt}
                title={game.name}
                link={`/game/${game.id}`}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
