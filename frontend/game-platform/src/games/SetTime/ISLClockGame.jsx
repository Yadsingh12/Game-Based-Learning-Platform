import { useState } from "react";
import InteractiveClock from "./InteractiveClock";
import "./ISLClockGame.css";

const videoData = [
  {
    videoSrc: "/assets/isl_videos/time_3_15.mp4",
    correctTime: { hour: 3, minute: 15 },
  },
  {
    videoSrc: "/assets/isl_videos/time_9_45.mp4",
    correctTime: { hour: 9, minute: 45 },
  },
  {
    videoSrc: "/assets/isl_videos/time_6_00.mp4",
    correctTime: { hour: 6, minute: 0 },
  },
];

const formatTime = (hour, minute) =>
  `${hour}:${minute.toString().padStart(2, "0")}`;

const ISLClockGame = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userTime, setUserTime] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const current = videoData[currentIndex];

  const checkAnswer = () => {
    if (!userTime) return;
    setShowResult(true);
  };

  const nextQuestion = () => {
    setCurrentIndex((prev) => (prev + 1) % videoData.length);
    setUserTime(null);
    setShowResult(false);
    setResetKey((prev) => prev + 1);
  };

  const isCorrect =
    userTime &&
    userTime.hour === current.correctTime.hour &&
    userTime.minute === current.correctTime.minute;

  return (
    <div className="game-wrapper">
      <div className="game-container">
        <h2 className="game-title">⏰ ISL Clock Game</h2>

        <video src={current.videoSrc} controls autoPlay className="game-video" />

        <div className="clock-interactive">
          <InteractiveClock
            key={resetKey}
            resetKey={resetKey}
            initialTime={{ hour: 12, minute: 0 }}
            onTimeChange={setUserTime}
          />
        </div>

        {!showResult && (
          <button onClick={checkAnswer} className="btn btn-check">
            Check Answer
          </button>
        )}
      </div>

      {showResult && (
        <div className="result-overlay">
          <div className="result-card">
            {isCorrect ? (
              <div className="result-status correct">✅ Correct!</div>
            ) : (
              <div className="result-status incorrect">❌ Incorrect</div>
            )}

            <div className="result-section">
              <div className="result-label">Your Answer</div>
              <div className="clock-display">
                🕒 Analog:
                <InteractiveClock initialTime={userTime} readOnly={true} />
              </div>
              <div className="digital-time">
                📟 Digital: {formatTime(userTime.hour, userTime.minute)}
              </div>
            </div>

            <div className="result-section">
              <div className="result-label">Correct Answer</div>
              <div className="clock-display">
                🕒 Analog:
                <InteractiveClock initialTime={current.correctTime} readOnly={true} />
              </div>
              <div className="digital-time">
                📟 Digital: {formatTime(current.correctTime.hour, current.correctTime.minute)}
              </div>
            </div>

            <button onClick={nextQuestion} className="btn btn-next">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ISLClockGame;