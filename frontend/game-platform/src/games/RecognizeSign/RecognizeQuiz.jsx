import React, { useEffect, useState } from "react";
import "./Quiz.css";

const RecognizeQuiz = () => {
  const [labels, setLabels] = useState([]);
  const [remaining, setRemaining] = useState([]);
  const [question, setQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [isDisabled, setIsDisabled] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    fetch("/labels.json")
      .then((res) => res.json())
      .then((data) => {
        const enabled = data.filter((item) => item.enabled);
        setLabels(enabled);
      });
  }, []);

  const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

  const startQuiz = () => {
    const rem = shuffle([...labels]);
    setScore(0);
    setRemaining(rem);
    setShowCongrats(false);
    setGameOver(false);
    setFeedback(null);
    setHasStarted(true);
    generateQuestion(rem);
  };

  const generateQuestion = (remainingItems) => {
    if (remainingItems.length === 0) {
      setShowCongrats(true);
      setQuestion(null);
      return;
    }

    const correct = remainingItems[0];
    const others = labels
      .filter((l) => l.name !== correct.name)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    const mixedOptions = shuffle([...others, correct]);

    setQuestion(correct);
    setOptions(mixedOptions);
    setFeedback(null);
    setIsDisabled(false);
  };

  const handleClick = (selected) => {
    setIsDisabled(true);

    if (selected.name === question.name) {
      const newRem = remaining.slice(1);
      setScore(score + 1);
      setFeedback("✅ Correct!");
      setTimeout(() => generateQuestion(newRem), 1300);
      setRemaining(newRem);
    } else {
      setFeedback("❌ Wrong! Game Over.");
      setTimeout(() => {
        setGameOver(true);
        setHasStarted(false);
        setFeedback(null);
      }, 1500);
    }
  };

  if (gameOver) {
    return (
      <div className="quiz-page">
        <h2>💀 Game Over</h2>
        <p>Your score: {score}</p>
        <button onClick={startQuiz} className="start-button">
          🔁 Try Again
        </button>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="quiz-page">
        <h2>🧠 Recognize the Correct Image</h2>
        <button onClick={startQuiz} className="start-button">
          ▶️ Start Game
        </button>
      </div>
    );
  }

  if (showCongrats) {
    return (
      <div className="quiz-page">
        <h2>🎉 Well Done!</h2>
        <p>You matched all {labels.length} videos to images!</p>
        <button onClick={startQuiz} className="start-button">
          🔁 Restart Game
        </button>
      </div>
    );
  }

  if (!question) return <div className="quiz-page">Loading...</div>;

  return (
    <div className="quiz-page">
      <h2>🎥 What image matches this video?</h2>

      <div className="question-video-wrapper">
        <video
          src={question.sample_video}
          autoPlay
          muted
          loop
          playsInline
          className="question-video"
        />
      </div>

      <div className="score">
        <p>Score: {score}</p>
        <p>Remaining: {remaining.length}</p>
      </div>

      <div className="feedback">{feedback && <p>{feedback}</p>}</div>

      <div className="image-options">
        {options.map((opt) => (
          <img
            key={opt.name}
            src={opt.image}
            alt={opt.name}
            className={`option-image ${isDisabled ? "disabled" : ""}`}
            onClick={() => !isDisabled && handleClick(opt)}
          />
        ))}
      </div>
    </div>
  );
};

export default RecognizeQuiz;
