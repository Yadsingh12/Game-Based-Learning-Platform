import React, { useEffect, useState } from "react";
import "./VideoOptionQuizColors.css";

const VideoOptionQuizColors = () => {
  const [allColors, setAllColors] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [remaining, setRemaining] = useState([]);
  const [question, setQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [isDisabled, setIsDisabled] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

  useEffect(() => {
    fetch("/Colors.json")
      .then((res) => res.json())
      .then((data) => {
        setAllColors(data);

        const qList = [];
        Object.keys(data).forEach((color) => {
          const colorObj = data[color];
          if (colorObj?.images?.length) {
            colorObj.images.forEach((img) => {
              qList.push({
                questionText: img.question,
                image: img.image,
                answerColor: color,
                answerVideo: colorObj.video,
              });
            });
          }
        });


        setQuestions(qList);
        setRemaining(shuffle(qList));
      });
  }, []);

  const startQuiz = () => {
    setScore(0);
    setShowCongrats(false);
    setGameOver(false);
    setFeedback(null);
    setHasStarted(true);

    const rem = shuffle([...questions]);
    setRemaining(rem);
    generateQuestion(rem);
  };

  const generateQuestion = (remainingItems) => {
    if (remainingItems.length === 0) {
      setShowCongrats(true);
      setQuestion(null);
      return;
    }

    const currentQ = remainingItems[0];

    const others = shuffle(
      Object.keys(allColors).filter((c) => c !== currentQ.answerColor)
    ).slice(0, 3);

    const mixedOptions = shuffle([
      ...others.map((c) => ({ color: c, video: allColors[c].video })),
      { color: currentQ.answerColor, video: currentQ.answerVideo },
    ]);

    setQuestion(currentQ);
    setOptions(mixedOptions);
    setFeedback(null);
    setIsDisabled(false);
  };

  const handleClick = (selected) => {
    setIsDisabled(true);

    if (selected.color === question.answerColor) {
      const newRem = remaining.slice(1);
      setScore(score + 1);
      setFeedback("✅ Correct!");
      setTimeout(() => generateQuestion(newRem), 1300);
      setRemaining(newRem);
    } else {
      setFeedback("❌ Wrong! Game Over.");
      setTimeout(() => setGameOver(true), 1500);
    }
  };

  if (!hasStarted) {
    return (
      <div className="color-quiz-game">
        <h2>🎨 Find the Color!</h2>
        <button onClick={startQuiz} className="start-button">
          ▶️ Start Game
        </button>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="color-quiz-game">
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
      <div className="color-quiz-game">
        <h2>🎉 Congratulations! 🎉</h2>
        <p>You answered all {questions.length} correctly!</p>
        <button onClick={startQuiz} className="start-button">
          🔁 Restart Game
        </button>
      </div>
    );
  }

  if (!question) return <div className="color-quiz-game">Loading...</div>;

  return (
    <div className="color-quiz-game">
      <h2>{question.questionText}</h2>

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
            key={opt.color}
            src={opt.video}
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

export default VideoOptionQuizColors;
