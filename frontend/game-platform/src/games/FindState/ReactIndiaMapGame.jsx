import React, { useEffect, useRef, useState } from "react";
import { UncontrolledReactSVGPanZoom } from "react-svg-pan-zoom";
import "./IndiaMap.css";

// Single MapState component
const MapState = ({ id, d, onClick, fill, onHover, isDisabled }) => (
  <path
    id={id}
    className={`map-state ${isDisabled ? "disabled" : ""}`}
    d={d}
    onClick={!isDisabled ? onClick : undefined}
    style={{ fill, cursor: isDisabled ? "not-allowed" : "pointer" }}
    onMouseEnter={(e) => !isDisabled && onHover(id, e)}
    onMouseLeave={() => !isDisabled && onHover(null)}
  />
);

const IndiaMap = () => {
  const Viewer = useRef(null);
  const mapContainerRef = useRef(null);

  // State data
  const [stateData, setStateData] = useState({});
  const [svgPaths, setSvgPaths] = useState([]);
  const [svgViewBox, setSvgViewBox] = useState("-50 -50 700 800");

  // Game state
  const [mode, setMode] = useState(null); // "learn" | "test" | null | "result"
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);

  // UI state
  const [feedback, setFeedback] = useState(null);
  const [hoveredState, setHoveredState] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [selectedState, setSelectedState] = useState(null);
  const [stateColors, setStateColors] = useState({});
  const [viewerSize, setViewerSize] = useState({ width: 0, height: 0 });

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

  /* ---------------- Helper: generate questions ---------------- */
  const generateQuestions = () => {
    if (!Object.keys(stateData).length) return [];
    const shuffled = Object.entries(stateData)
      .filter(([_, data]) => data.type === "state" && data.questions?.length)
      .map(([id, data]) => ({
        id,
        name: data.name,
        color: data.color,
        video_path: data.video_path,
        question:
          data.questions[Math.floor(Math.random() * data.questions.length)],
      }))
      .sort(() => 0.5 - Math.random());
    return shuffled;
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
    if (!mode) return;

    const stateInfo = stateData[id];
    if (!stateInfo || stateInfo.type !== "state") return;

    if (mode === "learn") {
      setSelectedState(stateInfo);
      setStateColors((prev) => ({ ...prev, [id]: stateInfo.color }));
    } else if (mode === "test") {
      const currentQ = questions[currentIndex];

      if (id === currentQ.id) {
        setScore((s) => s + 1);
        setFeedback(`✅ Correct! ${stateInfo.name}`);
        setStateColors((prev) => ({ ...prev, [id]: stateInfo.color }));
      } else {
        setFeedback(`❌ Wrong! Correct: ${currentQ.name}`);
        setStateColors((prev) => ({
          ...prev,
          [id]: "#ff6b6b",
          [currentQ.id]: currentQ.color,
        }));
      }

      setTimeout(() => {
        if (currentIndex + 1 >= questions.length) {
          setMode("result");
          setGameCompleted(true);
        } else {
          setCurrentIndex((i) => i + 1);
          setFeedback(null);
        }
      }, 1000);
    }
  };

  /* ---------------- Reset / start ---------------- */
  const resetGame = () => {
    setMode(null);
    setSelectedState(null);
    setStateColors({});
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setFeedback(null);
    setGameCompleted(false);
  };

  const startTest = () => {
    setQuestions(generateQuestions()); // ✅ refresh questions
    setMode("test");
    setCurrentIndex(0);
    setScore(0);
    setGameCompleted(false);
    setFeedback(null);
    setStateColors({});
  };

  /* ---------------- Render ---------------- */
  return (
    <div className="quiz-layout">
      {!mode && (
        <div className="mode-select">
          <h2>Choose a mode:</h2>
          <button onClick={() => setMode("learn")}>Learn</button>
          <button onClick={startTest}>Test</button>
        </div>
      )}

      {(mode === "learn" || mode === "test") && (
        <>
          <div className="quiz-header-section">
            <button className="back-button" onClick={resetGame}>🏠 Back</button>
            {mode === "test" && (
              <div className="game-info-box">
                <p>
                  Question {currentIndex + 1} of {questions.length}
                </p>
                <p>
                  Score: {score} / {questions.length}
                </p>
              </div>
            )}
            <div className="question-box">
              {mode === "learn"
                ? "Click on a state to see its video"
                : questions[currentIndex]?.question}
            </div>
            {feedback && <div className="feedback-box">{feedback}</div>}
          </div>
        </>
      )}

      <div className="quiz-main">
        <div ref={mapContainerRef} className="map-viewer-container">
          {viewerSize.width > 0 && viewerSize.height > 0 && (
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
          )}
          {hoveredState && (
            <div
              className="map-tooltip"
              style={{ top: tooltipPos.y + 10, left: tooltipPos.x + 10 }}
            >
              {hoveredState}
            </div>
          )}
        </div>

        <div className="video-container">
          {(mode === "learn" && selectedState) && (
            <video
              key={selectedState.name}
              src={selectedState.video_path}
              controls
              autoPlay
              className="state-video"
            />
          )}
          {(mode === "test" && questions[currentIndex]) && (
            <video
              key={questions[currentIndex].name}
              src={questions[currentIndex].video_path}
              controls
              autoPlay
              className="state-video"
            />
          )}
        </div>
      </div>

      {mode === "result" && (
        <div className="result-screen">
          <h2>🎉 Test Complete!</h2>
          <p>
            Your Score: {score} / {questions.length}
          </p>
          <button onClick={startTest}>🔄 Restart Test</button>
          <button onClick={resetGame}>🏠 Back</button>
        </div>
      )}
    </div>
  );
};

export default IndiaMap;
