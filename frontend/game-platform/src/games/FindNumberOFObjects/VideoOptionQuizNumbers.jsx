import React, { useEffect, useState } from "react";
import "./VideoOptionQuizNumbers.css";

const VideoOptionQuizNumbers = () => {
  const [allNumbers, setAllNumbers] = useState([]);
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

  // Shuffle helper
  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

  // Fetch questions from JSON
  useEffect(() => {
    fetch("/numbers.json")
      .then((res) => res.json())
      .then((data) => {
        setAllNumbers(data);

        // Flatten into individual questions
        const qList = [];
        data.forEach((num) => {
          num.images.forEach((img) => {
            qList.push({
              questionText: img.question,
              image: img.image,
              answerValue: num.value,
              answerVideo: num.video,
            });
          });
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

    // pick 3 wrong answers
    const others = shuffle(
      allNumbers.filter((n) => n.value !== currentQ.answerValue)
    ).slice(0, 3);

    const mixedOptions = shuffle([
      ...others.map((o) => ({ value: o.value, video: o.video })),
      { value: currentQ.answerValue, video: currentQ.answerVideo },
    ]);

    setQuestion(currentQ);
    setOptions(mixedOptions);
    setFeedback(null);
    setIsDisabled(false);
  };

  const handleClick = (selected) => {
    setIsDisabled(true);

    if (selected.value === question.answerValue) {
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

  // Screens
  if (!hasStarted) {
    return (
      <div className="number-quiz-game">
        <h2>🔢 How Many Objects?</h2>
        <button onClick={startQuiz} className="start-button">
          ▶️ Start Game
        </button>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="number-quiz-game">
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
      <div className="number-quiz-game">
        <h2>🎉 Congratulations! 🎉</h2>
        <p>You answered all {questions.length} correctly!</p>
        <button onClick={startQuiz} className="start-button">
          🔁 Restart Game
        </button>
      </div>
    );
  }

  if (!question) return <div className="number-quiz-game">Loading...</div>;

  return (
    <div className="number-quiz-game">
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
            key={opt.value}
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

export default VideoOptionQuizNumbers;
