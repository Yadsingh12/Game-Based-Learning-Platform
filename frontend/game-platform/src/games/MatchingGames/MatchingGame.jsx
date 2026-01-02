import React, { useState } from "react";
import StateCapitalMatch from "../StatesAndCapitals/StateCapitalMatch";
import ColumnMatch from "../ColumnMatch/ColumnMatch";
import AlphabetVideoMatch from "../AlphabetVideoMatch/AlphabetVideoMatch";

const MatchingGame = () => {
  const [selectedGame, setSelectedGame] = useState(null);

  const games = [
    {
      id: "state-capital",
      title: "State-Capital Match",
      icon: "🎯",
      description: "Match US states with their capital cities",
      component: StateCapitalMatch,
      color: "#4F46E5"
    },
    {
      id: "column-match",
      title: "Column Match",
      icon: "🎮",
      description: "Match images with their corresponding videos",
      component: ColumnMatch,
      color: "#7C3AED"
    },
    {
      id: "alphabet-match",
      title: "Alphabet Match",
      icon: "🔠",
      description: "Match letters with alphabet videos and take quizzes",
      component: AlphabetVideoMatch,
      color: "#2563EB"
    }
  ];

  if (selectedGame) {
    const GameComponent = selectedGame.component;
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6" }}>
        <button
          onClick={() => setSelectedGame(null)}
          style={{
            position: "fixed",
            top: "20px",
            left: "20px",
            padding: "12px 24px",
            fontSize: "16px",
            fontWeight: "600",
            color: "white",
            backgroundColor: "#1f2937",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            zIndex: 1000,
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#374151";
            e.target.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#1f2937";
            e.target.style.transform = "scale(1)";
          }}
        >
          ← Back to Game Hub
        </button>
        <GameComponent />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div style={{
        maxWidth: "1200px",
        width: "100%",
        textAlign: "center"
      }}>
        <h1 style={{
          fontSize: "clamp(2.5rem, 6vw, 4rem)",
          fontWeight: "800",
          color: "white",
          marginBottom: "16px",
          textShadow: "0 4px 6px rgba(0, 0, 0, 0.2)"
        }}>
          🎮 Matching Game Hub
        </h1>
        <p style={{
          fontSize: "clamp(1rem, 2vw, 1.25rem)",
          color: "rgba(255, 255, 255, 0.9)",
          marginBottom: "48px",
          maxWidth: "600px",
          margin: "0 auto 48px"
        }}>
          Choose a game to play and test your skills!
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px",
          padding: "0 20px"
        }}>
          {games.map((game) => (
            <div
              key={game.id}
              onClick={() => setSelectedGame(game)}
              style={{
                backgroundColor: "white",
                borderRadius: "16px",
                padding: "32px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
                transform: "translateY(0)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.1)";
              }}
            >
              <div style={{
                fontSize: "4rem",
                marginBottom: "16px"
              }}>
                {game.icon}
              </div>
              <h2 style={{
                fontSize: "1.5rem",
                fontWeight: "700",
                color: game.color,
                marginBottom: "12px"
              }}>
                {game.title}
              </h2>
              <p style={{
                fontSize: "1rem",
                color: "#6b7280",
                marginBottom: "24px",
                lineHeight: "1.6"
              }}>
                {game.description}
              </p>
              <button
                style={{
                  width: "100%",
                  padding: "14px",
                  fontSize: "1rem",
                  fontWeight: "600",
                  color: "white",
                  backgroundColor: game.color,
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.target.style.opacity = "0.9";
                  e.target.style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.opacity = "1";
                  e.target.style.transform = "scale(1)";
                }}
              >
                Play Now
              </button>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: "48px",
          padding: "24px",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          borderRadius: "12px",
          backdropFilter: "blur(10px)"
        }}>
          <p style={{
            color: "white",
            fontSize: "0.9rem",
            margin: 0
          }}>
            💡 Tip: Each game has multiple difficulty levels and modes to challenge yourself!
          </p>
        </div>
      </div>
    </div>
  );
};

export default MatchingGame;