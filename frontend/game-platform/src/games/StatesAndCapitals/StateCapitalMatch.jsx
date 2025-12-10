import React, { useEffect, useState } from "react";
import "./StateCapitalMatch.css";

const difficulties = { easy: 3, medium: 5, hard: 10 };

const StateCapitalMatch = () => {
  const [eligibleStates, setEligibleStates] = useState([]);
  const [pairs, setPairs] = useState([]);
  const [states, setStates] = useState([]);
  const [capitals, setCapitals] = useState([]);
  const [matched, setMatched] = useState([]);
  const [difficulty, setDifficulty] = useState(null);
  const [gameState, setGameState] = useState("start");
  const [hintMap, setHintMap] = useState({}); // track hints per card

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/stateData.json");
      const data = await res.json();
      const filtered = Object.values(data).filter(
        (item) => item.type === "state" && item.capital_enabled
      );
      setEligibleStates(filtered);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (difficulty && gameState === "playing" && eligibleStates.length) {
      const selectedStates = shuffleArray(eligibleStates).slice(0, difficulties[difficulty]);
      const newPairs = selectedStates.map((item) => ({
        name: item.name,
        capital: item.capital,
        stateVideo: item.video_path,
        capitalVideo: item.capital_video,
      }));
      setPairs(newPairs);
      setStates(shuffleArray(newPairs.map((p) => ({ ...p }))));
      setCapitals(shuffleArray(newPairs.map((p) => ({ ...p }))));
      setMatched([]);
      setHintMap({});
    }
  }, [difficulty, gameState, eligibleStates]);

  const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

  const handleDragStart = (e, name) => {
    e.dataTransfer.setData("name", name);
  };

  const handleDrop = (e, targetName) => {
    const draggedName = e.dataTransfer.getData("name");
    const pair = pairs.find((p) => p.name === draggedName);
    if (!pair) return;

    if (pair.name === targetName) {
      // correct match: mark matched
      setMatched((prev) => [...prev, draggedName]);
      // check if game over
      if (matched.length + 1 === pairs.length) {
        setTimeout(() => setGameState("end"), 300);
      }
    } else {
      // temporary wrong feedback on this target only
      const el = document.getElementById(`capital-${targetName}`);
      if (el) {
        el.classList.add("wrong");
        setTimeout(() => el.classList.remove("wrong"), 800);
      }
    }
  };

  const showHint = (key, text) => {
    setHintMap((prev) => ({ ...prev, [key]: text }));
    setTimeout(() => setHintMap((prev) => ({ ...prev, [key]: null })), 2000);
  };

  const startGame = (level) => {
    setDifficulty(level);
    setGameState("playing");
  };

  const restartGame = () => {
    setGameState("playing");
    setMatched([]);
    setHintMap({});
  };

  const goToStart = () => {
    setGameState("start");
    setDifficulty(null);
    setMatched([]);
    setHintMap({});
  };

  if (gameState === "start") {
    return (
      <div className="state-capital-match start-screen">
        <h1>🎯 State-Capital Match</h1>
        <p>Select a difficulty to start the game:</p>
        <div className="difficulty-buttons">
          {Object.keys(difficulties).map((lvl) => (
            <button key={lvl} onClick={() => startGame(lvl)}>
              {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (gameState === "end") {
    return (
      <div className="state-capital-match end-screen">
        <h1>🎉 Game Over!</h1>
        <p>Difficulty: {difficulty}</p>
        <p>Matched {matched.length} pairs successfully!</p>
        <div className="difficulty-buttons">
          <button onClick={restartGame}>Restart</button>
          <button onClick={goToStart}>Back to Start</button>
        </div>
      </div>
    );
  }

  return (
    <div className="state-capital-match">
      <h2>Match the State and Capital Videos</h2>
      <div className="game-area">
        <div className="sections">
          {/* States */}
          <div className="section">
            <h2>States</h2>
            <div className="grid-container">
              {states.map((item) => {
                const key = `state-${item.name}`;
                return (
                  <div
                    key={key}
                    className={`item-card ${matched.includes(item.name) ? "matched" : ""}`}
                    draggable={!matched.includes(item.name)}
                    onDragStart={(e) => handleDragStart(e, item.name)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, item.name)}
                  >
                    <video src={item.stateVideo} muted loop autoPlay playsInline />
                    {hintMap[key] ? (
                      <div className="hint-text">{hintMap[key]}</div>
                    ) : (
                      <button className="hint-btn" onClick={() => showHint(key, item.name)}>
                        Hint
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Capitals */}
          <div className="section">
            <h2>Capitals</h2>
            <div className="grid-container">
              {capitals.map((item) => {
                const key = `capital-${item.name}`;
                return (
                  <div
                    id={key}
                    key={key}
                    className={`item-card ${matched.includes(item.name) ? "matched" : ""}`}
                    draggable={false} // only states draggable
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, item.name)}
                  >
                    <video src={item.capitalVideo} muted loop autoPlay playsInline />
                    {hintMap[key] ? (
                      <div className="hint-text">{hintMap[key]}</div>
                    ) : (
                      <button className="hint-btn" onClick={() => showHint(key, item.capital)}>
                        Hint
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StateCapitalMatch;
