let gridSize = 10;
let cellSize = 30;  // Adjust for mobile size, smaller to fit screen
let grid = [];
let squares = [];
let selectedSquare = null;  // Stores the currently selected square
let total = 0;
let actualizedTotal = 0;
let actualizedSquares = [];
let donorLevels = [200, 400, 600, 1000, 2000, 4000, 6000, 10000, 20000, 40000, 60000, 100000];
let donationStats = {};  // To keep track of the number of tiles and summations
let selectedTile = null;  // For removal via "X" button
let colors = ["#F94144", "#F3722C", "#F8961E", "#F9C74F", "#90BE6D", "#43AA8B", "#577590", "#A05195", "#665191", "#2F4858", "#D45087", "#F95D6A"];

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Initialize grid
  for (let i = 0; i < gridSize; i++) {
    grid[i] = [];
    for (let j = 0; j < gridSize; j++) {
      grid[i][j] = null;
    }
  }

  // Initialize donation stats
  for (let value of donorLevels) {
    donationStats[value] = { count: 0, sum: 0 };
  }

  // Create squares with the given values, arranged at the top
  let spacing = (width - (donorLevels.length * (cellSize + 10))) / 2;  // Centering horizontally
  for (let i = 0; i < donorLevels.length; i++) {
    let square = new SelectableSquare(spacing + i * (cellSize + 10), 20, cellSize, donorLevels[i], colors[i % colors.length]);
    squares.push(square);
  }
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

  // Draw the option squares
  for (let square of squares) {
    square.display();
    square.displayStats();
  }

  // Highlight the selected square if any
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
  // Check if an option square is touched
  for (let square of squares) {
    if (square.isTouchOver()) {
      selectedSquare = square;  // Select the square
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

  // Check if we are placing the selected square into the grid
  if (selectedSquare != null) {
    let gridX = floor(touches[0].x / cellSize);
    let gridY = floor((touches[0].y - 100) / cellSize);  // Adjust for grid position

    if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
      if (grid[gridX][gridY] == null) {
        // Place the square in the grid and update total
        let newSquare = new SelectableSquare(0, 0, cellSize, selectedSquare.value, selectedSquare.color);
        grid[gridX][gridY] = newSquare;
        grid[gridX][gridY].gridX = gridX;  // Store grid coordinates for removal
        grid[gridX][gridY].gridY = gridY;
        total += selectedSquare.value;  // Add to total
        donationStats[selectedSquare.value].count += 1;
        donationStats[selectedSquare.value].sum += selectedSquare.value;
        selectedSquare = null;  // Deselect the square
      }
      return false;
    }
  }

  // Check if we are activating/deactivating a square in the grid
  let gridX = floor(touches[0].x / cellSize);
  let gridY = floor((touches[0].y - 100) / cellSize);

  if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
    if (grid[gridX][gridY] != null) {
      let square = grid[gridX][gridY];
      if (!square.isActualized) {
        // Actualize the square
        square.isActualized = true;
        actualizedSquares.push(square);
        actualizedTotal += square.value;
      } else {
        // De-actualize the square
        square.isActualized = false;
        actualizedTotal -= square.value;
        actualizedSquares = actualizedSquares.filter(s => s !== square);
      }
      selectedTile = square;  // Select tile for removal via "X"
      return false;
    }
  }

  return false;  // Prevent default behavior
}

// Class to represent selectable squares
class SelectableSquare {
  constructor(x, y, size, value, color) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.value = value;
    this.color = color;
    this.isActualized = false;  // Indicates if the square is actualized
  }

  display(px = null, py = null) {
    stroke(0);
    if (this.isActualized) {
      fill(100, 100, 255);  // Different color for actualized squares
    } else {
      fill(this.color);
    }
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
    // Checks if the touch point is over this square
    return touches[0].x > this.x && touches[0].x < this.x + this.size && touches[0].y > this.y && touches[0].y < this.y + this.size;
  }
  
  released() {
    // Stops the dragging behavior (if it were implemented)
    this.isDragging = false;
  }
}