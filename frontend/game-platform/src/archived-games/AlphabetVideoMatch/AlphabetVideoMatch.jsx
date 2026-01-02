// AlphabetVideoMatch.jsx
import React, { useState, useEffect } from "react";
import "./AlphabetVideoMatch.css";

const difficulties = {
  easy: 2,
  medium: 4,
  hard: 6,
};

const MAX_WRONG_ATTEMPTS = {
  easy: 5,
  medium: 4,
  hard: 3,
};

const TOTAL_QUIZ_QUESTIONS = 10;
const QUIZ_TIME = 30;

const AlphabetVideoMatch = () => {
  const [alphabets, setAlphabets] = useState([]);
  const [letters, setLetters] = useState([]);
  const [videos, setVideos] = useState([]);
  const [matched, setMatched] = useState([]);
  const [difficulty, setDifficulty] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [gameState, setGameState] = useState("start");
  const [mode, setMode] = useState(null);
  const [wrongDropTarget, setWrongDropTarget] = useState(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [showScores, setShowScores] = useState(false);

  // Quiz state
  const [quizAlphabets, setQuizAlphabets] = useState([]);
  const [currentQues, setCurrentQues] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizTimer, setQuizTimer] = useState(QUIZ_TIME);
  const [shownAlphabet, setShownAlphabet] = useState("");
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(null);

  const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

  // Load scores from localStorage
  const getStoredScores = (key) => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : { highScore: null, prevScore: null };
    } catch {
      return { highScore: null, prevScore: null };
    }
  };

  // Save scores to localStorage
  const saveScore = (key, score, isTimeScore = false) => {
    try {
      const scores = getStoredScores(key);
      const newScores = {
        highScore: scores.highScore === null 
          ? score 
          : isTimeScore 
            ? Math.min(scores.highScore, score) // Lower time is better
            : Math.max(scores.highScore, score), // Higher score is better
        prevScore: score,
      };
      localStorage.setItem(key, JSON.stringify(newScores));
    } catch (e) {
      console.error("Failed to save score:", e);
    }
  };

  // Alphabet match setup
  useEffect(() => {
    if (mode === "match" && difficulty && gameState === "playing") {
      const alphabetArray = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((ch) => ({
        name: ch,
        video: `/videos/Alphabets/${ch}.mp4`,
      }));
      const selected = shuffleArray(alphabetArray).slice(0, difficulties[difficulty]);
      setAlphabets(selected);
      setLetters(shuffleArray(selected));
      setVideos(shuffleArray(selected));
      setMatched([]);
      setWrongAttempts(0);
      setStartTime(Date.now());
      setEndTime(null);
      setWrongDropTarget(null);
    }
  }, [difficulty, gameState, mode]);

  // Quiz setup
  useEffect(() => {
    if (mode === "quiz" && gameState === "quiz") {
      const alphabetArray = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((ch) => ({
        name: ch,
        video: `/videos/Alphabets/${ch}.mp4`,
      }));
      const selected = shuffleArray(alphabetArray).slice(0, TOTAL_QUIZ_QUESTIONS);
      setQuizAlphabets(selected);
      setCurrentQues(0);
      setQuizScore(0);
      setQuizTimer(QUIZ_TIME);
      setLastAnswerCorrect(null);
    }
  }, [mode, gameState]);

  // Quiz timer
  useEffect(() => {
    if (mode === "quiz" && gameState === "quiz") {
      if (quizTimer <= 0) {
        handleQuizAnswer(false);
        return;
      }
      const timer = setTimeout(() => setQuizTimer(quizTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [quizTimer, mode, gameState]);

  // Update shownAlphabet per question
  useEffect(() => {
    if (mode === "quiz" && quizAlphabets[currentQues]) {
      const currentAlphabet = quizAlphabets[currentQues];
      const isMatch = Math.random() > 0.5;
      const alphabetToShow = isMatch
        ? currentAlphabet.name
        : shuffleArray(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").filter((ch) => ch !== currentAlphabet.name)
          )[0];
      setShownAlphabet(alphabetToShow);
      setLastAnswerCorrect(null);
    }
  }, [currentQues, quizAlphabets, mode]);

  const handleDrop = (e, targetName) => {
    e.preventDefault();
    const draggedName = e.dataTransfer.getData("name");

    if (draggedName === targetName && !matched.includes(draggedName)) {
      const newMatched = [...matched, draggedName];
      setMatched(newMatched);

      if (newMatched.length === alphabets.length) {
        const timeTaken = Date.now() - startTime;
        setEndTime(Date.now());
        saveScore(`alphabet-match-${difficulty}`, Math.floor(timeTaken / 1000), true); // true = time score
        setGameState("result");
      }
      return;
    }

    // Wrong attempt
    const newWrongAttempts = wrongAttempts + 1;
    setWrongAttempts(newWrongAttempts);
    setWrongDropTarget(targetName);
    setTimeout(() => setWrongDropTarget(null), 700);

    // Check if max wrong attempts reached
    if (newWrongAttempts >= MAX_WRONG_ATTEMPTS[difficulty]) {
      setTimeout(() => {
        setGameState("failed");
      }, 800);
    }
  };

  const handleDragStart = (e, name) => {
    e.dataTransfer.setData("name", name);
  };

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  const startGame = (level) => {
    setDifficulty(level);
    setMode("match");
    setGameState("playing");
  };

  const startQuiz = () => {
    setMode("quiz");
    setGameState("quiz");
  };

  const restartGame = () => {
    if (mode === "quiz") startQuiz();
    else if (mode === "match") startGame(difficulty);
  };

  const goToModeSelection = () => {
    setGameState("start");
    setMode(null);
    setDifficulty(null);
  };

  const DifficultyButtons = () => (
    <div className="difficulty-buttons">
      {Object.keys(difficulties).map((level) => (
        <button key={level} onClick={() => startGame(level)}>
          {level.charAt(0).toUpperCase() + level.slice(1)}
        </button>
      ))}
      <button onClick={startQuiz}>Is This Correct? Quiz</button>
    </div>
  );

  const handleQuizAnswer = (isCorrect) => {
    setLastAnswerCorrect(isCorrect);
    if (isCorrect) setQuizScore(quizScore + 1);
    setTimeout(() => {
      if (currentQues + 1 >= TOTAL_QUIZ_QUESTIONS) {
        const score = quizScore + (isCorrect ? 1 : 0);
        saveScore('alphabet-quiz', score);
        setGameState("result");
      } else {
        setCurrentQues(currentQues + 1);
        setQuizTimer(QUIZ_TIME);
        setLastAnswerCorrect(null);
      }
    }, 800);
  };

  // Info Modal
  if (showInfo) {
    return (
      <div className="alphabet-match info-screen">
        <div className="info-modal">
          <button className="close-info-btn" onClick={() => setShowInfo(false)}>✕</button>
          <h2>📖 How to Play</h2>
          
          <div className="info-section">
            <h3>🎯 Alphabet Match Game</h3>
            <ul>
              <li><strong>Objective:</strong> Match alphabet letters with their corresponding sign language videos</li>
              <li><strong>How to Play:</strong> Drag letters from the left and drop them onto matching videos on the right</li>
              <li><strong>Wrong Attempts:</strong> 
                <span className="attempts-info">Easy: {MAX_WRONG_ATTEMPTS.easy} | Medium: {MAX_WRONG_ATTEMPTS.medium} | Hard: {MAX_WRONG_ATTEMPTS.hard}</span>
              </li>
              <li><strong>Scoring:</strong> Complete as fast as possible! Lower time = better score</li>
            </ul>
          </div>

          <div className="info-section">
            <h3>❓ Is This Correct? Quiz</h3>
            <ul>
              <li><strong>Objective:</strong> Verify if the shown letter matches the sign language video</li>
              <li><strong>How to Play:</strong> Watch the video and click ✅ if correct or ❌ if wrong</li>
              <li><strong>Time Limit:</strong> {QUIZ_TIME} seconds per question</li>
              <li><strong>Questions:</strong> {TOTAL_QUIZ_QUESTIONS} questions total</li>
              <li><strong>Scoring:</strong> Get as many correct answers as possible</li>
            </ul>
          </div>

          <div className="info-section">
            <h3>🏆 Scoring System</h3>
            <ul>
              <li><strong>Match Game:</strong> Time taken to complete (lower is better)</li>
              <li><strong>Quiz:</strong> Number of correct answers out of {TOTAL_QUIZ_QUESTIONS}</li>
              <li>Your best score and previous score are saved automatically</li>
            </ul>
          </div>

          <button className="info-close-btn" onClick={() => setShowInfo(false)}>Got it!</button>
        </div>
      </div>
    );
  }

  // High Scores Modal
  if (showScores) {
    const easyScores = getStoredScores('alphabet-match-easy');
    const mediumScores = getStoredScores('alphabet-match-medium');
    const hardScores = getStoredScores('alphabet-match-hard');
    const quizScores = getStoredScores('alphabet-quiz');

    return (
      <div className="alphabet-match info-screen">
        <div className="info-modal scores-modal">
          <button className="close-info-btn" onClick={() => setShowScores(false)}>✕</button>
          <h2>🏆 High Scores</h2>
          
          <div className="scores-grid">
            <div className="score-card">
              <h3>🎯 Match Game - Easy</h3>
              <div className="score-details">
                {easyScores.highScore !== null ? (
                  <>
                    <div className="score-row">
                      <span>🥇 Best Time:</span>
                      <span className="score-highlight">{easyScores.highScore}s</span>
                    </div>
                    {easyScores.prevScore !== null && (
                      <div className="score-row">
                        <span>📊 Last:</span>
                        <span>{easyScores.prevScore}s</span>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="no-score">No games played yet</p>
                )}
              </div>
            </div>

            <div className="score-card">
              <h3>🎯 Match Game - Medium</h3>
              <div className="score-details">
                {mediumScores.highScore !== null ? (
                  <>
                    <div className="score-row">
                      <span>🥇 Best Time:</span>
                      <span className="score-highlight">{mediumScores.highScore}s</span>
                    </div>
                    {mediumScores.prevScore !== null && (
                      <div className="score-row">
                        <span>📊 Last:</span>
                        <span>{mediumScores.prevScore}s</span>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="no-score">No games played yet</p>
                )}
              </div>
            </div>

            <div className="score-card">
              <h3>🎯 Match Game - Hard</h3>
              <div className="score-details">
                {hardScores.highScore !== null ? (
                  <>
                    <div className="score-row">
                      <span>🥇 Best Time:</span>
                      <span className="score-highlight">{hardScores.highScore}s</span>
                    </div>
                    {hardScores.prevScore !== null && (
                      <div className="score-row">
                        <span>📊 Last:</span>
                        <span>{hardScores.prevScore}s</span>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="no-score">No games played yet</p>
                )}
              </div>
            </div>

            <div className="score-card">
              <h3>❓ Is This Correct? Quiz</h3>
              <div className="score-details">
                {quizScores.highScore !== null ? (
                  <>
                    <div className="score-row">
                      <span>🥇 Best Score:</span>
                      <span className="score-highlight">{quizScores.highScore}/{TOTAL_QUIZ_QUESTIONS}</span>
                    </div>
                    {quizScores.prevScore !== null && (
                      <div className="score-row">
                        <span>📊 Last:</span>
                        <span>{quizScores.prevScore}/{TOTAL_QUIZ_QUESTIONS}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="no-score">No games played yet</p>
                )}
              </div>
            </div>
          </div>

          <button className="info-close-btn" onClick={() => setShowScores(false)}>Close</button>
        </div>
      </div>
    );
  }

  // Start Screen
  if (gameState === "start") {
    return (
      <div className="alphabet-match start-screen">
        <h1>🔠 Alphabet Match</h1>
        <p>Select a difficulty or mode to start the game:</p>
        <DifficultyButtons />
        <div className="menu-buttons">
          <button className="info-btn" onClick={() => setShowInfo(true)}>
            ℹ️ How to Play
          </button>
          <button className="info-btn scores-btn" onClick={() => setShowScores(true)}>
            🏆 High Scores
          </button>
        </div>
      </div>
    );
  }

  // Failed Screen
  if (gameState === "failed") {
    return (
      <div className="alphabet-match end-screen">
        <h1>😔 Game Over!</h1>
        <p style={{ fontSize: "1.3rem", color: "#dc3545", fontWeight: "bold" }}>
          Too many wrong attempts!
        </p>
        <p style={{ color: "#6c757d" }}>
          You reached the maximum of {MAX_WRONG_ATTEMPTS[difficulty]} wrong attempts for {difficulty} difficulty.
        </p>
        <div className="difficulty-buttons">
          <button onClick={restartGame}>🔄 Try Again</button>
          <button onClick={goToModeSelection}>🏠 Back to Menu</button>
        </div>
      </div>
    );
  }

  // Result Screen
  if (gameState === "result") {
    const scores = mode === "quiz" 
      ? getStoredScores('alphabet-quiz')
      : getStoredScores(`alphabet-match-${difficulty}`);

    return (
      <div className="alphabet-match end-screen">
        <h1>🎉 {mode === "quiz" ? "Quiz Complete!" : "Well Done!"}</h1>
        {mode === "quiz" ? (
          <>
            <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#007bff" }}>
              Your Score: {quizScore} / {TOTAL_QUIZ_QUESTIONS}
            </p>
            <div className="score-display">
              {scores.highScore !== null && (
                <div className="score-item">
                  <span className="score-label">🏆 High Score:</span>
                  <span className="score-value">{scores.highScore} / {TOTAL_QUIZ_QUESTIONS}</span>
                </div>
              )}
              {scores.prevScore !== null && scores.prevScore !== quizScore && (
                <div className="score-item">
                  <span className="score-label">📊 Previous:</span>
                  <span className="score-value">{scores.prevScore} / {TOTAL_QUIZ_QUESTIONS}</span>
                </div>
              )}
            </div>
            <p style={{ color: "#6c757d" }}>
              {quizScore >= 8 ? "Excellent! 🌟" : quizScore >= 6 ? "Good job! 👍" : "Keep practicing! 💪"}
            </p>
          </>
        ) : (
          <>
            <p style={{ fontSize: "1.3rem", color: "#495057" }}>
              <strong>Difficulty:</strong> {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </p>
            <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#28a745" }}>
              Time taken: {formatTime(endTime - startTime)}
            </p>
            <div className="score-display">
              {scores.highScore !== null && (
                <div className="score-item">
                  <span className="score-label">🏆 Best Time:</span>
                  <span className="score-value">{scores.highScore}s</span>
                </div>
              )}
              {scores.prevScore !== null && scores.prevScore !== Math.floor((endTime - startTime) / 1000) && (
                <div className="score-item">
                  <span className="score-label">📊 Previous:</span>
                  <span className="score-value">{scores.prevScore}s</span>
                </div>
              )}
            </div>
            <p style={{ color: "#6c757d", fontSize: "0.95rem", marginTop: "0.5rem" }}>
              Wrong Attempts: {wrongAttempts} / {MAX_WRONG_ATTEMPTS[difficulty]}
            </p>
          </>
        )}
        <div className="difficulty-buttons">
          <button onClick={restartGame}>🔄 Restart</button>
          <button onClick={goToModeSelection}>🏠 Back to Menu</button>
        </div>
      </div>
    );
  }

  // Quiz Screen
  if (gameState === "quiz") {
    const currentAlphabet = quizAlphabets[currentQues];
    if (!currentAlphabet) return <div>Loading quiz...</div>;

    return (
      <div className="alphabet-match quiz-screen">
        <button className="back-to-difficulty-btn" onClick={goToModeSelection}>
          ↩ Back to Menu
        </button>

        <div className="quiz-container">
          <p className="quiz-instruction">
            Watch the video and check the letter shown. Click ✅ if correct, ❌ if wrong.
          </p>

          <div className="quiz-info">
            <span>Question {currentQues + 1}/{TOTAL_QUIZ_QUESTIONS}</span>
            <span>Score: {quizScore}</span>
            <span style={{ color: quizTimer <= 5 ? "#dc3545" : "#007bff", fontWeight: "bold" }}>
              Time: {quizTimer}s
            </span>
          </div>

          <div className="quiz-content">
            <div className="quiz-video-wrapper">
              <video src={currentAlphabet.video} muted loop autoPlay playsInline />
            </div>
            <div className="quiz-letter-wrapper">
              <h1>{shownAlphabet}</h1>
            </div>
          </div>

          <div className="quiz-feedback-wrapper">
            <p
              className={`answer-feedback ${
                lastAnswerCorrect === null ? "" : lastAnswerCorrect ? "correct" : "wrong"
              }`}
            >
              {lastAnswerCorrect === null
                ? ""
                : lastAnswerCorrect
                ? "✅ Correct!"
                : "❌ Wrong!"}
            </p>
          </div>

          <div className="quiz-buttons">
            <button onClick={() => handleQuizAnswer(shownAlphabet === currentAlphabet.name)}>
              ✅ Yes
            </button>
            <button onClick={() => handleQuizAnswer(shownAlphabet !== currentAlphabet.name)}>
              ❌ No
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Alphabet Match Game Screen
  return (
    <div className="alphabet-match">
      <button className="back-to-difficulty-btn" onClick={goToModeSelection}>
        ↩ Back to Menu
      </button>

      <h2 style={{ textAlign: "center", fontSize: "clamp(1.3rem, 3vw, 1.8rem)", margin: "0.5rem 0", color: "#212529" }}>
        Match Alphabets with Videos
      </h2>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <p className="difficulty-label" style={{ margin: 0 }}>Difficulty: {difficulty}</p>
        <p className="attempts-counter" style={{ 
          margin: 0,
          fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
          fontWeight: "600",
          color: wrongAttempts >= MAX_WRONG_ATTEMPTS[difficulty] - 1 ? "#dc3545" : "#495057"
        }}>
          Wrong Attempts: {wrongAttempts} / {MAX_WRONG_ATTEMPTS[difficulty]}
        </p>
      </div>

      <div className="game-area">
        <div className="sections">
          <div className="section">
            <h2>Alphabets</h2>
            <div className="grid-container">
              {letters.map((item) => (
                <div
                  key={item.name}
                  draggable={!matched.includes(item.name)}
                  onDragStart={(e) => handleDragStart(e, item.name)}
                  className={`grid-item letter ${matched.includes(item.name) ? "matched" : ""}`}
                >
                  {item.name}
                </div>
              ))}
            </div>
          </div>
          <div className="section">
            <h2>Videos</h2>
            <div className="grid-container">
              {videos.map((item) => (
                <div
                  key={item.name}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, item.name)}
                  className={`grid-item drop-target ${
                    matched.includes(item.name) ? "correct" : ""
                  } ${wrongDropTarget === item.name ? "wrong" : ""}`}
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

export default AlphabetVideoMatch;