let gridSize = 10;
let cellSize = 30;
let grid = [];
let squares = [];
let selectedSquare = null;
let total = 0;
let actualizedTotal = 0;
let actualizedSquares = [];
let donorLevels = [200, 400, 600, 1000, 2000, 4000, 6000, 10000, 20000, 40000, 60000, 100000];
let donationStats = {};
let selectedTile = null;
let colors = ["#F94144", "#F3722C", "#F8961E", "#F9C74F", "#90BE6D", "#43AA8B", "#577590", "#A05195", "#665191", "#2F4858", "#D45087", "#F95D6A"];
let gridData = [];  // Will be loaded from JSON

function preload() {
  // Load initial grid data from the JSON file
  gridData = loadJSON('gridData.json');
}

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('canvas-container');

  // Initialize grid based on data from JSON
  for (let i = 0; i < gridSize; i++) {
    grid[i] = [];
    for (let j = 0; j < gridSize; j++) {
      grid[i][j] = gridData[i][j] || null;
    }
  }

  // Initialize donation stats
  for (let value of donorLevels) {
    donationStats[value] = { count: 0, sum: 0 };
  }

  // Create squares at the top with donor levels
  let spacing = (width - (donorLevels.length * (cellSize + 10))) / 2;
  for (let i = 0; i < donorLevels.length; i++) {
    let square = new SelectableSquare(spacing + i * (cellSize + 10), 20, cellSize, donorLevels[i], colors[i % colors.length]);
    squares.push(square);
  }

  // Save button functionality
  let saveButton = document.getElementById("save-button");
  saveButton.addEventListener("click", saveGridConfiguration);
}

function draw() {
  background(240);

  // Draw the grid
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      stroke(0);
      fill(255);
      rect(i * cellSize, 100 + j * cellSize, cellSize, cellSize);

      if (grid[i][j] != null) {
        grid[i][j].display(i * cellSize, 100 + j * cellSize);
      }
    }
  }

  // Draw the selectable squares
  for (let square of squares) {
    square.display();
    square.displayStats();
  }

  // Highlight the selected square
  if (selectedSquare != null) {
    stroke(0, 255, 0);
    noFill();
    rect(selectedSquare.x, selectedSquare.y, selectedSquare.size, selectedSquare.size);
  }

  // Display totals
  fill(0);
  textSize(20);
  textAlign(LEFT);
  text("Total Donation Amount: $" + total, 20, height - 30);
  text("Actualized Total: $" + actualizedTotal, 20, height - 60);

  // Draw "X" button for removing selected tile
  if (selectedTile) {
    fill(255, 0, 0);
    rect(width - 60, height - 60, 50, 50);
    fill(255);
    textSize(30);
    textAlign(CENTER, CENTER);
    text("X", width - 35, height - 35);
  }
}

function touchStarted() {
  // Check if a square is touched
  for (let square of squares) {
    if (square.isTouchOver()) {
      selectedSquare = square;
      return false;
    }
  }

  // Check if "X" button is pressed to remove a selected tile
  if (selectedTile && touches[0].x > width - 60 && touches[0].x < width - 10 && touches[0].y > height - 60 && touches[0].y < height - 10) {
    let gridX = selectedTile.gridX;
    let gridY = selectedTile.gridY;
    if (grid[gridX][gridY] != null) {
      let square = grid[gridX][gridY];
      total -= square.value;
      if (square.isActualized) {
        actualizedTotal -= square.value;
      }
      donationStats[square.value].count -= 1;
      donationStats[square.value].sum -= square.value;
      grid[gridX][gridY] = null;
      selectedTile = null;
    }
    return false;
  }

  // Place the selected square into the grid
  if (selectedSquare != null) {
    let gridX = floor(touches[0].x / cellSize);
    let gridY = floor((touches[0].y - 100) / cellSize);

    if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
      if (grid[gridX][gridY] == null) {
        let newSquare = new SelectableSquare(0, 0, cellSize, selectedSquare.value, selectedSquare.color);
        grid[gridX][gridY] = newSquare;
        grid[gridX][gridY].gridX = gridX;
        grid[gridX][gridY].gridY = gridY;
        total += selectedSquare.value;
        donationStats[selectedSquare.value].count += 1;
        donationStats[selectedSquare.value].sum += selectedSquare.value;
        selectedSquare = null;
      }
      return false;
    }
  }

  // Toggle actualization of a square
  let gridX = floor(touches[0].x / cellSize);
  let gridY = floor((touches[0].y - 100) / cellSize);

  if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
    if (grid[gridX][gridY] != null) {
      let square = grid[gridX][gridY];
      if (!square.isActualized) {
        square.isActualized = true;
        actualizedSquares.push(square);
        actualizedTotal += square.value;
      } else {
        square.isActualized = false;
        actualizedTotal -= square.value;
        actualizedSquares = actualizedSquares.filter(s => s !== square);
      }
      selectedTile = square;
      return false;
    }
  }

  return false;
}

// Class representing selectable squares
class SelectableSquare {
  constructor(x, y, size, value, color) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.value = value;
    this.color = color;
    this.isActualized = false;
  }

  display(px = null, py = null) {
    stroke(0);
    fill(this.isActualized ? [100, 100, 255] : this.color);
    rect(px !== null ? px : this.x, py !== null ? py : this.y, this.size, this.size);
    fill(0);
    textSize(12);
    textAlign(CENTER, CENTER);
    text(this.value, (px !== null ? px : this.x) + this.size / 2, (py !== null ? py : this.y) + this.size / 2);
  }

  displayStats() {
    fill(0);
    textSize(12);
    textAlign(CENTER, CENTER);
    text("Count: " + donationStats[this.value].count, this.x + this.size / 2, this.y + this.size + 15);
    text("Sum: $" + donationStats[this.value].sum, this.x + this.size / 2, this.y + this.size + 30);
  }

  isTouchOver() {
    return touches[0].x > this.x && touches[0].x < this.x + this.size && touches[0].y > this.y && touches[0].y < this.y + this.size;
  }
}

function saveGridConfiguration() {
  let gridJSON = JSON.stringify(grid);
  console.log("Grid Configuration:", gridJSON);
  // Add functionality to save this JSON data to GitHub or other storage via API
}