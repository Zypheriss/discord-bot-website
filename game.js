const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startGame');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');

let bird = {
    x: 50,
    y: canvas.height / 2,
    velocity: 0,
    gravity: 0.5,
    jump: -8,
    size: 20
};

let pipes = [];
let score = 0;
let highScore = localStorage.getItem('flappyHighScore') || 0;
let gameLoop;
let isGameRunning = false;

const pipeWidth = 50;
const pipeGap = 150;
const pipeSpeed = 2;

function drawBird() {
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(bird.x, bird.y, bird.size, 0, Math.PI * 2);
    ctx.fill();
}

function createPipe() {
    const minHeight = 50;
    const maxHeight = canvas.height - pipeGap - minHeight;
    const height = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);

    pipes.push({
        x: canvas.width,
        height: height,
        passed: false
    });
}

function drawPipes() {
    ctx.fillStyle = '#4CAF50';
    pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.height);
        ctx.fillRect(pipe.x, pipe.height + pipeGap, pipeWidth, canvas.height - pipe.height - pipeGap);
    });
}

function updatePipes() {
    pipes.forEach(pipe => {
        pipe.x -= pipeSpeed;

        if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
            score++;
            scoreElement.textContent = score;
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('flappyHighScore', highScore);
                highScoreElement.textContent = highScore;
            }
            pipe.passed = true;
        }
    });

    pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);

    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 300) {
        createPipe();
    }
}

function checkCollision() {
    return pipes.some(pipe => {
        if (bird.x + bird.size > pipe.x && bird.x - bird.size < pipe.x + pipeWidth &&
            bird.y - bird.size < pipe.height) {
            return true;
        }
        if (bird.x + bird.size > pipe.x && bird.x - bird.size < pipe.x + pipeWidth &&
            bird.y + bird.size > pipe.height + pipeGap) {
            return true;
        }
        return false;
    });
}

function gameOver() {
    isGameRunning = false;
    cancelAnimationFrame(gameLoop);
    startBtn.style.display = 'block';
}

function update() {
    if (!isGameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    if (bird.y + bird.size > canvas.height || bird.y - bird.size < 0 || checkCollision()) {
        gameOver();
        return;
    }

    updatePipes();
    drawPipes();
    drawBird();

    gameLoop = requestAnimationFrame(update);
}

function jump() {
    if (isGameRunning) {
        bird.velocity = bird.jump;
    }
}

function startGame() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    scoreElement.textContent = '0';
    highScoreElement.textContent = highScore;

    isGameRunning = true;
    startBtn.style.display = 'none';
    update();
}

startBtn.addEventListener('click', startGame);
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (!isGameRunning) {
            startGame();
        } else {
            jump();
        }
    }
});
canvas.addEventListener('click', () => {
    if (isGameRunning) {
        jump();
    }
});