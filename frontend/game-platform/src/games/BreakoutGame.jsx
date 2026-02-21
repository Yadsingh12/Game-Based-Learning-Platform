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
  const SPEED_INCREASE_RATE = 0.15;
  const TOTAL_BRICKS = BRICK_ROWS * BRICK_COLS;

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
  const [boardScale, setBoardScale] = useState(1);

  const gameLoopRef = useRef();
  const lastTimeRef = useRef(Date.now());
  const boardRef = useRef(null);
  const containerRef = useRef(null);
  const wrapperRef = useRef(null);

  const isColorPack = signs.length > 0 && signs[0].visual?.type === 'color';

  // Compute scale so the board fits available space
  useEffect(() => {
    const updateScale = () => {
      if (!wrapperRef.current) return;
      const { width, height } = wrapperRef.current.getBoundingClientRect();
      const scaleX = width / BOARD_WIDTH;
      const scaleY = height / BOARD_HEIGHT;
      setBoardScale(Math.min(scaleX, scaleY, 1));
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  if (!signs || signs.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
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

  useEffect(() => { initializeGame(); }, []);

  useEffect(() => {
    if (status !== 'playing' || gameSignIds.length === 0) return;
    const interval = setInterval(() => {
      setTargetSign(prev => {
        const currentIndex = gameSignIds.indexOf(prev.id);
        const nextIndex = (currentIndex + 1) % gameSignIds.length;
        return signs.find(s => s.id === gameSignIds[nextIndex]);
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [status, gameSignIds, signs]);

  useEffect(() => {
    if (status !== 'playing' || !gameStartTime) return;
    const interval = setInterval(() => {
      const elapsed = (Date.now() - gameStartTime) / 1000;
      const multiplier = 1 + (Math.floor(elapsed / 10) * SPEED_INCREASE_RATE);
      setBallSpeed(INITIAL_BALL_SPEED * multiplier);
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
    return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
  }, [status, paddleX, bricks, ballX, ballY, ballAngle, ballSpeed, targetSign]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (status !== 'playing') return;
      if (e.key === 'ArrowLeft' || e.key === 'a')
        setPaddleX(prev => Math.max(0, prev - 25));
      else if (e.key === 'ArrowRight' || e.key === 'd')
        setPaddleX(prev => Math.min(BOARD_WIDTH - PADDLE_WIDTH, prev + 25));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status]);

  // Mouse/touch: translate client coords → logical board coords via scale
  const handleMouseMove = (e) => {
    if (status !== 'playing' || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const relativeX = (e.clientX - rect.left) / (rect.width);
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

    if (newX - BALL_RADIUS < 0) { newX = BALL_RADIUS; newAngle = Math.PI - newAngle; }
    if (newX + BALL_RADIUS > BOARD_WIDTH) { newX = BOARD_WIDTH - BALL_RADIUS; newAngle = Math.PI - newAngle; }
    if (newY - BALL_RADIUS < 0) { newY = BALL_RADIUS; newAngle = -newAngle; }

    const paddleTop = BOARD_HEIGHT - PADDLE_HEIGHT;
    if (newY + BALL_RADIUS >= paddleTop &&
        oldY + BALL_RADIUS <= paddleTop &&
        newX >= paddleX - BALL_RADIUS &&
        newX <= paddleX + PADDLE_WIDTH + BALL_RADIUS &&
        Math.sin(ballAngle) > 0) {
      newY = paddleTop - BALL_RADIUS;
      const hitPosition = (newX - paddleX) / PADDLE_WIDTH;
      const bounceAngle = Math.PI * 0.25 + (1 - hitPosition) * Math.PI * 0.5;
      newAngle = -Math.max(Math.PI * 0.3, Math.min(Math.PI * 0.7, bounceAngle));
    }

    if (newY - BALL_RADIUS > BOARD_HEIGHT) {
      setStatus('game over');
      setTimeout(() => onExit(Math.round((bricksDestroyed / TOTAL_BRICKS) * 100)), 2000);
      return;
    }

    let bricksBroken = 0;
    let brickHit = false;
    const newBricks = bricks.map(brick => {
      if (brick.status === 0 || brickHit) return brick;
      const { x: bx, y: by } = brick;
      if (newX + BALL_RADIUS >= bx && newX - BALL_RADIUS <= bx + BRICK_WIDTH &&
          newY + BALL_RADIUS >= by && newY - BALL_RADIUS <= by + BRICK_HEIGHT) {
        brickHit = true;
        const fromTop = oldY + BALL_RADIUS <= by;
        const fromBottom = oldY - BALL_RADIUS >= by + BRICK_HEIGHT;
        const fromLeft = oldX + BALL_RADIUS <= bx;
        const fromRight = oldX - BALL_RADIUS >= bx + BRICK_WIDTH;
        if (fromTop) { newY = by - BALL_RADIUS; newAngle = -newAngle; }
        else if (fromBottom) { newY = by + BRICK_HEIGHT + BALL_RADIUS; newAngle = -newAngle; }
        else if (fromLeft) { newX = bx - BALL_RADIUS; newAngle = Math.PI - newAngle; }
        else if (fromRight) { newX = bx + BRICK_WIDTH + BALL_RADIUS; newAngle = Math.PI - newAngle; }
        else { newAngle += Math.PI; }
        if (brick.signId === targetSign.id) { bricksBroken++; return { ...brick, status: 0 }; }
      }
      return brick;
    });

    setBricks(newBricks);
    if (bricksBroken > 0) setBricksDestroyed(prev => prev + bricksBroken);

    while (newAngle > Math.PI * 2) newAngle -= Math.PI * 2;
    while (newAngle < -Math.PI * 2) newAngle += Math.PI * 2;
    setBallX(newX); setBallY(newY); setBallAngle(newAngle);

    if (newBricks.every(b => b.status === 0)) {
      setStatus('complete');
      setTimeout(() => onExit(100), 2000);
    }
  };

  const getBrickDisplay = (brick) => {
    if (isColorPack) return { backgroundColor: brick.sign.visual.value, text: '' };
    const index = gameSignIds.indexOf(brick.signId);
    return { backgroundColor: ['#ef4444', '#3b82f6', '#22c55e'][index] || '#6b7280', text: brick.sign.visual.value };
  };

  const getTargetBadgeColor = (signId) => {
    if (isColorPack) return signs.find(s => s.id === signId)?.visual?.value || '#6b7280';
    const index = gameSignIds.indexOf(signId);
    return ['#ef4444', '#3b82f6', '#22c55e'][index] || '#6b7280';
  };

  const speedMultiplier = gameStartTime
    ? (1 + (Math.floor((Date.now() - gameStartTime) / 10000) * SPEED_INCREASE_RATE))
    : 1;

  return (
    <div className={`h-full overflow-hidden bg-gradient-to-br ${category.colorScheme.gradient} flex flex-col`}>

      {/* ── Compact header bar (mobile/tablet) ── */}
      <div className="flex-none flex items-center justify-between gap-2 px-3 py-2 bg-white/20 backdrop-blur-sm lg:hidden">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-white font-bold text-sm">
            🎯 {targetSign?.name}
          </span>
          <span className="text-white/80 text-xs">→ changes in 5s</span>
        </div>
        <div className="flex items-center gap-3 text-white text-xs font-bold">
          <span>{bricksDestroyed}/{TOTAL_BRICKS} 🧱</span>
          <span>⚡ {speedMultiplier.toFixed(1)}x</span>
        </div>
      </div>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col lg:flex-row gap-3 p-2 sm:p-3 min-h-0 items-center justify-center">

        {/* Side panel — hidden on mobile/tablet, shown on lg+ */}
        <div className="hidden lg:flex flex-col items-center gap-3 bg-white/90 backdrop-blur rounded-2xl p-4 shadow-xl w-72 flex-shrink-0 self-center">
          <h2 className="text-lg font-bold text-gray-800">
            🎯 Break This {isColorPack ? 'Color' : 'Number'}
          </h2>
          {targetSign && (
            <video
              key={targetSign.id}
              src={targetSign.videoUrl ? (assets?.videos?.[targetSign.videoUrl] ?? targetSign.videoUrl) : null}
              autoPlay loop muted playsInline
              className="w-full aspect-video rounded-xl shadow-lg bg-black"
            />
          )}
          <div className="text-center space-y-1 w-full">
            <div className="text-3xl font-bold" style={{ color: category.colorScheme.primary }}>
              {targetSign?.name}
            </div>
            <p className="text-xs text-gray-500">Target changes every 5s</p>
            <p className="text-2xl font-bold text-gray-800">{bricksDestroyed} / {TOTAL_BRICKS}</p>
            <p className="text-xs text-gray-500">Bricks Destroyed</p>
            <div className="flex gap-2 justify-center mt-2 flex-wrap">
              {gameSignIds.map(signId => {
                const sign = signs.find(s => s.id === signId);
                return (
                  <div key={signId} className="px-3 py-1 rounded-full text-white font-bold text-sm"
                    style={{ backgroundColor: getTargetBadgeColor(signId) }}>
                    {isColorPack ? sign.name : sign.visual.value}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-2">Speed: {speedMultiplier.toFixed(1)}x</p>
            <p className="text-xs text-gray-400">Arrow Keys or Mouse/Touch</p>
          </div>
        </div>

        {/* Board wrapper — fills remaining space, scales board to fit */}
        <div
          ref={wrapperRef}
          className="flex-1 flex items-center justify-center min-h-0 min-w-0 w-full"
        >
          {/* Outer scaled shell — actual rendered size matches scale */}
          <div
            style={{
              width: BOARD_WIDTH * boardScale,
              height: BOARD_HEIGHT * boardScale,
              position: 'relative',
            }}
          >
            {/* Inner board at native 500×500, scaled down via transform */}
            <div
              ref={boardRef}
              className="absolute top-0 left-0 border-4 rounded-xl bg-gray-800 touch-none overflow-hidden"
              style={{
                width: BOARD_WIDTH,
                height: BOARD_HEIGHT,
                transformOrigin: 'top left',
                transform: `scale(${boardScale})`,
                borderColor: category.colorScheme.primary,
              }}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              onTouchStart={(e) => e.preventDefault()}
            >
              {/* Ball */}
              <div className="absolute rounded-full bg-yellow-400 shadow-lg"
                style={{ left: ballX - BALL_RADIUS, top: ballY - BALL_RADIUS, width: BALL_RADIUS * 2, height: BALL_RADIUS * 2 }} />

              {/* Paddle */}
              <div className="absolute bottom-0 rounded-lg shadow-lg"
                style={{ left: paddleX, width: PADDLE_WIDTH, height: PADDLE_HEIGHT, backgroundColor: category.colorScheme.primary }} />

              {/* Bricks */}
              {bricks.map(brick => {
                if (brick.status === 0) return null;
                const display = getBrickDisplay(brick);
                return (
                  <div key={brick.id}
                    className="absolute rounded-sm flex items-center justify-center text-white font-bold text-xs shadow"
                    style={{
                      left: brick.x, top: brick.y,
                      width: BRICK_WIDTH, height: BRICK_HEIGHT,
                      backgroundColor: display.backgroundColor,
                      opacity: brick.signId === targetSign?.id ? 1 : 0.55,
                    }}>
                    {display.text}
                  </div>
                );
              })}

              {/* Overlays */}
              {status === 'game over' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10">
                  <div className="bg-red-600 text-white text-2xl font-bold px-6 py-4 rounded-xl shadow-2xl text-center">
                    Game Over!
                    <div className="text-sm mt-1">Destroyed: {bricksDestroyed}/{TOTAL_BRICKS}</div>
                  </div>
                </div>
              )}
              {status === 'complete' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10">
                  <div className="bg-green-600 text-white text-2xl font-bold px-6 py-4 rounded-xl shadow-2xl text-center">
                    🎉 Perfect!
                    <div className="text-sm mt-1">All Bricks Destroyed!</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom mini panel — mobile/tablet only, shows video + color badges */}
        <div className="flex lg:hidden items-center gap-3 bg-white/90 backdrop-blur rounded-2xl px-3 py-2 shadow-xl w-full max-w-lg flex-shrink-0">
          {targetSign && (
            <video
              key={targetSign.id}
              src={targetSign.videoUrl ? (assets?.videos?.[targetSign.videoUrl] ?? targetSign.videoUrl) : null}
              autoPlay loop muted playsInline
              className="h-16 sm:h-20 aspect-video rounded-lg bg-black flex-shrink-0 object-cover"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 mb-1">Break this color:</p>
            <div className="flex gap-1.5 flex-wrap">
              {gameSignIds.map(signId => {
                const sign = signs.find(s => s.id === signId);
                const isTarget = signId === targetSign?.id;
                return (
                  <div key={signId}
                    className={`px-2 py-0.5 rounded-full text-white font-bold text-xs transition-all ${isTarget ? 'ring-2 ring-white scale-110' : 'opacity-60'}`}
                    style={{ backgroundColor: getTargetBadgeColor(signId) }}>
                    {isColorPack ? sign.name : sign.visual.value}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="text-center flex-shrink-0">
            <p className="text-lg font-black text-gray-800">{bricksDestroyed}/{TOTAL_BRICKS}</p>
            <p className="text-xs text-gray-400">bricks</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreakoutGame;