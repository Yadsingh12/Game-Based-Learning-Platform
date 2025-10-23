import React, { useState, useEffect } from "react";
import "./BucketGame.css";

const BucketGameWithConfirm = ({ maxNumber = 10 }) => {
  const [targetNumber, setTargetNumber] = useState(() =>
    Math.floor(Math.random() * (maxNumber + 1))
  );
  const [waterLevel, setWaterLevel] = useState(0);
  const [message, setMessage] = useState("");
  const [locked, setLocked] = useState(false); // lock after confirm

  const handleSliderChange = (e) => {
    if (!locked) setWaterLevel(parseInt(e.target.value));
  };

  const handleConfirm = () => {
    setLocked(true);

    if (waterLevel === targetNumber) {
      setMessage("✅ Correct!");
      setTimeout(() => {
        nextRound();
      }, 1500);
    } else {
      setMessage("❌ Try again!");
      setTimeout(() => {
        setLocked(false);
        setMessage("");
      }, 1000);
    }
  };

  const nextRound = () => {
    const next = Math.floor(Math.random() * (maxNumber + 1));
    setTargetNumber(next);
    setWaterLevel(0);
    setLocked(false);
    setMessage("");
  };

  const waterHeight = (waterLevel / maxNumber) * 100;

  return (
    <div id="bucket-game">
      <h2>Match the ISL Number</h2>

      {/* ISL number video */}
      <video
        key={targetNumber}
        src={`/videos/Numbers/${targetNumber}.mp4`}
        autoPlay
        loop
        muted
        className="isl-video"
      />

      {/* Bucket */}
      <div className="bucket">
        <div
          className="water"
          style={{ height: `${waterHeight}%` }}
        ></div>
      </div>

      {/* Slider */}
      <input
        type="range"
        min="0"
        max={maxNumber}
        value={waterLevel}
        onChange={handleSliderChange}
        className="slider"
        disabled={locked}
      />

      <p>Water Level: {waterLevel}</p>

      {/* Confirm button */}
      <button onClick={handleConfirm} disabled={locked} className="confirm-btn">
        Confirm
      </button>

      <p className="message">{message}</p>
    </div>
  );
};

export default BucketGameWithConfirm;
