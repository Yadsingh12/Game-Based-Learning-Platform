import React, { useEffect, useState } from "react";
import "./Quiz.css";

const VideoOptionQuiz = () => {
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

  // Fetch labels from JSON
  useEffect(() => {
    fetch("/labels.json")
      .then((res) => res.json())
      .then((data) => {
        const enabled = data.filter((item) => item.enabled);
        setLabels(enabled);
        setRemaining(shuffle([...enabled]));
      });
  }, []);

  const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

  const startQuiz = () => {
    setScore(0);
    setShowCongrats(false);
    setGameOver(false);
    setFeedback(null);
    setHasStarted(true);
    const rem = shuffle([...labels]);
    setRemaining(rem);
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
      // Show wrong feedback briefly, then show Game Over
      setTimeout(() => setGameOver(true), 1500);
    }
  };

  // Screens
  if (!hasStarted) {
    return (
      <div className="quiz-page">
        <h2>🎬 Match the Correct Video</h2>
        <button onClick={startQuiz} className="start-button">
          ▶️ Start Game
        </button>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="quiz-page">
        <h2>💀 Game Over</h2>
        <p>Your final score: {score}</p>
        <button onClick={startQuiz} className="start-button">
          🔁 Try Again
        </button>
      </div>
    );
  }

  if (showCongrats) {
    return (
      <div className="quiz-page">
        <h2>🎉 Congratulations! 🎉</h2>
        <p>You matched all {labels.length} items!</p>
        <button onClick={startQuiz} className="start-button">
          🔁 Restart Game
        </button>
      </div>
    );
  }

  if (!question) return <div className="quiz-page">Loading...</div>;

  return (
    <div className="quiz-page">
      <h2>🖼️ What video represents this image?</h2>

      <div className="question-image-wrapper">
        <img src={question.image} alt="question" className="question-image" />
      </div>

      <div className="score">
        <p>Score: {score}</p>
        <p>Remaining: {remaining.length}</p>
      </div>

      <div className="feedback">{feedback && <p>{feedback}</p>}</div>

      <div className="video-options">
        {options.map((opt) => (
          <video
            key={opt.name}
            src={opt.sample_video}
            autoPlay
            muted
            loop
            playsInline
            className={`option-video ${isDisabled ? "disabled" : ""}`}
            onClick={() => !isDisabled && handleClick(opt)}
          />
        ))}
      </div>
    </div>
  );
};

export default VideoOptionQuiz;
