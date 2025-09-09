import { useEffect, useState } from "react";
import "./FindFruit.css";

export default function FruitGame() {
  const [svgContent, setSvgContent] = useState("");
  const [fruits, setFruits] = useState([]);
  const [selectedFruit, setSelectedFruit] = useState(null);
  const [hoveredFruit, setHoveredFruit] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Mode handling
  const [mode, setMode] = useState(null); // "learn", "test", or "result"
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);

  // Load fruits
  useEffect(() => {
    fetch("/fruits.json")
      .then((res) => res.json())
      .then((data) => setFruits(data));
  }, []);

  // Load SVG
  useEffect(() => {
    fetch("/images/Fruits/fruitBasket.svg")
      .then((res) => res.text())
      .then((data) => {
        let fixed = data;

        fixed = fixed.replace(
          /href="fruitBasket\.png"/g,
          'href="/images/Fruits/fruitBasket.png"'
        );

        if (!/viewBox=/.test(fixed)) {
          fixed = fixed.replace(
            /<svg([^>]*)>/,
            '<svg$1 viewBox="0 0 1536 1024">'
          );
        }

        fixed = fixed.replace(/<g /g, '<g style="pointer-events: all;" ');

        setSvgContent(fixed);
      });
  }, []);

  // Timer for test mode
  useEffect(() => {
    if (mode !== "test" || !fruits.length) return;

    if (timeLeft <= 0) {
      handleNextQuestion();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [mode, timeLeft, fruits]);

  // Handle hover + click
  useEffect(() => {
    if (!svgContent || fruits.length === 0) return;

    const svgElement = document.getElementById("fruit-basket-svg");

    const getFruitFromTarget = (target) => {
      while (target && target !== document) {
        const fruit = fruits.find(
          (f) => f.name.toLowerCase() === target.id?.toLowerCase()
        );
        if (fruit) return fruit;
        target = target.parentNode;
      }
      return null;
    };

    const handleMouseMove = (e) => {
      setTooltipPos({ x: e.clientX, y: e.clientY });
      const fruit = getFruitFromTarget(e.target);
      if (fruit && mode === "learn") {
        // only show tooltip in learn mode
        setHoveredFruit(fruit.name);
      } else {
        setHoveredFruit(null);
      }
    };

    const handleClick = (e) => {
      const fruit = getFruitFromTarget(e.target);
      if (!fruit) return;

      if (mode === "learn") {
        setSelectedFruit(fruit);
      } else if (mode === "test") {
        const current = fruits[currentQuestionIndex];
        if (fruit.name === current?.name) {
          setFeedback("✅ Correct!");
          setScore((s) => s + 1);
        } else {
          setFeedback("❌ Wrong!");
        }
        setTimeout(() => handleNextQuestion(), 1200);
      }
    };

    svgElement?.addEventListener("mousemove", handleMouseMove);
    svgElement?.addEventListener("click", handleClick);

    return () => {
      svgElement?.removeEventListener("mousemove", handleMouseMove);
      svgElement?.removeEventListener("click", handleClick);
    };
  }, [svgContent, fruits, mode, currentQuestionIndex]);

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 >= fruits.length) {
      setMode("result");
    } else {
      setCurrentQuestionIndex((i) => i + 1);
      setFeedback(null);
      setTimeLeft(30);
    }
  };

  const startTest = () => {
    setMode("test");
    setCurrentQuestionIndex(0);
    setScore(0);
    setFeedback(null);
    setSelectedFruit(null);
    setTimeLeft(30);
  };

  return (
    <div className="fruit-game-container">
      {/* Mode selection */}
      {!mode && (
        <div className="mode-select">
          <h2>Choose a mode:</h2>
          <button onClick={() => setMode("learn")}>Learn</button>
          <button onClick={startTest}>Test</button>
        </div>
      )}

      {/* Learn/Test mode */}
      {mode === "learn" || mode === "test" ? (
        <>
          <h2 className="instruction">
            {mode === "learn"
              ? "Click on a fruit to see its video"
              : `Identify the fruit from the sign! (${timeLeft}s left)`}
          </h2>

          {mode === "test" && (
            <div className="scoreboard">
              <p>
                Question {currentQuestionIndex + 1} of {fruits.length}
              </p>
              <p>
                Score: {score} / {fruits.length}
              </p>
            </div>
          )}

          <div className="game-layout">
            <div
              id="fruit-basket-svg"
              dangerouslySetInnerHTML={{ __html: svgContent }}
              className="svg-container"
            />

            <div className="video-container">
              {mode === "learn" ? (
                selectedFruit ? (
                  <video
                    key={selectedFruit.name}
                    src={selectedFruit.video}
                    controls
                    autoPlay
                    className="fruit-video"
                  />
                ) : (
                  <div className="placeholder">Video will appear here</div>
                )
              ) : (
                <video
                  key={fruits[currentQuestionIndex]?.name}
                  src={fruits[currentQuestionIndex]?.video}
                  controls
                  autoPlay
                  className="fruit-video"
                />
              )}
            </div>
          </div>

          {/* Feedback */}
          {feedback && <div className="feedback">{feedback}</div>}

          {/* Tooltip (only in learn mode) */}
          {hoveredFruit && (
            <div
              className="fruit-tooltip"
              style={{ top: tooltipPos.y + 10, left: tooltipPos.x + 10 }}
            >
              {hoveredFruit}
            </div>
          )}

          {/* Back button */}
          <button className="back-btn" onClick={() => setMode(null)}>
            🔙 Back to mode select
          </button>
        </>
      ) : null}

      {/* Result screen */}
      {mode === "result" && (
        <div className="result-screen">
          <h2>🎉 Test Complete!</h2>
          <p>
            Your Score: {score} / {fruits.length}
          </p>
          <button onClick={startTest}>🔄 Restart Test</button>
          <button onClick={() => setMode(null)}>🏠 Back to Mode Select</button>
        </div>
      )}
    </div>
  );
}
