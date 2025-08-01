import React, { useEffect, useRef, useState } from "react";
import { UncontrolledReactSVGPanZoom } from "react-svg-pan-zoom";
import stateData from "../data/stateData";
import "./IndiaMap.css";

// A small, reusable component for rendering a single path
const MapState = ({ id, d, onClick, fill }) => {
  return (
    <path
      id={id}
      className="map-state"
      d={d}
      onClick={onClick}
      style={{ fill }}
    />
  );
};

const IndiaMap = () => {
  const Viewer = useRef(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showError, setShowError] = useState(false);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showCorrect, setShowCorrect] = useState(false);
  
  const [stateColors, setStateColors] = useState({});
  const [svgPaths, setSvgPaths] = useState([]);
  const [svgViewBox, setSvgViewBox] = useState("-50 -50 700 800");

  const [viewerSize, setViewerSize] = useState({ width: 0, height: 0 });
  const mapContainerRef = useRef(null);

  const resetGame = () => {
    setGameCompleted(false);
    setScore(0);
    setCurrentIndex(0);
    setQuestions((questions) => {
      const shuffled = [...questions].sort(() => 0.5 - Math.random());
      return shuffled;
    });

    setStateColors({});

    if (Viewer.current) {
      Viewer.current.fitToViewer();
    }
  };

  useEffect(() => {
    const shuffled = Object.entries(stateData)
      .filter(([_, data]) => data.questions && data.questions.length)
      .map(([id, data]) => ({
        id,
        name: data.name,
        color: data.color,
        question:
          data.questions[Math.floor(Math.random() * data.questions.length)],
      }))
      .sort(() => 0.5 - Math.random());
    setQuestions(shuffled);
  }, []);

  useEffect(() => {
    fetch("/assets/RecognizeState/india.svg")
      .then((res) => res.text())
      .then((svgText) => {
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
        const svgElement = svgDoc.querySelector("svg");
        
        const viewBox = svgElement.getAttribute("viewBox");
        if (viewBox) {
          setSvgViewBox(viewBox);
        }

        const paths = Array.from(svgElement.querySelectorAll("[id^='IN-']")).map(
          (pathElement) => ({
            id: pathElement.getAttribute("id"),
            d: pathElement.getAttribute("d"),
          })
        );
        setSvgPaths(paths);
      })
      .catch((error) => console.error("Error fetching or parsing SVG:", error));
  }, []);

  // Use a debounced function to handle the re-fitting
  const debouncedFitToViewer = useRef(
    debounce(() => {
      if (Viewer.current) {
        Viewer.current.fitToViewer();
      }
    }, 200) // 200ms delay
  ).current;

  // Use ResizeObserver for more efficient and accurate size tracking
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setViewerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      if (mapContainerRef.current) {
        resizeObserver.unobserve(mapContainerRef.current);
      }
    };
  }, []);

  // New useEffect to call fitToViewer whenever the viewer size changes
  useEffect(() => {
    // We check if the size is valid before trying to fit
    if (viewerSize.width > 0 && viewerSize.height > 0) {
      debouncedFitToViewer();
    }
  }, [viewerSize, debouncedFitToViewer]);

  const handleMapClick = (id) => {
    const currentQuestion = questions[currentIndex];

    if (!currentQuestion) return;

    if (id === currentQuestion.id) {
      setStateColors((prevColors) => ({
        ...prevColors,
        [id]: currentQuestion.color,
      }));
      setScore((prev) => prev + 1);
      setShowCorrect(true);
      setTimeout(() => setShowCorrect(false), 800);

      if (currentIndex + 1 >= questions.length) {
        setTimeout(() => setGameCompleted(true), 800);
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    } else {
      setShowError(true);
      setStateColors((prevColors) => ({
        ...prevColors,
        [id]: "#ff6b6b",
        [currentQuestion.id]: currentQuestion.color,
      }));
      setTimeout(() => {
        setShowError(false);
        setStateColors((prevColors) => ({
          ...prevColors,
          [id]: "",
        }));
        if (currentIndex + 1 >= questions.length) {
          setGameCompleted(true);
        } else {
          setCurrentIndex((prev) => prev + 1);
        }
      }, 800);
    }
  };

  const currentQuestion = questions[currentIndex];
  const questionNumber = currentIndex + 1;
  const totalQuestions = questions.length;

  return (
    <div className="quiz-layout">
      <div className="quiz-header-section">
        <div className="game-info-box">
          <div className="game-score">
            Score: {score} / {totalQuestions}
          </div>
          <div className="game-progress">
            Question: {questionNumber} / {totalQuestions}
          </div>
        </div>

        {!gameCompleted ? (
          <div
            className={`question-box ${showError ? "shake" : ""} ${
              showCorrect ? "correct-pulse" : ""
            }`}
          >
            {currentQuestion ? currentQuestion.question : "Loading..."}
          </div>
        ) : (
          <div className="question-box game-over-box">
            <p>🎉 Game Over! 🎉</p>
            <p>You scored **{score} out of {totalQuestions}**!</p>
            <button onClick={resetGame} className="play-again-button">
              Play Again
            </button>
          </div>
        )}
      </div>

      <div ref={mapContainerRef} className="map-viewer-container">
        {viewerSize.width > 0 && viewerSize.height > 0 && (
            <UncontrolledReactSVGPanZoom
                ref={Viewer}
                width={viewerSize.width}
                height={viewerSize.height}
                onDoubleClick={(e) => e.preventDefault()}
                tool="auto"
                scaleFactorMin={0.5} 
                scaleFactorMax={4}
            >
                <svg viewBox={svgViewBox}>
                    {svgPaths.map((path) => (
                    <MapState
                        key={path.id}
                        id={path.id}
                        d={path.d}
                        onClick={() => handleMapClick(path.id)}
                        fill={stateColors[path.id] || "#e6e6e6"}
                    />
                    ))}
                </svg>
            </UncontrolledReactSVGPanZoom>
        )}
      </div>
    </div>
  );
};

export default IndiaMap;

// Debounce utility function
function debounce(fn, delay) {
  let timerId;
  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn(...args), delay);
  };
}