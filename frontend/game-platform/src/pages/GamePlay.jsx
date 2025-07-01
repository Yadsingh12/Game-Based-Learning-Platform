// src/pages/GamePlay.jsx

import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import { gamesMap } from "../games";
import "./GamePlay.css";

export default function GamePlay() {
  const { gameId } = useParams();
  const gameRef = useRef(null);
  const [phaserInstance, setPhaserInstance] = useState(null);

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
    setPhaserInstance(game);

    return () => {
      game.destroy(true);
    };
  }, [gameId]);

  if (!gameId || !gamesMap[gameId]) {
    return <h2>Game not found! Try our games by going to Home page</h2>;
  }

  const handleFullScreen = () => {
    if (!document.fullscreenElement) {
      gameRef.current?.requestFullscreen().catch((err) => {
        console.error("Error trying to enable full-screen mode:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="gameplay-container">
      <h2 className="gameplay-title">
        {gamesMap[gameId].name}
      </h2>

      <div className="gameplay-toolbar">
        <button onClick={handleFullScreen}>Toggle Fullscreen</button>
        {/* Add other game options here later */}
      </div>

      <div ref={gameRef}></div>
    </div>
  );
}
