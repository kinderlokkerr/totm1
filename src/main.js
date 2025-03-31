let gridSize = 20;
let cols, rows;
let player;
let walls = [];
let coins = [];
let enemies = [];
let powerUps = [];
let score = 0;
let level = 1;
let bgColor;

function setup() {
  createCanvas(400, 400);
  cols = width / gridSize;
  rows = height / gridSize;
  bgColor = color(20, 20, 40);
  resetGame();
}

function resetGame() {
  walls = [];
  coins = [];
  enemies = [];
  powerUps = [];
  player = new Player(1, 1);
  generateMaze();
  generateCoins();
  generateEnemies();
  generatePowerUps();
}

function draw() {
  background(bgColor);
  drawMaze();
  drawCoins();
  drawPowerUps();
  drawEnemies();
  player.update();
  player.show();
  displayScore();
  displayLevel();
}

function keyPressed() {
  if (keyCode === UP_ARROW) player.setDirection(0, -1);
  if (keyCode === DOWN_ARROW) player.setDirection(0, 1);
  if (keyCode === LEFT_ARROW) player.setDirection(-1, 0);
  if (keyCode === RIGHT_ARROW) player.setDirection(1, 0);
}

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.dx = 0;
    this.dy = 0;
  }

  setDirection(dx, dy) {
    this.dx = dx;
    this.dy = dy;
  }

  update() {
    while (!isWall(this.x + this.dx, this.y + this.dy)) {
      this.x += this.dx;
      this.y += this.dy;
      checkCoinCollision();
      checkPowerUpCollision();
      checkEnemyCollision();
    }
  }

  show() {
    fill(0, 255, 255);
    rect(this.x * gridSize, this.y * gridSize, gridSize, gridSize, 5);
  }
}

function generateMaze() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (random() < 0.3 || i === 0 || j === 0 || i === cols - 1 || j === rows - 1) {
        walls.push({ x: i, y: j });
      }
    }
  }
}

function drawMaze() {
  fill(50, 50, 80);
  for (let wall of walls) {
    rect(wall.x * gridSize, wall.y * gridSize, gridSize, gridSize);
  }
}

function isWall(x, y) {
  return walls.some(w => w.x === x && w.y === y);
}

function generateCoins() {
  for (let i = 2; i < cols - 2; i++) {
    for (let j = 2; j < rows - 2; j++) {
      if (!isWall(i, j) && random() < 0.1) {
        coins.push({ x: i, y: j });
      }
    }
  }
}

function drawCoins() {
  fill(255, 204, 0);
  for (let coin of coins) {
    ellipse(coin.x * gridSize + gridSize / 2, coin.y * gridSize + gridSize / 2, gridSize / 2);
  }
}

function checkCoinCollision() {
  coins = coins.filter(coin => {
    if (coin.x === player.x && coin.y === player.y) {
      score += 10;
      return false;
    }
    return true;
  });
}

function generatePowerUps() {
  if (random() < 0.5) {
    let x = floor(random(1, cols - 1));
    let y = floor(random(1, rows - 1));
    if (!isWall(x, y)) powerUps.push({ x, y });
  }
}

function drawPowerUps() {
  fill(0, 255, 0);
  for (let powerUp of powerUps) {
    rect(powerUp.x * gridSize, powerUp.y * gridSize, gridSize, gridSize, 5);
  }
}

function checkPowerUpCollision() {
  powerUps = powerUps.filter(powerUp => {
    if (powerUp.x === player.x && powerUp.y === player.y) {
      score += 50;
      return false;
    }
    return true;
  });
}

function generateEnemies() {
  for (let i = 2; i < cols - 2; i++) {
    for (let j = 2; j < rows - 2; j++) {
      if (!isWall(i, j) && random() < 0.05) {
        enemies.push(new Enemy(i, j));
      }
    }
  }
}

class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  move() {
    let directions = [
      { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
      { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
    ];
    let dir = random(directions);
    if (!isWall(this.x + dir.dx, this.y + dir.dy)) {
      this.x += dir.dx;
      this.y += dir.dy;
    }
  }
  show() {
    fill(255, 0, 0);
    rect(this.x * gridSize, this.y * gridSize, gridSize, gridSize, 5);
  }
}

function drawEnemies() {
  for (let enemy of enemies) {
    enemy.move();
    enemy.show();
  }
}

function checkLevelCompletion() {
  if (coins.length === 0) {
    level++;
    resetGame();
  }
}

function displayScore() {
  fill(255);
  textSize(16);
  textAlign(LEFT, TOP);
  text("Score: " + score, 10, 10);
}

function displayLevel() {
  fill(255);
  textSize(16);
  textAlign(RIGHT, TOP);
  text("Level: " + level, width - 10, 10);
}
