const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
const currentScoreEl = document.getElementById('currentScore');
const bestScoreEl = document.getElementById('bestScore');

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('pauseBtn').addEventListener('click', togglePause);
document.getElementById('resetBtn').addEventListener('click', resetGame);

let activeParticles = [];
let currentScore = 0;
let isPaused = false;
let isRunning = false;
let animationLoopId;

const cursor = { x: canvas.width / 2, y: canvas.height / 2, interactionRadius: 15 };

let bestScore = localStorage.getItem('bestScore') || 0;
bestScoreEl.textContent = bestScore;

canvas.addEventListener('mousemove', (mouseEvent) => {
    const canvasRect = canvas.getBoundingClientRect();
    cursor.x = mouseEvent.clientX - canvasRect.left;
    cursor.y = mouseEvent.clientY - canvasRect.top;
});

class Particle {
    constructor(color, pointValue) {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.speedX = (Math.random() - 0.5) * 5;
        this.speedY = (Math.random() - 0.5) * 5;
        this.accelerationX = (Math.random() - 0.5) * 0.1;
        this.accelerationY = (Math.random() - 0.5) * 0.1;
        this.lifeTime = 100 + Math.random() * 100;
        this.radius = 5 + Math.random() * 3;
        this.color = color;
        this.pointValue = pointValue;
    }

    draw() {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.fillStyle = this.color;
        context.globalAlpha = this.lifeTime / 200;
        context.fill();
        context.globalAlpha = 1;
    }

    update() {
        this.speedX += this.accelerationX;
        this.speedY += this.accelerationY;
        this.x += this.speedX;
        this.y += this.speedY;
        this.lifeTime -= 0.4;

        if (this.x <= 0 || this.x >= canvas.width) this.speedX *= -1;
        if (this.y <= 0 || this.y >= canvas.height) this.speedY *= -1;
    }
}

function spawnParticles() {
    const particleTypesConfig = [
        { hexColor: '#2ecc71', scorePoints: 3 },
        { hexColor: '#3498db', scorePoints: 1 },
        { hexColor: '#e74c3c', scorePoints: -2 }
    ];

    for (let i = 0; i < 10; i++) {
        const selectedConfig = particleTypesConfig[Math.floor(Math.random() * particleTypesConfig.length)];
        activeParticles.push(new Particle(selectedConfig.hexColor, selectedConfig.scorePoints));
    }
}

function updateScore(pointsDelta) {
    currentScore += pointsDelta;
    if (currentScore < 0) currentScore = 0;
    currentScoreEl.textContent = currentScore;

    if (currentScore > bestScore) {
        bestScore = currentScore;
        localStorage.setItem('bestScore', bestScore);
        bestScoreEl.textContent = bestScore;
    }
}

function gameLoop() {
    if (isPaused) return;

    context.clearRect(0, 0, canvas.width, canvas.height);

    context.beginPath();
    context.arc(cursor.x, cursor.y, cursor.interactionRadius, 0, Math.PI * 2);
    context.strokeStyle = "white";
    context.lineWidth = 3;
    context.stroke();

    activeParticles.forEach((particle, particleIndex) => {
        particle.update();
        particle.draw();

        const distanceToCursor = Math.hypot(particle.x - cursor.x, particle.y - cursor.y);
        if (distanceToCursor < particle.radius + cursor.interactionRadius) {
            updateScore(particle.pointValue);
            activeParticles.splice(particleIndex, 1);
        }

        if (particle.lifeTime <= 0) {
            activeParticles.splice(particleIndex, 1);
        }
    });

    if (Math.random() < 0.03) spawnParticles();

    animationLoopId = requestAnimationFrame(gameLoop);
}

function startGame() {
    if (!isRunning) {
        isRunning = true;
        isPaused = false;
        spawnParticles();
        gameLoop();
    }
}

function togglePause() {
    if (!isRunning) return;
    isPaused = !isPaused;
    if (!isPaused) gameLoop();
}

function resetGame() {
    currentScore = 0;
    updateScore(0);
    activeParticles = [];
    isPaused = false;
    isRunning = false;
    cancelAnimationFrame(animationLoopId);
    context.clearRect(0, 0, canvas.width, canvas.height);
}