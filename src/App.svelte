<script>
  import { onMount } from 'svelte';

  // Game state
  let canvas;
  let ctx;
  let gameRunning = $state(false);
  let gameOver = $state(false);
  let score = $state(0);
  let highScore = $state(parseInt(localStorage.getItem('catMouseHighScore') || '0'));
  let level = $state(1);
  let timeLeft = $state(30);
  let combo = $state(0);
  let showCombo = $state(false);
  let comboX = $state(0);
  let comboY = $state(0);

  // Canvas dimensions
  let W = $state(0);
  let H = $state(0);

  // Cat (player)
  let cat = { x: 0, y: 0, size: 40, speed: 4, targetX: 0, targetY: 0 };

  // Mice
  let mice = [];
  const MOUSE_SIZE = 28;

  // Particles for catch effect
  let particles = [];

  // Grass tufts (decoration)
  let grassTufts = [];

  // Touch/mouse tracking
  let pointerDown = false;
  let pointerX = 0;
  let pointerY = 0;

  // Timer
  let timerInterval;
  let animFrame;

  function initGame() {
    score = 0;
    level = 1;
    timeLeft = 30;
    combo = 0;
    gameOver = false;
    gameRunning = true;
    particles = [];

    cat.x = W / 2;
    cat.y = H / 2;
    cat.targetX = W / 2;
    cat.targetY = H / 2;
    cat.speed = 4;

    spawnMice();
    generateGrass();

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (gameRunning && !gameOver) {
        timeLeft--;
        if (timeLeft <= 0) {
          endGame();
        }
      }
    }, 1000);

    if (animFrame) cancelAnimationFrame(animFrame);
    gameLoop();
  }

  function generateGrass() {
    grassTufts = [];
    for (let i = 0; i < 40; i++) {
      grassTufts.push({
        x: Math.random() * W,
        y: Math.random() * H,
        size: 4 + Math.random() * 8,
        shade: Math.random() * 0.3
      });
    }
  }

  function spawnMice() {
    mice = [];
    const count = 3 + Math.floor(level * 0.5);
    for (let i = 0; i < count; i++) {
      spawnMouse();
    }
  }

  function spawnMouse() {
    const margin = 50;
    let mx, my;
    do {
      mx = margin + Math.random() * (W - margin * 2);
      my = margin + Math.random() * (H - margin * 2);
    } while (dist(mx, my, cat.x, cat.y) < 120);

    mice.push({
      x: mx,
      y: my,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      angle: Math.random() * Math.PI * 2,
      changeTimer: Math.random() * 120,
      scared: false,
      speed: 1.2 + level * 0.15,
      tailWag: 0
    });
  }

  function dist(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }

  function endGame() {
    gameOver = true;
    gameRunning = false;
    if (timerInterval) clearInterval(timerInterval);
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('catMouseHighScore', String(highScore));
    }
  }

  function updateCat() {
    if (pointerDown) {
      cat.targetX = pointerX;
      cat.targetY = pointerY;
    }

    const dx = cat.targetX - cat.x;
    const dy = cat.targetY - cat.y;
    const d = Math.sqrt(dx * dx + dy * dy);

    if (d > 2) {
      const speed = Math.min(cat.speed, d * 0.15);
      cat.x += (dx / d) * speed;
      cat.y += (dy / d) * speed;
    }

    cat.x = Math.max(cat.size / 2, Math.min(W - cat.size / 2, cat.x));
    cat.y = Math.max(cat.size / 2, Math.min(H - cat.size / 2, cat.y));
  }

  function updateMice() {
    const catchDist = (cat.size + MOUSE_SIZE) / 2;

    for (let i = mice.length - 1; i >= 0; i--) {
      const m = mice[i];
      const dToCat = dist(m.x, m.y, cat.x, cat.y);
      m.scared = dToCat < 150;

      if (m.scared) {
        const fleeX = m.x - cat.x;
        const fleeY = m.y - cat.y;
        const fleeDist = Math.sqrt(fleeX * fleeX + fleeY * fleeY);
        if (fleeDist > 0) {
          m.vx += (fleeX / fleeDist) * 0.5;
          m.vy += (fleeY / fleeDist) * 0.5;
        }
      } else {
        m.changeTimer--;
        if (m.changeTimer <= 0) {
          m.angle += (Math.random() - 0.5) * 2;
          m.changeTimer = 40 + Math.random() * 80;
        }
        m.vx += Math.cos(m.angle) * 0.1;
        m.vy += Math.sin(m.angle) * 0.1;
      }

      const maxSpeed = m.scared ? m.speed * 1.8 : m.speed;
      const spd = Math.sqrt(m.vx * m.vx + m.vy * m.vy);
      if (spd > maxSpeed) {
        m.vx = (m.vx / spd) * maxSpeed;
        m.vy = (m.vy / spd) * maxSpeed;
      }

      m.x += m.vx;
      m.y += m.vy;
      m.tailWag += 0.2;

      if (m.x < MOUSE_SIZE) { m.x = MOUSE_SIZE; m.vx *= -1; }
      if (m.x > W - MOUSE_SIZE) { m.x = W - MOUSE_SIZE; m.vx *= -1; }
      if (m.y < MOUSE_SIZE) { m.y = MOUSE_SIZE; m.vy *= -1; }
      if (m.y > H - MOUSE_SIZE) { m.y = H - MOUSE_SIZE; m.vy *= -1; }

      if (dToCat < catchDist) {
        combo++;
        const points = 10 * combo;
        score += points;

        showCombo = true;
        comboX = m.x;
        comboY = m.y;
        setTimeout(() => { showCombo = false; }, 600);

        for (let p = 0; p < 8; p++) {
          particles.push({
            x: m.x,
            y: m.y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            life: 30,
            color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#FFF'][Math.floor(Math.random() * 4)]
          });
        }

        mice.splice(i, 1);

        setTimeout(() => {
          if (gameRunning && !gameOver) {
            spawnMouse();
          }
        }, 800);

        if (score > 0 && score % 50 === 0) {
          level++;
          cat.speed = Math.min(7, 4 + level * 0.3);
          timeLeft = Math.min(timeLeft + 5, 30);
        }
      }
    }
  }

  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1;
      p.life--;
      if (p.life <= 0) {
        particles.splice(i, 1);
      }
    }
  }

  function drawGrass() {
    for (const g of grassTufts) {
      ctx.fillStyle = `rgba(34, ${100 + g.shade * 60 | 0}, 46, 0.6)`;
      ctx.beginPath();
      ctx.ellipse(g.x, g.y, g.size, g.size * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawCat(x, y, size) {
    const s = size;

    // Body
    ctx.fillStyle = '#FF8C42';
    ctx.beginPath();
    ctx.ellipse(x, y + 2, s * 0.45, s * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.arc(x, y - s * 0.2, s * 0.32, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.beginPath();
    ctx.moveTo(x - s * 0.25, y - s * 0.35);
    ctx.lineTo(x - s * 0.1, y - s * 0.6);
    ctx.lineTo(x - s * 0.02, y - s * 0.35);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + s * 0.25, y - s * 0.35);
    ctx.lineTo(x + s * 0.1, y - s * 0.6);
    ctx.lineTo(x + s * 0.02, y - s * 0.35);
    ctx.fill();

    // Inner ears
    ctx.fillStyle = '#FFB5B5';
    ctx.beginPath();
    ctx.moveTo(x - s * 0.2, y - s * 0.37);
    ctx.lineTo(x - s * 0.11, y - s * 0.52);
    ctx.lineTo(x - s * 0.05, y - s * 0.37);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + s * 0.2, y - s * 0.37);
    ctx.lineTo(x + s * 0.11, y - s * 0.52);
    ctx.lineTo(x + s * 0.05, y - s * 0.37);
    ctx.fill();

    // Stripes on head
    ctx.strokeStyle = '#E07030';
    ctx.lineWidth = 1.5;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(x + i * s * 0.1, y - s * 0.45);
      ctx.lineTo(x + i * s * 0.12, y - s * 0.3);
      ctx.stroke();
    }

    // Eyes
    ctx.fillStyle = '#2D2D2D';
    ctx.beginPath();
    ctx.ellipse(x - s * 0.12, y - s * 0.22, s * 0.05, s * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + s * 0.12, y - s * 0.22, s * 0.05, s * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye shine
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(x - s * 0.1, y - s * 0.24, s * 0.02, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + s * 0.14, y - s * 0.24, s * 0.02, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.fillStyle = '#FF6B8A';
    ctx.beginPath();
    ctx.moveTo(x, y - s * 0.12);
    ctx.lineTo(x - s * 0.04, y - s * 0.08);
    ctx.lineTo(x + s * 0.04, y - s * 0.08);
    ctx.fill();

    // Mouth
    ctx.strokeStyle = '#2D2D2D';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y - s * 0.08);
    ctx.lineTo(x, y - s * 0.03);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x - s * 0.05, y - s * 0.01, s * 0.05, -0.3, Math.PI * 0.3);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + s * 0.05, y - s * 0.01, s * 0.05, Math.PI * 0.7, Math.PI + 0.3);
    ctx.stroke();

    // Whiskers
    ctx.strokeStyle = '#2D2D2D';
    ctx.lineWidth = 0.8;
    for (let side = -1; side <= 1; side += 2) {
      for (let w = -1; w <= 1; w++) {
        ctx.beginPath();
        ctx.moveTo(x + side * s * 0.15, y - s * 0.1 + w * s * 0.04);
        ctx.lineTo(x + side * s * 0.4, y - s * 0.12 + w * s * 0.06);
        ctx.stroke();
      }
    }

    // Tail
    ctx.strokeStyle = '#FF8C42';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const tailTime = Date.now() / 300;
    ctx.moveTo(x + s * 0.35, y + s * 0.15);
    ctx.quadraticCurveTo(
      x + s * 0.6 + Math.sin(tailTime) * 8,
      y - s * 0.1,
      x + s * 0.5 + Math.sin(tailTime + 1) * 10,
      y - s * 0.35
    );
    ctx.stroke();
  }

  function drawMouse(m) {
    const s = MOUSE_SIZE;
    const angle = Math.atan2(m.vy, m.vx);

    ctx.save();
    ctx.translate(m.x, m.y);
    ctx.rotate(angle);

    // Body
    ctx.fillStyle = m.scared ? '#A0A0A0' : '#808080';
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.4, s * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.ellipse(s * 0.3, 0, s * 0.2, s * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.fillStyle = '#FFB5B5';
    ctx.beginPath();
    ctx.arc(s * 0.25, -s * 0.18, s * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(s * 0.25, s * 0.18, s * 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    ctx.fillStyle = m.scared ? '#FF0000' : '#111';
    ctx.beginPath();
    ctx.arc(s * 0.38, -s * 0.05, s * 0.04, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.fillStyle = '#FFB5B5';
    ctx.beginPath();
    ctx.arc(s * 0.48, 0, s * 0.03, 0, Math.PI * 2);
    ctx.fill();

    // Tail
    ctx.strokeStyle = '#B0B0B0';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-s * 0.4, 0);
    ctx.quadraticCurveTo(
      -s * 0.6, Math.sin(m.tailWag) * s * 0.2,
      -s * 0.75, Math.sin(m.tailWag + 0.5) * s * 0.15
    );
    ctx.stroke();

    // Scared indicator
    if (m.scared) {
      ctx.fillStyle = '#FFF';
      ctx.font = `${s * 0.4}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('!', 0, -s * 0.35);
    }

    ctx.restore();
  }

  function drawParticles() {
    for (const p of particles) {
      const alpha = p.life / 30;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function draw() {
    if (!ctx) return;

    ctx.fillStyle = '#2a7a3a';
    ctx.fillRect(0, 0, W, H);

    drawGrass();

    for (const m of mice) {
      drawMouse(m);
    }

    drawCat(cat.x, cat.y, cat.size);
    drawParticles();
  }

  function gameLoop() {
    if (!gameRunning || gameOver) return;

    updateCat();
    updateMice();
    updateParticles();
    draw();

    animFrame = requestAnimationFrame(gameLoop);
  }

  function handlePointerDown(e) {
    if (!gameRunning) return;
    e.preventDefault();
    pointerDown = true;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    pointerX = touch.clientX - rect.left;
    pointerY = touch.clientY - rect.top;
    cat.targetX = pointerX;
    cat.targetY = pointerY;
  }

  function handlePointerMove(e) {
    if (!gameRunning || !pointerDown) return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    pointerX = touch.clientX - rect.left;
    pointerY = touch.clientY - rect.top;
    cat.targetX = pointerX;
    cat.targetY = pointerY;
  }

  function handlePointerUp() {
    pointerDown = false;
  }

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    if (canvas) {
      canvas.width = W;
      canvas.height = H;
    }
  }

  onMount(() => {
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      if (timerInterval) clearInterval(timerInterval);
      if (animFrame) cancelAnimationFrame(animFrame);
    };
  });
</script>

<div class="game-container">
  <canvas
    bind:this={canvas}
    ontouchstart={handlePointerDown}
    ontouchmove={handlePointerMove}
    ontouchend={handlePointerUp}
    onmousedown={handlePointerDown}
    onmousemove={handlePointerMove}
    onmouseup={handlePointerUp}
  ></canvas>

  {#if gameRunning && !gameOver}
    <div class="hud">
      <div class="hud-left">
        <div class="score">Poang: {score}</div>
        <div class="level">Niva {level}</div>
      </div>
      <div class="hud-right">
        <div class="timer" class:urgent={timeLeft <= 10}>
          {timeLeft}s
        </div>
      </div>
    </div>

    {#if showCombo && combo > 1}
      <div class="combo-popup" style="left: {comboX}px; top: {comboY - 40}px">
        x{combo} Combo!
      </div>
    {/if}
  {/if}

  {#if !gameRunning && !gameOver}
    <div class="menu">
      <div class="title-area">
        <div class="title-emoji">🐱</div>
        <h1>Katt & Mus</h1>
        <p class="subtitle">Fanga sa manga moss du kan!</p>
      </div>
      <button class="play-btn" onclick={initGame}>
        Spela
      </button>
      {#if highScore > 0}
        <div class="high-score">Rekord: {highScore}</div>
      {/if}
      <div class="instructions">
        <p>Tryck och dra for att styra katten</p>
        <p>Fanga mossen innan tiden tar slut!</p>
      </div>
    </div>
  {/if}

  {#if gameOver}
    <div class="menu">
      <div class="title-area">
        <div class="title-emoji">{score >= highScore && score > 0 ? '🏆' : '🐱'}</div>
        <h1>Spelet slut!</h1>
        <div class="final-score">{score} poang</div>
        {#if score >= highScore && score > 0}
          <div class="new-record">Nytt rekord!</div>
        {/if}
      </div>
      <button class="play-btn" onclick={initGame}>
        Spela igen
      </button>
      <div class="high-score">Rekord: {highScore}</div>
    </div>
  {/if}
</div>

<style>
  .game-container {
    width: 100%;
    height: 100vh;
    height: 100dvh;
    position: relative;
    overflow: hidden;
    background: #1a472a;
  }

  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }

  .hud {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    padding: 12px 16px;
    padding-top: max(12px, env(safe-area-inset-top));
    pointer-events: none;
  }

  .score {
    font-size: 22px;
    font-weight: 700;
    color: #FFD700;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  }

  .level {
    font-size: 14px;
    color: #90EE90;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
  }

  .timer {
    font-size: 28px;
    font-weight: 700;
    color: #FFF;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
    text-align: right;
  }

  .timer.urgent {
    color: #FF4444;
    animation: pulse 0.5s ease-in-out infinite alternate;
  }

  @keyframes pulse {
    from { transform: scale(1); }
    to { transform: scale(1.15); }
  }

  .combo-popup {
    position: absolute;
    transform: translateX(-50%);
    font-size: 24px;
    font-weight: 700;
    color: #FFD700;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
    pointer-events: none;
    animation: comboFloat 0.6s ease-out forwards;
  }

  @keyframes comboFloat {
    0% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
    100% { opacity: 0; transform: translateX(-50%) translateY(-40px) scale(1.3); }
  }

  .menu {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    gap: 20px;
    padding: 24px;
  }

  .title-area {
    text-align: center;
  }

  .title-emoji {
    font-size: 72px;
    line-height: 1;
    margin-bottom: 8px;
  }

  h1 {
    font-size: 36px;
    color: #FFD700;
    text-shadow: 2px 2px 8px rgba(0,0,0,0.5);
    margin: 0;
  }

  .subtitle {
    font-size: 16px;
    color: #ccc;
    margin-top: 8px;
  }

  .play-btn {
    background: linear-gradient(135deg, #FF8C42, #FF6B2B);
    color: white;
    border: none;
    border-radius: 50px;
    padding: 16px 48px;
    font-size: 22px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(255, 107, 43, 0.4);
    transition: transform 0.15s;
    -webkit-tap-highlight-color: transparent;
  }

  .play-btn:active {
    transform: scale(0.95);
  }

  .final-score {
    font-size: 48px;
    font-weight: 700;
    color: #FFF;
    margin-top: 8px;
  }

  .new-record {
    font-size: 20px;
    color: #FFD700;
    animation: pulse 0.5s ease-in-out infinite alternate;
  }

  .high-score {
    font-size: 16px;
    color: #90EE90;
  }

  .instructions {
    text-align: center;
    color: #aaa;
    font-size: 14px;
    line-height: 1.6;
  }

  .instructions p {
    margin: 0;
  }
</style>
