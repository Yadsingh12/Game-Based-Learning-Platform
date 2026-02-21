// src/components/games/IndiaMapGame.jsx
// Requires: npm install react-zoom-pan-pinch
import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { HelpCircle, Home, MapPin } from "lucide-react";

const TOTAL_ROUNDS = 5;

// ─────────────────────────────────────────────────────────────
// Pure helper — pick a random unused question
// ─────────────────────────────────────────────────────────────

function pickQuestion(stateMap, usedIds) {
  const all      = Object.values(stateMap).filter(s => s.type === "state" && s.questions.length > 0);
  const eligible = all.filter(s => !usedIds.has(s.id));
  const pool     = eligible.length > 0 ? eligible : all;
  if (!pool.length) return null;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  return {
    id:       pick.id,
    name:     pick.name,
    color:    pick.color,
    videoUrl: pick.videoUrl,
    question: pick.questions[Math.floor(Math.random() * pick.questions.length)],
  };
}

// ─────────────────────────────────────────────────────────────
// SVG path component
// ─────────────────────────────────────────────────────────────

function MapState({ id, d, fill, onHover, isDisabled }) {
  return (
    <path
      id={id}
      d={d}
      style={{
        fill,
        stroke: "#000",
        strokeWidth: 0.5,
        transition: "fill 0.3s ease-in-out",
        cursor: isDisabled ? "not-allowed" : "pointer",
      }}
      onMouseEnter={e => !isDisabled && onHover(id, e)}
      onMouseLeave={() => !isDisabled && onHover(null)}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────

export default function IndiaMapGame({ data, assets, category, onExit }) {
  const svgRef      = useRef(null);
  const pointerDown = useRef(null);

  const colors = category?.colorScheme || {
    primary:   "#7c3aed",
    secondary: "#3b82f6",
    dark:      "#5b21b6",
    gradient:  "from-purple-600 to-blue-600",
  };

  // ── Build state map from props ─────────────────────────────
  const stateMap = useMemo(() => {
    const map = {};
    for (const sign of data?.signs ?? []) {
      const svgId = sign.visual?.svgId ?? sign.id;
      map[svgId] = {
        id:        svgId,
        name:      sign.name,
        color:     sign.visual?.color ?? "#e6e6e6",
        videoUrl:  sign.videoUrl ?? null,
        questions: sign.metadata?.questions ?? [],
        type:      sign.metadata?.type ?? "state",
      };
    }
    return map;
  }, [data]);

  // ── SVG loading ────────────────────────────────────────────
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

  // ── Game state ─────────────────────────────────────────────
  const [mode,          setMode]         = useState(null);
  const [question,      setQuestion]     = useState(null);
  const [usedIds,       setUsedIds]      = useState(new Set());
  const [round,         setRound]        = useState(1);
  const [score,         setScore]        = useState(0);
  const [roundOver,     setRoundOver]    = useState(false);
  const [gameOver,      setGameOver]     = useState(false);  // true only after last round's feedback is shown
  const [feedback,      setFeedback]     = useState(null);   // "correct" | "wrong" | null
  const [message,       setMessage]      = useState("");
  const [stateColors,   setStateColors]  = useState({});
  const [learnSelected, setLearnSelected]= useState(null);
  const [hovered,       setHovered]      = useState(null);
  const [tooltipPos,    setTooltipPos]   = useState({ x: 0, y: 0 });
  const [showHelp,      setShowHelp]     = useState(false);

  // Ref bag — always fresh, used inside callbacks to avoid stale closures
  const g = useRef({});
  g.current = { mode, question, usedIds, round, score, roundOver, gameOver, stateMap };

  // ── Game control functions ─────────────────────────────────

  const startTest = useCallback(() => {
    const used = new Set();
    setMode("test");
    setQuestion(pickQuestion(stateMap, used));
    setUsedIds(used);
    setRound(1);
    setScore(0);
    setRoundOver(false);
    setGameOver(false);
    setFeedback(null);
    setMessage("");
    setStateColors({});
  }, [stateMap]);

  // Called after the user sees feedback on any round (including the last)
  const nextRound = useCallback(() => {
    const { question: q, usedIds: used, round: r, score: s } = g.current;
    const isLastRound = r >= TOTAL_ROUNDS;

    if (isLastRound) {
      // Show game-over screen — keep feedback visible until they see the final modal
      setGameOver(true);
      return;
    }

    const newUsed = new Set([...used, q?.id]);
    const nextQ   = pickQuestion(g.current.stateMap, newUsed);

    setUsedIds(newUsed);
    setQuestion(nextQ);
    setRound(r => r + 1);
    setRoundOver(false);
    setFeedback(null);
    setMessage("");
    setStateColors({});
  }, []);

  const resetGame = () => {
    setMode(null);
    setQuestion(null);
    setUsedIds(new Set());
    setRound(1);
    setScore(0);
    setRoundOver(false);
    setGameOver(false);
    setFeedback(null);
    setMessage("");
    setStateColors({});
    setLearnSelected(null);
  };

  // ── State selection handler ────────────────────────────────

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
        [id]:          "#ff6b6b",
        [question.id]: question.color,
      }));
    }

    setRoundOver(true);

    // Always set message — last round message shown in the modal after user clicks Next
    setMessage(
      correct
        ? `🎉 Correct! Round ${round} / ${TOTAL_ROUNDS}`
        : `The answer was "${question.name}". Round ${round} / ${TOTAL_ROUNDS}`
    );
  }, []);

  // ── Pointer tap detection ──────────────────────────────────

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

  // ── Hover ──────────────────────────────────────────────────

  const handleHover = useCallback((id, e) => {
    if (!id) { setHovered(null); return; }
    const s = stateMap[id];
    if (!s || s.type !== "state") return;
    setHovered(s.name);
    setTooltipPos({ x: e.clientX, y: e.clientY });
  }, [stateMap]);

  // ── Derived display values ─────────────────────────────────

  const resolveVideo = url => url ? (assets?.videos?.[url] ?? url) : null;
  const videoSrc = mode === "learn" ? learnSelected?.videoUrl : question?.videoUrl;
  const videoKey = mode === "learn" ? learnSelected?.name     : question?.name;
  const isLastRound = round >= TOTAL_ROUNDS;

  // ─────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 overflow-hidden">

      {/* ── Mode selection ── */}
      {!mode && (
        <div className="flex-1 flex flex-col items-center justify-center gap-8 p-6">
          <h2 className={`text-3xl sm:text-4xl font-extrabold bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>
            Choose a Mode
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md sm:max-w-none sm:justify-center">
            <ModeCard
              onClick={() => setMode("learn")}
              icon={<MapPin size={36} className="text-green-500" />}
              title="Learn"
              titleColor="text-green-600"
              borderColor="border-green-400"
              description="Tap states to explore and see their videos"
              hoverColor="bg-green-100"
            />
            <ModeCard
              onClick={startTest}
              icon={<HelpCircle size={36} className="text-yellow-500" />}
              title="Test"
              titleColor="text-yellow-600"
              borderColor="border-yellow-400"
              description={`${TOTAL_ROUNDS} rounds — watch the video and tap the right state`}
              hoverColor="bg-yellow-100"
            />
          </div>
        </div>
      )}

      {/* ── Game screen ── */}
      {(mode === "learn" || mode === "test") && (
        <>
          {/* Header */}
          <div className="flex-none bg-white/80 backdrop-blur-sm border-b border-gray-200 px-3 py-2 space-y-2">

            <div className="flex items-center justify-between">
              <button
                onClick={resetGame}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-500 text-white text-sm font-semibold hover:bg-gray-600 transition-colors"
              >
                <Home size={14} /> Back
              </button>

              {mode === "test" && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-gray-200 text-xs sm:text-sm font-semibold">
                  <span style={{ color: colors.dark }}>Round</span>
                  <span className="font-black" style={{ color: colors.primary }}>{round}/{TOTAL_ROUNDS}</span>
                  <span className="text-gray-300">|</span>
                  <span style={{ color: colors.dark }}>Score</span>
                  <span className="font-black text-orange-500">{score}</span>
                </div>
              )}

              <button
                onClick={() => setShowHelp(v => !v)}
                className="p-1.5 rounded-full hover:bg-white/60 transition-colors"
                style={{ color: colors.primary }}
              >
                <HelpCircle size={20} />
              </button>
            </div>

            {showHelp && (
              <p className="text-xs sm:text-sm bg-white/90 border border-gray-200 rounded-xl px-3 py-2 text-gray-600">
                {mode === "learn"
                  ? "Tap any state to see its video. Pinch to zoom, drag to pan."
                  : `Watch the video then tap the matching state. ${TOTAL_ROUNDS} rounds total.`}
              </p>
            )}

            <div
              className="bg-white/90 border-2 rounded-xl px-3 py-2 flex items-center justify-center min-h-[44px]"
              style={{ borderColor: colors.primary }}
            >
              <p className="text-sm sm:text-base font-semibold text-center text-gray-800">
                {mode === "learn" ? "Tap a state to see its video" : (question?.question ?? "Loading...")}
              </p>
            </div>

            {(mode === "learn" ? learnSelected : feedback) && (
              <div className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-center ${
                mode === "learn" || feedback === "correct"
                  ? "bg-green-100 border border-green-300 text-green-800"
                  : "bg-red-100 border border-red-300 text-red-800"
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
          <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">

            {/* Map */}
            <div className="flex-[3] min-h-0 p-2 sm:p-3">
              <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-gray-200 shadow-lg bg-white">
                <TransformWrapper
                  key={mode}
                  initialScale={1}
                  minScale={0.4}
                  maxScale={6}
                  doubleClick={{ mode: "zoomIn", step: 0.7 }}
                >
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
                        <MapState
                          key={id} id={id} d={d}
                          fill={stateColors[id] ?? "#e6e6e6"}
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
            <div className="flex-[2] min-h-0 flex items-center justify-center p-2 sm:p-3 bg-white/40 border-t-2 lg:border-t-0 lg:border-l-2 border-gray-200">
              {videoSrc ? (
                <video
                  key={videoKey}
                  src={resolveVideo(videoSrc)}
                  controls autoPlay
                  className="w-full h-full max-h-full rounded-2xl shadow-xl border-4 border-white object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-300">
                  <MapPin size={36} />
                  <p className="text-sm text-center">
                    {mode === "learn" ? "Tap a state to see its video" : "Loading video..."}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Hover tooltip — desktop only */}
          {hovered && (
            <div
              className="fixed z-50 pointer-events-none hidden sm:block bg-white/90 border border-blue-200 text-blue-700 text-sm font-semibold px-3 py-1.5 rounded-lg shadow-lg"
              style={{ top: tooltipPos.y + 12, left: tooltipPos.x + 12 }}
            >
              {hovered}
            </div>
          )}

          {/* Round-over modal — shown after every answer including the last */}
          {roundOver && !gameOver && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl w-full max-w-sm text-center space-y-3">
                <div className="text-5xl">{feedback === "correct" ? "🎉" : "😔"}</div>
                <p
                  className="text-xl sm:text-2xl font-black"
                  style={{ color: feedback === "correct" ? "#10b981" : "#ef4444" }}
                >
                  {feedback === "correct" ? "Correct!" : "Wrong!"}
                </p>
                <p className="text-sm sm:text-base text-gray-500 font-medium">{message}</p>
                <div className="pt-2">
                  <GradientButton onClick={nextRound} colors={colors}>
                    {isLastRound ? "See Results →" : "Next Round →"}
                  </GradientButton>
                </div>
              </div>
            </div>
          )}

          {/* Game-over modal — shown only after user dismisses last round's feedback */}
          {gameOver && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl w-full max-w-sm text-center space-y-3">
                <div className="text-5xl">🏁</div>
                <p className="text-xl sm:text-2xl font-black" style={{ color: colors.primary }}>
                  Game Complete!
                </p>
                <p className="text-sm sm:text-base text-gray-500 font-medium">
                  You got <span className="font-black text-orange-500">{score}</span> out of{" "}
                  <span className="font-black">{TOTAL_ROUNDS}</span>
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <GradientButton onClick={startTest} colors={colors}>
                    🎮 Play Again
                  </GradientButton>
                  <button
                    onClick={() => onExit?.(Math.round((score / TOTAL_ROUNDS) * 100))}
                    className="px-6 py-3 rounded-2xl bg-gray-600 text-white font-bold hover:bg-gray-700 transition-colors"
                  >
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

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

function ModeCard({ onClick, icon, title, titleColor, borderColor, description, hoverColor }) {
  return (
    <button
      onClick={onClick}
      className={`group relative w-full sm:w-56 p-5 sm:p-7 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border-2 ${borderColor} hover:shadow-2xl transition-all hover:scale-105 active:scale-95 overflow-hidden text-left sm:text-center`}
    >
      <div className="relative z-10 flex sm:flex-col items-center gap-4 sm:gap-2">
        <div className="shrink-0 sm:flex sm:justify-center">{icon}</div>
        <div>
          <h3 className={`text-lg sm:text-xl font-bold ${titleColor}`}>{title}</h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{description}</p>
        </div>
      </div>
      <div className={`absolute inset-0 ${hoverColor} opacity-0 group-hover:opacity-30 transition-opacity`} />
    </button>
  );
}

function GradientButton({ onClick, colors, children }) {
  return (
    <button
      onClick={onClick}
      className="px-6 py-3 rounded-2xl text-white font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
      style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
    >
      {children}
    </button>
  );
}