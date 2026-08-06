/* Self-Harm Safety & Urge Toolkit */

let urgeTimerInterval = null;
let urgeTimeRemaining = 15 * 60; // 15 minutes in seconds
let isUrgeTimerRunning = false;

function toggleUrgeTimer() {
  const btn = document.getElementById('timer-start-btn');
  if (isUrgeTimerRunning) {
    pauseUrgeTimer();
    if (btn) btn.textContent = '▶️ Resume Wave';
  } else {
    startUrgeTimer();
    if (btn) btn.textContent = '⏸️ Pause Wave';
  }
}

function startUrgeTimer() {
  if (isUrgeTimerRunning) return;
  isUrgeTimerRunning = true;
  
  urgeTimerInterval = setInterval(() => {
    if (urgeTimeRemaining > 0) {
      urgeTimeRemaining--;
      updateUrgeTimerDisplay();
    } else {
      pauseUrgeTimer();
      alert("🌊 You did it! You rode out 15 minutes of the urge safely. Take a deep breath.");
    }
  }, 1000);
}

function pauseUrgeTimer() {
  if (urgeTimerInterval) clearInterval(urgeTimerInterval);
  urgeTimerInterval = null;
  isUrgeTimerRunning = false;
}

function resetUrgeTimer() {
  pauseUrgeTimer();
  urgeTimeRemaining = 15 * 60;
  updateUrgeTimerDisplay();
  const btn = document.getElementById('timer-start-btn');
  if (btn) btn.textContent = '▶️ Ride the Wave';
}

function updateUrgeTimerDisplay() {
  const display = document.getElementById('urge-timer-display');
  if (!display) return;

  const mins = Math.floor(urgeTimeRemaining / 60);
  const secs = urgeTimeRemaining % 60;
  display.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/* Scribble Canvas */
let isDrawing = false;
let canvasCtx = null;

function initScribbleCanvas() {
  const canvas = document.getElementById('scribble-canvas');
  if (!canvas) return;

  // Set real canvas dimension based on parent container
  canvas.width = canvas.offsetWidth || 500;
  canvas.height = canvas.offsetHeight || 220;

  canvasCtx = canvas.getContext('2d');
  canvasCtx.strokeStyle = '#f43f5e';
  canvasCtx.lineWidth = 3;
  canvasCtx.lineCap = 'round';

  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDraw);
  canvas.addEventListener('mouseleave', stopDraw);

  canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startDraw(e.touches[0]); });
  canvas.addEventListener('touchmove', (e) => { e.preventDefault(); draw(e.touches[0]); });
  canvas.addEventListener('touchend', stopDraw);
}

function startDraw(e) {
  isDrawing = true;
  if (!canvasCtx) return;
  const rect = document.getElementById('scribble-canvas').getBoundingClientRect();
  canvasCtx.beginPath();
  canvasCtx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

function draw(e) {
  if (!isDrawing || !canvasCtx) return;
  const rect = document.getElementById('scribble-canvas').getBoundingClientRect();
  canvasCtx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
  canvasCtx.stroke();
}

function stopDraw() {
  isDrawing = false;
}

function clearScribbleCanvas() {
  const canvas = document.getElementById('scribble-canvas');
  if (canvas && canvasCtx) {
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

function playBandSnapSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {}
}

/* Safety Plan Storage */
function saveSafetyPlan() {
  const plan = {
    triggers: document.getElementById('sp-triggers').value,
    distractions: document.getElementById('sp-distractions').value,
    people: document.getElementById('sp-people').value,
    places: document.getElementById('sp-places').value
  };

  localStorage.setItem('haven_safety_plan', JSON.stringify(plan));
  alert('✅ Your Safety Plan has been saved safely in your browser!');
}

function loadSafetyPlan() {
  const saved = localStorage.getItem('haven_safety_plan');
  if (!saved) return;

  try {
    const plan = JSON.parse(saved);
    if (plan.triggers) document.getElementById('sp-triggers').value = plan.triggers;
    if (plan.distractions) document.getElementById('sp-distractions').value = plan.distractions;
    if (plan.people) document.getElementById('sp-people').value = plan.people;
    if (plan.places) document.getElementById('sp-places').value = plan.places;
  } catch (e) {}
}

/* ================= Distraction Mini-Game (calm Snake) =================
   Low-frustration by design: gentle game-over copy, no red flashing,
   pause anytime, and a "Play Again" that never feels punishing. */

const GAME_GRID = 20;         // 20x20 cells
const GAME_CELL = 18;         // px per cell (canvas is 360x360)
const GAME_SPEED_MS = 140;    // tick speed — calm pace, not twitchy

let gameCanvas = null;
let gameCtx = null;
let gameLoopId = null;
let gameSnake = [];
let gameDir = { x: 1, y: 0 };
let gameNextDir = { x: 1, y: 0 };
let gameFood = { x: 10, y: 10 };
let gameScore = 0;
let gameBest = 0;
let gameRunning = false;
let gamePaused = false;
let gameKeyBound = false;
let gameSwipeStartX = 0, gameSwipeStartY = 0;

function initSnakeGame() {
  gameCanvas = document.getElementById('game-canvas');
  if (!gameCanvas) return;
  gameCtx = gameCanvas.getContext('2d');

  gameBest = parseInt(localStorage.getItem('haven_game_best') || '0', 10) || 0;
  const bestEl = document.getElementById('game-best');
  if (bestEl) bestEl.textContent = gameBest;

  resetSnakeState();
  drawSnakeGame(); // paint an idle frame behind the overlay

  if (!gameKeyBound) {
    document.addEventListener('keydown', handleSnakeKey);
    gameCanvas.addEventListener('touchstart', (e) => {
      const t = e.touches[0];
      gameSwipeStartX = t.clientX;
      gameSwipeStartY = t.clientY;
    }, { passive: true });
    gameCanvas.addEventListener('touchend', (e) => {
      const t = e.changedTouches[0];
      const dx = t.clientX - gameSwipeStartX;
      const dy = t.clientY - gameSwipeStartY;
      if (Math.abs(dx) > Math.abs(dy)) {
        setSnakeDir(dx > 0 ? 1 : -1, 0);
      } else {
        setSnakeDir(0, dy > 0 ? 1 : -1);
      }
    }, { passive: true });
    gameKeyBound = true;
  }
}

function resetSnakeState() {
  gameSnake = [{ x: 8, y: 10 }, { x: 7, y: 10 }, { x: 6, y: 10 }];
  gameDir = { x: 1, y: 0 };
  gameNextDir = { x: 1, y: 0 };
  gameScore = 0;
  placeSnakeFood();
  updateSnakeScoreUI();
}

function handleSnakeKey(e) {
  const map = {
    ArrowUp: [0, -1], w: [0, -1], W: [0, -1],
    ArrowDown: [0, 1], s: [0, 1], S: [0, 1],
    ArrowLeft: [-1, 0], a: [-1, 0], A: [-1, 0],
    ArrowRight: [1, 0], d: [1, 0], D: [1, 0]
  };
  if (map[e.key] && gameRunning) {
    e.preventDefault();
    setSnakeDir(map[e.key][0], map[e.key][1]);
  }
}

function setSnakeDir(x, y) {
  // Prevent reversing directly into itself
  if (gameDir.x === -x && gameDir.y === -y) return;
  gameNextDir = { x, y };
}

function placeSnakeFood() {
  let valid = false;
  while (!valid) {
    gameFood = {
      x: Math.floor(Math.random() * GAME_GRID),
      y: Math.floor(Math.random() * GAME_GRID)
    };
    valid = !gameSnake.some(seg => seg.x === gameFood.x && seg.y === gameFood.y);
  }
}

function startSnakeGame() {
  if (!gameCanvas) initSnakeGame();
  hideSnakeOverlay();
  if (gameRunning && !gamePaused) return;
  if (!gameRunning) resetSnakeState();
  gameRunning = true;
  gamePaused = false;
  if (gameLoopId) clearInterval(gameLoopId);
  gameLoopId = setInterval(snakeTick, GAME_SPEED_MS);
}

function pauseSnakeGame() {
  if (!gameRunning) return;
  gamePaused = true;
  if (gameLoopId) clearInterval(gameLoopId);
  gameLoopId = null;
  showSnakeOverlay('⏸️ Paused', 'Resume', 'startSnakeGame()');
}

function restartSnakeGame() {
  if (gameLoopId) clearInterval(gameLoopId);
  gameLoopId = null;
  gameRunning = false;
  gamePaused = false;
  resetSnakeState();
  drawSnakeGame();
  showSnakeOverlay('', '▶️ Play', 'startSnakeGame()');
}

function snakeTick() {
  gameDir = gameNextDir;
  const head = { x: gameSnake[0].x + gameDir.x, y: gameSnake[0].y + gameDir.y };

  // Wrap around edges instead of a hard wall-death — gentler feel
  if (head.x < 0) head.x = GAME_GRID - 1;
  if (head.x >= GAME_GRID) head.x = 0;
  if (head.y < 0) head.y = GAME_GRID - 1;
  if (head.y >= GAME_GRID) head.y = 0;

  const hitSelf = gameSnake.some(seg => seg.x === head.x && seg.y === head.y);
  if (hitSelf) {
    endSnakeGame();
    return;
  }

  gameSnake.unshift(head);

  if (head.x === gameFood.x && head.y === gameFood.y) {
    gameScore++;
    updateSnakeScoreUI();
    placeSnakeFood();
  } else {
    gameSnake.pop();
  }

  drawSnakeGame();
}

function endSnakeGame() {
  if (gameLoopId) clearInterval(gameLoopId);
  gameLoopId = null;
  gameRunning = false;
  gamePaused = false;

  if (gameScore > gameBest) {
    gameBest = gameScore;
    localStorage.setItem('haven_game_best', gameBest);
    updateSnakeScoreUI();
    showSnakeOverlay(`🌟 New best — ${gameScore}!`, '🔄 Play Again', 'restartAndPlaySnake()');
  } else {
    const gentle = [
      'Nice run — no pressure, go again whenever.',
      'That counts as a break. Want another round?',
      'Good focus for a minute. Play again?',
      'All good — resets happen. Try again?'
    ];
    const msg = gentle[Math.floor(Math.random() * gentle.length)];
    showSnakeOverlay(`Score: ${gameScore} — ${msg}`, '🔄 Play Again', 'restartAndPlaySnake()');
  }
}

function restartAndPlaySnake() {
  resetSnakeState();
  startSnakeGame();
}

function updateSnakeScoreUI() {
  const s = document.getElementById('game-score');
  const b = document.getElementById('game-best');
  if (s) s.textContent = gameScore;
  if (b) b.textContent = gameBest;
}

function showSnakeOverlay(title, btnLabel, btnOnclick) {
  const overlay = document.getElementById('game-overlay');
  if (!overlay) return;
  overlay.classList.remove('hidden');
  overlay.innerHTML = `
    ${title ? `<p style="color:#fff; font-weight:800; margin-bottom:10px; text-align:center; padding:0 16px;">${title}</p>` : ''}
    <button class="btn-primary" onclick="${btnOnclick}">${btnLabel}</button>
    <p style="font-size:0.76rem; color:rgba(255,255,255,0.7); margin-top:10px;">Arrow keys / WASD, or swipe on mobile</p>
  `;
}

function hideSnakeOverlay() {
  const overlay = document.getElementById('game-overlay');
  if (overlay) overlay.classList.add('hidden');
}

function drawSnakeGame() {
  if (!gameCtx) return;
  gameCtx.fillStyle = '#0f172a';
  gameCtx.fillRect(0, 0, GAME_GRID * GAME_CELL, GAME_GRID * GAME_CELL);

  // Subtle grid
  gameCtx.strokeStyle = 'rgba(255,255,255,0.04)';
  for (let i = 1; i < GAME_GRID; i++) {
    gameCtx.beginPath();
    gameCtx.moveTo(i * GAME_CELL, 0);
    gameCtx.lineTo(i * GAME_CELL, GAME_GRID * GAME_CELL);
    gameCtx.stroke();
    gameCtx.beginPath();
    gameCtx.moveTo(0, i * GAME_CELL);
    gameCtx.lineTo(GAME_GRID * GAME_CELL, i * GAME_CELL);
    gameCtx.stroke();
  }

  // Food
  gameCtx.fillStyle = '#f59e0b';
  gameCtx.beginPath();
  gameCtx.arc(
    gameFood.x * GAME_CELL + GAME_CELL / 2,
    gameFood.y * GAME_CELL + GAME_CELL / 2,
    GAME_CELL / 2.6, 0, Math.PI * 2
  );
  gameCtx.fill();

  // Snake — calming green gradient, rounded segments
  gameSnake.forEach((seg, i) => {
    const t = i / Math.max(gameSnake.length - 1, 1);
    gameCtx.fillStyle = i === 0 ? '#4ade80' : `rgba(74, 222, 128, ${0.9 - t * 0.5})`;
    const pad = 2;
    gameCtx.beginPath();
    gameCtx.roundRect(
      seg.x * GAME_CELL + pad, seg.y * GAME_CELL + pad,
      GAME_CELL - pad * 2, GAME_CELL - pad * 2, 5
    );
    gameCtx.fill();
  });
}
