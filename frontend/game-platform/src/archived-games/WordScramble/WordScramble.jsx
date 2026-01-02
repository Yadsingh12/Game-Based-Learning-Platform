import React, { useEffect, useState } from "react";
import "./WordScramble.css";

export default function WordScrambleGame() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [chars, setChars] = useState([]);
  const [dragIndex, setDragIndex] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Load questions from labels.json
  useEffect(() => {
    fetch("/labels.json")
      .then((res) => res.json())
      .then((data) => {
        const enabled = data.filter((q) => q.enabled);
        setQuestions(enabled);
        if (enabled.length > 0) {
          startGame(enabled[Math.floor(Math.random() * enabled.length)]);
        }
      });
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!gameOver && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !gameOver) {
      endGame(false);
    }
  }, [timeLeft, gameOver]);

  const shuffle = (word) => {
    return word.split("").sort(() => Math.random() - 0.5);
  };

  const startGame = (question) => {
    setCurrentQuestion(question);
    setChars(shuffle(question.name));
    setShowHint(false);
    setTimeLeft(30);
    setGameOver(false);
    setIsCorrect(false);
  };

  const handleDragStart = (index) => {
    setDragIndex(index);
  };

  const handleDrop = (index) => {
    const newChars = [...chars];
    const temp = newChars[dragIndex];
    newChars[dragIndex] = newChars[index];
    newChars[index] = temp;
    setChars(newChars);
    setDragIndex(null);
  };

  const checkAnswer = () => {
    if (chars.join("") === currentQuestion.name) {
      endGame(true);
    } else {
      endGame(false);
    }
  };

  const endGame = (correct) => {
    setGameOver(true);
    setIsCorrect(correct);
  };

  const restartGame = () => {
    if (questions.length > 0) {
      startGame(questions[Math.floor(Math.random() * questions.length)]);
    }
  };

  if (!currentQuestion) return <p>Loading...</p>;

  return (
    <div id="word-scramble-game">
      {!gameOver ? (
        <div className="game-screen">
          <h2>Arrange the letters</h2>
          <video
            width="320"
            height="240"
            muted
            autoPlay
            loop
            src={currentQuestion.sample_video}
          />
          <div className="letters">
            {chars.map((ch, i) => (
              <div
                key={i}
                className="letter"
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(i)}
              >
                {ch}
              </div>
            ))}
          </div>
          <p>Time left: {timeLeft}s</p>
          <button onClick={checkAnswer}>Submit</button>
          <button onClick={() => setShowHint(true)}>Hint</button>
          {showHint && <p className="hint">{currentQuestion.description}</p>}
        </div>
      ) : (
        <div className="end-screen">
          <h2>{isCorrect ? "✅ Correct!" : "❌ Wrong!"}</h2>
          <p>Correct Answer: {currentQuestion.name}</p>
          <button onClick={restartGame}>Restart</button>
        </div>
      )}
    </div>
  );
}
