/* ═══════════════════════ PARTICLES ═══════════════════════ */
(function() {
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() { this.reset(true); }
    reset(initial) {
      this.x = Math.random() * W;
      this.y = initial ? Math.random() * H : H + 10;
      this.size = Math.random() * 1.5 + .3;
      this.speedY = -(Math.random() * .4 + .1);
      this.speedX = (Math.random() - .5) * .15;
      this.opacity = Math.random() * .4 + .1;
      this.color = Math.random() > .5 ? '79,142,247' : '139,92,246';
    }
    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      if (this.y < -10) this.reset(false);
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${this.opacity})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 80; i++) particles.push(new Particle());

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ═══════════════════════ CURSOR GLOW ═══════════════════════ */
const cursorGlow = document.getElementById('cursorGlow');
document.addEventListener('mousemove', e => {
  cursorGlow.style.left = e.clientX + 'px';
  cursorGlow.style.top = e.clientY + 'px';
});

/* ═══════════════════════ TYPEWRITER ═══════════════════════ */
(function() {
  const phrases = [
    'Gameplay Systems Engineer',
    'Multiplayer Architecture',
    'UE Actor Replication Expert',
    'Team Lead @ NeographGames',
    'C++ & Unreal Engine',
    'MongoDB Data Architect',
    'Linux Power User',
    'AI-Assisted Developer',
  ];
  const el = document.getElementById('typewriter');
  let pi = 0, ci = 0, deleting = false, wait = 0;

  function tick() {
    const phrase = phrases[pi];
    if (!deleting) {
      el.textContent = phrase.slice(0, ci + 1);
      ci++;
      if (ci === phrase.length) { deleting = true; wait = 60; }
    } else {
      if (wait-- > 0) { setTimeout(tick, 30); return; }
      el.textContent = phrase.slice(0, ci - 1);
      ci--;
      if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; }
    }
    setTimeout(tick, deleting ? 40 : 80);
  }
  setTimeout(tick, 600);
})();

/* ═══════════════════════ SCROLL REVEAL ═══════════════════════ */
const observer = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.reveal').forEach((el, idx) => {
  el.style.transitionDelay = `${(idx % 5) * 0.07}s`;
  observer.observe(el);
});

/* ═══════════════════════ COUNT-UP STATS ═══════════════════════ */
const statObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const el = e.target.querySelector('[data-target]');
      if (!el) return;
      const target = parseInt(el.dataset.target);
      let cur = 0;
      const step = Math.ceil(target / 20);
      const iv = setInterval(() => {
        cur = Math.min(cur + step, target);
        el.textContent = cur + '+';
        if (cur >= target) clearInterval(iv);
      }, 50);
      statObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.stat-item').forEach(el => statObserver.observe(el));

/* ═══════════════════════ LANGUAGE BARS ═══════════════════════ */
const barObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.lang-bar').forEach(bar => {
        const w = bar.style.getPropertyValue('--w') || '100%';
        bar.style.transform = `scaleX(${parseFloat(w)/100})`;
        bar.classList.add('animate');
      });
      barObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.info-card').forEach(el => barObserver.observe(el));

/* ═══════════════════════ SKILL CARD MOUSE GLOW ═══════════════════════ */
document.querySelectorAll('.skill-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width * 100).toFixed(1);
    const y = ((e.clientY - r.top) / r.height * 100).toFixed(1);
    card.style.setProperty('--mx', x + '%');
    card.style.setProperty('--my', y + '%');
  });
});

/* ═══════════════════════════════════════════════
   SNAKE GAME
═══════════════════════════════════════════════ */
(function() {
  const canvas = document.getElementById('snake-canvas');
  const ctx    = canvas.getContext('2d');
  const COLS = 17, ROWS = 17;
  const CELL  = Math.floor(canvas.width / COLS);

  const overlay     = document.getElementById('game-overlay');
  const titleEl     = document.getElementById('overlay-title');
  const subEl       = document.getElementById('overlay-sub');
  const scoreEl     = document.getElementById('overlay-score');
  const scoreDisp   = document.getElementById('score-display');
  const bestDisp    = document.getElementById('best-display');
  const levelDisp   = document.getElementById('level-display');

  // Colors
  const C = {
    bg:        '#050709',
    grid:      'rgba(79,142,247,.04)',
    head:      '#06d6a0',
    headGlow:  'rgba(6,214,160,.8)',
    body:      '#4f8ef7',
    bodyDark:  '#2a5ebf',
    food:      '#f72585',
    foodGlow:  'rgba(247,37,133,.8)',
    bonus:     '#ffd166',
    bonusGlow: 'rgba(255,209,102,.8)',
    wall:      '#1a1e2a',
    text:      '#e2e8f0',
    muted:     '#6b7a99',
  };

  let snake, dir, nextDir, food, bonus, score, best, level,
      speed, state, frameId, tick, bonusTimer;

  // state: 'idle' | 'running' | 'paused' | 'dead'

  function rnd(max) { return Math.floor(Math.random() * max); }

  function freeCell() {
    const occupied = new Set(snake.map(s => s.x + ',' + s.y));
    let c;
    do { c = { x: rnd(COLS), y: rnd(ROWS) }; }
    while (occupied.has(c.x + ',' + c.y));
    return c;
  }

  function spawnFood() {
    food = freeCell();
    food.anim = 0;
  }

  function spawnBonus() {
    if (bonus) return;
    bonus = freeCell();
    bonus.anim = 0;
    bonusTimer = 120 + rnd(60); // frames until it disappears
  }

  function init() {
    snake = [
      { x: 8, y: 8 },
      { x: 7, y: 8 },
      { x: 6, y: 8 },
    ];
    dir = nextDir = { x: 1, y: 0 };
    score = 0;
    level = 1;
    speed = 130;
    bonus = null;
    bonusTimer = 0;
    tick = 0;
    best = parseInt(localStorage.getItem('snake_best') || '0');
    spawnFood();
    updateHUD();
  }

  function updateHUD() {
    scoreDisp.textContent = score;
    bestDisp.textContent  = best;
    levelDisp.textContent = level;
  }

  function setOverlay(show, title, sub, sc) {
    overlay.classList.toggle('hidden', !show);
    if (title !== undefined) titleEl.textContent = title;
    if (sub   !== undefined) subEl.textContent   = sub;
    if (sc !== undefined) {
      scoreEl.style.display = 'block';
      scoreEl.textContent = 'Score: ' + sc;
    } else {
      scoreEl.style.display = 'none';
    }
  }

  function start() {
    init();
    state = 'running';
    setOverlay(false);
    schedule();
  }

  function pause() {
    if (state !== 'running' && state !== 'paused') return;
    if (state === 'running') {
      state = 'paused';
      cancelAnimationFrame(frameId);
      setOverlay(true, '⏸ PAUSED', 'Press P or Space to resume');
    } else {
      state = 'running';
      setOverlay(false);
      lastTime = performance.now();
      schedule();
    }
  }

  let lastTime = 0, accum = 0;

  function schedule() {
    lastTime = performance.now();
    accum = 0;
    frameId = requestAnimationFrame(loop);
  }

  function loop(now) {
    if (state !== 'running') return;
    accum += now - lastTime;
    lastTime = now;
    if (accum >= speed) {
      accum -= speed;
      update();
    }
    draw();
    frameId = requestAnimationFrame(loop);
  }

  function update() {
    tick++;

    // Apply direction
    dir = nextDir;

    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    // Wall collision
    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
      die(); return;
    }

    // Self collision
    if (snake.some(s => s.x === head.x && s.y === head.y)) {
      die(); return;
    }

    snake.unshift(head);

    // Eat food
    if (head.x === food.x && head.y === food.y) {
      score += 10 * level;
      if (score > best) { best = score; localStorage.setItem('snake_best', best); }
      level = Math.floor(score / 80) + 1;
      speed = Math.max(55, 130 - (level - 1) * 12);
      spawnFood();
      updateHUD();
      if (score % 50 === 0 || (tick % 40 === 0 && !bonus)) spawnBonus();
    } else {
      snake.pop();
    }

    // Eat bonus
    if (bonus && head.x === bonus.x && head.y === bonus.y) {
      score += 30 * level;
      if (score > best) { best = score; localStorage.setItem('snake_best', best); }
      updateHUD();
      bonus = null;
    }

    // Bonus timer
    if (bonus) {
      food.anim = (food.anim + 1) % 60;
      bonus.anim = (bonus.anim + 1) % 60;
      bonusTimer--;
      if (bonusTimer <= 0) bonus = null;
    } else {
      food.anim = (food.anim + 1) % 60;
    }

    // Occasional bonus spawn
    if (!bonus && tick % 80 === 0) spawnBonus();
  }

  function die() {
    state = 'dead';
    cancelAnimationFrame(frameId);
    draw();
    setTimeout(() => {
      setOverlay(true, '💀 GAME OVER', 'Press Space to restart', score);
    }, 300);
  }

  /* ── DRAW ── */
  function drawCell(x, y, color, glow, radius) {
    const px = x * CELL + 1, py = y * CELL + 1;
    const sz = CELL - 2;
    const r = radius || 4;
    ctx.beginPath();
    ctx.roundRect(px, py, sz, sz, r);
    if (glow) {
      ctx.shadowBlur = 14;
      ctx.shadowColor = glow;
    }
    ctx.fillStyle = color;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  function drawPulse(x, y, color, glowColor, anim) {
    const pulse = Math.sin(anim * Math.PI / 30) * .12 + 1;
    const px = x * CELL + CELL / 2;
    const py = y * CELL + CELL / 2;
    ctx.save();
    ctx.translate(px, py);
    ctx.scale(pulse, pulse);
    ctx.translate(-px, -py);
    drawCell(x, y, color, glowColor, 6);
    ctx.restore();
  }

  function draw() {
    // Background
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = C.grid;
    ctx.lineWidth = .5;
    for (let c = 0; c <= COLS; c++) {
      ctx.beginPath(); ctx.moveTo(c * CELL, 0); ctx.lineTo(c * CELL, canvas.height); ctx.stroke();
    }
    for (let r = 0; r <= ROWS; r++) {
      ctx.beginPath(); ctx.moveTo(0, r * CELL); ctx.lineTo(canvas.width, r * CELL); ctx.stroke();
    }

    // Snake body
    for (let i = snake.length - 1; i >= 1; i--) {
      const t = i / snake.length;
      ctx.globalAlpha = Math.max(0.3, 1 - t * 0.6);
      drawCell(snake[i].x, snake[i].y, C.body, null, 4);
    }
    ctx.globalAlpha = 1;

    // Snake head
    drawCell(snake[0].x, snake[0].y, C.head, C.headGlow, 5);

    // Eyes
    const hx = snake[0].x * CELL, hy = snake[0].y * CELL;
    const eyeSize = 2.5;
    const eyeOffset = 4;
    ctx.fillStyle = '#000';
    if (dir.x === 1)  { ctx.fillRect(hx+CELL-6, hy+eyeOffset,   eyeSize, eyeSize); ctx.fillRect(hx+CELL-6, hy+CELL-eyeOffset-eyeSize, eyeSize, eyeSize); }
    if (dir.x === -1) { ctx.fillRect(hx+3,       hy+eyeOffset,   eyeSize, eyeSize); ctx.fillRect(hx+3,       hy+CELL-eyeOffset-eyeSize, eyeSize, eyeSize); }
    if (dir.y === -1) { ctx.fillRect(hx+eyeOffset, hy+3, eyeSize, eyeSize); ctx.fillRect(hx+CELL-eyeOffset-eyeSize, hy+3, eyeSize, eyeSize); }
    if (dir.y === 1)  { ctx.fillRect(hx+eyeOffset, hy+CELL-6, eyeSize, eyeSize); ctx.fillRect(hx+CELL-eyeOffset-eyeSize, hy+CELL-6, eyeSize, eyeSize); }

    // Food
    if (food) drawPulse(food.x, food.y, C.food, C.foodGlow, food.anim);

    // Bonus
    if (bonus) {
      const flash = bonusTimer < 30 ? (bonusTimer % 6 < 3) : true;
      if (flash) drawPulse(bonus.x, bonus.y, C.bonus, C.bonusGlow, bonus.anim);
    }

    // Death overlay flash
    if (state === 'dead') {
      ctx.fillStyle = 'rgba(247,37,133,.07)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  /* ── CONTROLS ── */
  const DIR = {
    ArrowUp:    { x: 0, y:-1 }, w: { x: 0, y:-1 }, W: { x: 0, y:-1 },
    ArrowDown:  { x: 0, y: 1 }, s: { x: 0, y: 1 }, S: { x: 0, y: 1 },
    ArrowLeft:  { x:-1, y: 0 }, a: { x:-1, y: 0 }, A: { x:-1, y: 0 },
    ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 }, D: { x: 1, y: 0 },
  };

  const gameSection = document.getElementById('game-section');

  document.addEventListener('keydown', e => {
    const newDir = DIR[e.key];
    if (newDir) {
      // Prevent reversing
      if (newDir.x !== -dir.x || newDir.y !== -dir.y) {
        nextDir = newDir;
      }
      // Prevent page scroll when game is in view
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
        const r = gameSection.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) e.preventDefault();
      }
    }
    if (e.key === ' ') {
      e.preventDefault();
      if (state === 'idle' || state === 'dead') start();
      else if (state === 'running' || state === 'paused') pause();
    }
    if (e.key === 'p' || e.key === 'P') pause();
  });

  // Touch support
  let touchStart = null;
  canvas.addEventListener('touchstart', e => { touchStart = e.touches[0]; e.preventDefault(); }, { passive: false });
  canvas.addEventListener('touchend', e => {
    if (!touchStart) return;
    const dx = e.changedTouches[0].clientX - touchStart.clientX;
    const dy = e.changedTouches[0].clientY - touchStart.clientY;
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      if (state === 'idle' || state === 'dead') start();
      else pause();
      return;
    }
    let newDir;
    if (Math.abs(dx) > Math.abs(dy)) {
      newDir = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
    } else {
      newDir = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
    }
    if (newDir.x !== -dir.x || newDir.y !== -dir.y) nextDir = newDir;
    touchStart = null;
    e.preventDefault();
  }, { passive: false });

  // Click overlay to start
  overlay.addEventListener('click', () => {
    if (state === 'idle' || state === 'dead') start();
    else pause();
  });

  /* ── BOOT ── */
  state = 'idle';
  dir = nextDir = { x: 1, y: 0 };
  snake = [{ x: 8, y: 8 }, { x: 7, y: 8 }, { x: 6, y: 8 }];
  food = { x: 12, y: 8, anim: 0 };
  score = 0; level = 1; tick = 0;
  best = parseInt(localStorage.getItem('snake_best') || '0');
  bestDisp.textContent = best;
  draw();
  setOverlay(true, '🐍 SNAKE', 'Press Space or click to start');

})();

/* ═══════════════════════ GAME TAB SWITCHER ═══════════════════════ */
function switchGame(name) {
  const order = ['snake', 'pong', 'sudoku'];
  document.querySelectorAll('.game-tab').forEach((btn, idx) => {
    btn.classList.toggle('active', idx === order.indexOf(name));
  });
  document.querySelectorAll('.game-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-' + name).classList.add('active');
}

/* ═══════════════════════════════════════════════
   PONG GAME
═══════════════════════════════════════════════ */
(function() {
  const canvas  = document.getElementById('pong-canvas');
  const ctx     = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  const overlay    = document.getElementById('pong-overlay');
  const titleEl    = document.getElementById('pong-overlay-title');
  const subEl      = document.getElementById('pong-overlay-sub');
  const scoreEl    = document.getElementById('pong-overlay-score');
  const aiScoreEl  = document.getElementById('pong-ai-score');
  const plScoreEl  = document.getElementById('pong-player-score');
  const winsEl     = document.getElementById('pong-wins');

  const PW = 10, PH = 70, BALL_R = 7;
  const WIN_SCORE = 7;

  const C = {
    bg:      '#030507',
    net:     'rgba(255,255,255,.06)',
    player:  '#4f8ef7',
    ai:      '#8b5cf6',
    ball:    '#06d6a0',
    ballGlow:'rgba(6,214,160,.8)',
    text:    '#e2e8f0',
    muted:   '#6b7a99',
    trail:   'rgba(6,214,160,.15)',
  };

  // State
  let pState = 'idle'; // idle | running | paused | scored | over
  let pAnimId, pLastTime;

  // Game objects
  let player, ai, ball, scores, wins, aiDiff, ballTrail;

  function initGame() {
    player = { x: W - PW - 12, y: H / 2 - PH / 2, dy: 0 };
    ai     = { x: 12, y: H / 2 - PH / 2 };
    ball   = newBall(1);
    scores = { player: 0, ai: 0 };
    wins   = parseInt(winsEl.textContent) || 0;
    aiDiff = 0.055 + wins * 0.008; // AI speed factor, increases with wins
    ballTrail = [];
    updateHUD();
  }

  function newBall(dir) {
    const angle = (Math.random() * 0.5 + 0.2) * (Math.random() > .5 ? 1 : -1);
    const spd = 4.5;
    return {
      x: W / 2, y: H / 2,
      vx: dir * spd * Math.cos(angle),
      vy: spd * Math.sin(angle),
      speed: spd,
    };
  }

  function updateHUD() {
    aiScoreEl.textContent = scores.ai;
    plScoreEl.textContent = scores.player;
    winsEl.textContent    = wins;
  }

  function showOverlay(show, title, sub, sc) {
    overlay.classList.toggle('hidden', !show);
    if (title !== undefined) titleEl.textContent = title;
    if (sub   !== undefined) subEl.textContent   = sub;
    if (sc    !== undefined) { scoreEl.style.display = 'block'; scoreEl.textContent = sc; }
    else scoreEl.style.display = 'none';
  }

  function startGame() {
    initGame();
    pState = 'running';
    showOverlay(false);
    pLastTime = performance.now();
    pAnimId = requestAnimationFrame(pLoop);
  }

  function pauseGame() {
    if (pState === 'running') {
      pState = 'paused';
      cancelAnimationFrame(pAnimId);
      showOverlay(true, '⏸ PAUSED', 'Press Space to resume');
    } else if (pState === 'paused') {
      pState = 'running';
      showOverlay(false);
      pLastTime = performance.now();
      pAnimId = requestAnimationFrame(pLoop);
    }
  }

  // Controls
  const keys = {};
  document.addEventListener('keydown', e => {
    keys[e.key] = true;
    if (e.key === ' ') {
      const panel = document.getElementById('panel-pong');
      if (!panel.classList.contains('active')) return;
      e.preventDefault();
      if (pState === 'idle' || pState === 'over') startGame();
      else if (pState === 'running' || pState === 'paused') pauseGame();
    }
  });
  document.addEventListener('keyup', e => { keys[e.key] = false; });

  // Mouse control
  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    const my = (e.clientY - r.top) * (H / r.height);
    player.y = Math.max(0, Math.min(H - PH, my - PH / 2));
  });

  // Touch control
  canvas.addEventListener('touchmove', e => {
    const r = canvas.getBoundingClientRect();
    const my = (e.touches[0].clientY - r.top) * (H / r.height);
    player.y = Math.max(0, Math.min(H - PH, my - PH / 2));
    e.preventDefault();
  }, { passive: false });

  canvas.addEventListener('click', () => {
    if (pState === 'idle' || pState === 'over') startGame();
    else pauseGame();
  });

  const PSPD = 5.5;

  function update(dt) {
    // Player keyboard
    if (keys['ArrowUp']   || keys['w'] || keys['W']) player.y = Math.max(0, player.y - PSPD);
    if (keys['ArrowDown'] || keys['s'] || keys['S']) player.y = Math.min(H - PH, player.y + PSPD);

    // AI — tracks ball with speed limit + imperfection
    const aiCenter = ai.y + PH / 2;
    const diff = ball.y - aiCenter;
    ai.y += diff * aiDiff * Math.min(dt / 16, 2.5);
    ai.y = Math.max(0, Math.min(H - PH, ai.y));

    // Ball trail
    ballTrail.push({ x: ball.x, y: ball.y });
    if (ballTrail.length > 10) ballTrail.shift();

    // Move ball
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Top/bottom bounce
    if (ball.y - BALL_R <= 0)     { ball.y = BALL_R;     ball.vy = Math.abs(ball.vy); }
    if (ball.y + BALL_R >= H)     { ball.y = H - BALL_R; ball.vy = -Math.abs(ball.vy); }

    // Player paddle collision
    if (
      ball.vx > 0 &&
      ball.x + BALL_R >= player.x &&
      ball.x - BALL_R <= player.x + PW &&
      ball.y + BALL_R >= player.y &&
      ball.y - BALL_R <= player.y + PH
    ) {
      ball.x = player.x - BALL_R;
      const hit = (ball.y - (player.y + PH / 2)) / (PH / 2);
      const angle = hit * Math.PI / 3.5;
      ball.speed = Math.min(ball.speed + 0.3, 10);
      ball.vx = -ball.speed * Math.cos(angle);
      ball.vy =  ball.speed * Math.sin(angle);
    }

    // AI paddle collision
    if (
      ball.vx < 0 &&
      ball.x - BALL_R <= ai.x + PW &&
      ball.x + BALL_R >= ai.x &&
      ball.y + BALL_R >= ai.y &&
      ball.y - BALL_R <= ai.y + PH
    ) {
      ball.x = ai.x + PW + BALL_R;
      const hit = (ball.y - (ai.y + PH / 2)) / (PH / 2);
      const angle = hit * Math.PI / 3.5;
      ball.speed = Math.min(ball.speed + 0.2, 10);
      ball.vx =  ball.speed * Math.cos(angle);
      ball.vy =  ball.speed * Math.sin(angle);
    }

    // Scoring
    if (ball.x > W + 20) { point('ai');     }
    else if (ball.x < -20) { point('player'); }
  }

  function point(who) {
    scores[who]++;
    updateHUD();
    if (scores.player >= WIN_SCORE || scores.ai >= WIN_SCORE) {
      pState = 'over';
      cancelAnimationFrame(pAnimId);
      const won = scores.player >= WIN_SCORE;
      if (won) wins++;
      winsEl.textContent = wins;
      draw();
      setTimeout(() => {
        showOverlay(true,
          won ? '🎉 YOU WIN!' : '🤖 AI WINS',
          'Press Space or click to play again',
          `${scores.player} : ${scores.ai}`
        );
      }, 400);
    } else {
      ball = newBall(who === 'player' ? -1 : 1);
      ballTrail = [];
    }
  }

  function pLoop(now) {
    if (pState !== 'running') return;
    const dt = now - pLastTime;
    pLastTime = now;
    update(dt);
    draw();
    pAnimId = requestAnimationFrame(pLoop);
  }

  function drawRect(x, y, w, h, color, glow) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 4);
    if (glow) { ctx.shadowBlur = 14; ctx.shadowColor = glow; }
    ctx.fillStyle = color;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  function draw() {
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);

    // Center net
    ctx.strokeStyle = C.net;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
    ctx.setLineDash([]);

    // Center circle
    ctx.strokeStyle = C.net;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(W / 2, H / 2, 40, 0, Math.PI * 2); ctx.stroke();

    // Ball trail
    ballTrail.forEach((p, i) => {
      const a = (i / ballTrail.length) * 0.4;
      const r = BALL_R * (i / ballTrail.length) * 0.7;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(6,214,160,${a})`;
      ctx.fill();
    });

    // Ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
    ctx.shadowBlur = 18; ctx.shadowColor = C.ballGlow;
    ctx.fillStyle = C.ball;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Paddles
    drawRect(player.x, player.y, PW, PH, C.player, 'rgba(79,142,247,.7)');
    drawRect(ai.x, ai.y, PW, PH, C.ai, 'rgba(139,92,246,.7)');

    // Score display on canvas
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,.12)';
    ctx.fillText(scores.ai,     W * .27, 50);
    ctx.fillText(scores.player, W * .73, 50);

    // Labels
    ctx.font = '11px monospace';
    ctx.fillStyle = C.muted;
    ctx.fillText('AI', W * .27, 68);
    ctx.fillText('YOU', W * .73, 68);
  }

  // Init idle state
  pState = 'idle';
  player = { x: W - PW - 12, y: H / 2 - PH / 2 };
  ai     = { x: 12, y: H / 2 - PH / 2 };
  ball   = newBall(1);
  scores = { player: 0, ai: 0 };
  wins   = 0;
  ballTrail = [];
  draw();
  showOverlay(true, '🏓 PONG', 'Press Space or click to start');

})();

/* ═══════════════════════════════════════════════
   SUDOKU
═══════════════════════════════════════════════ */
(function() {
  /* ── Puzzle generator using backtracking ── */
  function emptyGrid()  { return Array.from({length:81}, () => 0); }

  function isValid(g, idx, val) {
    const row = Math.floor(idx / 9), col = idx % 9;
    const boxR = Math.floor(row / 3) * 3, boxC = Math.floor(col / 3) * 3;
    for (let i = 0; i < 9; i++) {
      if (g[row * 9 + i] === val) return false;
      if (g[i * 9 + col] === val) return false;
      if (g[(boxR + Math.floor(i / 3)) * 9 + boxC + (i % 3)] === val) return false;
    }
    return true;
  }

  function solve(g) {
    const idx = g.indexOf(0);
    if (idx === -1) return true;
    const nums = [1,2,3,4,5,6,7,8,9].sort(() => Math.random() - .5);
    for (const n of nums) {
      if (isValid(g, idx, n)) {
        g[idx] = n;
        if (solve(g)) return true;
        g[idx] = 0;
      }
    }
    return false;
  }

  function generatePuzzle(clues) {
    const solution = emptyGrid();
    solve(solution);
    const puzzle = solution.slice();
    let toRemove = 81 - clues;
    const positions = [...Array(81).keys()].sort(() => Math.random() - .5);
    for (const pos of positions) {
      if (toRemove === 0) break;
      puzzle[pos] = 0;
      toRemove--;
    }
    return { puzzle, solution };
  }

  /* ── Difficulty clue counts ── */
  const DIFF_CLUES = { easy: 45, medium: 35, hard: 26 };

  /* ── State ── */
  let grid, solution, given, selected, diff, timerSec, timerInterval, hintsLeft;

  function init(d) {
    diff = d || diff || 'easy';
    const { puzzle, solution: sol } = generatePuzzle(DIFF_CLUES[diff]);
    grid     = puzzle.slice();
    solution = sol;
    given    = puzzle.map(v => v !== 0);
    selected = -1;
    hintsLeft = 3;
    clearInterval(timerInterval);
    timerSec = 0;
    updateTimer();
    timerInterval = setInterval(() => { timerSec++; updateTimer(); }, 1000);
    render();
    setStatus('Select a cell to begin');
  }

  function updateTimer() {
    const m = Math.floor(timerSec / 60), s = timerSec % 60;
    document.getElementById('sudoku-timer').textContent = m + ':' + String(s).padStart(2,'0');
  }

  /* ── Render ── */
  function render() {
    const board = document.getElementById('sudoku-board');
    board.innerHTML = '';
    for (let i = 0; i < 81; i++) {
      const cell = document.createElement('div');
      cell.className = 'sudoku-cell';
      if (given[i])    cell.classList.add('given');
      if (i === selected) cell.classList.add('selected');
      if (!given[i] && grid[i] !== 0 && grid[i] !== solution[i]) cell.classList.add('error');
      cell.textContent = grid[i] || '';
      cell.addEventListener('click', () => { selected = i; render(); });
      board.appendChild(cell);
    }
  }

  function setStatus(msg) {
    document.getElementById('sudoku-status').textContent = msg;
  }

  /* ── Input ── */
  window.sudokuInput = function(val) {
    if (selected === -1 || given[selected]) return;
    grid[selected] = val;
    render();
    checkWin();
  };

  window.sudokuHint = function() {
    if (hintsLeft <= 0) { setStatus('No hints left!'); return; }
    const empties = [];
    for (let i = 0; i < 81; i++) if (!given[i] && grid[i] !== solution[i]) empties.push(i);
    if (empties.length === 0) { setStatus('Board is already correct!'); return; }
    const idx = empties[Math.floor(Math.random() * empties.length)];
    grid[idx] = solution[idx];
    given[idx] = true; // treat as given so it can't be overwritten
    hintsLeft--;
    render();
    // Flash hint cell
    const cells = document.querySelectorAll('.sudoku-cell');
    cells[idx].classList.add('hint');
    setStatus(`Hint used! ${hintsLeft} remaining.`);
    checkWin();
  };

  window.sudokuValidate = function() {
    let errors = 0;
    for (let i = 0; i < 81; i++) {
      if (!given[i] && grid[i] !== 0 && grid[i] !== solution[i]) errors++;
    }
    if (errors === 0) setStatus(isComplete() ? '✅ Solved!' : '✅ Everything correct so far!');
    else setStatus(`❌ ${errors} mistake${errors > 1 ? 's' : ''} found.`);
  };

  window.sudokuNew = function() { init(diff); };

  window.sudokuSetDiff = function(d) {
    document.querySelectorAll('.sudoku-difficulty button').forEach(b => {
      b.classList.toggle('active', b.textContent.toLowerCase() === d);
    });
    init(d);
  };

  function isComplete() {
    return grid.every((v, i) => v === solution[i]);
  }

  function checkWin() {
    if (isComplete()) {
      clearInterval(timerInterval);
      const m = Math.floor(timerSec / 60), s = timerSec % 60;
      setStatus(`🎉 Solved in ${m}:${String(s).padStart(2,'0')}! Excellent!`);
    }
  }

  /* ── Keyboard input ── */
  document.addEventListener('keydown', e => {
    const panel = document.getElementById('panel-sudoku');
    if (!panel.classList.contains('active')) return;
    if (selected === -1) return;
    // Arrow navigation works on any cell (given or not)
    const moves = { ArrowUp: -9, ArrowDown: 9, ArrowLeft: -1, ArrowRight: 1 };
    if (moves[e.key] !== undefined) {
      const next = selected + moves[e.key];
      if (next >= 0 && next < 81) { selected = next; render(); }
      e.preventDefault();
      return;
    }
    // Digit / erase only on non-given cells
    if (given[selected]) return;
    if (e.key >= '1' && e.key <= '9') { sudokuInput(parseInt(e.key)); e.preventDefault(); }
    if (e.key === '0' || e.key === 'Backspace' || e.key === 'Delete') { sudokuInput(0); e.preventDefault(); }
  });

  /* ── Boot ── */
  init('easy');
})();