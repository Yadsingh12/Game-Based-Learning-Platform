import React, { useState, useEffect } from "react";
import "./VideoOptionQuizNumbers.css";

// Feedback Modal
const MessageModal = ({ message, onClose, video }) => (
  <div className="modal-overlay">
    <div className="modal-content">
      <p className="modal-message">{message}</p>
      {video && (
        <video width="300" controls autoPlay>
          <source src={video} type="video/mp4" />
        </video>
      )}
      <button onClick={onClose} className="modal-close-btn">Close</button>
    </div>
  </div>
);

// Confirmation Modal
const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="modal-overlay">
    <div className="modal-content">
      <p className="modal-message">{message}</p>
      <div className="confirm-buttons">
        <button className="modal-close-btn" onClick={onConfirm}>Yes</button>
        <button className="modal-close-btn" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  </div>
);

export default function VideoOptionQuizNumbers() {
  const [mode, setMode] = useState("learn");
  
  // Data
  const [allNumbers, setAllNumbers] = useState([]);
  const [questions, setQuestions] = useState([]);
  
  // Test state
  const [remaining, setRemaining] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  
  // Scores
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => Number(localStorage.getItem("best_numbers_score") || 0));
  const [previousScore, setPreviousScore] = useState(() => Number(localStorage.getItem("previous_numbers_score") || 0));
  
  // Feedback modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [videoSrc, setVideoSrc] = useState(null);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(null);
  
  // Confirmation modal
  const [pendingMode, setPendingMode] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Shuffle helper
  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

  // Fetch data on mount
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
      });
  }, []);

  const startTest = () => {
    const rem = shuffle([...questions]);
    setRemaining(rem);
    setScore(0);
    generateQuestion(rem);
    setMode("test");
  };

  const generateQuestion = (remainingItems) => {
    if (remainingItems.length === 0) {
      endTest(score);
      return;
    }

    const currentQ = remainingItems[0];
    
    // Pick 3 wrong answers
    const others = shuffle(
      allNumbers.filter((n) => n.value !== currentQ.answerValue)
    ).slice(0, 3);

    const mixedOptions = shuffle([
      ...others.map((o) => ({ value: o.value, video: o.video })),
      { value: currentQ.answerValue, video: currentQ.answerVideo },
    ]);

    setCurrentQuestion(currentQ);
    setOptions(mixedOptions);
  };

  const endTest = (finalScore) => {
    localStorage.setItem("previous_numbers_score", finalScore);
    setPreviousScore(finalScore);

    if (finalScore > bestScore) {
      localStorage.setItem("best_numbers_score", finalScore);
      setBestScore(finalScore);
    }

    setRemaining([]);
    setCurrentQuestion(null);
    setOptions([]);
    setLastAnswerCorrect(null);
    setScore(0);
    setMode("learn");
  };

  const handleClick = (selected) => {
    if (mode === "learn") {
      setVideoSrc(selected.video);
      setMessage(`This is ${selected.value}.`);
      setIsModalVisible(true);
      setLastAnswerCorrect(null);
      return;
    }

    if (mode === "test") {
      if (selected.value === currentQuestion.answerValue) {
        setScore(score + 1);
        setMessage("Correct! 🎉");
        setVideoSrc(selected.video);
        setLastAnswerCorrect(true);
      } else {
        setMessage("Try again ❌");
        setVideoSrc(null);
        setLastAnswerCorrect(false);
      }
      setIsModalVisible(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setMessage("");
    setVideoSrc(null);

    if (mode === "test") {
      if (lastAnswerCorrect === true) {
        const newRem = remaining.slice(1);
        setRemaining(newRem);
        generateQuestion(newRem);
        setLastAnswerCorrect(null);
      } else if (lastAnswerCorrect === false) {
        endTest(score);
      }
    }
  };

  // Mode switch with confirmation
  const requestModeChange = (newMode) => {
    if (mode === newMode) return;

    if (mode === "test" || newMode === "test") {
      setPendingMode(newMode);
      setShowConfirmModal(true);
    } else {
      setMode(newMode);
    }
  };

  const confirmModeChange = () => {
    setShowConfirmModal(false);

    if (mode === "test") {
      setRemaining([]);
      setCurrentQuestion(null);
      setOptions([]);
      setScore(0);
      setLastAnswerCorrect(null);
    }

    if (pendingMode === "test") {
      startTest();
    } else {
      setMode(pendingMode);
    }

    setPendingMode(null);
  };

  const cancelModeChange = () => {
    setShowConfirmModal(false);
    setPendingMode(null);
  };

  const getConfirmMessage = () => {
    if (mode === "learn" && pendingMode === "test") {
      return "You are about to start a test. Are you ready?";
    }
    if (mode === "test" && pendingMode === "learn") {
      return "You are leaving the test. Your current score will be lost. Continue?";
    }
    return "";
  };

  if (allNumbers.length === 0) {
    return <div id="numberquizgame">Loading...</div>;
  }

  return (
    <div id="numberquizgame">
      <h1 className="main-title">Number Recognition Game</h1>
      <p className="subtitle">Learn with sign videos or test your knowledge!</p>

      <div className="score-box">
        <div className="score-item">Previous Score: {previousScore}</div>
        <div className="separator">|</div>
        <div className="score-item">Best Score: {bestScore}</div>
      </div>

      <div className="button-container">
        <button onClick={() => requestModeChange("learn")} disabled={mode === "learn"}>
          Learn Mode
        </button>
        <button onClick={() => requestModeChange("test")} disabled={mode === "test"}>
          Test Mode
        </button>
      </div>

      {mode === "test" && currentQuestion && (
        <div className="test-section">
          <h2 className="test-question">{currentQuestion.questionText}</h2>
          <div className="question-image-wrapper">
            <img src={currentQuestion.image} alt="question" className="question-image" />
          </div>
          <p className="test-instruction">
            Score: {score} / {questions.length}
          </p>
          <p className="test-instruction">
            Remaining: {remaining.length}
          </p>
        </div>
      )}

      <div className={`grid-container ${mode}`}>
        {(mode === "learn" ? allNumbers : options).map((item) => (
          <div 
            key={item.value} 
            className="grid-item" 
            onClick={() => handleClick(item)}
          >
            <video 
              src={item.video} 
              autoPlay 
              muted 
              loop 
              playsInline
              className="option-video"
            />
            {mode === "learn" && <span className="item-label">{item.value}</span>}
          </div>
        ))}
      </div>

      {isModalVisible && (
        <MessageModal message={message} onClose={handleCloseModal} video={videoSrc} />
      )}

      {showConfirmModal && (
        <ConfirmModal
          message={getConfirmMessage()}
          onConfirm={confirmModeChange}
          onCancel={cancelModeChange}
        />
      )}
    </div>
  );
}