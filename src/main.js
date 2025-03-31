let gridSize = 20;
let cols, rows;
let player;
let walls = [];

function setup() {
  createCanvas(400, 400);
  cols = width / gridSize;
  rows = height / gridSize;
  player = new Player(1, 1);
  generateMaze();
}

function draw() {
  background(0);
  drawMaze();
  player.show();
}

function keyPressed() {
  if (keyCode === UP_ARROW) player.move(0, -1);
  if (keyCode === DOWN_ARROW) player.move(0, 1);
  if (keyCode === LEFT_ARROW) player.move(-1, 0);
  if (keyCode === RIGHT_ARROW) player.move(1, 0);
}

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  move(dx, dy) {
    while (!isWall(this.x + dx, this.y + dy)) {
      this.x += dx;
      this.y += dy;
    }
  }

  show() {
    fill(255, 255, 0);
    rect(this.x * gridSize, this.y * gridSize, gridSize, gridSize);
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
  fill(255);
  for (let wall of walls) {
    rect(wall.x * gridSize, wall.y * gridSize, gridSize, gridSize);
  }
}

function isWall(x, y) {
  return walls.some(w => w.x === x && w.y === y);
}