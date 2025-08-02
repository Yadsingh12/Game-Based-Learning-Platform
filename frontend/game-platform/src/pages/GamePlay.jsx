import { useParams, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import { gamesMap } from "../games";
import "./GamePlay.css";

export default function GamePlay() {
  const { gameId } = useParams();
  const location = useLocation();
  const prevPath = useRef(location.pathname);
  const gameContainerRef = useRef(null);
  const [gameInstance, setGameInstance] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [showResume, setShowResume] = useState(false);

  const gameDef = gamesMap[gameId];
  const orientation = gameDef?.orientation || "landscape";

  const pauseAllScenes = () => {
    gameInstance?.scene?.scenes?.forEach(scene => {
      if (!scene.scene?.isPaused?.()) scene.scene.pause();
    });
  };

  const resumeAllScenes = () => {
    gameInstance?.scene?.scenes?.forEach(scene => {
      if (scene.scene?.isPaused?.()) scene.scene.resume();
    });
  };

  const startGame = async () => {
    if (!gameDef) return;

    if (!gameInstance && gameDef.type === "phaser") {
      const config = {
        type: Phaser.AUTO,
        parent: gameContainerRef.current,
        backgroundColor: "#ffffff",
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
          width: gameDef.width || 1600,
          height: gameDef.height || 900,
        },
        physics: {
          default: "arcade",
          arcade: {
            gravity: { y: 200 },
            debug: false,
          },
        },
        dom: { createContainer: true },
        scene: gameDef.scene,
      };

      const game = new Phaser.Game(config);
      setGameInstance(game);
    }

    setHasStarted(true);

    try {
      await gameContainerRef.current?.requestFullscreen();
      if (screen.orientation?.lock) {
        await screen.orientation.lock(orientation);
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  };

  const resumeGame = async () => {
    try {
      await gameContainerRef.current?.requestFullscreen();
      if (screen.orientation?.lock) {
        await screen.orientation.lock(orientation);
      }
    } catch (err) {
      console.error("Resume fullscreen error:", err);
    }

    resumeAllScenes();
    setShowResume(false);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = !!document.fullscreenElement;
      if (!isFullscreen && hasStarted) {
        pauseAllScenes();
        setShowResume(true);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [gameInstance, hasStarted]);

  useEffect(() => {
    if (location.pathname !== prevPath.current) {
      gameInstance?.destroy(true);
      setGameInstance(null);
    }
    prevPath.current = location.pathname;
  }, [location.pathname]);

  if (!gameId || !gameDef) return <p>Game not found!</p>;

  const shouldRenderReactGame = gameDef.type === "react";

  return (
    <div className="gameplay-container">
      <h2 className="gameplay-title">{gameDef.name}</h2>

      {/* Game container, always mounted but visibility toggled */}
      <div
        ref={gameContainerRef}
        className={`game-display ${orientation}`}
        style={{ display: hasStarted && !showResume ? "block" : "none" }}
      >
        {shouldRenderReactGame && (
          <div style={{ width: "100%", height: "100%" }}>
            <gameDef.component />
          </div>
        )}
      </div>

      {!hasStarted && (
        <button className="overlay-button" onClick={startGame}>
          Start Game
        </button>
      )}

      {showResume && (
        <button className="overlay-button" onClick={resumeGame}>
          Resume Game
        </button>
      )}
    </div>
  );
}
