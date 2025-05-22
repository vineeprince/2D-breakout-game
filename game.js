// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');

// Game objects
let ball = {
    x: canvas.width / 2,
    y: canvas.height - 30,
    radius: 10,
    dx: 4,
    dy: -4,
    speed: 4
};

// Modify your paddle properties at the top of your code
let paddle = {
    width: 100,
    height: 15,
    x: canvas.width / 2 - 50,
    speed: 20,  // Increased from 8 to 20
    isMoving: false,
    moveLeft: false,
    moveRight: false
};


let bricks = [];
const brickRowCount = 5;
const brickColumnCount = 9;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 60;
const brickOffsetLeft = 30;

// Game state
let score = 0;
let lives = 3;
let gameRunning = false;
let gamePaused = false;
let animationFrameId = null;

// Initialize bricks
function initBricks() {
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
            const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
            const colors = ['#f94144', '#f3722c', '#f8961e', '#90be6d', '#43aa8b'];
            
            bricks[c][r] = {
                x: brickX,
                y: brickY,
                width: brickWidth,
                height: brickHeight,
                color: colors[r],
                visible: true
            };
        }
    }
}

// Draw ball
function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.closePath();
}

// Draw paddle
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddle.x, canvas.height - paddle.height, paddle.width, paddle.height);
    ctx.fillStyle = '#4dabf7';
    ctx.fill();
    ctx.closePath();
}

// Draw bricks
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const brick = bricks[c][r];
            if (brick.visible) {
                ctx.beginPath();
                ctx.rect(brick.x, brick.y, brick.width, brick.height);
                ctx.fillStyle = brick.color;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

// Collision detection
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const brick = bricks[c][r];
            if (brick.visible) {
                if (
                    ball.x > brick.x &&
                    ball.x < brick.x + brick.width &&
                    ball.y > brick.y &&
                    ball.y < brick.y + brick.height
                ) {
                    ball.dy = -ball.dy;
                    brick.visible = false;
                    score++;
                    scoreDisplay.textContent = score;
                    
                    // Check if all bricks are cleared
                    if (score === brickRowCount * brickColumnCount) {
                        alert('Congratulations! You won!');
                        resetGame();
                    }
                }
            }
        }
    }
}

// Then modify your movePaddle() function
function movePaddle() {
    if (paddle.moveLeft && paddle.x > 0) {
        paddle.x -= paddle.speed;
        // Snap to left edge if close
        if (paddle.x < 0) paddle.x = 0;
    } else if (paddle.moveRight && paddle.x < canvas.width - paddle.width) {
        paddle.x += paddle.speed;
        // Snap to right edge if close
        if (paddle.x > canvas.width - paddle.width) {
            paddle.x = canvas.width - paddle.width;
        }
    }
}

// Update game state
function update() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw game objects
    drawBricks();
    drawBall();
    drawPaddle();
    
    // Collision detection
    collisionDetection();
    
    // Ball collision with walls
    if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
        ball.dx = -ball.dx;
    }
    
    // Ball collision with top
    if (ball.y + ball.dy < ball.radius) {
        ball.dy = -ball.dy;
    }
    
    // Ball collision with paddle
    if (
        ball.y + ball.dy > canvas.height - ball.radius - paddle.height &&
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width
    ) {
        // Calculate bounce angle based on where ball hits paddle
        const hitPosition = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
        const angle = hitPosition * Math.PI / 3; // Max 60 degrees
        
        // Update ball direction
        ball.dx = ball.speed * Math.sin(angle);
        ball.dy = -ball.speed * Math.cos(angle);
    }
    
    // Ball out of bounds (bottom)
    if (ball.y + ball.dy > canvas.height) {
        lives--;
        livesDisplay.textContent = lives;
        
        // In your collision detection where lives run out:
    if (lives <= 0) {
        gameRunning = false;
        document.getElementById('gameOver').style.display = 'block';
    }else {
            // Reset ball and paddle position
            ball.x = canvas.width / 2;
            ball.y = canvas.height - 30;
            ball.dx = 4;
            ball.dy = -4;
            paddle.x = canvas.width / 2 - paddle.width / 2;
        }
    }
    
    // Move ball
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Move paddle
    movePaddle();
    
    // Continue animation if game is running and not paused
    if (gameRunning && !gamePaused) {
        animationFrameId = requestAnimationFrame(update);
    }
}

// Reset game
function resetGame() {
    gameRunning = false;
    gamePaused = false;
    score = 0;
    lives = 3;
    scoreDisplay.textContent = score;
    livesDisplay.textContent = lives;
    
    // Reset ball and paddle
    ball.x = canvas.width / 2;
    ball.y = canvas.height - 30;
    ball.dx = 4;
    ball.dy = -4;
    paddle.x = canvas.width / 2 - paddle.width / 2;
    
    // Initialize bricks
    initBricks();
    
    // Clear any existing animation frame
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    
    // Draw initial state
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();

    document.getElementById('gameOver').style.display = 'none';
}

// Event listeners
startBtn.addEventListener('click', () => {
    if (!gameRunning) {
        gameRunning = true;
        gamePaused = false;
        update();
    }
});

pauseBtn.addEventListener('click', () => {
    if (gameRunning) {
        gamePaused = !gamePaused;
        pauseBtn.textContent = gamePaused ? 'Resume' : 'Pause';
        
        if (!gamePaused) {
            update();
        }
    }
});

resetBtn.addEventListener('click', resetGame);

document.getElementById('gameOver').addEventListener('click', function() {
    this.style.display = 'none';
    resetGame();
});

// Mouse/touch controls
canvas.addEventListener('mousemove', (e) => {
    if (gameRunning && !gamePaused) {
        const relativeX = e.clientX - canvas.offsetLeft;
        if (relativeX > 0 && relativeX < canvas.width) {
            paddle.x = relativeX - paddle.width / 2;
            
            // Keep paddle within canvas
            if (paddle.x < 0) {
                paddle.x = 0;
            } else if (paddle.x > canvas.width - paddle.width) {
                paddle.x = canvas.width - paddle.width;
            }
        }
    }
});

// Touch controls for mobile
canvas.addEventListener('touchmove', (e) => {
    if (gameRunning && !gamePaused) {
        e.preventDefault();
        const touch = e.touches[0];
        const relativeX = touch.clientX - canvas.offsetLeft;
        if (relativeX > 0 && relativeX < canvas.width) {
            paddle.x = relativeX - paddle.width / 2;
            
            // Keep paddle within canvas
            if (paddle.x < 0) {
                paddle.x = 0;
            } else if (paddle.x > canvas.width - paddle.width) {
                paddle.x = canvas.width - paddle.width;
            }
        }
    }
}, { passive: false });



// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (gameRunning && !gamePaused) {
        if (e.key === 'ArrowLeft' || e.key === 'Left') {
            paddle.moveLeft = true;
        } else if (e.key === 'ArrowRight' || e.key === 'Right') {
            paddle.moveRight = true;
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'Left') {
        paddle.moveLeft = false;
    } else if (e.key === 'ArrowRight' || e.key === 'Right') {
        paddle.moveRight = false;
    }
});

// Handle window resize
function handleResize() {
    // For simplicity, we'll just reset the game on resize
    // In a more advanced version, you could scale the game
    resetGame();
}

window.addEventListener('resize', handleResize);

// Initialize game
resetGame();