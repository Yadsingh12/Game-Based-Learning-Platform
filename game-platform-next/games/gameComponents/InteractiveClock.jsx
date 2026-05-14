import { useEffect, useRef, useState } from "react";

const CLOCK_RADIUS = 100;
const CENTER = { x: CLOCK_RADIUS, y: CLOCK_RADIUS };
const HOUR_HAND_LENGTH = 50;
const MINUTE_HAND_LENGTH = 70;

const timeToAngle = ({ hour, minute }) => ({
  minute: (minute % 60) * 6,
  hour: ((hour % 12) + minute / 60) * 30,
});

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
  darkMode = false,
}) => {
  const [time, setTime] = useState(initialTime);
  const [dragging, setDragging] = useState(null);
  const [flashFill, setFlashFill] = useState(null);
  const svgRef = useRef();

  useEffect(() => setTime(initialTime), [resetKey, initialTime]);
  useEffect(() => { if (forceTime) setTime(forceTime); }, [forceTime]);

  useEffect(() => {
    if (!flashFeedback) return;
    setFlashFill(flashFeedback === "correct" ? "correct" : "incorrect");
    const timeout = setTimeout(() => setFlashFill(null), 800);
    return () => clearTimeout(timeout);
  }, [flashFeedback]);

  const updateTime = (newTime) => { setTime(newTime); onTimeChange?.(newTime); };

  const handlePointerDown = (hand) => (e) => { if (readOnly) return; e.preventDefault(); setDragging(hand); };

  const handlePointerMove = (e) => {
    if (!dragging || !svgRef.current || readOnly) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - CENTER.x;
    const y = e.clientY - rect.top - CENTER.y;
    const angleDeg = (Math.atan2(y, x) * 180) / Math.PI + 90;
    const adjustedAngle = (angleDeg + 360) % 360;
    if (dragging === "minute") updateTime({ ...time, minute: Math.round(adjustedAngle / 6) % 60 });
    else if (dragging === "hour") updateTime({ ...time, hour: Math.floor((adjustedAngle / 30) % 12) || 12 });
  };

  const handlePointerUp = () => { if (!readOnly) setDragging(null); };

  const { hour, minute } = timeToAngle(time);
  const hourHand = angleToCoords(hour, HOUR_HAND_LENGTH);
  const minuteHand = angleToCoords(minute, MINUTE_HAND_LENGTH);

  // Face color based on state
  const getFaceFill = () => {
    if (flashFill === "correct") return darkMode ? "#064e3b" : "#bbf7d0";
    if (flashFill === "incorrect") return darkMode ? "#7f1d1d" : "#fecaca";
    return darkMode ? "#1a1035" : "#ffffff";
  };

  const faceStroke = darkMode ? "rgba(255,255,255,0.15)" : "#000";
  const tickColor = darkMode ? "rgba(255,255,255,0.3)" : "#000";
  const numColor = darkMode ? "rgba(255,255,255,0.7)" : "#111";
  const centerColor = darkMode ? "rgba(255,255,255,0.8)" : "#000";

  return (
    <div className="flex items-center justify-center">
      <svg
        ref={svgRef}
        width={2 * CLOCK_RADIUS}
        height={2 * CLOCK_RADIUS}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{ cursor: readOnly ? "default" : "pointer" }}
      >
        {/* Clock face */}
        <circle
          cx={CENTER.x} cy={CENTER.y} r={CLOCK_RADIUS}
          fill={getFaceFill()}
          stroke={faceStroke}
          strokeWidth={darkMode ? "1" : "2"}
          style={{ transition: 'fill 0.3s ease' }}
        />

        {/* Hour ticks */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const x1 = CENTER.x + Math.cos(angle) * 80;
          const y1 = CENTER.y + Math.sin(angle) * 80;
          const x2 = CENTER.x + Math.cos(angle) * 90;
          const y2 = CENTER.y + Math.sin(angle) * 90;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={tickColor} strokeWidth="2" />;
        })}

        {/* Hour numbers */}
        {[...Array(12)].map((_, i) => {
          const angle = ((i * 30 - 60) * Math.PI) / 180;
          const x = CENTER.x + Math.cos(angle) * 65;
          const y = CENTER.y + Math.sin(angle) * 65 + 5;
          return (
            <text key={i + 1} x={x} y={y} textAnchor="middle" fontSize="14" fontWeight="600" fill={numColor}>
              {i + 1}
            </text>
          );
        })}

        {/* Hour hand */}
        <line
          x1={CENTER.x} y1={CENTER.y} x2={hourHand.x} y2={hourHand.y}
          stroke={readOnly ? (darkMode ? "rgba(255,255,255,0.3)" : "#666") : (darkMode ? "rgba(255,255,255,0.9)" : "#111")}
          strokeWidth="6" strokeLinecap="round"
          onPointerDown={handlePointerDown("hour")}
          style={{ cursor: readOnly ? "default" : "grab" }}
        />

        {/* Minute hand */}
        <line
          x1={CENTER.x} y1={CENTER.y} x2={minuteHand.x} y2={minuteHand.y}
          stroke={readOnly ? (darkMode ? "rgba(124,58,237,0.4)" : "#999") : (darkMode ? "#a78bfa" : "#2563eb")}
          strokeWidth="4" strokeLinecap="round"
          onPointerDown={handlePointerDown("minute")}
          style={{ cursor: readOnly ? "default" : "grab" }}
        />

        {/* Center cap */}
        <circle cx={CENTER.x} cy={CENTER.y} r="4" fill={centerColor} />
      </svg>
    </div>
  );
};

export default InteractiveClock;