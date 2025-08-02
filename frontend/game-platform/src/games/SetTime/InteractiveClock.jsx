import { useEffect, useRef, useState } from "react";
import "./ISLClockGame.css";

const CLOCK_RADIUS = 100;
const CENTER = { x: CLOCK_RADIUS, y: CLOCK_RADIUS };

const timeToAngle = ({ hour, minute }) => ({
  minuteAngle: (minute % 60) * 6,
  hourAngle: ((hour % 12) + minute / 60) * 30,
});

const InteractiveClock = ({
  onTimeChange,
  initialTime = { hour: 12, minute: 0 },
  resetKey,
  readOnly = false,
}) => {
  const [time, setTime] = useState(initialTime);
  const [dragging, setDragging] = useState(null);
  const svgRef = useRef();

  useEffect(() => {
    setTime(initialTime);
    onTimeChange?.(initialTime);
  }, [resetKey, initialTime, onTimeChange]);

  const updateTime = (newTime) => {
    setTime(newTime);
    onTimeChange?.(newTime);
  };

  const handlePointerDown = (hand) => (e) => {
    if (readOnly) return;
    e.preventDefault();
    setDragging(hand);
  };

  const handlePointerMove = (e) => {
    if (!dragging || !svgRef.current || readOnly) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - CENTER.x;
    const y = e.clientY - rect.top - CENTER.y;
    const angleRad = Math.atan2(y, x);
    const angleDeg = (angleRad * 180) / Math.PI + 90;
    const adjustedAngle = (angleDeg + 360) % 360;

    if (dragging === "minute") {
      const newMinute = Math.round(adjustedAngle / 6) % 60;
      updateTime({ ...time, minute: newMinute });
    } else if (dragging === "hour") {
      const totalAngle = (adjustedAngle / 30) % 12;
      const newHour = Math.floor(totalAngle) || 12;
      updateTime({ ...time, hour: newHour });
    }
  };

  const handlePointerUp = () => {
    if (!readOnly) setDragging(null);
  };

  const handCoords = (angleDeg, length) => {
    const rad = (angleDeg - 90) * (Math.PI / 180);
    return {
      x: CENTER.x + length * Math.cos(rad),
      y: CENTER.y + length * Math.sin(rad),
    };
  };

  const { minuteAngle, hourAngle } = timeToAngle(time);
  const minuteHand = handCoords(minuteAngle, 70);
  const hourHand = handCoords(hourAngle, 50);

  return (
    <div className="game-clock-container">
      <svg
        ref={svgRef}
        width={2 * CLOCK_RADIUS}
        height={2 * CLOCK_RADIUS}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="game-clock-svg"
        style={{ cursor: readOnly ? "default" : "pointer" }}
      >
        <circle cx={CENTER.x} cy={CENTER.y} r={CLOCK_RADIUS} fill="#fff" stroke="#000" />
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const x1 = CENTER.x + Math.cos(angle) * 80;
          const y1 = CENTER.y + Math.sin(angle) * 80;
          const x2 = CENTER.x + Math.cos(angle) * 90;
          const y2 = CENTER.y + Math.sin(angle) * 90;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#000" />;
        })}

        <line
          x1={CENTER.x}
          y1={CENTER.y}
          x2={hourHand.x}
          y2={hourHand.y}
          stroke={readOnly ? "#888" : "#333"}
          strokeWidth="6"
          strokeLinecap="round"
          onPointerDown={handlePointerDown("hour")}
        />

        <line
          x1={CENTER.x}
          y1={CENTER.y}
          x2={minuteHand.x}
          y2={minuteHand.y}
          stroke={readOnly ? "#aaa" : "#007bff"}
          strokeWidth="4"
          strokeLinecap="round"
          onPointerDown={handlePointerDown("minute")}
        />

        <circle cx={CENTER.x} cy={CENTER.y} r="4" fill="#000" />
      </svg>
    </div>
  );
};

export default InteractiveClock;
