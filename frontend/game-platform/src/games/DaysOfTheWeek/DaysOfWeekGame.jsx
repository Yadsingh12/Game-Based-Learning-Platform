import React, { useState, useEffect } from "react";
import "./DaysOfWeekGame.css";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Modal for feedback
const MessageModal = ({ message, onClose, video }) => (
  <div className="modal-overlay">
    <div className="modal-content">
      <p className="modal-message">{message}</p>
      {video && (
        <video width="300" controls autoPlay>
          <source src={video} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
      <button onClick={onClose} className="modal-close-btn">
        Close
      </button>
    </div>
  </div>
);

export default function DaysOfWeekGame() {
  const [mode, setMode] = useState("learn");
  const [currentTestDay, setCurrentTestDay] = useState(null);
  const [testOptions, setTestOptions] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [videoSrc, setVideoSrc] = useState(null);

  const startTest = () => {
    const randomDay = days[Math.floor(Math.random() * days.length)];
    setCurrentTestDay(randomDay);

    // Generate 4 random options including the correct one
    const pool = [randomDay];
    const others = days.filter((d) => d !== randomDay);
    while (pool.length < 4) {
      const r = others.splice(Math.floor(Math.random() * others.length), 1)[0];
      pool.push(r);
    }

    // Shuffle
    setTestOptions(pool.sort(() => Math.random() - 0.5));
  };

  const handleClick = (day) => {
    // Video filenames remain lowercase
    const videoPath = `/videos/DaysOfTheWeek/${day}.mp4`;

    if (mode === "learn") {
      setVideoSrc(videoPath);
      setMessage(`This is ${day}.`);
      setIsModalVisible(true);
    } else if (mode === "test") {
      if (day === currentTestDay) {
        setMessage("Correct! 🎉");
        setVideoSrc(videoPath);
      } else {
        setMessage("Try again ❌");
        setVideoSrc(null);
      }
      setIsModalVisible(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setMessage("");
    setVideoSrc(null);

    if (mode === "test") startTest();
  };

  useEffect(() => {
    if (mode === "test") startTest();
  }, [mode]);

  return (
    <div id="daysofweekgame">
      <h1 className="main-title">Days of the Week Game</h1>
      <p className="subtitle">Learn with sign videos or test your knowledge!</p>

      <div className="button-container">
        <button onClick={() => setMode("learn")} disabled={mode === "learn"}>
          Learn Mode
        </button>
        <button onClick={() => setMode("test")} disabled={mode === "test"}>
          Test Mode
        </button>
      </div>

      {/* Test video */}
      {mode === "test" && currentTestDay && (
        <div className="test-video">
          <video width="320" controls autoPlay loop key={currentTestDay}>
            <source
              src={`/videos/DaysOfTheWeek/${currentTestDay}.mp4`}
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
          <p className="test-instruction">
            Watch the sign and click the correct day!
          </p>
        </div>
      )}

      {/* Grid */}
      <div className={`grid-container ${mode}`}>
        {days
          .filter((day) =>
            mode === "learn" ? true : testOptions.includes(day)
          )
          .map((day) => (
            <div
              key={day}
              className="grid-item"
              onClick={() => handleClick(day)}
            >
              <span className="day-name">{day}</span>
            </div>
          ))}
      </div>

      {isModalVisible && (
        <MessageModal
          message={message}
          onClose={handleCloseModal}
          video={videoSrc}
        />
      )}
    </div>
  );
}
