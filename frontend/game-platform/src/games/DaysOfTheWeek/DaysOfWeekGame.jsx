import React, { useState, useEffect } from "react";
import "./DaysOfWeekGame.css";

const days = [
  "Monday", "Tuesday", "Wednesday", "Thursday",
  "Friday", "Saturday", "Sunday",
];

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

export default function DaysOfWeekGame() {
  const [mode, setMode] = useState("learn");

  // Test state
  const [testOrder, setTestOrder] = useState([]);
  const [testIndex, setTestIndex] = useState(0);
  const [currentTestDay, setCurrentTestDay] = useState(null);
  const [testOptions, setTestOptions] = useState([]);

  // Scores
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => Number(localStorage.getItem("best_week_score") || 0));
  const [previousScore, setPreviousScore] = useState(() => Number(localStorage.getItem("previous_week_score") || 0));

  // Feedback modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [videoSrc, setVideoSrc] = useState(null);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(null);

  // Confirmation modal
  const [pendingMode, setPendingMode] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Build 4 options
  const buildOptions = (correct) => {
    const others = days.filter((d) => d !== correct).sort(() => Math.random() - 0.5);
    const pool = [correct, ...others.slice(0, 3)];
    return pool.sort(() => Math.random() - 0.5);
  };

  const startTest = () => {
    const order = [...days].sort(() => Math.random() - 0.5);
    const first = order[0];

    setTestOrder(order);
    setTestIndex(0);
    setCurrentTestDay(first);
    setTestOptions(buildOptions(first));
    setScore(0);
    setMode("test");
  };

  const endTest = (finalScore) => {
    localStorage.setItem("previous_week_score", finalScore);
    setPreviousScore(finalScore);

    if (finalScore > bestScore) {
      localStorage.setItem("best_week_score", finalScore);
      setBestScore(finalScore);
    }

    setTestOrder([]);
    setTestIndex(0);
    setCurrentTestDay(null);
    setTestOptions([]);
    setLastAnswerCorrect(null);
    setScore(0);
    setMode("learn");
  };

  const handleClick = (day) => {
    const videoPath = `/videos/DaysOfTheWeek/${day}.mp4`;

    if (mode === "learn") {
      setVideoSrc(videoPath);
      setMessage(`This is ${day}.`);
      setIsModalVisible(true);
      setLastAnswerCorrect(null);
      return;
    }

    if (mode === "test") {
      if (day === currentTestDay) {
        setScore(score + 1);
        setMessage("Correct! 🎉");
        setVideoSrc(videoPath);
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
        const nextIndex = testIndex + 1;

        if (nextIndex >= testOrder.length) {
          endTest(score);
        } else {
          const nextDay = testOrder[nextIndex];
          setTestIndex(nextIndex);
          setCurrentTestDay(nextDay);
          setTestOptions(buildOptions(nextDay));
          setLastAnswerCorrect(null);
        }
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
      // Leaving test
      setTestOrder([]);
      setTestIndex(0);
      setCurrentTestDay(null);
      setTestOptions([]);
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

  useEffect(() => {
    if (mode === "test" && testOrder.length === 0) startTest();
  }, [mode]);

  // Dynamic confirmation message
  const getConfirmMessage = () => {
    if (mode === "learn" && pendingMode === "test") {
      return "You are about to start a test. Are you ready?";
    }
    if (mode === "test" && pendingMode === "learn") {
      return "You are leaving the test. Your current score will be lost. Continue?";
    }
    return "";
  };

  return (
    <div id="daysofweekgame">
      <h1 className="main-title">Days of the Week Game</h1>
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

      {mode === "test" && currentTestDay && (
        <div className="test-video">
          <video width="320" controls autoPlay loop key={currentTestDay}>
            <source src={`/videos/DaysOfTheWeek/${currentTestDay}.mp4`} type="video/mp4" />
          </video>
          <p className="test-instruction">Watch and pick the correct day!</p>
          <p className="test-instruction">
            Score: {score} / {testOrder.length}
          </p>
        </div>
      )}

      <div className={`grid-container ${mode}`}>
        {(mode === "learn" ? days : testOptions).map((day) => (
          <div key={day} className="grid-item" onClick={() => handleClick(day)}>
            <span className="day-name">{day}</span>
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
