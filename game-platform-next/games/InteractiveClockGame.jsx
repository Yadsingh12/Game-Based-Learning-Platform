// src/components/games/InteractiveClockGame.jsx
// Dark cosmic restyled version

import { useState, useRef, useEffect } from "react";
import InteractiveClock from "./gameComponents/InteractiveClock";

const formatTime = (hour, minute, period) => {
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minute.toString().padStart(2, "0")} ${period}`;
};

const InteractiveClockGame = (props) => {
  const signs = props.signs || props.data?.signs || props.data || [];
  const onComplete = props.onComplete || props.onExit;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userTime, setUserTime] = useState({ hour: 12, minute: 0, period: "AM" });
  const [prevUserTime, setPrevUserTime] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [resetKey, setResetKey] = useState(0);
  const [score, setScore] = useState(0);

  const clockPaneRef = useRef(null);
  const clockInnerRef = useRef(null);
  const [clockScale, setClockScale] = useState(1);
  const CLOCK_NATIVE_SIZE = 260;

  useEffect(() => {
    const update = () => {
      if (!clockPaneRef.current) return;
      const pane = clockPaneRef.current.getBoundingClientRect();
      const reservedBelow = 90;
      const availableH = pane.height - reservedBelow;
      const availableW = pane.width - 24;
      const available = Math.min(availableW, availableH);
      const scale = Math.min(1, Math.max(0.55, available / CLOCK_NATIVE_SIZE));
      setClockScale(scale);
    };
    update();
    const ro = new ResizeObserver(update);
    if (clockPaneRef.current) ro.observe(clockPaneRef.current);
    return () => ro.disconnect();
  }, []);

  if (!signs || signs.length === 0) return (
    <div className="h-full flex items-center justify-center bg-[#0f0a1e]">
      <p className="text-white/50">No time data available</p>
    </div>
  );

  const currentSign = signs[currentIndex];
  const correctTime = currentSign.visual;
  const progress = (currentIndex / signs.length) * 100;
  const isLast = currentIndex + 1 >= signs.length;

  const handleTimeChange = (t) => setUserTime(prev => ({ ...prev, hour: t.hour, minute: t.minute }));

  const isEqualTime = (a, b) => a.hour === b.hour && a.minute === b.minute && a.period === b.period;

  const checkAnswer = () => {
    const correct = isEqualTime(userTime, correctTime);
    setPrevUserTime(userTime);
    setFeedback(correct ? "correct" : "incorrect");
    setUserTime(correctTime);
    if (correct) setScore(s => s + 1);
  };

  const nextQuestion = () => {
    if (isLast) { onComplete?.(Math.round((score / signs.length) * 100)); return; }
    setCurrentIndex(prev => prev + 1);
    setUserTime({ hour: 12, minute: 0, period: "AM" });
    setPrevUserTime(null);
    setFeedback(null);
    setResetKey(prev => prev + 1);
  };

  return (
    <div className="h-full flex flex-col bg-[#0f0a1e] overflow-hidden relative">

      {/* Ambient blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px]
                      bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px]
                      bg-blue-600/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex-none px-4 pt-4 pb-3 bg-white/5 border-b border-white/10 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-black text-white">⏰ Clock Game</h1>
          <div className="flex items-center gap-2 text-sm">
            <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-white/40 font-semibold">
              <span className="text-white font-black">{currentIndex + 1}</span> / {signs.length}
            </span>
            <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-white/40 font-semibold">
              ⭐ <span className="text-white font-black">{score}</span>
            </span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #7c3aed, #3b82f6)' }}
          />
        </div>
      </div>

      {/* Body */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-3 sm:p-4 min-h-0">
        <div className="w-full max-w-2xl h-full flex flex-col bg-white/5 border border-white/10 backdrop-blur-sm rounded-3xl overflow-hidden">

          {/* Question label */}
          <div className="flex-none px-5 pt-3 pb-2 text-center border-b border-white/10">
            <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-0.5">
              Watch the sign, then set the clock
            </p>
            <p className="text-base sm:text-lg font-black text-white">
              What time is shown?
            </p>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col sm:flex-row min-h-0 overflow-hidden">

            {/* Video pane */}
            <div className="flex-1 flex flex-col items-center justify-center gap-1.5 p-3 sm:border-r border-b sm:border-b-0 border-white/10 min-h-0">
              <p className="text-xs text-white/30 font-medium">Sign language video</p>
              <div className="w-full max-w-[280px] sm:max-w-full rounded-2xl overflow-hidden ring-1 ring-white/10 bg-black aspect-video">
                <video
                  key={currentSign.videoUrl}
                  src={currentSign.videoUrl ? (props.assets?.videos?.[currentSign.videoUrl] ?? currentSign.videoUrl) : null}
                  muted loop autoPlay playsInline
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Clock pane */}
            <div ref={clockPaneRef} className="flex-1 flex flex-col items-center justify-center gap-3 p-3">
              <div style={{ width: CLOCK_NATIVE_SIZE * clockScale, height: CLOCK_NATIVE_SIZE * clockScale, position: "relative", flexShrink: 0 }}>
                <div
                  ref={clockInnerRef}
                  style={{ position: "absolute", top: 0, left: 0, width: CLOCK_NATIVE_SIZE, height: CLOCK_NATIVE_SIZE, transformOrigin: "top left", transform: `scale(${clockScale})` }}
                >
                  <InteractiveClock
                    key={resetKey}
                    resetKey={resetKey}
                    initialTime={{ hour: 12, minute: 0 }}
                    forceTime={{ hour: userTime.hour, minute: userTime.minute }}
                    onTimeChange={handleTimeChange}
                    readOnly={Boolean(feedback)}
                    flashFeedback={feedback}
                    darkMode={true}
                  />
                </div>
              </div>

              {/* AM/PM toggle */}
              <div
                className={`flex rounded-2xl overflow-hidden ring-1 select-none
                             ${feedback ? "opacity-40 pointer-events-none" : "cursor-pointer"}
                             ring-violet-500/40`}
                onClick={() => !feedback && setUserTime(prev => ({ ...prev, period: prev.period === "AM" ? "PM" : "AM" }))}
              >
                {["AM", "PM"].map(p => (
                  <span
                    key={p}
                    className="px-6 py-1.5 text-sm font-black transition-all duration-200"
                    style={userTime.period === p
                      ? { background: 'linear-gradient(135deg, #7c3aed, #3b82f6)', color: 'white' }
                      : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }
                    }
                  >
                    {p}
                  </span>
                ))}
              </div>

              {/* Time display */}
              <div className="text-center">
                <span className="text-xl font-black tracking-tight text-violet-300">
                  {formatTime(userTime.hour, userTime.minute, userTime.period)}
                </span>
                <p className="text-xs text-white/30 mt-0.5">Your answer</p>
              </div>
            </div>
          </div>

          {/* Check button */}
          <div className="flex-none px-5 py-3 border-t border-white/10">
            <button
              onClick={checkAnswer}
              disabled={Boolean(feedback)}
              className="w-full py-3 rounded-2xl text-white font-black text-base
                         bg-gradient-to-r from-violet-600 to-blue-600
                         shadow-lg shadow-violet-500/20
                         hover:opacity-90 active:scale-[0.98] transition-all
                         disabled:opacity-30 disabled:pointer-events-none"
            >
              Check Answer
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {feedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#1a1035] border border-white/15 rounded-3xl shadow-2xl overflow-hidden">
            <div className="h-1 w-full" style={{ background: feedback === "correct" ? '#34d399' : '#f87171' }} />
            <div className="p-6 text-center">
              <div className="text-5xl mb-2">{feedback === "correct" ? "🎉" : "😔"}</div>
              <p className={`text-2xl font-black mb-4 ${feedback === "correct" ? "text-emerald-400" : "text-red-400"}`}>
                {feedback === "correct" ? "Correct!" : "Not quite!"}
              </p>

              <div className="flex items-center justify-center gap-3 mb-5">
                <div className={`flex-1 rounded-2xl px-3 py-2.5 border
                                 ${feedback === "correct" ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                  <p className="text-xs text-white/30 mb-0.5">Your answer</p>
                  <p className={`text-base font-black ${feedback === "correct" ? "text-emerald-400" : "text-red-400"}`}>
                    {prevUserTime ? formatTime(prevUserTime.hour, prevUserTime.minute, prevUserTime.period) : "—"}
                  </p>
                </div>
                <span className="text-white/20 text-xl flex-shrink-0">→</span>
                <div className="flex-1 rounded-2xl px-3 py-2.5 bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-xs text-white/30 mb-0.5">Correct</p>
                  <p className="text-base font-black text-emerald-400">
                    {formatTime(correctTime.hour, correctTime.minute, correctTime.period)}
                  </p>
                </div>
              </div>

              <p className="text-sm text-white/40 mb-4">
                Score: <span className="font-black text-white">{score} / {signs.length}</span>
              </p>

              <button
                onClick={nextQuestion}
                className="w-full py-3 rounded-2xl text-white font-black text-base
                           bg-gradient-to-r from-violet-600 to-blue-600
                           hover:opacity-90 active:scale-[0.98] transition-all"
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