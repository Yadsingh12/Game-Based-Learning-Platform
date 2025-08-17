import React, { useEffect, useState } from "react";
import "./StateCapitalMatch.css";

const difficulties = {
  easy: 3,
  medium: 5,
  hard: 10,
};

const StateCapitalMatch = () => {
  const [eligibleStates, setEligibleStates] = useState([]); // store eligible objects once
  const [pairs, setPairs] = useState([]);
  const [states, setStates] = useState([]);
  const [capitals, setCapitals] = useState([]);
  const [matched, setMatched] = useState([]);
  const [difficulty, setDifficulty] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [gameState, setGameState] = useState("start"); // "start", "playing", "end"

  // Fetch and filter eligible objects once on mount
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

  // Start a game whenever difficulty is set
  useEffect(() => {
    if (difficulty && gameState === "playing" && eligibleStates.length) {
      // Shuffle and pick based on difficulty
      const selectedStates = shuffleArray(eligibleStates).slice(0, difficulties[difficulty]);

      const newPairs = selectedStates.map((item) => ({
        name: item.name,
        stateVideo: item.video_path,
        capitalVideo: item.capital_video,
      }));

      setPairs(newPairs);
      setStates(shuffleArray(newPairs.map((p) => ({ name: p.name, video: p.stateVideo }))));
      setCapitals(shuffleArray(newPairs.map((p) => ({ name: p.name, video: p.capitalVideo }))));
      setMatched([]);
      setStartTime(Date.now());
      setEndTime(null);
    }
  }, [difficulty, gameState, eligibleStates]);

  const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

  const handleDrop = (e, targetName) => {
    const draggedName = e.dataTransfer.getData("name");
    if (draggedName === targetName && !matched.includes(draggedName)) {
      const newMatched = [...matched, draggedName];
      setMatched(newMatched);
      if (newMatched.length === pairs.length) {
        setEndTime(Date.now());
        setGameState("end");
      }
    }
  };

  const handleDragStart = (e, name) => {
    e.dataTransfer.setData("name", name);
  };

  const formatTime = (ms) => `${Math.floor(ms / 1000)}s`;

  const startGame = (level) => {
    setDifficulty(level);
    setGameState("playing");
  };

  const DifficultyButtons = () => (
    <div className="difficulty-buttons">
      {Object.keys(difficulties).map((level) => (
        <button key={level} onClick={() => startGame(level)}>
          {level.charAt(0).toUpperCase() + level.slice(1)}
        </button>
      ))}
    </div>
  );

  if (gameState === "start") {
    return (
      <div className="state-capital-match start-screen">
        <h1>🎯 State-Capital Match</h1>
        <p>Select a difficulty level to start the game:</p>
        <DifficultyButtons />
        <div className="instructions">
          <h3>How to Play:</h3>
          <ul>
            <li>Drag the correct capital video to its corresponding state video (or vice versa).</li>
            <li>Match all pairs as fast as you can.</li>
            <li>The game ends when all pairs are correctly matched.</li>
          </ul>
        </div>
      </div>
    );
  }

  if (gameState === "end") {
    return (
      <div className="state-capital-match end-screen">
        <h1>🎉 Game Over!</h1>
        <p>Difficulty: {difficulty}</p>
        <p>Time taken: {formatTime(endTime - startTime)}</p>
        <p>Want to play again? Choose a new difficulty:</p>
        <DifficultyButtons />
      </div>
    );
  }

  return (
    <div className="state-capital-match">
      <h2>Match the State and Capital Videos</h2>
      <div className="game-area">
        <div className="sections">
          <div className="section">
            <h2>States</h2>
            <div className="grid-container">
              {states.map((item) => (
                <div
                  key={item.name}
                  draggable={!matched.includes(item.name)}
                  onDragStart={(e) => handleDragStart(e, item.name)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, item.name)}
                  className={`grid-item drop-target ${matched.includes(item.name) ? "matched" : ""}`}
                >
                  <video src={item.video} muted loop autoPlay playsInline />
                </div>
              ))}
            </div>
          </div>
          <div className="section">
            <h2>Capitals</h2>
            <div className="grid-container">
              {capitals.map((item) => (
                <div
                  key={item.name}
                  draggable={!matched.includes(item.name)}
                  onDragStart={(e) => handleDragStart(e, item.name)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, item.name)}
                  className={`grid-item drop-target ${matched.includes(item.name) ? "matched" : ""}`}
                >
                  <video src={item.video} muted loop autoPlay playsInline />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StateCapitalMatch;
