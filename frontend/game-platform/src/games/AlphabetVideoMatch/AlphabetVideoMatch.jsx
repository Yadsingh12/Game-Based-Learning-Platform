// AlphabetVideoMatch.jsx
import React, { useState, useEffect } from "react";
import "./AlphabetVideoMatch.css";

const difficulties = {
  easy: 2,
  medium: 4,
  hard: 6,
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
  const [gameState, setGameState] = useState("start"); // start, playing, quiz, result
  const [mode, setMode] = useState(null); // match or quiz

  // temporary state to highlight wrong drop target
  const [wrongDropTarget, setWrongDropTarget] = useState(null);

  // Quiz state
  const [quizAlphabets, setQuizAlphabets] = useState([]);
  const [currentQues, setCurrentQues] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizTimer, setQuizTimer] = useState(QUIZ_TIME);
  const [shownAlphabet, setShownAlphabet] = useState("");
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(null); // feedback

  const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

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

  // Match drop handling (updated to support wrong/correct UI)
  const handleDrop = (e, targetName) => {
    e.preventDefault();
    const draggedName = e.dataTransfer.getData("name");

    // correct match
    if (draggedName === targetName && !matched.includes(draggedName)) {
      const newMatched = [...matched, draggedName];
      setMatched(newMatched);

      if (newMatched.length === alphabets.length) {
        setEndTime(Date.now());
        setGameState("result");
      }
      return;
    }

    // wrong match -> flash the target
    setWrongDropTarget(targetName);
    setTimeout(() => setWrongDropTarget(null), 700);
  };

  const handleDragStart = (e, name) => {
    e.dataTransfer.setData("name", name);
    // (optional) could set a drag image here if needed
  };

  const formatTime = (ms) => `${Math.floor(ms / 1000)}s`;

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
      if (currentQues + 1 >= TOTAL_QUIZ_QUESTIONS) setGameState("result");
      else {
        setCurrentQues(currentQues + 1);
        setQuizTimer(QUIZ_TIME);
        setLastAnswerCorrect(null);
      }
    }, 800);
  };

  // ---------------- Reset / Back to Main Menu ----------------
  const goToMainMenu = () => {
    setGameState("start");
    setMode(null);
    setDifficulty(null);
    setAlphabets([]);
    setLetters([]);
    setVideos([]);
    setMatched([]);
    setStartTime(null);
    setEndTime(null);
    setQuizAlphabets([]);
    setCurrentQues(0);
    setQuizScore(0);
    setQuizTimer(QUIZ_TIME);
    setShownAlphabet("");
    setLastAnswerCorrect(null);
    setWrongDropTarget(null);
  };

  // ---------------- Start Screen ----------------
  if (gameState === "start") {
    return (
      <div className="alphabet-match start-screen">
        <h1>🔠 Alphabet Match</h1>
        <p>Select a difficulty or mode to start the game:</p>
        <DifficultyButtons />
      </div>
    );
  }

  // ---------------- Result Screen ----------------
  if (gameState === "result") {
    return (
      <div className="alphabet-match end-screen">
        <h1>🎉 Game Over!</h1>
        {mode === "quiz" ? (
          <p>
            Your Score: {quizScore} / {TOTAL_QUIZ_QUESTIONS}
          </p>
        ) : (
          <>
            <p>Difficulty: {difficulty}</p>
            <p>Time taken: {formatTime(endTime - startTime)}</p>
          </>
        )}
        <div className="difficulty-buttons">
          <button onClick={restartGame}>Restart</button>
          <button onClick={goToMainMenu}>Go Back to Main Menu</button>
        </div>
      </div>
    );
  }

  // ---------------- Quiz Screen ----------------
  if (gameState === "quiz") {
    const currentAlphabet = quizAlphabets[currentQues];
    if (!currentAlphabet) return <div>Loading quiz...</div>;

    return (
      <div className="alphabet-match quiz-screen">
        <button className="back-button" onClick={goToMainMenu}>
          ⬅ Back to Main Menu
        </button>

        <p className="quiz-instruction">
          Watch the video and check the letter shown. Click ✅ if correct, ❌ if wrong.
        </p>

        <div className="quiz-info">
          <span>
            Question {currentQues + 1} / {TOTAL_QUIZ_QUESTIONS}
          </span>
          <span>Score: {quizScore}</span>
          <span>Time left: {quizTimer}s</span>
        </div>

        <div className="quiz-content">
          <video src={currentAlphabet.video} muted loop autoPlay playsInline />
          <h1>{shownAlphabet}</h1>
        </div>

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

        <div className="quiz-buttons">
          <button onClick={() => handleQuizAnswer(shownAlphabet === currentAlphabet.name)}>
            ✅ Yes
          </button>
          <button onClick={() => handleQuizAnswer(shownAlphabet !== currentAlphabet.name)}>
            ❌ No
          </button>
        </div>
      </div>
    );
  }

  // ---------------- Alphabet Match Game Screen ----------------
  return (
    <div className="alphabet-match">
      <button className="back-button" onClick={goToMainMenu}>
        ⬅ Back to Main Menu
      </button>

      <h2>Match Alphabets with Videos</h2>
      <p className="difficulty-label">Difficulty: {difficulty}</p>

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
