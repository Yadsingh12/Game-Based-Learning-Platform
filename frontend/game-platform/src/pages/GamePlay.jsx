// src/pages/GamePlay.jsx

import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import { gamesMap } from "../games";
import "./GamePlay.css";

export default function GamePlay() {
  const { gameId } = useParams();
  const gameContainerRef = useRef(null);
  const [gameInstance, setGameInstance] = useState(null);

  useEffect(() => {
    if (!gameId || !gamesMap[gameId]) {
      console.error("Game not found:", gameId);
      return;
    }

    const config = {
      type: Phaser.AUTO,
      parent: gameContainerRef.current,
      backgroundColor: "#ffffff",
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1600,
        height: 900,
      },
      scene: gamesMap[gameId].scene,
    };

    const game = new Phaser.Game(config);
    setGameInstance(game);

    return () => {
      game.destroy(true);
    };
  }, [gameId]);

  const handleFullScreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await gameContainerRef.current.requestFullscreen();
        if (screen.orientation && screen.orientation.lock) {
          await screen.orientation.lock("landscape");
        }
      } catch (err) {
        console.error("Error requesting fullscreen or locking orientation:", err);
      }
    } else {
      document.exitFullscreen();
    }
  };

  if (!gameId || !gamesMap[gameId]) {
    return <p>Game not found!</p>;
  }

  return (
    <div className="gameplay-container">
      <h2 className="gameplay-title">{gamesMap[gameId].name}</h2>
      <div className="gameplay-toolbar">
        <button onClick={handleFullScreen}>Toggle Fullscreen</button>
      </div>
      <div
        ref={gameContainerRef}
        style={{
          width: "100%",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000",
        }}
      ></div>
    </div>
  );
}
