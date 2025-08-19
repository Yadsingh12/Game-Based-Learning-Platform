import { useState } from "react";
import InteractiveClock from "./InteractiveClock";
import "./ISLClockGame.css";

const videoData = [
  {
    videoSrc: "/videos/Times/3_20 pm.mp4",
    correctTime: { hour: 3, minute: 20, period: "PM" },
  },
  {
    videoSrc: "/videos/Times/5_40 am.mp4",
    correctTime: { hour: 5, minute: 40, period: "AM" },
  },
  {
    videoSrc: "/videos/Times/9_45 am.mp4",
    correctTime: { hour: 9, minute: 45, period: "AM" },
  },
  {
    videoSrc: "/videos/Times/10_30 am.mp4",
    correctTime: { hour: 10, minute: 30, period: "AM" },
  },
  {
    videoSrc: "/videos/Times/12_05 pm.mp4",
    correctTime: { hour: 12, minute: 5, period: "PM" },
  },
];

const formatTime = (hour, minute, period) => {
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minute.toString().padStart(2, "0")} ${period}`;
};

const ISLClockGame = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userTime, setUserTime] = useState({ hour: 12, minute: 0, period: "AM" });
  const [prevUserTime, setPrevUserTime] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [resetKey, setResetKey] = useState(0);

  const current = videoData[currentIndex];

  const handleTimeChange = (t) => {
    setUserTime((prev) => ({ ...prev, hour: t.hour, minute: t.minute }));
  };

  const isEqualTime = (a, b) =>
    a.hour === b.hour && a.minute === b.minute && a.period === b.period;

  const checkAnswer = () => {
    const correct = isEqualTime(userTime, current.correctTime);
    setPrevUserTime(userTime);
    setFeedback(correct ? "correct" : "incorrect");
    setUserTime(current.correctTime);
  };

  const nextQuestion = () => {
    setCurrentIndex((prev) => (prev + 1) % videoData.length);
    setUserTime({ hour: 12, minute: 0, period: "AM" });
    setPrevUserTime(null);
    setFeedback(null);
    setResetKey((prev) => prev + 1);
  };

  return (
    <div className="clock-game">
    <div className="clock-game game-wrapper">
      <div className="game-container">
        <h2 className="game-title">⏰ ISL Clock Game</h2>

        <video
          src={current.videoSrc}
          muted
          loop
          autoPlay
          playsInline
          className="game-video"
        />

        <div className="clock-interactive">
          <InteractiveClock
            key={resetKey}
            resetKey={resetKey}
            initialTime={{ hour: 12, minute: 0 }}
            forceTime={{ hour: userTime.hour, minute: userTime.minute }}
            onTimeChange={handleTimeChange}
            readOnly={Boolean(feedback)}
            flashFeedback={feedback}
          />

          {/* AM/PM Toggle */}
          {/* AM/PM Toggle */}
          <div
            className={`ampm-toggle ${userTime.period}`}
            onClick={() =>
              setUserTime((prev) => ({
                ...prev,
                period: prev.period === "AM" ? "PM" : "AM",
              }))
            }
          >
            <span className={`ampm-option ${userTime.period === "AM" ? "active" : ""}`}>
              AM
            </span>
            <span className={`ampm-option ${userTime.period === "PM" ? "active" : ""}`}>
              PM
            </span>
          </div>
        </div>
        
        {!feedback && (
          <button onClick={checkAnswer} className="btn btn-check">
            Check Answer
          </button>
        )}

        {feedback && (
          <div className="result-card-inline">
            <div className="result-headline">This is the correct position</div>
            <div className={`result-status ${feedback === "correct" ? "correct" : "incorrect"}`}>
              {feedback === "correct" ? "✅ Correct!" : "❌ Incorrect"}
            </div>
            <p className="result-text">
              Your Answer:&nbsp;
              {prevUserTime
                ? formatTime(prevUserTime.hour, prevUserTime.minute, prevUserTime.period)
                : "—"}
              &nbsp;|&nbsp;
              Correct Answer:&nbsp;
              {formatTime(
                current.correctTime.hour,
                current.correctTime.minute,
                current.correctTime.period
              )}
            </p>
            <button onClick={nextQuestion} className="btn btn-next">
              Next
            </button>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default ISLClockGame;
