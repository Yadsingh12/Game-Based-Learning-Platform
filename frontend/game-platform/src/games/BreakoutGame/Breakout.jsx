import React, { useState, useEffect, useRef } from 'react';

const BreakoutGame = () => {
  const BOARD_WIDTH = 500;
  const BOARD_HEIGHT = 500;
  const PADDLE_HEIGHT = 10;
  const PADDLE_WIDTH = 75;
  const BALL_RADIUS = 5;
  const BRICK_ROWS = 5;
  const BRICK_COLS = 8;
  const BRICK_WIDTH = 50;
  const BRICK_HEIGHT = 20;
  const NUMBER_SIZE = 30;
  const NUMBER_FALL_SPEED = 2;

  const [paddleX, setPaddleX] = useState(BOARD_WIDTH / 2 - PADDLE_WIDTH / 2);
  const [ballX, setBallX] = useState(BOARD_WIDTH / 2);
  const [ballY, setBallY] = useState(BOARD_HEIGHT / 2);
  const [ballDx, setBallDx] = useState(2);
  const [ballDy, setBallDy] = useState(-2);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState('playing');
  const [bricks, setBricks] = useState([]);
  const [fallingNumbers, setFallingNumbers] = useState([]);
  const gameLoopRef = useRef();

  useEffect(() => {
    resetBricks();
  }, []);

  useEffect(() => {
    if (status !== 'playing') return;

    const loop = () => {
      updateGame();
      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(gameLoopRef.current);
  }, [status, paddleX, bricks, ballDx, ballDy, fallingNumbers]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        setPaddleX(prev => Math.max(0, prev - 10));
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        setPaddleX(prev => Math.min(BOARD_WIDTH - PADDLE_WIDTH, prev + 10));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const newX = e.clientX - rect.left - PADDLE_WIDTH / 2;
    setPaddleX(Math.max(0, Math.min(BOARD_WIDTH - PADDLE_WIDTH, newX)));
  };

  const resetBricks = () => {
    const newBricks = [];
    for (let c = 0; c < BRICK_COLS; c++) {
      for (let r = 0; r < BRICK_ROWS; r++) {
        newBricks.push({
          x: c * (BRICK_WIDTH + 10) + 20,
          y: r * (BRICK_HEIGHT + 10) + 30,
          status: 1,
          id: r * BRICK_COLS + c,
        });
      }
    }
    setBricks(newBricks);
  };

  const createNewFallingNumbers = () => {
    const correctValue = Math.floor(Math.random() * 9) + 1;
    const positions = [
      { x: BOARD_WIDTH / 4, y: 0 },
      { x: BOARD_WIDTH / 2, y: 0 },
      { x: (BOARD_WIDTH / 4) * 3, y: 0 },
    ];
    const correctIndex = Math.floor(Math.random() * 3);
    return positions.map((pos, i) => ({
      ...pos,
      value: i === correctIndex ? correctValue : Math.floor(Math.random() * 9) + 1,
      isCorrect: i === correctIndex,
      id: Date.now() + i,
      dy: NUMBER_FALL_SPEED,
    }));
  };

  const updateGame = () => {
    let nextBallX = ballX + ballDx;
    let nextBallY = ballY + ballDy;
    let nextBallDx = ballDx;
    let nextBallDy = ballDy;
    let newNumbersToDrop = [];
    let scoreChange = 0;

    if (nextBallX > BOARD_WIDTH - BALL_RADIUS || nextBallX < BALL_RADIUS) nextBallDx = -nextBallDx;
    if (nextBallY < BALL_RADIUS) nextBallDy = -nextBallDy;

    if (
      nextBallY > BOARD_HEIGHT - BALL_RADIUS - PADDLE_HEIGHT &&
      nextBallY < BOARD_HEIGHT - BALL_RADIUS &&
      nextBallX > paddleX &&
      nextBallX < paddleX + PADDLE_WIDTH
    ) {
      nextBallDy = -nextBallDy;
    }

    if (nextBallY > BOARD_HEIGHT - BALL_RADIUS) {
      setStatus('game over');
      return;
    }

    const newBricks = bricks.map(brick => {
      if (brick.status === 1) {
        const isColliding =
          nextBallX + BALL_RADIUS > brick.x &&
          nextBallX - BALL_RADIUS < brick.x + BRICK_WIDTH &&
          nextBallY + BALL_RADIUS > brick.y &&
          nextBallY - BALL_RADIUS < brick.y + BRICK_HEIGHT;
        if (isColliding) {
          nextBallDy = -nextBallDy;
          scoreChange = 10;
          newNumbersToDrop = createNewFallingNumbers();
          return { ...brick, status: 0 };
        }
      }
      return brick;
    });

    setBricks(newBricks);
    setScore(prev => prev + scoreChange);
    setBallX(nextBallX);
    setBallY(nextBallY);
    setBallDx(nextBallDx);
    setBallDy(nextBallDy);

    setFallingNumbers(prev => {
      const combined = [...prev, ...newNumbersToDrop];
      return combined
        .map(num => ({ ...num, y: num.y + num.dy }))
        .filter(num => {
          const isColliding =
            num.y + NUMBER_SIZE > BOARD_HEIGHT - PADDLE_HEIGHT &&
            num.y < BOARD_HEIGHT &&
            num.x > paddleX &&
            num.x < paddleX + PADDLE_WIDTH;

          if (isColliding) {
            if (num.isCorrect) setScore(prev => prev + 50);
            return false;
          }

          return num.y < BOARD_HEIGHT;
        });
    });

    if (newBricks.every(brick => brick.status === 0)) setStatus('win');
  };

  const resetGame = () => {
    setPaddleX(BOARD_WIDTH / 2 - PADDLE_WIDTH / 2);
    setBallX(BOARD_WIDTH / 2);
    setBallY(BOARD_HEIGHT / 2);
    setBallDx(2);
    setBallDy(-2);
    setScore(0);
    setStatus('playing');
    resetBricks();
    setFallingNumbers([]);
  };

  const renderMessage = () => {
    if (status === 'game over') return <div className="message game-over">Game Over!</div>;
    if (status === 'win') return <div className="message win">You Win!</div>;
    return null;
  };

  return (
    <div className="game-container">
      <style>
        {`
          .game-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background-color: #111827;
            color: white;
            font-family: 'Inter', sans-serif;
            padding: 1rem;
          }
          .game-title {
            font-size: 2.25rem;
            font-weight: 800;
            margin-bottom: 1rem;
          }
          .game-info {
            display: flex;
            justify-content: space-between;
            width: 100%;
            max-width: 32rem;
            margin-bottom: 1rem;
          }
          .score-display {
            font-size: 1.25rem;
            font-weight: 600;
          }
          .reset-button {
            background-color: #2563eb;
            color: white;
            font-weight: bold;
            padding: 0.5rem 1rem;
            border-radius: 9999px;
            transition: background-color 0.3s;
          }
          .reset-button:hover {
            background-color: #1d4ed8;
          }
          .board {
            position: relative;
            border: 4px solid #374151;
            border-radius: 0.75rem;
            background-color: #1f2937;
          }
          .ball {
            position: absolute;
            border-radius: 50%;
            background-color: #facc15;
          }
          .paddle {
            position: absolute;
            border-radius: 0.5rem;
            background-color: #6366f1;
            bottom: 0;
          }
          .brick {
            position: absolute;
            border-radius: 0.125rem;
            background-color: #6b7280;
          }
          .falling-number {
            position: absolute;
            width: ${NUMBER_SIZE}px;
            height: ${NUMBER_SIZE}px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            font-size: 1rem;
            font-weight: bold;
            color: white;
            background-color: #ef4444;
          }
          .falling-number.correct {
            background-color: #22c55e;
          }
          .message {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 1.875rem;
            font-weight: bold;
            padding: 1rem;
            border-radius: 0.5rem;
          }
          .game-over {
            background-color: #dc2626;
          }
          .win {
            background-color: #16a34a;
          }
        `}
      </style>

      <h1 className="game-title">Breakout</h1>
      <div className="game-info" style={{ maxWidth: BOARD_WIDTH }}>
        <div className="score-display">Score: {score}</div>
        <button onClick={resetGame} className="reset-button">
          {status === 'playing' ? 'Reset' : 'Play Again'}
        </button>
      </div>

      <div
        className="board"
        style={{ width: BOARD_WIDTH, height: BOARD_HEIGHT }}
        onMouseMove={handleMouseMove}
      >
        <div
          className="ball"
          style={{
            left: ballX - BALL_RADIUS,
            top: ballY - BALL_RADIUS,
            width: BALL_RADIUS * 2,
            height: BALL_RADIUS * 2,
          }}
        ></div>

        <div
          className="paddle"
          style={{
            left: paddleX,
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT,
          }}
        ></div>

        {bricks.map(brick =>
          brick.status === 1 ? (
            <div
              key={brick.id}
              className="brick"
              style={{
                left: brick.x,
                top: brick.y,
                width: BRICK_WIDTH,
                height: BRICK_HEIGHT,
              }}
            ></div>
          ) : null
        )}

        {fallingNumbers.map(num => (
          <div
            key={num.id}
            className={`falling-number ${num.isCorrect ? 'correct' : ''}`}
            style={{
              left: num.x - NUMBER_SIZE / 2,
              top: num.y,
            }}
          >
            {num.value}
          </div>
        ))}

        {renderMessage()}
      </div>
    </div>
  );
};

export default BreakoutGame;
