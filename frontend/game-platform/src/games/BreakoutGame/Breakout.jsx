import React, { useRef, useEffect, useState, useCallback } from 'react';

// ISL Sign SVGs - Simple symbolic representations for events
const ISL_SVG_EVENTS = {
    hit: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f6ad55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" />
        </svg>`,
    gameOver: `<svg width="60" height="60" viewBox="0 0 24 24" fill="#e53e3e" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="8" y1="8" x2="16" y2="16" />
            <line x1="16" y1="8" x2="8" y2="16" />
        </svg>`,
    win: `<svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#48bb78" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>`
};

// ISL Sign SVGs - Abstracted finger counts for numbers 1-5
const ISL_SVG_NUMBERS = {
    1: `<svg viewBox="0 0 100 100" fill="none" stroke="#63b3ed" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round">
            <path d="M50 80 V20" />
        </svg>`,
    2: `<svg viewBox="0 0 100 100" fill="none" stroke="#63b3ed" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round">
            <path d="M40 80 V30 M60 80 V30" />
        </svg>`,
    3: `<svg viewBox="0 0 100 100" fill="none" stroke="#63b3ed" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round">
            <path d="M30 80 V40 M50 80 V20 M70 80 V40" />
        </svg>`,
    4: `<svg viewBox="0 0 100 100" fill="none" stroke="#63b3ed" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round">
            <path d="M25 80 V45 M40 80 V25 M60 80 V25 M75 80 V45" />
        </svg>`,
    5: `<svg viewBox="0 0 100 100" fill="none" stroke="#63b3ed" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 80 V30 M35 80 V20 M50 80 V10 M65 80 V20 M80 80 V30" />
        </svg>`
};

// Base dimensions for scaling
const BASE_CANVAS_WIDTH = 600;
const BASE_CANVAS_HEIGHT = 337.5; // 16:9 aspect ratio of 600

// Ball properties (defined as ratios of base dimensions)
const ballRadiusRatio = 10 / BASE_CANVAS_WIDTH;
const dxRatio = 2 / BASE_CANVAS_WIDTH;
const dyRatio = -2 / BASE_CANVAS_HEIGHT;

// Paddle properties (defined as ratios of base dimensions)
const paddleHeightRatio = 10 / BASE_CANVAS_HEIGHT;
const paddleWidthRatio = 75 / BASE_CANVAS_WIDTH;

// Brick properties (defined as ratios of base dimensions)
const brickRowCount = 5;
const brickColumnCount = 8;
const brickWidthRatio = 75 / BASE_CANVAS_WIDTH;
const brickHeightRatio = 20 / BASE_CANVAS_HEIGHT;
const brickPaddingRatio = 10 / BASE_CANVAS_WIDTH;
const brickOffsetTopRatio = 10 / BASE_CANVAS_HEIGHT;
const brickOffsetLeftRatio = 10 / BASE_CANVAS_WIDTH;

// Falling Numbers properties (defined as ratios of base dimensions)
const FALLING_NUMBER_SPEED_RATIO = 1.5 / BASE_CANVAS_HEIGHT;
const FALLING_NUMBER_RADIUS_RATIO = 15 / BASE_CANVAS_WIDTH;
const NUM_FALLING_ITEMS_PER_BRICK = 3;

const BreakoutGame = () => {
    const canvasRef = useRef(null);
    const [gameRunning, setGameRunning] = useState(false);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [currentISLTargetNumber, setCurrentISLTargetNumber] = useState(0);
    const [message, setMessage] = useState(null); // { text: "...", type: "win" | "gameOver" }
    const [islEventSign, setIslEventSign] = useState(null); // SVG for events like hit, win, game over

    // Game state that needs to be mutable within the game loop but also accessible/updatable by React
    // Using useRef to avoid re-renders on every game state change,
    // and ensuring the `useEffect` cleanup works correctly.
    const gameState = useRef({
        x: 0, y: 0, dx: 0, dy: 0,
        paddleX: 0,
        ballRadius: 0, paddleHeight: 0, paddleWidth: 0,
        brickWidth: 0, brickHeight: 0, brickPadding: 0, brickOffsetTop: 0, brickOffsetLeft: 0,
        fallingNumberSpeed: 0, fallingNumberRadius: 0,
        bricks: [],
        fallingNumbers: [],
        rightPressed: false,
        leftPressed: false,
        animationFrameId: null,
    });

    const showISLSign = useCallback((type) => {
        setIslEventSign(ISL_SVG_EVENTS[type]);
        setTimeout(() => {
            setIslEventSign(null);
        }, 1000); // Display for 1 second (700ms display + 300ms fade out)
    }, []);

    const setNewISLTargetNumber = useCallback(() => {
        const newTarget = Math.floor(Math.random() * 5) + 1; // Random number between 1 and 5
        setCurrentISLTargetNumber(newTarget);
    }, []);

    const showMessage = useCallback((text, type) => {
        setMessage({ text, type });
    }, []);

    const initGame = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // Set canvas dimensions dynamically based on container
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        // Calculate actual dimensions based on current canvas size
        gameState.current.ballRadius = ballRadiusRatio * canvas.width;
        gameState.current.paddleHeight = paddleHeightRatio * canvas.height;
        gameState.current.paddleWidth = paddleWidthRatio * canvas.width;
        gameState.current.dx = dxRatio * canvas.width;
        gameState.current.dy = dyRatio * canvas.height;
        gameState.current.fallingNumberSpeed = FALLING_NUMBER_SPEED_RATIO * canvas.height;
        gameState.current.fallingNumberRadius = FALLING_NUMBER_RADIUS_RATIO * canvas.width;

        gameState.current.brickWidth = brickWidthRatio * canvas.width;
        gameState.current.brickHeight = brickHeightRatio * canvas.height;
        gameState.current.brickPadding = brickPaddingRatio * canvas.width;
        gameState.current.brickOffsetTop = brickOffsetTopRatio * canvas.height;
        gameState.current.brickOffsetLeft = brickOffsetLeftRatio * canvas.width;

        // Initialize ball position to center of paddle
        gameState.current.x = canvas.width / 2;
        gameState.current.y = canvas.height - gameState.current.paddleHeight - gameState.current.ballRadius;
        gameState.current.paddleX = (canvas.width - gameState.current.paddleWidth) / 2;

        // Initialize bricks array
        const newBricks = [];
        for (let c = 0; c < brickColumnCount; c++) {
            newBricks[c] = [];
            for (let r = 0; r < brickRowCount; r++) {
                newBricks[c][r] = { x: 0, y: 0, status: 1 };
            }
        }
        gameState.current.bricks = newBricks;

        // Clear falling numbers
        gameState.current.fallingNumbers = [];

        setScore(0);
        setLives(3);
        setMessage(null);
        setIslEventSign(null);
        setGameRunning(false);

        setNewISLTargetNumber();
    }, [setNewISLTargetNumber]);

    // --- Drawing Functions ---
    const drawBall = useCallback((ctx) => {
        const { x, y, ballRadius } = gameState.current;
        ctx.beginPath();
        ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = "#63b3ed";
        ctx.fill();
        ctx.closePath();
    }, []);

    const drawPaddle = useCallback((ctx) => {
        const canvas = canvasRef.current;
        const { paddleX, paddleHeight, paddleWidth } = gameState.current;
        ctx.beginPath();
        ctx.roundRect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight, 5);
        ctx.fillStyle = "#a0aec0";
        ctx.fill();
        ctx.closePath();
    }, []);

    const drawBricks = useCallback((ctx) => {
        const { bricks, brickWidth, brickHeight, brickPadding, brickOffsetTop, brickOffsetLeft } = gameState.current;
        for (let c = 0; c < brickColumnCount; c++) {
            for (let r = 0; r < brickRowCount; r++) {
                if (bricks[c][r].status === 1) {
                    let brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                    let brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                    bricks[c][r].x = brickX;
                    bricks[c][r].y = brickY;
                    ctx.beginPath();
                    ctx.roundRect(brickX, brickY, brickWidth, brickHeight, 3);
                    ctx.fillStyle = (r % 2 === 0) ? "#f6ad55" : "#9f7aea";
                    ctx.fill();
                    ctx.closePath();
                }
            }
        }
    }, []);

    const drawFallingNumbers = useCallback((ctx) => {
        const { fallingNumbers, fallingNumberRadius } = gameState.current;
        fallingNumbers.forEach(num => {
            if (num.status === 1) {
                ctx.beginPath();
                ctx.arc(num.x, num.y, fallingNumberRadius, 0, Math.PI * 2);
                ctx.fillStyle = (num.value === currentISLTargetNumber) ? "#48bb78" : "#e0e0e0";
                ctx.fill();
                ctx.closePath();

                ctx.font = `${fallingNumberRadius * 1.2}px Inter`;
                ctx.fillStyle = (num.value === currentISLTargetNumber) ? "#e2e8f0" : "#333";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(num.value, num.x, num.y + 1);
            }
        });
    }, [currentISLTargetNumber]);

    // --- Collision Detection ---
    const collisionDetection = useCallback(() => {
        const { x, y, ballRadius, bricks, brickWidth, brickHeight } = gameState.current;
        for (let c = 0; c < brickColumnCount; c++) {
            for (let r = 0; r < brickRowCount; r++) {
                let b = bricks[c][r];
                if (b.status === 1) {
                    if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                        gameState.current.dy = -gameState.current.dy;
                        b.status = 0;
                        setScore(prevScore => prevScore + 10);
                        showISLSign('hit');

                        let numbersToFall = [];
                        numbersToFall.push(currentISLTargetNumber);

                        while (numbersToFall.length < NUM_FALLING_ITEMS_PER_BRICK) {
                            let randomNum = Math.floor(Math.random() * 5) + 1;
                            if (randomNum !== currentISLTargetNumber && !numbersToFall.includes(randomNum)) {
                                numbersToFall.push(randomNum);
                            }
                        }

                        for (let i = numbersToFall.length - 1; i > 0; i--) {
                            const j = Math.floor(Math.random() * (i + 1));
                            [numbersToFall[i], numbersToFall[j]] = [numbersToFall[j], numbersToFall[i]];
                        }

                        const spacing = gameState.current.fallingNumberRadius * 2.5;
                        const totalWidth = (NUM_FALLING_ITEMS_PER_BRICK - 1) * spacing;
                        const startX = b.x + brickWidth / 2 - totalWidth / 2;

                        for (let i = 0; i < numbersToFall.length; i++) {
                            const spawnX = startX + i * spacing;
                            const spawnY = b.y + brickHeight / 2;

                            gameState.current.fallingNumbers.push({
                                x: spawnX,
                                y: spawnY,
                                value: numbersToFall[i],
                                dy: gameState.current.fallingNumberSpeed,
                                status: 1
                            });
                        }
                    }
                }
            }
        }
    }, [currentISLTargetNumber, showISLSign]);

    const allBricksBroken = useCallback(() => {
        const { bricks } = gameState.current;
        for (let c = 0; c < brickColumnCount; c++) {
            for (let r = 0; r < brickRowCount; r++) {
                if (bricks[c][r].status === 1) {
                    return false;
                }
            }
        }
        return true;
    }, []);

    const catchFallingNumbers = useCallback(() => {
        const canvas = canvasRef.current;
        const { fallingNumbers, paddleX, paddleWidth, paddleHeight, fallingNumberRadius } = gameState.current;
        for (let i = 0; i < fallingNumbers.length; i++) {
            const num = fallingNumbers[i];
            if (num.status === 1) {
                if (num.x > paddleX && num.x < paddleX + paddleWidth &&
                    num.y + fallingNumberRadius > canvas.height - paddleHeight &&
                    num.y - fallingNumberRadius < canvas.height) {

                    num.status = 0; // Mark as caught

                    if (num.value === currentISLTargetNumber) {
                        setScore(prevScore => prevScore + 100);
                        setNewISLTargetNumber();
                    }
                }
            }
        }
        // Filter out caught or fallen numbers
        gameState.current.fallingNumbers = fallingNumbers.filter(num => num.status === 1 && num.y < canvas.height + fallingNumberRadius);
    }, [currentISLTargetNumber, setNewISLTargetNumber]);

    // Main game update loop
    const updateGame = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !gameRunning) {
            gameState.current.animationFrameId = null;
            return;
        }
        const ctx = canvas.getContext('2d');

        // Check win condition here (after potential brick breaks)
        if (allBricksBroken()) {
            showISLSign('win');
            showMessage("YOU WIN!", "win");
            setGameRunning(false);
            return;
        }

        // Ball movement
        gameState.current.x += gameState.current.dx;
        gameState.current.y += gameState.current.dy;

        // Ball-wall collision detection
        if (gameState.current.x + gameState.current.ballRadius > canvas.width || gameState.current.x - gameState.current.ballRadius < 0) {
            gameState.current.dx = -gameState.current.dx;
        }
        if (gameState.current.y - gameState.current.ballRadius < 0) {
            gameState.current.dy = -gameState.current.dy;
        } else if (gameState.current.y + gameState.current.ballRadius > canvas.height - gameState.current.paddleHeight) {
            // Ball hits bottom (misses paddle)
            if (gameState.current.x > gameState.current.paddleX && gameState.current.x < gameState.current.paddleX + gameState.current.paddleWidth) {
                // Ball hits paddle
                gameState.current.dy = -gameState.current.dy;
                let hitPoint = gameState.current.x - (gameState.current.paddleX + gameState.current.paddleWidth / 2);
                gameState.current.dx = hitPoint * (0.1 * (canvas.width / BASE_CANVAS_WIDTH));
            } else {
                // Ball falls off screen
                setLives(prevLives => {
                    const newLives = prevLives - 1;
                    if (newLives === 0) {
                        showISLSign('gameOver');
                        showMessage("GAME OVER", "gameOver");
                        setGameRunning(false);
                        return 0;
                    } else {
                        // Reset ball and paddle for next life
                        gameState.current.x = canvas.width / 2;
                        gameState.current.y = canvas.height - gameState.current.paddleHeight - gameState.current.ballRadius;
                        gameState.current.dx = dxRatio * canvas.width;
                        gameState.current.dy = dyRatio * canvas.height;
                        gameState.current.paddleX = (canvas.width - gameState.current.paddleWidth) / 2;
                        return newLives;
                    }
                });
            }
        }

        // Paddle movement (keyboard)
        const paddleSpeed = 7 * (canvas.width / BASE_CANVAS_WIDTH);
        if (gameState.current.rightPressed && gameState.current.paddleX < canvas.width - gameState.current.paddleWidth) {
            gameState.current.paddleX += paddleSpeed;
        } else if (gameState.current.leftPressed && gameState.current.paddleX > 0) {
            gameState.current.paddleX -= paddleSpeed;
        }

        // Update falling numbers positions
        gameState.current.fallingNumbers.forEach(num => {
            if (num.status === 1) {
                num.y += num.dy;
            }
        });

        collisionDetection();
        catchFallingNumbers();

        // Drawing
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBricks(ctx);
        drawBall(ctx);
        drawPaddle(ctx);
        drawFallingNumbers(ctx);

        gameState.current.animationFrameId = requestAnimationFrame(updateGame);
    }, [gameRunning, showISLSign, showMessage, allBricksBroken, collisionDetection, catchFallingNumbers, drawBall, drawPaddle, drawBricks, drawFallingNumbers]);


    // Effect for game loop
    useEffect(() => {
        if (gameRunning) {
            gameState.current.animationFrameId = requestAnimationFrame(updateGame);
        } else {
            if (gameState.current.animationFrameId) {
                cancelAnimationFrame(gameState.current.animationFrameId);
                gameState.current.animationFrameId = null;
            }
        }

        // Cleanup function for when component unmounts or gameRunning changes
        return () => {
            if (gameState.current.animationFrameId) {
                cancelAnimationFrame(gameState.current.animationFrameId);
            }
        };
    }, [gameRunning, updateGame]);

    // Effect for initial setup and resize handler
    useEffect(() => {
        initGame(); // Initial setup

        const canvas = canvasRef.current;
        if (!canvas) return;

        const resizeHandler = () => {
            // Store old canvas dimensions before recalculating
            const oldCanvasWidth = canvas.width;
            const oldCanvasHeight = canvas.height;

            // Update canvas dimensions
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;

            // Calculate scaling ratios
            const scaleX = canvas.width / oldCanvasWidth;
            const scaleY = canvas.height / oldCanvasHeight;

            // Scale current game element positions and speeds
            gameState.current.x *= scaleX;
            gameState.current.y *= scaleY;
            gameState.current.dx *= scaleX;
            gameState.current.dy *= scaleY;
            gameState.current.paddleX *= scaleX;

            // Re-calculate other dynamic dimensions
            gameState.current.ballRadius = ballRadiusRatio * canvas.width;
            gameState.current.paddleHeight = paddleHeightRatio * canvas.height;
            gameState.current.paddleWidth = paddleWidthRatio * canvas.width;
            gameState.current.fallingNumberSpeed = FALLING_NUMBER_SPEED_RATIO * canvas.height;
            gameState.current.fallingNumberRadius = FALLING_NUMBER_RADIUS_RATIO * canvas.width;
            gameState.current.brickWidth = brickWidthRatio * canvas.width;
            gameState.current.brickHeight = brickHeightRatio * canvas.height;
            gameState.current.brickPadding = brickPaddingRatio * canvas.width;
            gameState.current.brickOffsetTop = brickOffsetTopRatio * canvas.height;
            gameState.current.brickOffsetLeft = brickOffsetLeftRatio * canvas.width;

            // Ensure falling numbers positions are scaled
            gameState.current.fallingNumbers.forEach(num => {
                num.x *= scaleX;
                num.y *= scaleY;
                num.dy = gameState.current.fallingNumberSpeed; // Re-apply scaled speed
            });

            // Re-draw immediately after resize
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawBricks(ctx);
            drawBall(ctx);
            drawPaddle(ctx);
            drawFallingNumbers(ctx);
        };

        window.addEventListener('resize', resizeHandler);

        // Cleanup
        return () => {
            window.removeEventListener('resize', resizeHandler);
        };
    }, [initGame, drawBall, drawPaddle, drawBricks, drawFallingNumbers]);


    // Effect for input handlers
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const keyDownHandler = (e) => {
            if (e.key === "Right" || e.key === "ArrowRight") {
                gameState.current.rightPressed = true;
            } else if (e.key === "Left" || e.key === "ArrowLeft") {
                gameState.current.leftPressed = true;
            }
        };

        const keyUpHandler = (e) => {
            if (e.key === "Right" || e.key === "ArrowRight") {
                gameState.current.rightPressed = false;
            } else if (e.key === "Left" || e.key === "ArrowLeft") {
                gameState.current.leftPressed = false;
            }
        };

        const mouseMoveHandler = (e) => {
            if (!gameRunning) return;
            const relativeX = e.clientX - canvas.getBoundingClientRect().left;
            if (relativeX > 0 && relativeX < canvas.width) {
                let newPaddleX = relativeX - gameState.current.paddleWidth / 2;
                newPaddleX = Math.max(0, Math.min(newPaddleX, canvas.width - gameState.current.paddleWidth));
                gameState.current.paddleX = newPaddleX;
            }
        };

        const touchMoveHandler = (e) => {
            if (!gameRunning) return;
            e.preventDefault();
            const touch = e.touches[0];
            const relativeX = touch.clientX - canvas.getBoundingClientRect().left;
            if (relativeX > 0 && relativeX < canvas.width) {
                let newPaddleX = relativeX - gameState.current.paddleWidth / 2;
                newPaddleX = Math.max(0, Math.min(newPaddleX, canvas.width - gameState.current.paddleWidth));
                gameState.current.paddleX = newPaddleX;
            }
        };

        document.addEventListener("keydown", keyDownHandler);
        document.addEventListener("keyup", keyUpHandler);
        canvas.addEventListener("mousemove", mouseMoveHandler);
        canvas.addEventListener("touchmove", touchMoveHandler);

        return () => {
            document.removeEventListener("keydown", keyDownHandler);
            document.removeEventListener("keyup", keyUpHandler);
            canvas.removeEventListener("mousemove", mouseMoveHandler);
            canvas.removeEventListener("touchmove", touchMoveHandler);
        };
    }, [gameRunning]);

    const handleStartGame = () => {
        if (!gameRunning) {
            // If the game was over, reset completely
            if (lives === 0 || allBricksBroken()) {
                initGame();
            }
            setGameRunning(true);
        }
    };

    const handleResetGame = () => {
        setGameRunning(false);
        initGame();
    };

    const handleMessageBoxButtonClick = () => {
        setMessage(null);
        handleResetGame(); // Reset game state when message box button is clicked
    };

    return (
        <div style={styles.body}>
            <div className="game-container" style={styles.gameContainer}>
                <h1 style={styles.h1}>Breakout Game</h1>
                <canvas ref={canvasRef} style={styles.canvas}></canvas>
                <div className="game-info-row" style={styles.gameInfoRow}>
                    <span className="game-info-item" style={styles.gameInfoItem}>Score: {score}</span>
                    <span className="game-info-item" style={styles.gameInfoItem}>Lives: {lives}</span>
                </div>
                <div className="isl-target-display" style={styles.islTargetDisplay}>
                    <div className="label" style={styles.islTargetDisplayLabel}>Target ISL Number:</div>
                    <div className="isl-sign" style={styles.islTargetDisplayISLSign} dangerouslySetInnerHTML={{ __html: ISL_SVG_NUMBERS[currentISLTargetNumber] }}></div>
                </div>
                <div className="controls" style={styles.controls}>
                    <button style={styles.button} onClick={handleStartGame}>Start Game</button>
                    <button style={styles.button} onClick={handleResetGame}>Reset Game</button>
                </div>

                {islEventSign && (
                    <div className="isl-sign-container" style={{ ...styles.islSignContainer, opacity: 1, display: 'flex' }} dangerouslySetInnerHTML={{ __html: islEventSign }}></div>
                )}
            </div>

            {message && (
                <div className="message-box" style={styles.messageBox}>
                    <p id="messageText" style={styles.messageBoxText}>{message.text}</p>
                    <button style={styles.messageBoxButton} onClick={handleMessageBoxButtonClick}>Play Again</button>
                </div>
            )}
        </div>
    );
};

// Inline styles (for demonstration, consider using a CSS module or styled-components in a real app)
const styles = {
    body: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#1a202c',
        fontFamily: "'Inter', sans-serif",
        color: '#e2e8f0',
    },
    gameContainer: {
        backgroundColor: '#2d3748',
        borderRadius: '15px',
        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.5)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: '95vw',
        width: '600px',
        boxSizing: 'border-box',
        position: 'relative',
        minHeight: '70vh',
        justifyContent: 'space-between',
    },
    h1: {
        color: '#63b3ed',
        marginBottom: '20px',
        fontSize: '2.5em',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
        textAlign: 'center',
        marginTop: '0',
    },
    canvas: {
        backgroundColor: '#000',
        border: '2px solid #4a5568',
        borderRadius: '8px',
        display: 'block',
        touchAction: 'none',
        width: '100%',
        aspectRatio: '16 / 9',
        maxHeight: '60vh',
        marginBottom: '15px',
    },
    gameInfoRow: {
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: '15px',
        fontSize: '1.2em',
        color: '#a0aec0',
        flexWrap: 'wrap',
    },
    gameInfoItem: {
        flex: 1,
        minWidth: '120px',
        textAlign: 'center',
        padding: '5px',
    },
    islTargetDisplay: {
        backgroundColor: '#4a5568',
        borderRadius: '8px',
        padding: '10px',
        marginTop: '10px',
        textAlign: 'center',
        color: '#e2e8f0',
        fontSize: '1.1em',
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    islTargetDisplayLabel: {
        fontWeight: 'bold',
        marginBottom: '5px',
        color: '#9f7aea',
    },
    islTargetDisplayISLSign: {
        width: '60px',
        height: '60px',
        backgroundColor: '#2d3748',
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: 'inset 0 0 5px rgba(0,0,0,0.3)',
    },
    controls: {
        marginTop: '20px',
        display: 'flex',
        gap: '15px',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    button: {
        background: 'linear-gradient(145deg, #4a5568, #2d3748)',
        color: '#e2e8f0',
        border: 'none',
        padding: '12px 25px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '1.1em',
        fontWeight: 'bold',
        boxShadow: '3px 3px 6px rgba(0, 0, 0, 0.4), -3px -3px 6px rgba(255, 255, 255, 0.05)',
        transition: 'all 0.2s ease-in-out',
        outline: 'none',
    },
    messageBox: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        border: '2px solid #63b3ed',
        borderRadius: '10px',
        padding: '30px',
        textAlign: 'center',
        fontSize: '1.8em',
        fontWeight: 'bold',
        color: '#e2e8f0',
        zIndex: 100,
        boxShadow: '0 0 20px rgba(99, 179, 237, 0.7)',
    },
    messageBoxText: {
        margin: '0 0 20px 0', // Remove default paragraph margin, add bottom margin
    },
    messageBoxButton: {
        marginTop: '20px',
        fontSize: '1.2em',
        padding: '10px 20px',
        background: 'linear-gradient(145deg, #5a67d8, #434190)', // Different gradient for message box button
        color: '#e2e8f0',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
        boxShadow: '3px 3px 6px rgba(0, 0, 0, 0.4), -3px -3px 6px rgba(255, 255, 255, 0.05)',
        transition: 'all 0.2s ease-in-out',
        outline: 'none',
    },
    islSignContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 101,
        opacity: 0,
        transition: 'opacity 0.3s ease-in-out',
        pointerEvents: 'none',
        display: 'none', // Controlled by JS
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: '10px',
        padding: '15px',
        minWidth: '80px',
        minHeight: '80px',
    },
};

export default BreakoutGame;