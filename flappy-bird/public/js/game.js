// ===== Game Engine - Bird physics, pipes, rendering, collision =====

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const CANVAS_W = 400;
const CANVAS_H = 600;

// Game constants
const GRAVITY = 0.25;
const FLAP_FORCE = -5;
const PIPE_WIDTH = 60;
const PIPE_GAP = 170;
const PIPE_SPEED = 2;
const PIPE_SPAWN_INTERVAL = 120;
const BIRD_RADIUS = 15;

// Game state
let bird, pipes, score, frameCount, gameState, animFrameId;
let currentUser = null;

function resetGame() {
    bird = { x: 80, y: 300, velocity: 0 };
    pipes = [];
    score = 0;
    frameCount = 0;
    gameState = 'idle';
    document.getElementById('current-score').textContent = '0';
    document.getElementById('game-instructions').style.display = 'block';
}

function startGameForUser(username) {
    currentUser = username;
    document.getElementById('user-info').textContent = username;
    const data = loadData();
    document.getElementById('best-score').textContent = data.users[username].highScore;
    showScreen('game');
    resetGame();
    if (animFrameId) cancelAnimationFrame(animFrameId);
    gameLoop();
}

function flap() {
    if (gameState === 'idle') {
        gameState = 'playing';
        document.getElementById('game-instructions').style.display = 'none';
    }
    if (gameState === 'playing') {
        bird.velocity = FLAP_FORCE;
    }
}

// Input handlers
canvas.addEventListener('click', flap);
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); flap(); });
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && screens.game.classList.contains('active')) {
        e.preventDefault();
        flap();
    }
});

function spawnPipe() {
    const minTop = 80;
    const maxTop = CANVAS_H - PIPE_GAP - 80;
    const topHeight = Math.random() * (maxTop - minTop) + minTop;
    pipes.push({ x: CANVAS_W, topHeight, scored: false });
}

function circleRectCollision(cx, cy, cr, rx, ry, rw, rh) {
    const closestX = Math.max(rx, Math.min(cx, rx + rw));
    const closestY = Math.max(ry, Math.min(cy, ry + rh));
    const dx = cx - closestX;
    const dy = cy - closestY;
    return (dx * dx + dy * dy) < (cr * cr);
}

function update() {
    if (gameState !== 'playing') return;

    bird.velocity += GRAVITY;
    bird.y += bird.velocity;

    frameCount++;
    if (frameCount % PIPE_SPAWN_INTERVAL === 0) {
        spawnPipe();
    }

    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= PIPE_SPEED;
        if (pipes[i].x + PIPE_WIDTH < 0) {
            pipes.splice(i, 1);
            continue;
        }

        // Scoring
        if (!pipes[i].scored && pipes[i].x + PIPE_WIDTH < bird.x - BIRD_RADIUS) {
            pipes[i].scored = true;
            score++;
            document.getElementById('current-score').textContent = score;
        }

        // Collision with pipes
        if (circleRectCollision(bird.x, bird.y, BIRD_RADIUS,
            pipes[i].x, 0, PIPE_WIDTH, pipes[i].topHeight) ||
            circleRectCollision(bird.x, bird.y, BIRD_RADIUS,
            pipes[i].x, pipes[i].topHeight + PIPE_GAP, PIPE_WIDTH, CANVAS_H - pipes[i].topHeight - PIPE_GAP)) {
            endGame();
            return;
        }
    }

    // Floor and ceiling collision
    if (bird.y + BIRD_RADIUS >= CANVAS_H || bird.y - BIRD_RADIUS <= 0) {
        endGame();
        return;
    }
}

function draw() {
    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, CANVAS_W, CANVAS_H);
    grad.addColorStop(0, '#0f0c29');
    grad.addColorStop(0.5, '#302b63');
    grad.addColorStop(1, '#24243e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Ground line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_H - 1);
    ctx.lineTo(CANVAS_W, CANVAS_H - 1);
    ctx.stroke();

    // Pipes
    for (const pipe of pipes) {
        // Top pipe
        ctx.fillStyle = '#4ecca3';
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
        ctx.fillStyle = '#38a882';
        ctx.fillRect(pipe.x - 4, pipe.topHeight - 24, PIPE_WIDTH + 8, 24);

        // Bottom pipe
        const bottomY = pipe.topHeight + PIPE_GAP;
        ctx.fillStyle = '#4ecca3';
        ctx.fillRect(pipe.x, bottomY, PIPE_WIDTH, CANVAS_H - bottomY);
        ctx.fillStyle = '#38a882';
        ctx.fillRect(pipe.x - 4, bottomY, PIPE_WIDTH + 8, 24);
    }

    // Bird
    const birdBob = gameState === 'idle' ? Math.sin(Date.now() / 300) * 8 : 0;
    const by = bird.y + birdBob;

    // Bird body
    ctx.fillStyle = '#f0a500';
    ctx.beginPath();
    ctx.arc(bird.x, by, BIRD_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // Bird eye
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(bird.x + 7, by - 5, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(bird.x + 9, by - 5, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Bird beak
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.moveTo(bird.x + BIRD_RADIUS, by);
    ctx.lineTo(bird.x + BIRD_RADIUS + 10, by + 3);
    ctx.lineTo(bird.x + BIRD_RADIUS, by + 6);
    ctx.closePath();
    ctx.fill();

    // Wing
    const wingFlap = Math.sin(Date.now() / 100) * 4;
    ctx.fillStyle = '#d4940a';
    ctx.beginPath();
    ctx.ellipse(bird.x - 5, by + 2 + wingFlap, 10, 5, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Score on canvas
    if (gameState === 'playing') {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 48px Segoe UI, Tahoma, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 10;
        ctx.fillText(score, CANVAS_W / 2, 70);
        ctx.shadowBlur = 0;
    }
}

function gameLoop() {
    update();
    draw();
    animFrameId = requestAnimationFrame(gameLoop);
}

function endGame() {
    gameState = 'gameover';
    cancelAnimationFrame(animFrameId);
    animFrameId = null;

    const data = loadData();
    const user = data.users[currentUser];
    const isNewRecord = score > user.highScore;
    if (isNewRecord) {
        user.highScore = score;
        saveData(data);
    }

    document.getElementById('final-score').textContent = score;
    document.getElementById('final-best').textContent = 'שיא אישי: ' + user.highScore;
    document.getElementById('new-record').style.display = isNewRecord ? 'block' : 'none';
    document.getElementById('best-score').textContent = user.highScore;

    renderLeaderboard(data);
    showScreen('gameover');
}

function renderLeaderboard(data) {
    const entries = Object.entries(data.users)
        .map(([name, u]) => ({ name, score: u.highScore }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

    const tbody = document.getElementById('leaderboard-body');
    tbody.innerHTML = entries.map((entry, i) =>
        `<tr class="${entry.name === currentUser ? 'current-user' : ''}">
            <td>${i + 1}</td>
            <td>${entry.name}</td>
            <td>${entry.score}</td>
        </tr>`
    ).join('');
}
