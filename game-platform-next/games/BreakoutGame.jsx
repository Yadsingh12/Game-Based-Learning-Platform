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
  const wrapperRef = useRef(null);

  const isColorPack = signs.length > 0 && signs[0].visual?.type === 'color';

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
      <div className="h-full flex items-center justify-center bg-[#0f0a1e]">
        <p className="text-red-400 font-semibold">No data available</p>
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
    return { backgroundColor: ['#7c3aed', '#3b82f6', '#06b6d4'][index] || '#6b7280', text: brick.sign.visual.value };
  };

  const getTargetBadgeColor = (signId) => {
    if (isColorPack) return signs.find(s => s.id === signId)?.visual?.value || '#6b7280';
    const index = gameSignIds.indexOf(signId);
    return ['#7c3aed', '#3b82f6', '#06b6d4'][index] || '#6b7280';
  };

  const speedMultiplier = gameStartTime
    ? (1 + (Math.floor((Date.now() - gameStartTime) / 10000) * SPEED_INCREASE_RATE))
    : 1;

  return (
    <div className="h-full overflow-hidden bg-[#0f0a1e] relative flex flex-col">
      {/* Ambient blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-violet-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-80 h-80 bg-blue-600/15 rounded-full blur-[100px] pointer-events-none" />

      {/* ── Compact header bar (mobile/tablet) ── */}
      <div className="relative z-10 flex-none flex items-center justify-between gap-2 px-4 py-2.5 bg-white/5 border-b border-white/10 backdrop-blur-sm lg:hidden">
        <div className="flex items-center gap-2">
          <span className="text-violet-300 font-bold text-sm">🎯 {targetSign?.name}</span>
          <span className="text-white/40 text-xs">· changes in 5s</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-bold">
          <span className="text-white/70">{bricksDestroyed}/{TOTAL_BRICKS} 🧱</span>
          <span className="text-violet-300">⚡ {speedMultiplier.toFixed(1)}x</span>
        </div>
      </div>

      {/* ── Main area ── */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row gap-3 p-3 min-h-0 items-center justify-center">

        {/* Side panel — lg+ only */}
        <div className="hidden lg:flex flex-col items-center gap-3 bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-4 w-64 flex-shrink-0 self-center">
          <h2 className="text-sm font-bold text-white/70 uppercase tracking-widest">
            🎯 Break This Sign
          </h2>
          {targetSign && (
            <video
              key={targetSign.id}
              src={targetSign.videoUrl ? (assets?.videos?.[targetSign.videoUrl] ?? targetSign.videoUrl) : null}
              autoPlay loop muted playsInline
              className="w-full aspect-video rounded-xl bg-black/50 border border-white/10"
            />
          )}
          <div className="text-center space-y-2 w-full">
            <div className="text-2xl font-black text-white">{targetSign?.name}</div>
            <p className="text-xs text-white/40">Target changes every 5s</p>

            <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-3xl font-black text-violet-400">{bricksDestroyed}</span>
              <span className="text-white/40 font-bold">/</span>
              <span className="text-xl font-bold text-white/50">{TOTAL_BRICKS}</span>
              <span className="text-white/40 text-xs ml-1">bricks</span>
            </div>

            <div className="flex gap-1.5 justify-center flex-wrap mt-1">
              {gameSignIds.map(signId => {
                const sign = signs.find(s => s.id === signId);
                const isTarget = signId === targetSign?.id;
                return (
                  <div key={signId}
                    className={`px-2.5 py-1 rounded-full text-white font-bold text-xs transition-all ${isTarget ? 'ring-2 ring-white/50 scale-105' : 'opacity-50'}`}
                    style={{ backgroundColor: getTargetBadgeColor(signId) + 'cc' }}>
                    {isColorPack ? sign.name : sign.visual.value}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-white/40">Speed</span>
              <span className="text-violet-300 font-bold">{speedMultiplier.toFixed(1)}x</span>
            </div>
            <p className="text-xs text-white/25">Arrow keys or mouse/touch</p>
          </div>
        </div>

        {/* Board wrapper */}
        <div ref={wrapperRef} className="flex-1 flex items-center justify-center min-h-0 min-w-0 w-full">
          <div style={{ width: BOARD_WIDTH * boardScale, height: BOARD_HEIGHT * boardScale, position: 'relative' }}>
            <div
              ref={boardRef}
              className="absolute top-0 left-0 rounded-2xl touch-none overflow-hidden"
              style={{
                width: BOARD_WIDTH,
                height: BOARD_HEIGHT,
                transformOrigin: 'top left',
                transform: `scale(${boardScale})`,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(124,58,237,0.3)',
                boxShadow: '0 0 40px rgba(124,58,237,0.15)',
              }}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              onTouchStart={e => e.preventDefault()}
            >
              {/* Ball */}
              <div className="absolute rounded-full"
                style={{
                  left: ballX - BALL_RADIUS, top: ballY - BALL_RADIUS,
                  width: BALL_RADIUS * 2, height: BALL_RADIUS * 2,
                  background: 'linear-gradient(135deg, #a78bfa, #818cf8)',
                  boxShadow: '0 0 8px rgba(167,139,250,0.8)',
                }} />

              {/* Paddle */}
              <div className="absolute bottom-0 rounded-full"
                style={{
                  left: paddleX, width: PADDLE_WIDTH, height: PADDLE_HEIGHT,
                  background: 'linear-gradient(90deg, #7c3aed, #3b82f6)',
                  boxShadow: '0 0 12px rgba(124,58,237,0.6)',
                }} />

              {/* Bricks */}
              {bricks.map(brick => {
                if (brick.status === 0) return null;
                const display = getBrickDisplay(brick);
                const isTarget = brick.signId === targetSign?.id;
                return (
                  <div key={brick.id}
                    className="absolute rounded flex items-center justify-center text-white font-bold text-xs"
                    style={{
                      left: brick.x, top: brick.y,
                      width: BRICK_WIDTH, height: BRICK_HEIGHT,
                      backgroundColor: display.backgroundColor,
                      opacity: isTarget ? 1 : 0.4,
                      boxShadow: isTarget ? `0 0 8px ${display.backgroundColor}80` : 'none',
                    }}>
                    {display.text}
                  </div>
                );
              })}

              {/* Overlays */}
              {status === 'game over' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10"
                  style={{ background: 'rgba(15,10,30,0.85)', backdropFilter: 'blur(8px)' }}>
                  <div className="text-center px-8 py-6 rounded-2xl bg-white/5 border border-white/10">
                    <div className="text-3xl font-black text-white mb-1">Game Over</div>
                    <div className="text-white/50 text-sm">Destroyed: {bricksDestroyed}/{TOTAL_BRICKS}</div>
                  </div>
                </div>
              )}
              {status === 'complete' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10"
                  style={{ background: 'rgba(15,10,30,0.85)', backdropFilter: 'blur(8px)' }}>
                  <div className="text-center px-8 py-6 rounded-2xl bg-white/5 border border-white/10">
                    <div className="text-3xl font-black text-white mb-1">🎉 Perfect!</div>
                    <div className="text-violet-300 text-sm">All Bricks Destroyed!</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom mini panel — mobile/tablet */}
        <div className="flex lg:hidden items-center gap-3 bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl px-3 py-2 w-full max-w-lg flex-shrink-0">
          {targetSign && (
            <video
              key={targetSign.id}
              src={targetSign.videoUrl ? (assets?.videos?.[targetSign.videoUrl] ?? targetSign.videoUrl) : null}
              autoPlay loop muted playsInline
              className="h-16 sm:h-20 aspect-video rounded-lg bg-black/50 flex-shrink-0 object-cover border border-white/10"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white/40 mb-1">Break this sign:</p>
            <div className="flex gap-1.5 flex-wrap">
              {gameSignIds.map(signId => {
                const sign = signs.find(s => s.id === signId);
                const isTarget = signId === targetSign?.id;
                return (
                  <div key={signId}
                    className={`px-2 py-0.5 rounded-full text-white font-bold text-xs transition-all ${isTarget ? 'ring-2 ring-white/40 scale-110' : 'opacity-40'}`}
                    style={{ backgroundColor: getTargetBadgeColor(signId) + 'cc' }}>
                    {isColorPack ? sign.name : sign.visual.value}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="text-center flex-shrink-0">
            <p className="text-lg font-black text-violet-300">{bricksDestroyed}/{TOTAL_BRICKS}</p>
            <p className="text-xs text-white/30">bricks</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreakoutGame;