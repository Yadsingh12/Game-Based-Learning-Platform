import React, { useState, useEffect } from "react";
import "./FindShapes.css";

const shapes = {
    arrow: { type: "polygon", points: "50,0 70,30 60,30 60,100 40,100 40,30 30,30" },
    circle: { type: "circle", cx: 50, cy: 50, r: 50 },
    cross: { type: "path", d: "M40 0 H60 V40 H100 V60 H60 V100 H40 V60 H0 V40 H40 Z" },
    cube: {
        type: "g",
        d: `
      <polygon points="50,10 80,25 50,40 20,25" fill="#5E8C5F" stroke="#333" stroke-width="2" />
      <polygon points="20,25 50,40 50,90 20,75" fill="#4CAF50" stroke="#333" stroke-width="2" />
      <polygon points="50,40 80,25 80,75 50,90" fill="#428148" stroke="#333" stroke-width="2" />
    `
    },
    cylinder: {
        type: "g",
        d: `
      <path d="M20,40 L20,80 A30,15 0 1,0 80,80 L80,40 A30,15 0 1,1 20,40 Z" fill="#4CAF50" stroke="#333" stroke-width="2" />
      <ellipse cx="50" cy="40" rx="30" ry="15" fill="#6CC072" stroke="#333" stroke-width="2" />
    `
    },
    cone: { type: "path", d: "M50 0 L10 70 A40 20 0 1 0 90 70 Z", fill: "#4CAF50" },
    diamond: { type: "polygon", points: "50,0 100,50 50,100 0,50" },
    heart: { type: "path", d: "M50 90 L90 50 A20 20 0 0 0 50 10 A20 20 0 0 0 10 50 Z" },
    hexagon: { type: "polygon", points: "25,0 75,0 100,50 75,100 25,100 0,50" },
    moon: {
        type: "path",
        d: "M40,0 A40,40 0 1,1 40,100 A10,30 0 1,0 40,0",
        fill: "#4CAF50",
        fillRule: "evenodd"
    },
    oval: { type: "ellipse", cx: 50, cy: 50, rx: 50, ry: 30 },
    parallelogram: { type: "polygon", points: "20,0 100,0 80,100 0,100" },
    pentagon: { type: "polygon", points: "50,0 100,38 81,100 19,100 0,38" },
    rectangle: { type: "polygon", points: "0,0 100,0 100,60 0,60" },
    square: { type: "polygon", points: "0,0 100,0 100,100 0,100" },
    trapezium: { type: "polygon", points: "20,0 80,0 100,100 0,100" },
    triangle: { type: "polygon", points: "50,0 100,100 0,100" },
};

// Shape renderer
const Shape = ({ shape, color = "#4CAF50", onClick }) => {
    const { type } = shape;
    return (
        <svg width={80} height={80} viewBox="0 0 100 100" onClick={onClick} style={{ cursor: "pointer" }}>
            {type === "polygon" && <polygon points={shape.points} fill={color} stroke="#333" strokeWidth="2" />}
            {type === "circle" && <circle cx={shape.cx} cy={shape.cy} r={shape.r} fill={color} stroke="#333" strokeWidth="2" />}
            {type === "ellipse" && <ellipse cx={shape.cx} cy={shape.cy} rx={shape.rx} ry={shape.ry} fill={color} stroke="#333" strokeWidth="2" />}
            {type === "path" && <path d={shape.d} fill={shape.fill || color} stroke="#333" strokeWidth="2" />}
            {type === "g" && <g dangerouslySetInnerHTML={{ __html: shape.d }} />}
        </svg>
    );
};

// Modal for feedback
const MessageModal = ({ message, onClose, video }) => (
    <div className="modal-overlay">
        <div className="modal-content">
            <p className="modal-message">{message}</p>
            {video && (
                <video width="300" controls autoPlay>
                    <source src={video} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            )}
            <button onClick={onClose} className="modal-close-btn">Close</button>
        </div>
    </div>
);

// Confirmation Modal
const ConfirmModal = ({ message, onConfirm, onCancel }) => (
    <div className="modal-overlay">
        <div className="modal-content">
            <p className="modal-message">{message}</p>
            <div className="confirm-buttons">
                <button className="modal-close-btn" onClick={onConfirm}>Yes</button>
                <button className="modal-close-btn" onClick={onCancel}>Cancel</button>
            </div>
        </div>
    </div>
);

export default function ShapesGame() {
    // keep default "learn" mode
    const [mode, setMode] = useState("learn");

    // test sequencing & options
    const [testOrder, setTestOrder] = useState([]); // full randomized order of shapes
    const [testIndex, setTestIndex] = useState(0); // current index in testOrder
    const [currentTestShape, setCurrentTestShape] = useState(null); // name string
    const [testOptions, setTestOptions] = useState([]); // array of 4 names (correct + 3 distractors)

    // scoring & storage
    const [score, setScore] = useState(0);
    const [bestScore, setBestScore] = useState(() => Number(localStorage.getItem("best_shape_score") || 0));
    const [previousScore, setPreviousScore] = useState(() => Number(localStorage.getItem("previous_shape_score") || 0));

    // modal / feedback
    const [message, setMessage] = useState("");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [videoSrc, setVideoSrc] = useState(null);

    // to decide what happens on closing the modal
    // true => last answer was correct, false => last was wrong
    const [lastAnswerCorrect, setLastAnswerCorrect] = useState(null);

    // Confirmation modal
    const [pendingMode, setPendingMode] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // helper: build 4-option pool (correct + 3 random others)
    const buildOptionsFor = (correctName) => {
        const all = Object.keys(shapes).filter(n => n !== correctName);
        // shuffle all and take 3
        const shuffled = all.sort(() => Math.random() - 0.5).slice(0, 3);
        const pool = [correctName, ...shuffled].sort(() => Math.random() - 0.5);
        return pool;
    };

    // start the full test (random order of all shapes)
    const startTest = () => {
        const shapeNames = Object.keys(shapes);
        // shuffle full order
        const order = [...shapeNames].sort(() => Math.random() - 0.5);
        setTestOrder(order);
        setTestIndex(0);
        setScore(0);

        const first = order[0];
        setCurrentTestShape(first);
        setTestOptions(buildOptionsFor(first));

        // switch mode to test (if not already)
        setMode("test");
    };

    // end test: save previous & best, return to learn (start) page
    const endTest = (finalScore) => {
        localStorage.setItem("previous_shape_score", finalScore);
        setPreviousScore(finalScore);

        if (finalScore > bestScore) {
            localStorage.setItem("best_shape_score", finalScore);
            setBestScore(finalScore);
        }
        // reset test state
        setTestOrder([]);
        setTestIndex(0);
        setCurrentTestShape(null);
        setTestOptions([]);
        setScore(0);
        setLastAnswerCorrect(null);
        // go back to learn 
        setMode("learn");
        setIsModalVisible(false);
        setMessage("");
        setVideoSrc(null);
    };

    // what happens when a shape tile is clicked
    const handleClick = (shapeName) => {
        const videoPath = `/videos/Shapes/${shapeName}.mp4`;

        if (mode === "learn") {
            setVideoSrc(videoPath);
            setMessage(`This is a ${shapeName}`);
            setIsModalVisible(true);
            setLastAnswerCorrect(null);
            return;
        }

        if (mode === "test") {
            if (!currentTestShape) return; // safety
            if (shapeName === currentTestShape) {
                // correct
                const newScore = score + 1;
                setScore(newScore);
                setMessage("Correct! 🎉");
                setVideoSrc(videoPath);
                setIsModalVisible(true);
                setLastAnswerCorrect(true);

                // if this was the last item in testOrder, we still show modal and then end on close
                return;
            } else {
                // wrong -> show modal and mark wrong; on close we end test
                setMessage("Try again ❌");
                setVideoSrc(null);
                setIsModalVisible(true);
                setLastAnswerCorrect(false);
                return;
            }
        }
    };

    // close modal handler — decides whether to advance test or finish test
    const handleCloseModal = () => {
        setIsModalVisible(false);
        setMessage("");
        setVideoSrc(null);

        if (mode === "test") {
            if (lastAnswerCorrect === true) {
                // move to next test item or finish if done
                const nextIndex = testIndex + 1;
                if (nextIndex >= testOrder.length) {
                    // finished all correctly
                    endTest(score);
                } else {
                    const nextShape = testOrder[nextIndex];
                    setTestIndex(nextIndex);
                    setCurrentTestShape(nextShape);
                    setTestOptions(buildOptionsFor(nextShape));
                    setLastAnswerCorrect(null);
                    // modal closed and next question now visible (video will autoplay from test video area)
                }
            } else if (lastAnswerCorrect === false) {
                // wrong answer -> immediate end
                endTest(score);
            } else {
                // neutral (e.g., learn modal) — do nothing extra
            }
        }
    };

    // request mode change with confirmation if leaving/entering test
    const requestModeChange = (newMode) => {
        if (mode === newMode) return;
        if (mode === "test" || newMode === "test") {
            setPendingMode(newMode);
            setShowConfirmModal(true);
        } else {
            setMode(newMode);
        }
    };

    const confirmModeChange = () => {
        setShowConfirmModal(false);

        if (mode === "test") {
            setTestOrder([]);
            setTestIndex(0);
            setCurrentTestShape(null);
            setTestOptions([]);
            setScore(0);
            setLastAnswerCorrect(null);
        }

        if (pendingMode === "test") startTest();
        else setMode(pendingMode);

        setPendingMode(null);
    };

    const cancelModeChange = () => {
        setShowConfirmModal(false);
        setPendingMode(null);
    };

    const getConfirmMessage = () => {
        if (mode === "learn" && pendingMode === "test") {
            return "You are about to start a test. Are you ready?";
        }
        if (mode === "test" && pendingMode === "learn") {
            return "You are leaving the test. Your current score will be lost. Continue?";
        }
        return "";
    };

    // when user toggles to test mode via button (keeps buttons visible)
    useEffect(() => {
        if (mode === "test") {
            // if testOrder empty, start a fresh test
            if (!testOrder || testOrder.length === 0) {
                startTest();
            } else {
                // else resume current test state (rare)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode]);

    return (
        <div id="findshapegame">
            <h1 className="main-title">Shapes Game</h1>
            <p className="subtitle">Learn with sign videos or test your knowledge!</p>

            {/* Score box */}
            <div className="score-box">
                <div className="score-item">Previous Score: {previousScore}</div>
                <div className="separator">|</div>
                <div className="score-item">Best Score: {bestScore}</div>
            </div>

            <div className="button-container">
                <button onClick={() => requestModeChange("learn")} disabled={mode === "learn"}>Learn Mode</button>
                <button onClick={() => requestModeChange("test")} disabled={mode === "test"}>Test Mode</button>
            </div>

            {/* Show video in Test Mode (autoplay the current test shape's video) */}
            {mode === "test" && currentTestShape && (
                <div className="test-video">
                    <video width="320" controls autoPlay loop key={currentTestShape}>
                        <source src={`/videos/Shapes/${currentTestShape}.mp4`} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                    <p className="test-instruction">Watch the sign and click the correct shape below!</p>
                    <p className="test-instruction">Score: {score} / {testOrder.length || Object.keys(shapes).length}</p>
                </div>
            )}

            {/* Shapes Grid — layout remains same as original. In test mode we only render testOptions (4 names). In learn mode, render all. */}
            <div className={`grid-container ${mode}`}>
                {Object.entries(shapes)
                    .filter(([name]) => {
                        if (mode === "learn") return true;
                        if (mode === "test") return testOptions.includes(name);
                        return true;
                    })
                    .map(([name, shapeObj]) => (
                        <div key={name} className="grid-item" title={name} onClick={() => handleClick(name)}>
                            <Shape shape={shapeObj} />
                            <span className="shape-name">{name}</span>
                        </div>
                    ))}
            </div>

            {isModalVisible && <MessageModal message={message} onClose={handleCloseModal} video={videoSrc} />}

            {showConfirmModal && <ConfirmModal message={getConfirmMessage()} onConfirm={confirmModeChange} onCancel={cancelModeChange} />}
        </div>
    );
}
