// src/pages/GamePlay.jsx

import { useParams } from "react-router-dom";
import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { gamesMap } from "../games";

export default function GamePlay() {
  const { gameId } = useParams();
  const gameRef = useRef(null);

  useEffect(() => {
    if (!gameId || !gamesMap[gameId]) {
      console.error("Game not found:", gameId);
      return;
    }

    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: gameRef.current,
      scene: gamesMap[gameId].scene
    };

    const game = new Phaser.Game(config);

    return () => {
      game.destroy(true);
    };
  }, [gameId]);

  if (!gameId || !gamesMap[gameId]) {
    return <p>Game not found!</p>;
  }

  return (
    <div>
      <h2 style={{ textAlign: "center" }}>
        {gamesMap[gameId].name}
      </h2>
      <div ref={gameRef}></div>
    </div>
  );
}
