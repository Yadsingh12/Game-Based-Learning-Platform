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
  const [status, setStatus] = useState('initializing');
  const [bricks, setBricks] = useState([]);
  const [fallingNumbers, setFallingNumbers] = useState([]);
  const [targetNumber, setTargetNumber] = useState(Math.floor(Math.random() * 10));
  const [showSuccess, setShowSuccess] = useState(false);

  const gameLoopRef = useRef();

  // Start/Loop the ISL video for the target number
  const startLoopingISLVideo = (number) => {
    const videoEl = document.getElementById("islVideo");
    if (!videoEl) return;
    videoEl.style.display = "block";
    videoEl.src = `/videos/Numbers/${number}.mp4`;
    videoEl.play();
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
    setBallX(BOARD_WIDTH / 2);
    setBallY(BOARD_HEIGHT / 2);
    setBallDx(2);
    setBallDy(-2);
    setPaddleX(BOARD_WIDTH / 2 - PADDLE_WIDTH / 2);
  };

  const initializeNewRound = (initial = false) => {
    let newTarget;
    do {
      newTarget = Math.floor(Math.random() * 10);
    } while (!initial && newTarget === targetNumber);

    setTargetNumber(newTarget);
    setFallingNumbers([]);
    setStatus('playing');
    resetBricks();
    startLoopingISLVideo(newTarget);
  };

  useEffect(() => {
    initializeNewRound(true);
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
      if (status !== 'playing') return;
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        setPaddleX(prev => Math.max(0, prev - 15));
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        setPaddleX(prev => Math.min(BOARD_WIDTH - PADDLE_WIDTH, prev + 15));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status]);

  const handleMouseMove = (e) => {
    if (status !== 'playing') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const newX = e.clientX - rect.left - PADDLE_WIDTH / 2;
    setPaddleX(Math.max(0, Math.min(BOARD_WIDTH - PADDLE_WIDTH, newX)));
  };

  const createNewFallingNumbers = () => {
    const positions = [
      { x: BOARD_WIDTH / 4, y: 0 },
      { x: BOARD_WIDTH / 2, y: 0 },
      { x: (BOARD_WIDTH / 4) * 3, y: 0 },
    ];
    let numberOptions = [0,1,2,3,4,5,6,7,8,9].filter(n => n !== targetNumber);
    const shuffle = (a) => {
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
    };
    shuffle(numberOptions);
    const distractors = numberOptions.slice(0,2);
    const correctIndex = Math.floor(Math.random() * 3);

    return positions.map((pos,i) => {
      let value = (i === correctIndex) ? targetNumber : distractors.pop();
      return { ...pos, value, id: Date.now() + i, dy: NUMBER_FALL_SPEED };
    });
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

    setScore(prev => {
      const newScore = prev + scoreChange;
      const speedFactor = 1 + newScore / 500;
      const baseSpeed = 2;
      const newSpeedX = Math.sign(nextBallDx) * Math.min(8, baseSpeed * speedFactor);
      const newSpeedY = Math.sign(nextBallDy) * Math.min(8, baseSpeed * speedFactor);
      setBallDx(newSpeedX);
      setBallDy(newSpeedY);
      return newScore;
    });

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
            if (num.value === targetNumber) {
              setScore(prev => prev + 50);
              setShowSuccess(true);
              setTimeout(() => setShowSuccess(false), 1000);

              // Change target number & video
              let newTarget;
              do {
                newTarget = Math.floor(Math.random() * 10);
              } while (newTarget === targetNumber);

              setTargetNumber(newTarget);
              startLoopingISLVideo(newTarget);
              setFallingNumbers([]);
            } else {
              setScore(prev => Math.max(0, prev - 25));
            }
            return false;
          }
          return num.y < BOARD_HEIGHT;
        });
    });

    if (newBricks.every(brick => brick.status === 0)) {
      initializeNewRound();
    }
  };

  const resetGame = () => {
    setScore(0);
    initializeNewRound(true);
  };

  const renderMessage = () => {
    if (status === 'game over') return <div className="message game-over">Game Over!</div>;
    return null;
  };

  return (
    <div className="main-app-container">
      <style>{`
        .main-app-container { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; background-color:#111827; color:white; font-family:'Inter', sans-serif; padding:1rem;}
        .game-layout-wrapper { display:flex; gap:20px; align-items:flex-start; flex-wrap:nowrap; justify-content:center; }
        .video-sidebar { flex:0 0 300px; display:flex; flex-direction:column; align-items:center; justify-content:flex-start; }
        .game-container { flex:0 0 ${BOARD_WIDTH}px; display:flex; flex-direction:column; align-items:center; }
        #islVideo { width:100%; height:auto; border-radius:0.75rem; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1),0 4px 6px -2px rgba(0,0,0,0.05); background-color:#1f2937; }
        .game-title { font-size:2.25rem; font-weight:800; margin-bottom:1rem; }
        .target-display { margin-bottom:0.5rem; font-size:1.25rem; font-weight:500; color:#38bdf8; }
        .game-info { display:flex; justify-content:space-between; width:100%; max-width:${BOARD_WIDTH}px; margin-bottom:1rem; }
        .score-display { font-size:1.25rem; font-weight:600; }
        .reset-button { background-color:#2563eb; color:white; font-weight:bold; padding:0.5rem 1rem; border-radius:9999px; transition:background-color 0.3s; }
        .reset-button:hover { background-color:#1d4ed8; }
        .board { position:relative; border:4px solid #374151; border-radius:0.75rem; background-color:#1f2937; }
        .ball { position:absolute; border-radius:50%; background-color:#facc15; }
        .paddle { position:absolute; border-radius:0.5rem; background-color:#6366f1; bottom:0; }
        .brick { position:absolute; border-radius:0.125rem; background-color:#6b7280; }
        .falling-number { position:absolute; width:${NUMBER_SIZE}px; height:${NUMBER_SIZE}px; display:flex; align-items:center; justify-content:center; border-radius:50%; font-size:1rem; font-weight:bold; color:white; background-color:#ef4444; border:2px solid white; }
        .message { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); color:white; font-size:1.875rem; font-weight:bold; padding:1rem; border-radius:0.5rem; z-index:10; }
        .game-over { background-color:#dc2626; }
        .success-popup { position:absolute; bottom:20px; right:20px; background-color:#10b981; color:white; padding:8px 12px; border-radius:12px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1),0 2px 4px -2px rgba(0,0,0,0.06); animation:bounce 0.5s ease-in-out; z-index:10; }
        @keyframes bounce {0%,100%{transform:translateY(0);}50%{transform:translateY(-10px);}}
      `}</style>

      <h1 className="game-title">ISL Number Sign Challenge</h1>
      <div className="target-display">🤔 Which number does the sign represent? Catch it!</div>

      <div className="game-layout-wrapper">
        <div className="video-sidebar">
          <div className="video-title">Target Sign: Watch Carefully!</div>
          <video id="islVideo" autoPlay muted loop />
          <div className="game-info" style={{ maxWidth: BOARD_WIDTH, margin: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-around', alignItems: 'center' }}>
            <div className="score-display">Score: {score}</div>
            <button onClick={resetGame} className="reset-button">
              {status === 'playing' ? 'Restart' : 'Play Again'}
            </button>
          </div>
        </div>

        <div className="game-container">

          <div className="board" style={{ width: BOARD_WIDTH, height: BOARD_HEIGHT }} onMouseMove={handleMouseMove}>
            <div className="ball" style={{ left: ballX - BALL_RADIUS, top: ballY - BALL_RADIUS, width: BALL_RADIUS * 2, height: BALL_RADIUS * 2 }} />
            <div className="paddle" style={{ left: paddleX, width: PADDLE_WIDTH, height: PADDLE_HEIGHT }} />

            {bricks.map(brick => brick.status === 1 ? (
              <div key={brick.id} className="brick" style={{ left: brick.x, top: brick.y, width: BRICK_WIDTH, height: BRICK_HEIGHT }} />
            ) : null)}

            {fallingNumbers.map(num => (
              <div key={num.id} className="falling-number" style={{ left: num.x - NUMBER_SIZE / 2, top: num.y }}>
                {num.value}
              </div>
            ))}

            {renderMessage()}

            {showSuccess && <div className="success-popup">Correct! Keep going!</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreakoutGame;
