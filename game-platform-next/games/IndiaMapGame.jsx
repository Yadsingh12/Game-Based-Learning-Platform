// src/components/games/IndiaMapGame.jsx
// Requires: npm install react-zoom-pan-pinch
import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { HelpCircle, Home, MapPin } from "lucide-react";

const TOTAL_ROUNDS = 5;

function pickQuestion(stateMap, usedIds) {
  const all      = Object.values(stateMap).filter(s => s.type === "state" && s.questions.length > 0);
  const eligible = all.filter(s => !usedIds.has(s.id));
  const pool     = eligible.length > 0 ? eligible : all;
  if (!pool.length) return null;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  return {
    id: pick.id, name: pick.name, color: pick.color,
    videoUrl: pick.videoUrl,
    question: pick.questions[Math.floor(Math.random() * pick.questions.length)],
  };
}

function MapState({ id, d, fill, onHover, isDisabled }) {
  return (
    <path id={id} d={d}
      style={{
        fill, stroke: "rgba(255,255,255,0.15)", strokeWidth: 0.5,
        transition: "fill 0.3s ease-in-out",
        cursor: isDisabled ? "not-allowed" : "pointer",
      }}
      onMouseEnter={e => !isDisabled && onHover(id, e)}
      onMouseLeave={() => !isDisabled && onHover(null)}
    />
  );
}

export default function IndiaMapGame({ data, assets, category, onExit }) {
  const svgRef      = useRef(null);
  const pointerDown = useRef(null);

  const colors = category?.colorScheme || {
    primary: "#7c3aed", secondary: "#3b82f6",
    dark: "#5b21b6", gradient: "from-violet-600 to-blue-600",
  };

  const stateMap = useMemo(() => {
    const map = {};
    for (const sign of data?.signs ?? []) {
      const svgId = sign.visual?.svgId ?? sign.id;
      map[svgId] = {
        id: svgId, name: sign.name,
        color: sign.visual?.color ?? "rgba(124,58,237,0.3)",
        videoUrl: sign.videoUrl ?? null,
        questions: sign.metadata?.questions ?? [],
        type: sign.metadata?.type ?? "state",
      };
    }
    return map;
  }, [data]);

  const [svgPaths,   setSvgPaths]   = useState([]);
  const [svgViewBox, setSvgViewBox] = useState("-50 -50 700 800");

  useEffect(() => {
    fetch("/assets/RecognizeState/india.svg")
      .then(r => r.text())
      .then(text => {
        const doc = new DOMParser().parseFromString(text, "image/svg+xml");
        const el  = doc.querySelector("svg");
        setSvgViewBox(el?.getAttribute("viewBox") ?? "-50 -50 700 800");
        setSvgPaths(
          Array.from(el.querySelectorAll("[id^='IN-']"))
            .map(p => ({ id: p.getAttribute("id"), d: p.getAttribute("d") }))
        );
      })
      .catch(console.error);
  }, []);

  const [mode,          setMode]          = useState(null);
  const [question,      setQuestion]      = useState(null);
  const [usedIds,       setUsedIds]       = useState(new Set());
  const [round,         setRound]         = useState(1);
  const [score,         setScore]         = useState(0);
  const [roundOver,     setRoundOver]     = useState(false);
  const [gameOver,      setGameOver]      = useState(false);
  const [feedback,      setFeedback]      = useState(null);
  const [message,       setMessage]       = useState("");
  const [stateColors,   setStateColors]   = useState({});
  const [learnSelected, setLearnSelected] = useState(null);
  const [hovered,       setHovered]       = useState(null);
  const [tooltipPos,    setTooltipPos]    = useState({ x: 0, y: 0 });
  const [showHelp,      setShowHelp]      = useState(false);

  const g = useRef({});
  g.current = { mode, question, usedIds, round, score, roundOver, gameOver, stateMap };

  const startTest = useCallback(() => {
    const used = new Set();
    setMode("test"); setQuestion(pickQuestion(stateMap, used)); setUsedIds(used);
    setRound(1); setScore(0); setRoundOver(false); setGameOver(false);
    setFeedback(null); setMessage(""); setStateColors({});
  }, [stateMap]);

  const nextRound = useCallback(() => {
    const { question: q, usedIds: used, round: r } = g.current;
    if (r >= TOTAL_ROUNDS) { setGameOver(true); return; }
    const newUsed = new Set([...used, q?.id]);
    const nextQ   = pickQuestion(g.current.stateMap, newUsed);
    setUsedIds(newUsed); setQuestion(nextQ); setRound(r => r + 1);
    setRoundOver(false); setFeedback(null); setMessage(""); setStateColors({});
  }, []);

  const resetGame = () => {
    setMode(null); setQuestion(null); setUsedIds(new Set());
    setRound(1); setScore(0); setRoundOver(false); setGameOver(false);
    setFeedback(null); setMessage(""); setStateColors({}); setLearnSelected(null);
  };

  const handleStateSelect = useCallback((id) => {
    const { mode, question, round, score, roundOver, gameOver, stateMap } = g.current;
    if (!mode || roundOver || gameOver) return;
    const s = stateMap[id];
    if (!s || s.type !== "state") return;

    if (mode === "learn") {
      setLearnSelected(s);
      setStateColors(prev => ({ ...prev, [id]: s.color }));
      return;
    }
    if (!question) return;

    const correct  = id === question.id;
    const newScore = correct ? score + 1 : score;

    if (correct) {
      setScore(newScore);
      setFeedback("correct");
      setStateColors(prev => ({ ...prev, [id]: s.color }));
    } else {
      setFeedback("wrong");
      setStateColors(prev => ({
        ...prev,
        [id]: "#ef4444",
        [question.id]: question.color,
      }));
    }
    setRoundOver(true);
    setMessage(
      correct
        ? `🎉 Correct! Round ${round} / ${TOTAL_ROUNDS}`
        : `The answer was "${question.name}". Round ${round} / ${TOTAL_ROUNDS}`
    );
  }, []);

  const onPointerDown = useCallback(e => {
    if (pointerDown.current) return;
    pointerDown.current = { x: e.clientX, y: e.clientY, time: Date.now(), id: e.pointerId };
  }, []);

  const onPointerUp = useCallback(e => {
    const pd = pointerDown.current;
    if (!pd || pd.id !== e.pointerId) return;
    pointerDown.current = null;
    const moved   = Math.abs(e.clientX - pd.x) > 12 || Math.abs(e.clientY - pd.y) > 12;
    const tooSlow = Date.now() - pd.time > 450;
    if (moved || tooSlow) return;
    let el = e.target;
    while (el && el !== svgRef.current) {
      if (el.id?.startsWith("IN-")) { handleStateSelect(el.id); return; }
      el = el.parentElement;
    }
  }, [handleStateSelect]);

  const onPointerCancel = useCallback(() => { pointerDown.current = null; }, []);

  const handleHover = useCallback((id, e) => {
    if (!id) { setHovered(null); return; }
    const s = stateMap[id];
    if (!s || s.type !== "state") return;
    setHovered(s.name);
    setTooltipPos({ x: e.clientX, y: e.clientY });
  }, [stateMap]);

  const resolveVideo = url => url ? (assets?.videos?.[url] ?? url) : null;
  const videoSrc  = mode === "learn" ? learnSelected?.videoUrl : question?.videoUrl;
  const videoKey  = mode === "learn" ? learnSelected?.name     : question?.name;
  const isLastRound = round >= TOTAL_ROUNDS;

  return (
    <div className="h-full flex flex-col bg-[#0f0a1e] relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-violet-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-80 h-80 bg-blue-600/15 rounded-full blur-[100px] pointer-events-none" />

      {/* ── Mode selection ── */}
      {!mode && (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-8 p-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-4">
              <span className="text-violet-300 text-sm font-semibold tracking-wide">India Map</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Choose a Mode</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md sm:max-w-none sm:justify-center">
            <ModeCard
              onClick={() => setMode("learn")}
              icon={<MapPin size={32} className="text-emerald-400" />}
              title="Learn"
              description="Tap states to explore and see their videos"
              accentColor="rgba(52,211,153,0.2)"
              borderColor="rgba(52,211,153,0.3)"
            />
            <ModeCard
              onClick={startTest}
              icon={<HelpCircle size={32} className="text-amber-400" />}
              title="Test"
              description={`${TOTAL_ROUNDS} rounds — watch the video and tap the right state`}
              accentColor="rgba(251,191,36,0.2)"
              borderColor="rgba(251,191,36,0.3)"
            />
          </div>
        </div>
      )}

      {/* ── Game screen ── */}
      {(mode === "learn" || mode === "test") && (
        <>
          {/* Header */}
          <div className="relative z-10 flex-none bg-white/5 border-b border-white/10 backdrop-blur-sm px-3 py-2 space-y-2">
            <div className="flex items-center justify-between">
              <button onClick={resetGame}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 text-white/70 text-sm font-semibold hover:bg-white/20 transition-all">
                <Home size={13} /> Back
              </button>

              {mode === "test" && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs sm:text-sm font-semibold">
                  <span className="text-white/50">Round</span>
                  <span className="font-black text-white">{round}/{TOTAL_ROUNDS}</span>
                  <span className="text-white/20">|</span>
                  <span className="text-white/50">Score</span>
                  <span className="font-black text-violet-300">{score}</span>
                </div>
              )}

              <button onClick={() => setShowHelp(v => !v)}
                className="p-1.5 rounded-full hover:bg-white/10 transition-all text-violet-400">
                <HelpCircle size={18} />
              </button>
            </div>

            {showHelp && (
              <p className="text-xs sm:text-sm bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white/50">
                {mode === "learn"
                  ? "Tap any state to see its video. Pinch to zoom, drag to pan."
                  : `Watch the video then tap the matching state. ${TOTAL_ROUNDS} rounds total.`}
              </p>
            )}

            <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 flex items-center justify-center min-h-[44px]">
              <p className="text-sm sm:text-base font-semibold text-center text-white/70">
                {mode === "learn" ? "Tap a state to see its video" : (question?.question ?? "Loading...")}
              </p>
            </div>

            {(mode === "learn" ? learnSelected : feedback) && (
              <div className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-center border ${
                mode === "learn" || feedback === "correct"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}>
                {mode === "learn"
                  ? `Selected: ${learnSelected.name}`
                  : feedback === "correct"
                    ? `✅ Correct! That's ${question?.name}`
                    : `❌ Wrong! The answer was ${question?.name}`}
              </div>
            )}
          </div>

          {/* Body */}
          <div className="relative z-10 flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
            {/* Map */}
            <div className="flex-[3] min-h-0 p-2 sm:p-3">
              <div className="w-full h-full rounded-2xl overflow-hidden border border-white/10 bg-black/20">
                <TransformWrapper key={mode} initialScale={1} minScale={0.4} maxScale={6}
                  doubleClick={{ mode: "zoomIn", step: 0.7 }}>
                  <TransformComponent
                    wrapperStyle={{ width: "100%", height: "100%" }}
                    contentStyle={{ width: "100%", height: "100%" }}
                  >
                    <svg
                      ref={svgRef}
                      viewBox={svgViewBox}
                      style={{ width: "100%", height: "100%", display: "block", touchAction: "none" }}
                      onPointerDown={onPointerDown}
                      onPointerUp={onPointerUp}
                      onPointerCancel={onPointerCancel}
                    >
                      {svgPaths.map(({ id, d }) => (
                        <MapState key={id} id={id} d={d}
                          fill={stateColors[id] ?? "rgba(255,255,255,0.06)"}
                          onHover={handleHover}
                          isDisabled={!stateMap[id] || stateMap[id].type !== "state"}
                        />
                      ))}
                    </svg>
                  </TransformComponent>
                </TransformWrapper>
              </div>
            </div>

            {/* Video */}
            <div className="flex-[2] min-h-0 flex items-center justify-center p-2 sm:p-3
              bg-black/20 border-t border-white/10 lg:border-t-0 lg:border-l lg:border-white/10">
              {videoSrc ? (
                <video
                  key={videoKey}
                  src={resolveVideo(videoSrc)}
                  controls autoPlay
                  className="w-full h-full max-h-full rounded-2xl border border-white/10 object-contain bg-black/30"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-white/20">
                  <MapPin size={32} />
                  <p className="text-sm text-center">
                    {mode === "learn" ? "Tap a state to see its video" : "Loading video..."}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Hover tooltip */}
          {hovered && (
            <div className="fixed z-50 pointer-events-none hidden sm:block bg-[#0f0a1e] border border-violet-500/30 text-violet-300 text-sm font-semibold px-3 py-1.5 rounded-lg"
              style={{ top: tooltipPos.y + 12, left: tooltipPos.x + 12 }}>
              {hovered}
            </div>
          )}

          {/* Round-over modal */}
          {roundOver && !gameOver && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-[#0f0a1e] border border-white/15 rounded-3xl p-6 sm:p-8 w-full max-w-sm text-center space-y-3">
                <div className="text-5xl">{feedback === "correct" ? "🎉" : "😔"}</div>
                <p className="text-xl sm:text-2xl font-black"
                  style={{ color: feedback === "correct" ? "#34d399" : "#f87171" }}>
                  {feedback === "correct" ? "Correct!" : "Wrong!"}
                </p>
                <p className="text-sm sm:text-base text-white/50 font-medium">{message}</p>
                <div className="pt-2">
                  <GradientButton onClick={nextRound} colors={colors}>
                    {isLastRound ? "See Results →" : "Next Round →"}
                  </GradientButton>
                </div>
              </div>
            </div>
          )}

          {/* Game-over modal */}
          {gameOver && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-[#0f0a1e] border border-white/15 rounded-3xl p-6 sm:p-8 w-full max-w-sm text-center space-y-3">
                <div className="text-5xl">🏁</div>
                <p className="text-xl sm:text-2xl font-black text-white">Game Complete!</p>
                <p className="text-sm sm:text-base text-white/50 font-medium">
                  You got <span className="font-black text-violet-300">{score}</span> out of{" "}
                  <span className="font-black text-white">{TOTAL_ROUNDS}</span>
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <GradientButton onClick={startTest} colors={colors}>🎮 Play Again</GradientButton>
                  <button
                    onClick={() => onExit?.(Math.round((score / TOTAL_ROUNDS) * 100))}
                    className="px-6 py-3 rounded-2xl bg-white/10 border border-white/10 text-white/70 font-bold hover:bg-white/20 transition-all">
                    ← Exit
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ModeCard({ onClick, icon, title, description, accentColor, borderColor }) {
  return (
    <button
      onClick={onClick}
      className="group relative w-full sm:w-56 p-5 sm:p-7 bg-white/5 backdrop-blur-sm rounded-2xl border-2 transition-all hover:scale-105 active:scale-95 overflow-hidden text-left sm:text-center"
      style={{ borderColor }}
    >
      <div className="relative z-10 flex sm:flex-col items-center gap-4 sm:gap-2">
        <div className="shrink-0 sm:flex sm:justify-center">{icon}</div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-white">{title}</h3>
          <p className="text-xs sm:text-sm text-white/40 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"
        style={{ background: accentColor }} />
    </button>
  );
}

function GradientButton({ onClick, colors, children }) {
  return (
    <button onClick={onClick}
      className="px-6 py-3 rounded-2xl text-white font-bold transition-all hover:scale-105 active:scale-95 hover:opacity-90"
      style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
      {children}
    </button>
  );
}