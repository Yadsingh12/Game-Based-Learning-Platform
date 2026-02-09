// src/games/BreakoutGame.jsx
import React, { useState, useEffect, useRef } from 'react';

const BreakoutGame = ({ data, pack, category, assets, onExit }) => {
  const signs = data?.signs || [];
  
  const BOARD_WIDTH = 500;
  const BOARD_HEIGHT = 500;
  const PADDLE_HEIGHT = 10;
  const PADDLE_WIDTH = 75;
  const BALL_RADIUS = 5;
  const BRICK_ROWS = 5;
  const BRICK_COLS = 8;
  const BRICK_WIDTH = 50;
  const BRICK_HEIGHT = 20;
  const INITIAL_BALL_SPEED = 4;
  const SPEED_INCREASE_RATE = 0.15; // Speed increases by 15% every 10 seconds

  const [paddleX, setPaddleX] = useState(BOARD_WIDTH / 2 - PADDLE_WIDTH / 2);
  const [ballX, setBallX] = useState(BOARD_WIDTH / 2);
  const [ballY, setBallY] = useState(BOARD_HEIGHT - 100);
  const [ballAngle, setBallAngle] = useState(-Math.PI / 4);
  const [ballSpeed, setBallSpeed] = useState(INITIAL_BALL_SPEED);
  const [bricksDestroyed, setBricksDestroyed] = useState(0);
  const [status, setStatus] = useState('initializing');
  const [bricks, setBricks] = useState([]);
  const [targetSign, setTargetSign] = useState(null);
  const [gameSignIds, setGameSignIds] = useState([]);
  const [gameStartTime, setGameStartTime] = useState(null);

  const gameLoopRef = useRef();
  const lastTimeRef = useRef(Date.now());
  const boardRef = useRef(null);
  const TOTAL_BRICKS = BRICK_ROWS * BRICK_COLS;

  // Determine if this is a color pack or numeral pack
  const isColorPack = signs.length > 0 && signs[0].visual?.type === 'color';

  if (!signs || signs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">No data available</p>
      </div>
    );
  }

  const initializeGame = () => {
    const shuffled = [...signs].sort(() => Math.random() - 0.5);
    const selectedSigns = shuffled.slice(0, 3);
    const selectedIds = selectedSigns.map(s => s.id);
    
    setGameSignIds(selectedIds);
    setTargetSign(selectedSigns[0]);

    const newBricks = [];
    for (let c = 0; c < BRICK_COLS; c++) {
      for (let r = 0; r < BRICK_ROWS; r++) {
        const randomSignId = selectedIds[Math.floor(Math.random() * 3)];
        const randomSign = selectedSigns.find(s => s.id === randomSignId);
        newBricks.push({
          x: c * (BRICK_WIDTH + 10) + 20,
          y: r * (BRICK_HEIGHT + 10) + 30,
          status: 1,
          signId: randomSignId,
          sign: randomSign,
          id: r * BRICK_COLS + c,
        });
      }
    }
    setBricks(newBricks);
    setBallX(BOARD_WIDTH / 2);
    setBallY(BOARD_HEIGHT - 100);
    setBallAngle(-Math.PI / 4);
    setBallSpeed(INITIAL_BALL_SPEED);
    setPaddleX(BOARD_WIDTH / 2 - PADDLE_WIDTH / 2);
    setBricksDestroyed(0);
    setStatus('playing');
    setGameStartTime(Date.now());
    lastTimeRef.current = Date.now();
  };

  useEffect(() => {
    initializeGame();
  }, []);

  // Target rotation every 5 seconds
  useEffect(() => {
    if (status !== 'playing' || gameSignIds.length === 0) return;

    const interval = setInterval(() => {
      setTargetSign(prev => {
        const currentIndex = gameSignIds.indexOf(prev.id);
        const nextIndex = (currentIndex + 1) % gameSignIds.length;
        const nextSignId = gameSignIds[nextIndex];
        return signs.find(s => s.id === nextSignId);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [status, gameSignIds, signs]);

  // Speed increase over time
  useEffect(() => {
    if (status !== 'playing' || !gameStartTime) return;

    const interval = setInterval(() => {
      const elapsedSeconds = (Date.now() - gameStartTime) / 1000;
      const speedMultiplier = 1 + (Math.floor(elapsedSeconds / 10) * SPEED_INCREASE_RATE);
      setBallSpeed(INITIAL_BALL_SPEED * speedMultiplier);
    }, 1000);

    return () => clearInterval(interval);
  }, [status, gameStartTime]);

  useEffect(() => {
    if (status !== 'playing') return;

    const loop = () => {
      const now = Date.now();
      const deltaTime = Math.min((now - lastTimeRef.current) / 16.67, 2);
      lastTimeRef.current = now;
      
      updateGame(deltaTime);
      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [status, paddleX, bricks, ballX, ballY, ballAngle, ballSpeed, targetSign]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (status !== 'playing') return;
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        setPaddleX(prev => Math.max(0, prev - 25));
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        setPaddleX(prev => Math.min(BOARD_WIDTH - PADDLE_WIDTH, prev + 25));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status]);

  const handleMouseMove = (e) => {
    if (status !== 'playing' || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const relativeX = (e.clientX - rect.left) / rect.width;
    const newX = relativeX * BOARD_WIDTH - PADDLE_WIDTH / 2;
    setPaddleX(Math.max(0, Math.min(BOARD_WIDTH - PADDLE_WIDTH, newX)));
  };

  const handleTouchMove = (e) => {
    if (status !== 'playing' || !boardRef.current) return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = boardRef.current.getBoundingClientRect();
    const relativeX = (touch.clientX - rect.left) / rect.width;
    const newX = relativeX * BOARD_WIDTH - PADDLE_WIDTH / 2;
    setPaddleX(Math.max(0, Math.min(BOARD_WIDTH - PADDLE_WIDTH, newX)));
  };

  const updateGame = (deltaTime) => {
    const velocityX = Math.cos(ballAngle) * ballSpeed * deltaTime;
    const velocityY = Math.sin(ballAngle) * ballSpeed * deltaTime;
    
    let newX = ballX + velocityX;
    let newY = ballY + velocityY;
    let newAngle = ballAngle;
    const oldX = ballX;
    const oldY = ballY;

    // Left wall
    if (newX - BALL_RADIUS < 0) {
      newX = BALL_RADIUS;
      newAngle = Math.PI - newAngle;
    }
    
    // Right wall
    if (newX + BALL_RADIUS > BOARD_WIDTH) {
      newX = BOARD_WIDTH - BALL_RADIUS;
      newAngle = Math.PI - newAngle;
    }
    
    // Top wall
    if (newY - BALL_RADIUS < 0) {
      newY = BALL_RADIUS;
      newAngle = -newAngle;
    }

    // Paddle collision
    const paddleTop = BOARD_HEIGHT - PADDLE_HEIGHT;
    const paddleLeft = paddleX;
    const paddleRight = paddleX + PADDLE_WIDTH;
    
    if (newY + BALL_RADIUS >= paddleTop && 
        oldY + BALL_RADIUS <= paddleTop &&
        newX >= paddleLeft - BALL_RADIUS && 
        newX <= paddleRight + BALL_RADIUS &&
        Math.sin(ballAngle) > 0) {
      
      newY = paddleTop - BALL_RADIUS;
      
      const hitPosition = (newX - paddleLeft) / PADDLE_WIDTH;
      const bounceAngle = Math.PI * 0.25 + (1 - hitPosition) * Math.PI * 0.5;
      newAngle = -Math.max(Math.PI * 0.3, Math.min(Math.PI * 0.7, bounceAngle));
    }

    // Ball fell - game over
    if (newY - BALL_RADIUS > BOARD_HEIGHT) {
      setStatus('game over');
      const percentage = Math.round((bricksDestroyed / TOTAL_BRICKS) * 100);
      setTimeout(() => onExit(percentage), 2000);
      return;
    }

    // Brick collision
    let bricksBroken = 0;
    let brickHit = false;
    
    const newBricks = bricks.map(brick => {
      if (brick.status === 0 || brickHit) return brick;

      const brickLeft = brick.x;
      const brickRight = brick.x + BRICK_WIDTH;
      const brickTop = brick.y;
      const brickBottom = brick.y + BRICK_HEIGHT;

      if (newX + BALL_RADIUS >= brickLeft &&
          newX - BALL_RADIUS <= brickRight &&
          newY + BALL_RADIUS >= brickTop &&
          newY - BALL_RADIUS <= brickBottom) {
        
        brickHit = true;

        // Determine collision side using old position
        const fromLeft = oldX + BALL_RADIUS <= brickLeft;
        const fromRight = oldX - BALL_RADIUS >= brickRight;
        const fromTop = oldY + BALL_RADIUS <= brickTop;
        const fromBottom = oldY - BALL_RADIUS >= brickBottom;

        if (fromTop) {
          newY = brickTop - BALL_RADIUS;
          newAngle = -newAngle;
        } else if (fromBottom) {
          newY = brickBottom + BALL_RADIUS;
          newAngle = -newAngle;
        } else if (fromLeft) {
          newX = brickLeft - BALL_RADIUS;
          newAngle = Math.PI - newAngle;
        } else if (fromRight) {
          newX = brickRight + BALL_RADIUS;
          newAngle = Math.PI - newAngle;
        } else {
          newAngle = newAngle + Math.PI;
        }

        // Only destroy if matches target
        if (brick.signId === targetSign.id) {
          bricksBroken++;
          return { ...brick, status: 0 };
        }
      }

      return brick;
    });

    setBricks(newBricks);
    if (bricksBroken > 0) {
      setBricksDestroyed(prev => prev + bricksBroken);
    }

    // Normalize angle
    while (newAngle > Math.PI * 2) newAngle -= Math.PI * 2;
    while (newAngle < -Math.PI * 2) newAngle += Math.PI * 2;

    setBallX(newX);
    setBallY(newY);
    setBallAngle(newAngle);

    // Win condition
    if (newBricks.every(brick => brick.status === 0)) {
      setStatus('complete');
      setTimeout(() => onExit(100), 2000);
    }
  };

  const getBrickDisplay = (brick) => {
    if (isColorPack) {
      return {
        backgroundColor: brick.sign.visual.value,
        text: ''
      };
    } else {
      // For numerals, use a solid color and display the number
      const index = gameSignIds.indexOf(brick.signId);
      const colors = ['#ef4444', '#3b82f6', '#22c55e'];
      return {
        backgroundColor: colors[index] || '#6b7280',
        text: brick.sign.visual.value
      };
    }
  };

  const getTargetBadgeColor = (signId) => {
    if (isColorPack) {
      const sign = signs.find(s => s.id === signId);
      return sign?.visual?.value || '#6b7280';
    } else {
      const index = gameSignIds.indexOf(signId);
      const colors = ['#ef4444', '#3b82f6', '#22c55e'];
      return colors[index] || '#6b7280';
    }
  };

  const speedMultiplier = gameStartTime 
    ? (1 + (Math.floor((Date.now() - gameStartTime) / 10000) * SPEED_INCREASE_RATE))
    : 1;

  return (
    <div className={`min-h-screen h-screen overflow-hidden bg-gradient-to-br ${category.colorScheme.gradient} flex items-center justify-center p-2 sm:p-4`}>
      <div className="w-full max-w-6xl h-full max-h-[98vh] flex flex-col lg:flex-row gap-4 items-center justify-center">
        
        <div className="flex flex-col items-center gap-3 bg-white/90 backdrop-blur rounded-2xl p-4 shadow-xl lg:w-80 flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">
            🎯 Break This {isColorPack ? 'Color' : 'Number'}
          </h2>
          
          {targetSign && (
            <video
              key={targetSign.id}
              src={targetSign.videoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full max-w-xs aspect-video rounded-xl shadow-lg bg-black"
            />
          )}
          
          <div className="text-center space-y-2 w-full">
            <div className="text-4xl font-bold" style={{ color: category.colorScheme.primary }}>
              {targetSign?.name}
            </div>
            <p className="text-sm text-gray-600">
              Target changes every 5s
            </p>
            <p className="text-2xl font-bold text-gray-800">
              {bricksDestroyed} / {TOTAL_BRICKS}
            </p>
            <p className="text-xs text-gray-500">
              Bricks Destroyed
            </p>
            <div className="flex gap-2 justify-center mt-3 flex-wrap">
              {gameSignIds.map(signId => {
                const sign = signs.find(s => s.id === signId);
                return (
                  <div
                    key={signId}
                    className="px-3 py-1 rounded-full text-white font-bold text-sm"
                    style={{ backgroundColor: getTargetBadgeColor(signId) }}
                  >
                    {isColorPack ? sign.name : sign.visual.value}
                  </div>
                );
              })}
            </div>
            <div className="mt-3 text-xs text-gray-600">
              <p>Speed: {speedMultiplier.toFixed(1)}x</p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Arrow Keys or Mouse/Touch
            </p>
          </div>
        </div>

        <div className="relative bg-white/90 backdrop-blur rounded-2xl p-4 shadow-xl flex-shrink-0">
          <div
            ref={boardRef}
            className="relative border-4 rounded-xl bg-gray-800 touch-none"
            style={{ 
              width: BOARD_WIDTH,
              height: BOARD_HEIGHT,
              borderColor: category.colorScheme.primary
            }}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
          >
            <div
              className="absolute rounded-full bg-yellow-400 shadow-lg"
              style={{
                left: ballX - BALL_RADIUS,
                top: ballY - BALL_RADIUS,
                width: BALL_RADIUS * 2,
                height: BALL_RADIUS * 2
              }}
            />

            <div
              className="absolute bottom-0 rounded-lg shadow-lg"
              style={{
                left: paddleX,
                width: PADDLE_WIDTH,
                height: PADDLE_HEIGHT,
                backgroundColor: category.colorScheme.primary
              }}
            />

            {bricks.map(brick => {
              if (brick.status === 0) return null;
              const display = getBrickDisplay(brick);
              return (
                <div
                  key={brick.id}
                  className="absolute rounded-sm flex items-center justify-center text-white font-bold text-xs shadow"
                  style={{
                    left: brick.x,
                    top: brick.y,
                    width: BRICK_WIDTH,
                    height: BRICK_HEIGHT,
                    backgroundColor: display.backgroundColor,
                    opacity: brick.signId === targetSign?.id ? 1 : 0.6
                  }}
                >
                  {display.text}
                </div>
              );
            })}

            {status === 'game over' && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white text-xl sm:text-2xl font-bold px-4 sm:px-6 py-3 sm:py-4 rounded-xl z-10 shadow-2xl">
                Game Over!
                <div className="text-sm mt-2">
                  Destroyed: {bricksDestroyed}/{TOTAL_BRICKS}
                </div>
              </div>
            )}

            {status === 'complete' && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-600 text-white text-xl sm:text-2xl font-bold px-4 sm:px-6 py-3 sm:py-4 rounded-xl z-10 shadow-2xl">
                🎉 Perfect!
                <div className="text-sm mt-2">
                  All Bricks Destroyed!
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreakoutGame;