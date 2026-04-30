// src/components/games/InteractiveClockGame.jsx
import { useState, useRef, useEffect } from "react";
import InteractiveClock from "./gameComponents/InteractiveClock";

const formatTime = (hour, minute, period) => {
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minute.toString().padStart(2, "0")} ${period}`;
};

const InteractiveClockGame = (props) => {
  const signs = props.signs || props.data?.signs || props.data || [];
  const onComplete = props.onComplete || props.onExit;
  const category = props.category || {};
  const colors = category.colorScheme || {
    primary: "#2563eb",
    secondary: "#7c3aed",
    gradient: "from-blue-600 to-purple-600",
    dark: "#1e40af",
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userTime, setUserTime] = useState({
    hour: 12,
    minute: 0,
    period: "AM",
  });
  const [prevUserTime, setPrevUserTime] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [resetKey, setResetKey] = useState(0);
  const [score, setScore] = useState(0);

  // Clock scaling — measure the pane, fit the clock into it
  const clockPaneRef = useRef(null);
  const clockInnerRef = useRef(null);
  const [clockScale, setClockScale] = useState(1);
  const CLOCK_NATIVE_SIZE = 260; // conservative upper bound; real size measured below

  useEffect(() => {
    const update = () => {
      if (!clockPaneRef.current) return;
      const pane = clockPaneRef.current.getBoundingClientRect();

      // Space available for the clock itself (leave room for AM/PM + time label below)
      const reservedBelow = 90; // px for AM/PM toggle + time text
      const availableH = pane.height - reservedBelow;
      const availableW = pane.width - 24; // small side padding

      const available = Math.min(availableW, availableH);
      // Scale up to fill, but never exceed 1 (native size)
      const scale = Math.min(1, Math.max(0.55, available / CLOCK_NATIVE_SIZE));
      setClockScale(scale);
    };

    update();
    const ro = new ResizeObserver(update);
    if (clockPaneRef.current) ro.observe(clockPaneRef.current);
    return () => ro.disconnect();
  }, []);

  if (!signs || signs.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-red-600 font-semibold">No time data available</p>
      </div>
    );
  }

  const currentSign = signs[currentIndex];
  const correctTime = currentSign.visual;
  const progress = (currentIndex / signs.length) * 100;
  const isLast = currentIndex + 1 >= signs.length;

  const handleTimeChange = (t) => {
    setUserTime((prev) => ({ ...prev, hour: t.hour, minute: t.minute }));
  };

  const isEqualTime = (a, b) =>
    a.hour === b.hour && a.minute === b.minute && a.period === b.period;

  const checkAnswer = () => {
    const correct = isEqualTime(userTime, correctTime);
    setPrevUserTime(userTime);
    setFeedback(correct ? "correct" : "incorrect");
    setUserTime(correctTime);
    if (correct) setScore((s) => s + 1);
  };

  const nextQuestion = () => {
    if (isLast) {
      onComplete?.(Math.round((score / signs.length) * 100));
      return;
    }
    setCurrentIndex((prev) => prev + 1);
    setUserTime({ hour: 12, minute: 0, period: "AM" });
    setPrevUserTime(null);
    setFeedback(null);
    setResetKey((prev) => prev + 1);
  };

  return (
    <div
      className={`h-full flex flex-col bg-gradient-to-br ${colors.gradient} overflow-hidden`}
    >
      {/* ── Header ── */}
      <div className="flex-none px-4 pt-3 pb-2 bg-white/20 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-white font-extrabold text-lg sm:text-xl drop-shadow">
            ⏰ Clock Game
          </h1>
          <div className="flex items-center gap-2 text-white text-sm font-semibold">
            <span className="bg-white/20 px-3 py-1 rounded-full">
              {currentIndex + 1} / {signs.length}
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-full">
              ⭐ {score}
            </span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex items-center justify-center p-3 sm:p-4 min-h-0">
        <div className="w-full max-w-2xl h-full flex flex-col bg-white/95 backdrop-blur rounded-3xl shadow-2xl overflow-hidden">
          {/* Question label */}
          <div className="flex-none px-5 pt-3 pb-2 text-center border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-0.5">
              Watch the sign, then set the clock
            </p>
            <p className="text-base sm:text-lg font-black text-gray-800">
              What time is shown?
            </p>
          </div>

          {/* ── Content: portrait = stacked, landscape/sm+ = side by side ── */}
          <div className="flex-1 flex flex-col sm:flex-row min-h-0 overflow-hidden">
            {/* Video pane */}
            <div className="flex-1 flex flex-col items-center justify-center gap-1.5 p-3 sm:border-r border-b sm:border-b-0 border-gray-100 min-h-0">
              <p className="text-xs text-gray-400">Sign language video</p>
              <div className="w-full max-w-[280px] sm:max-w-full rounded-2xl overflow-hidden shadow-lg bg-black aspect-video">
                <video
                  key={currentSign.videoUrl}
                  src={
                    currentSign.videoUrl
                      ? (props.assets?.videos?.[currentSign.videoUrl] ??
                        currentSign.videoUrl)
                      : null
                  }
                  muted
                  loop
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Clock pane — ref measured for scaling */}
            <div
              ref={clockPaneRef}
              className="flex-1 flex flex-col items-center justify-center"
            >
              {/* Scaled clock shell */}
              <div
                style={{
                  width: CLOCK_NATIVE_SIZE * clockScale,
                  height: CLOCK_NATIVE_SIZE * clockScale,
                  position: "relative",
                  flexShrink: 0,
                }}
              >
                <div
                  ref={clockInnerRef}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: CLOCK_NATIVE_SIZE,
                    height: CLOCK_NATIVE_SIZE,
                    transformOrigin: "top left",
                    transform: `scale(${clockScale})`,
                  }}
                >
                  <InteractiveClock
                    key={resetKey}
                    resetKey={resetKey}
                    initialTime={{ hour: 12, minute: 0 }}
                    forceTime={{ hour: userTime.hour, minute: userTime.minute }}
                    onTimeChange={handleTimeChange}
                    readOnly={Boolean(feedback)}
                    flashFeedback={feedback}
                  />
                </div>
              </div>

              {/* AM/PM toggle */}
              <div
                className={`flex-shrink-0 flex rounded-xl overflow-hidden border-2 shadow-sm select-none ${
                  feedback ? "opacity-40 pointer-events-none" : "cursor-pointer"
                }`}
                style={{ borderColor: colors.primary }}
                onClick={() =>
                  !feedback &&
                  setUserTime((prev) => ({
                    ...prev,
                    period: prev.period === "AM" ? "PM" : "AM",
                  }))
                }
              >
                {["AM", "PM"].map((p) => (
                  <span
                    key={p}
                    className="px-6 py-1.5 text-sm font-bold transition-all duration-200"
                    style={
                      userTime.period === p
                        ? { backgroundColor: colors.primary, color: "white" }
                        : { backgroundColor: "white", color: colors.primary }
                    }
                  >
                    {p}
                  </span>
                ))}
              </div>

              {/* Live time display */}
              <div className="flex-shrink-0 text-center">
                <span
                  className="text-xl font-black tracking-tight"
                  style={{ color: colors.primary }}
                >
                  {formatTime(userTime.hour, userTime.minute, userTime.period)}
                </span>
                <p className="text-xs text-gray-400">Your answer</p>
              </div>
            </div>
          </div>

          {/* Check button */}
          <div className="flex-none px-5 py-3 border-t border-gray-100">
            <button
              onClick={checkAnswer}
              disabled={Boolean(feedback)}
              className="w-full py-3 rounded-2xl text-white font-bold text-base shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
              style={{
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
              }}
            >
              Check Answer
            </button>
          </div>
        </div>
      </div>

      {/* ── Feedback Modal ── */}
      {feedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div
              className="h-2 w-full"
              style={{
                backgroundColor: feedback === "correct" ? "#10b981" : "#ef4444",
              }}
            />
            <div className="p-6 text-center">
              <div className="text-5xl mb-2">
                {feedback === "correct" ? "🎉" : "😔"}
              </div>
              <p
                className={`text-2xl font-black mb-4 ${feedback === "correct" ? "text-green-600" : "text-red-500"}`}
              >
                {feedback === "correct" ? "Correct!" : "Not quite!"}
              </p>

              <div className="flex items-center justify-center gap-3 mb-5">
                <div
                  className={`flex-1 rounded-2xl px-3 py-2.5 ${feedback === "correct" ? "bg-green-50" : "bg-red-50"}`}
                >
                  <p className="text-xs text-gray-400 mb-0.5">Your answer</p>
                  <p
                    className={`text-base font-black ${feedback === "correct" ? "text-green-600" : "text-red-500"}`}
                  >
                    {prevUserTime
                      ? formatTime(
                          prevUserTime.hour,
                          prevUserTime.minute,
                          prevUserTime.period,
                        )
                      : "—"}
                  </p>
                </div>
                <span className="text-gray-300 text-xl flex-shrink-0">→</span>
                <div className="flex-1 rounded-2xl px-3 py-2.5 bg-green-50">
                  <p className="text-xs text-gray-400 mb-0.5">Correct</p>
                  <p className="text-base font-black text-green-600">
                    {formatTime(
                      correctTime.hour,
                      correctTime.minute,
                      correctTime.period,
                    )}
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-400 mb-4">
                Score:{" "}
                <span className="font-bold text-gray-700">
                  {score} / {signs.length}
                </span>
              </p>

              <button
                onClick={nextQuestion}
                className="w-full py-3 rounded-2xl text-white font-bold text-base shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                }}
              >
                {isLast ? "🏁 Finish" : "Next Question →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveClockGame;
