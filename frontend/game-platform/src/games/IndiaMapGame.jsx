// src/components/games/IndiaMapGame.jsx
// Modern India Map Recognition Game with Tailwind CSS

import React, { useEffect, useRef, useState } from "react";
import { UncontrolledReactSVGPanZoom } from "react-svg-pan-zoom";
import { HelpCircle, Home, MapPin } from "lucide-react";

const TOTAL_ROUNDS = 5;

// Single MapState component
const MapState = ({ id, d, onClick, fill, onHover, isDisabled }) => (
  <path
    id={id}
    className={`${isDisabled ? "cursor-not-allowed" : "cursor-pointer hover:opacity-80"}`}
    d={d}
    onClick={!isDisabled ? onClick : undefined}
    style={{ 
      fill, 
      stroke: "#000000",
      strokeWidth: 0.5,
      transition: "fill 0.5s ease-in-out"
    }}
    onMouseEnter={(e) => !isDisabled && onHover(id, e)}
    onMouseLeave={() => !isDisabled && onHover(null)}
  />
);

export default function IndiaMapGame(props) {
  const Viewer = useRef(null);
  const mapContainerRef = useRef(null);
  const assets = props.assets || {};

  // Extract props
  const onComplete = props.onComplete || props.onExit;
  const category = props.category || {};
  
  // Extract color scheme from category or use defaults
  const colors = category.colorScheme || {
    primary: "#7c3aed",
    secondary: "#3b82f6",
    light: "#c4b5fd",
    dark: "#5b21b6",
    gradient: "from-purple-600 to-blue-600"
  };

  // State data
  const [stateData, setStateData] = useState({});
  const [svgPaths, setSvgPaths] = useState([]);
  const [svgViewBox, setSvgViewBox] = useState("-50 -50 700 800");

  // Game state
  const [mode, setMode] = useState(null); // "learn" | "test" | null
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [usedStates, setUsedStates] = useState(new Set());
  const [roundOver, setRoundOver] = useState(false);
  const [gameCompletelyOver, setGameCompletelyOver] = useState(false);

  // UI state
  const [feedback, setFeedback] = useState(null);
  const [message, setMessage] = useState("");
  const [hoveredState, setHoveredState] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [selectedState, setSelectedState] = useState(null);
  const [stateColors, setStateColors] = useState({});
  const [viewerSize, setViewerSize] = useState({ width: 0, height: 0 });
  const [showInstructions, setShowInstructions] = useState(false);

  /* ---------------- Load data ---------------- */
  useEffect(() => {
    fetch("/stateData.json")
      .then((res) => res.json())
      .then(setStateData)
      .catch((err) => console.error("Error loading stateData:", err));
  }, []);

  useEffect(() => {
    fetch("/assets/RecognizeState/india.svg")
      .then((res) => res.text())
      .then((svgText) => {
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
        const svgElement = svgDoc.querySelector("svg");
        setSvgViewBox(svgElement.getAttribute("viewBox") || svgViewBox);

        const paths = Array.from(svgElement.querySelectorAll("[id^='IN-']")).map(
          (p) => ({ id: p.getAttribute("id"), d: p.getAttribute("d") })
        );
        setSvgPaths(paths);
      });
  }, []);

  /* ---------------- Resize observer ---------------- */
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setViewerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    if (mapContainerRef.current) resizeObserver.observe(mapContainerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Force update viewer size when map becomes visible
  useEffect(() => {
    if ((mode === "learn" || mode === "test") && mapContainerRef.current) {
      const rect = mapContainerRef.current.getBoundingClientRect();
      setViewerSize({ width: rect.width, height: rect.height });
    }
  }, [mode]);

  /* ---------------- Helper: generate questions ---------------- */
  const generateQuestions = () => {
    if (!Object.keys(stateData).length) return [];
    
    const availableStates = Object.entries(stateData)
      .filter(([id, data]) => data.type === "state" && data.questions?.length && !usedStates.has(id))
      .map(([id, data]) => ({
        id,
        name: data.name,
        color: data.color,
        video_path: data.video_path,
        question: data.questions[Math.floor(Math.random() * data.questions.length)],
      }));

    if (availableStates.length === 0) {
      // Reset if all used
      setUsedStates(new Set());
      return Object.entries(stateData)
        .filter(([_, data]) => data.type === "state" && data.questions?.length)
        .map(([id, data]) => ({
          id,
          name: data.name,
          color: data.color,
          video_path: data.video_path,
          question: data.questions[Math.floor(Math.random() * data.questions.length)],
        }))
        .sort(() => 0.5 - Math.random())
        .slice(0, 1);
    }

    return availableStates.sort(() => 0.5 - Math.random()).slice(0, 1);
  };

  /* ---------------- Event handlers ---------------- */
  const handleHover = (id, e) => {
    if (id) {
      const stateInfo = stateData[id];
      if (!stateInfo || stateInfo.type !== "state") return;
      setHoveredState(stateInfo.name);
      setTooltipPos({ x: e.clientX, y: e.clientY });
    } else setHoveredState(null);
  };

  const handleMapClick = (id) => {
    if (!mode || roundOver || gameCompletelyOver) return;

    const stateInfo = stateData[id];
    if (!stateInfo || stateInfo.type !== "state") return;

    if (mode === "learn") {
      setSelectedState(stateInfo);
      setStateColors((prev) => ({ ...prev, [id]: stateInfo.color }));
    } else if (mode === "test") {
      const currentQ = questions[currentIndex];

      if (id === currentQ.id) {
        const newScore = score + 1;
        setScore(newScore);
        setFeedback(`✅ Correct! ${stateInfo.name}`);
        setStateColors((prev) => ({ ...prev, [id]: stateInfo.color }));
        setRoundOver(true);
        
        if (currentRound >= TOTAL_ROUNDS) {
          setGameCompletelyOver(true);
          setMessage(`🎉 Game Complete! You got ${newScore} out of ${TOTAL_ROUNDS} states!`);
        } else {
          setMessage(`🎉 Correct! Round ${currentRound}/${TOTAL_ROUNDS}`);
        }
      } else {
        setFeedback(`❌ Wrong! Correct answer: ${currentQ.name}`);
        setStateColors((prev) => ({
          ...prev,
          [id]: "#ff6b6b",
          [currentQ.id]: currentQ.color,
        }));
        setRoundOver(true);
        
        if (currentRound >= TOTAL_ROUNDS) {
          setGameCompletelyOver(true);
          setMessage(`Game Complete! You got ${score} out of ${TOTAL_ROUNDS} states!`);
        } else {
          setMessage(`The state was "${currentQ.name}". Round ${currentRound}/${TOTAL_ROUNDS}`);
        }
      }

      setUsedStates(prev => new Set([...prev, currentQ.id]));
    }
  };

  /* ---------------- Game control ---------------- */
  const resetGame = () => {
    setMode(null);
    setSelectedState(null);
    setStateColors({});
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setCurrentRound(1);
    setFeedback(null);
    setRoundOver(false);
    setGameCompletelyOver(false);
    setUsedStates(new Set());
    setMessage("");
  };

  const startTest = () => {
    const newQuestions = generateQuestions();
    setQuestions(newQuestions);
    setMode("test");
    setCurrentIndex(0);
    setScore(0);
    setCurrentRound(1);
    setRoundOver(false);
    setGameCompletelyOver(false);
    setFeedback(null);
    setStateColors({});
    setUsedStates(new Set());
  };

  const nextRound = () => {
    if (currentRound >= TOTAL_ROUNDS) return;
    
    const newQuestions = generateQuestions();
    setQuestions(newQuestions);
    setCurrentIndex(0);
    setCurrentRound(prev => prev + 1);
    setRoundOver(false);
    setFeedback(null);
    setMessage("");
    setStateColors({});
  };

  const handleExit = () => {
    if (onComplete) {
      const percentage = Math.round((score / TOTAL_ROUNDS) * 100);
      onComplete(percentage);
    }
  };

  /* ---------------- Render ---------------- */
  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Mode Selection Screen */}
      {!mode && (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <h2 className={`text-3xl sm:text-4xl font-extrabold mb-8 bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>
            Choose a Mode
          </h2>
          <div className="flex flex-wrap gap-6 justify-center">
            <button
              onClick={() => setMode("learn")}
              className="group relative w-64 p-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border-2 border-green-400 hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95 overflow-hidden"
            >
              <div className="relative z-10">
                <div className="flex justify-center mb-4">
                  <MapPin size={48} className="text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">Learn Mode</h3>
                <p className="text-sm text-gray-600">
                  Click on states to see their videos and learn at your own pace
                </p>
              </div>
              <div className="absolute inset-0 bg-green-100 opacity-0 group-hover:opacity-30 transition-opacity"></div>
            </button>

            <button
              onClick={startTest}
              className="group relative w-64 p-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border-2 border-yellow-400 hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95 overflow-hidden"
            >
              <div className="relative z-10">
                <div className="flex justify-center mb-4">
                  <HelpCircle size={48} className="text-yellow-500" />
                </div>
                <h3 className="text-2xl font-bold text-yellow-600 mb-2">Test Mode</h3>
                <p className="text-sm text-gray-600">
                  Test your knowledge with {TOTAL_ROUNDS} random questions about Indian states
                </p>
              </div>
              <div className="absolute inset-0 bg-yellow-100 opacity-0 group-hover:opacity-30 transition-opacity"></div>
            </button>
          </div>
        </div>
      )}

      {/* Game Screen (Learn or Test) */}
      {(mode === "learn" || mode === "test") && (
        <>
          {/* Header */}
          <div className="flex-shrink-0 w-full px-4 pt-4 pb-3 bg-white/80 backdrop-blur-sm border-b-2 border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={resetGame}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-500 text-white font-semibold shadow-lg hover:bg-gray-600 transition-all transform hover:scale-105 active:scale-95"
              >
                <Home size={18} />
                Back
              </button>

              {mode === "test" && (
                <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-sm shadow-sm border border-white/40">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold" style={{ color: colors.dark }}>Round:</span>
                    <span className="text-lg font-extrabold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">{currentRound}/{TOTAL_ROUNDS}</span>
                  </div>
                  <div className="w-px h-4 bg-gray-300"></div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold" style={{ color: colors.dark }}>Score:</span>
                    <span className="text-lg font-extrabold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">{score}</span>
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="p-2 rounded-full hover:bg-white/50 transition-all duration-200"
                style={{ color: colors.primary }}
              >
                <HelpCircle size={22} strokeWidth={2.5} />
              </button>
            </div>

            {/* Instructions */}
            {showInstructions && (
              <div className="mb-3 text-sm bg-white/90 backdrop-blur-md shadow-md p-3 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top duration-300">
                <p className="font-semibold text-gray-700">
                  {mode === "learn" 
                    ? "Click on any state on the map to see its video and learn about it."
                    : "Watch the video and click on the correct state on the map. You have 5 rounds to test your knowledge!"}
                </p>
              </div>
            )}

            {/* Question Box */}
            <div className="bg-white/90 border-2 rounded-2xl p-4 shadow-lg min-h-[60px] flex items-center justify-center"
                 style={{ borderColor: colors.primary }}>
              <p className="text-lg sm:text-xl font-semibold text-center text-gray-800">
                {mode === "learn"
                  ? "Click on a state to see its video"
                  : questions[currentIndex]?.question || "Loading..."}
              </p>
            </div>

            {/* Feedback Box */}
            <div className="mt-3 min-h-[40px] flex items-center justify-center">
              {mode === "learn" && selectedState && (
                <div className="px-4 py-2 bg-green-100 border border-green-300 rounded-xl">
                  <span className="text-sm font-semibold text-green-800">
                    Clicked on '{selectedState.name}'
                  </span>
                </div>
              )}
              {mode === "test" && feedback && (
                <div className={`px-4 py-2 rounded-xl animate-in fade-in zoom-in duration-300 ${
                  feedback.startsWith('✅') 
                    ? 'bg-green-100 border border-green-300 text-green-800' 
                    : 'bg-red-100 border border-red-300 text-red-800'
                }`}>
                  <span className="text-sm font-bold">{feedback}</span>
                </div>
              )}
            </div>
          </div>

          {/* Main Content - Map and Video */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Map Container */}
            <div ref={mapContainerRef} className="flex-[2] p-4 flex items-center justify-center">
              {viewerSize.width > 0 && viewerSize.height > 0 && (
                <div className="w-full h-full border-2 border-gray-300 rounded-2xl overflow-hidden shadow-xl bg-white">
                  <UncontrolledReactSVGPanZoom
                    ref={Viewer}
                    width={viewerSize.width}
                    height={viewerSize.height}
                    tool="auto"
                    scaleFactorMin={0.5}
                    scaleFactorMax={4}
                  >
                    <svg viewBox={svgViewBox}>
                      {svgPaths.map((path) => {
                        const isDisabled =
                          stateData[path.id] && stateData[path.id].type !== "state";
                        return (
                          <MapState
                            key={path.id}
                            id={path.id}
                            d={path.d}
                            onClick={() => handleMapClick(path.id)}
                            fill={stateColors[path.id] || "#e6e6e6"}
                            onHover={handleHover}
                            isDisabled={isDisabled}
                          />
                        );
                      })}
                    </svg>
                  </UncontrolledReactSVGPanZoom>
                </div>
              )}
              {hoveredState && (
                <div
                  className="fixed bg-white/90 backdrop-blur-sm text-blue-700 px-3 py-1.5 rounded-lg text-sm font-semibold shadow-lg pointer-events-none z-50 border border-blue-200"
                  style={{
                    top: tooltipPos.y + 10,
                    left: tooltipPos.x + 10,
                  }}
                >
                  {hoveredState}
                </div>
              )}
            </div>

            {/* Video Container */}
            <div className="flex-1 p-4 flex items-center justify-center bg-white/50 backdrop-blur-sm border-t-2 lg:border-t-0 lg:border-l-2 border-gray-200">
              {(mode === "learn" && selectedState) && (
                <video
                  key={selectedState.name}
                  src={selectedState.video_path ? (assets?.videos?.[selectedState.video_path] ?? selectedState.video_path) : null}
                  controls
                  autoPlay
                  className="max-w-full max-h-full rounded-2xl shadow-2xl border-4 border-white"
                />
              )}
              {(mode === "test" && questions[currentIndex]) && (
                <video
                  key={questions[currentIndex].name}
                  src={questions[currentIndex].video_path ? (assets?.videos?.[questions[currentIndex].video_path] ?? questions[currentIndex].video_path) : null}
                  controls
                  autoPlay
                  className="max-w-full max-h-full rounded-2xl shadow-2xl border-4 border-white"
                />
              )}
              {mode === "test" && !questions[currentIndex] && (
                <p className="text-gray-500 text-sm">Loading video...</p>
              )}
            </div>
          </div>

          {/* Round Over Overlay */}
          {roundOver && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/60 max-w-md mx-4 animate-in zoom-in duration-500">
                <div className="text-6xl text-center mb-4">
                  {feedback?.startsWith('✅') ? '🎉' : '😔'}
                </div>
                <p className="text-2xl font-black text-center mb-4" style={{ 
                  color: feedback?.startsWith('✅') ? '#10b981' : '#ef4444' 
                }}>
                  {feedback?.startsWith('✅') ? 'Correct!' : 'Wrong Answer!'}
                </p>
                <p className="text-lg font-bold text-center mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {message}
                </p>
                
                <div className="flex gap-3 justify-center flex-wrap mt-6">
                  {!gameCompletelyOver ? (
                    <button
                      onClick={nextRound}
                      className="group relative px-8 py-3.5 text-base rounded-2xl text-white font-bold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95 overflow-hidden"
                      style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        Next Round →
                      </span>
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={startTest}
                        className="group relative px-8 py-3.5 text-base rounded-2xl text-white font-bold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95 overflow-hidden"
                        style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          🎮 Play Again
                        </span>
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                      </button>
                      {onComplete && (
                        <button
                          onClick={handleExit}
                          className="group relative px-8 py-3.5 text-base rounded-2xl bg-gradient-to-br from-gray-600 to-gray-700 text-white font-bold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95 overflow-hidden"
                        >
                          <span className="relative z-10 flex items-center gap-2">
                            ← Exit
                          </span>
                          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}