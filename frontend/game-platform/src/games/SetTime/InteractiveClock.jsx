import { useEffect, useRef, useState } from "react";
import "./ISLClockGame.css";

const CLOCK_RADIUS = 100;
const CENTER = { x: CLOCK_RADIUS, y: CLOCK_RADIUS };
const HOUR_HAND_LENGTH = 50;
const MINUTE_HAND_LENGTH = 70;

// Convert time to angles
const timeToAngle = ({ hour, minute }) => ({
  minute: (minute % 60) * 6,           // 360° / 60 = 6° per minute
  hour: ((hour % 12) + minute / 60) * 30, // 360° / 12 = 30° per hour
});

// Convert angle to SVG coordinates
const angleToCoords = (angleDeg, length) => {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return {
    x: CENTER.x + length * Math.cos(rad),
    y: CENTER.y + length * Math.sin(rad),
  };
};

const InteractiveClock = ({
  onTimeChange,
  initialTime = { hour: 12, minute: 0 },
  forceTime,
  resetKey,
  readOnly = false,
  flashFeedback = null,
}) => {
  const [time, setTime] = useState(initialTime);
  const [dragging, setDragging] = useState(null);
  const [flashFill, setFlashFill] = useState("#fff");
  const svgRef = useRef();

  // Update time when resetKey or forceTime changes
  useEffect(() => setTime(initialTime), [resetKey, initialTime]);
  useEffect(() => forceTime && setTime(forceTime), [forceTime]);

  // Flash feedback effect
  useEffect(() => {
    if (!flashFeedback) return;
    setFlashFill(flashFeedback === "correct" ? "#bbf7d0" : "#fecaca");
    const timeout = setTimeout(() => setFlashFill("#fff"), 800);
    return () => clearTimeout(timeout);
  }, [flashFeedback]);

  const updateTime = (newTime) => {
    setTime(newTime);
    onTimeChange?.(newTime);
  };

  // Dragging hands
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
    const angleDeg = (Math.atan2(y, x) * 180) / Math.PI + 90;
    const adjustedAngle = (angleDeg + 360) % 360;

    if (dragging === "minute") {
      const newMinute = Math.round(adjustedAngle / 6) % 60;
      updateTime({ ...time, minute: newMinute });
    } else if (dragging === "hour") {
      const newHour = Math.floor((adjustedAngle / 30) % 12) || 12;
      updateTime({ ...time, hour: newHour });
    }
  };

  const handlePointerUp = () => !readOnly && setDragging(null);

  const { hour, minute } = timeToAngle(time);
  const hourHand = angleToCoords(hour, HOUR_HAND_LENGTH);
  const minuteHand = angleToCoords(minute, MINUTE_HAND_LENGTH);

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
        {/* Clock face */}
        <circle
          cx={CENTER.x}
          cy={CENTER.y}
          r={CLOCK_RADIUS}
          fill={flashFill}
          stroke="#000"
          strokeWidth="2"
        />

        {/* Hour ticks */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180); // start at top
          const x1 = CENTER.x + Math.cos(angle) * 80;
          const y1 = CENTER.y + Math.sin(angle) * 80;
          const x2 = CENTER.x + Math.cos(angle) * 90;
          const y2 = CENTER.y + Math.sin(angle) * 90;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#000" />;
        })}

        {/* Hour numbers */}
        {[...Array(12)].map((_, i) => {
          const angle = ((i * 30 - 60) * Math.PI) / 180;
          const x = CENTER.x + Math.cos(angle) * 65;
          const y = CENTER.y + Math.sin(angle) * 65 + 5;
          return (
            <text key={i + 1} x={x} y={y} textAnchor="middle" fontSize="14" fontWeight="600" fill="#111">
              {i + 1}
            </text>
          );
        })}

        {/* Hour hand */}
        <line
          x1={CENTER.x}
          y1={CENTER.y}
          x2={hourHand.x}
          y2={hourHand.y}
          stroke={readOnly ? "#666" : "#111"}
          strokeWidth="6"
          strokeLinecap="round"
          onPointerDown={handlePointerDown("hour")}
        />

        {/* Minute hand */}
        <line
          x1={CENTER.x}
          y1={CENTER.y}
          x2={minuteHand.x}
          y2={minuteHand.y}
          stroke={readOnly ? "#999" : "#2563eb"}
          strokeWidth="4"
          strokeLinecap="round"
          onPointerDown={handlePointerDown("minute")}
        />

        {/* Center cap */}
        <circle cx={CENTER.x} cy={CENTER.y} r="4" fill="#000" />
      </svg>
    </div>
  );
};

export default InteractiveClock;
