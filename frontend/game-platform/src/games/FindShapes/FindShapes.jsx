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

// Modal for feedback in Learn Mode
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

export default function ShapesGame() {
    const [mode, setMode] = useState("learn");
    const [currentTestShape, setCurrentTestShape] = useState(null);
    const [message, setMessage] = useState("");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [videoSrc, setVideoSrc] = useState(null);

    const startTest = () => {
        const shapeNames = Object.keys(shapes);
        const randomShape = shapeNames[Math.floor(Math.random() * shapeNames.length)];
        setCurrentTestShape(randomShape);
    };

    const handleClick = (shapeName) => {
        const videoPath = `/videos/Shapes/${shapeName}.mp4`;

        if (mode === "learn") {
            setVideoSrc(videoPath);
            setMessage(`This is a ${shapeName}`);
            setIsModalVisible(true);
        } else if (mode === "test") {
            if (shapeName === currentTestShape) {
                setMessage("Correct! 🎉");
                setVideoSrc(`/videos/Shapes/${currentTestShape}.mp4`); // replay the test video
                setIsModalVisible(true);
                startTest();
            } else {
                setMessage("Try again ❌");
                setVideoSrc(null);
                setIsModalVisible(true);
            }
        }
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setMessage("");
        setVideoSrc(null);
    };

    useEffect(() => {
        if (mode === "test") startTest();
    }, [mode]);

    return (
        <div id="findshapegame">
            <h1 className="main-title">Shapes Game</h1>
            <p className="subtitle">Learn with sign videos or test your knowledge!</p>

            <div className="button-container">
                <button onClick={() => setMode("learn")} disabled={mode === "learn"}>Learn Mode</button>
                <button onClick={() => setMode("test")} disabled={mode === "test"}>Test Mode</button>
            </div>

            {/* Show video in Test Mode */}
            {mode === "test" && currentTestShape && (
                <div className="test-video">
                    <video width="320" controls autoPlay loop>
                        <source src={`/videos/Shapes/${currentTestShape}.mp4`} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                    <p className="test-instruction">Watch the sign and click the correct shape below!</p>
                </div>
            )}

            {/* Shapes Grid */}
            <div className={`grid-container ${mode}`}>
                {Object.entries(shapes)
                    .filter(([name]) => {
                        if (mode === "learn") return true; // all shapes
                        if (mode === "test") {
                            // only show a subset: correct + random few
                            const pool = [currentTestShape];
                            const others = Object.keys(shapes).filter(s => s !== currentTestShape);
                            while (pool.length < 6) {
                                const r = others.splice(Math.floor(Math.random() * others.length), 1)[0];
                                pool.push(r);
                            }
                            return pool.includes(name);
                        }
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
        </div>
    );
}
