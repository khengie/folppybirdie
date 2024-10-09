const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const bird = {
    x: 50,
    y: 150,
    width: 20,
    height: 20,
    gravity: 0.2,  // Further reduce gravity for slower descent
    lift: -5,      // Further reduce lift for gentler jump
    velocity: 0,
    draw: function() {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    },
    update: function() {
        this.velocity += this.gravity;
        this.y += this.velocity;
        if (this.y > canvas.height - this.height) {
            this.y = canvas.height - this.height;
            this.velocity = 0;
        }
    },
    reset: function() {
        this.y = 150;      // Reset bird position
        this.velocity = 0; // Reset velocity
    }
};

const pipes = [];
const pipeWidth = 20;
const pipeGap = 100;
const pipeFrequency = 90;
let frame = 0;

let score = 0; // Score variable to track the player's score
let highScore = localStorage.getItem('highScore') || 0; // Retrieve high score from localStorage

function createPipe() {
    const pipeHeight = Math.floor(Math.random() * (canvas.height - pipeGap));
    const pipeMove = score >= 10;  // If score is 10 or more, make pipes move up and down

    pipes.push({
        x: canvas.width,
        top: pipeHeight,
        bottom: canvas.height - pipeHeight - pipeGap,
        moveUpAndDown: pipeMove,
        yOffset: 0  // Initial vertical offset for moving pipes
    });
}

function movePipes() {
    for (let i = 0; i < pipes.length; i++) {
        pipes[i].x -= 2;

        // If pipes should move, adjust their yOffset
        if (pipes[i].moveUpAndDown) {
            pipes[i].yOffset += 1;
            if (pipes[i].yOffset > 30 || pipes[i].yOffset < -30) {
                pipes[i].yOffset = pipes[i].yOffset > 0 ? 30 : -30;
            }
        }

        if (pipes[i].x + pipeWidth < 0) {
            pipes.splice(i, 1);
            i--;
        }
    }
}

function drawPipes() {
    for (let i = 0; i < pipes.length; i++) {
        ctx.fillStyle = 'green';
        ctx.fillRect(pipes[i].x, 0 + pipes[i].yOffset, pipeWidth, pipes[i].top);
        ctx.fillRect(pipes[i].x, canvas.height - pipes[i].bottom + pipes[i].yOffset, pipeWidth, pipes[i].bottom);
    }
}

function collisionDetection() {
    for (let i = 0; i < pipes.length; i++) {
        if (
            bird.x + bird.width > pipes[i].x &&
            bird.x < pipes[i].x + pipeWidth &&
            (bird.y < pipes[i].top || bird.y + bird.height > canvas.height - pipes[i].bottom)
        ) {
            return true;
        }
    }
    return false;
}

function updateScore() {
    ctx.font = '20px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText('Score: ' + score, 10, 30);
    ctx.fillText('High Score: ' + highScore, canvas.width - 150, 30);
}

function restartGame() {
    bird.reset();
    pipes.length = 0;  // Clear the pipes array
    score = 0;         // Reset the score
    frame = 0;         // Reset the frame counter

    // Check if the current score is a new high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);  // Save new high score
    }

    gameLoop();  // Restart the game loop
}

function gameLoop() {
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    bird.update();
    bird.draw();

    if (frame % pipeFrequency === 0) {
        createPipe();
    }
    movePipes();
    drawPipes();

    // Increase score when bird successfully passes a pipe
    if (pipes.length > 0 && pipes[0].x + pipeWidth < bird.x) {
        score++;
        pipes.shift();  // Remove the passed pipes to avoid counting them again
    }

    updateScore();  // Display the score

    if (collisionDetection()) {
        setTimeout(() => {
            alert('Game Over! Press OK to restart.');
            restartGame();
        }, 100);  // Add a short delay to show Game Over message
        return;
    }

    requestAnimationFrame(gameLoop);
}

// Mobile touch controls
window.addEventListener('touchstart', function(event) {
    event.preventDefault();  // Prevent default touch actions
    bird.velocity = bird.lift;  // Make the bird jump on touch
});

gameLoop();
