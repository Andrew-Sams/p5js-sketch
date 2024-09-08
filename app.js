let gridSize = 10;
let cellSize = 30;
let grid = [];  // Initialize the grid based on JSON data
let selectedSquare = null;
let total = 0;
let actualizedTotal = 0;
let colors = ["#F94144", "#F3722C", "#F8961E", "#F9C74F", "#90BE6D", "#43AA8B", "#577590", "#A05195", "#665191", "#2F4858", "#D45087", "#F95D6A"];
let gridData = [];  // Loaded from JSON file

function preload() {
  // Load initial grid data from JSON file
  gridData = loadJSON('gridData.json');
}

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('canvas-container');  // Attach canvas to a div in HTML
  
  // Initialize grid with data from JSON
  for (let i = 0; i < gridSize; i++) {
    grid[i] = [];
    for (let j = 0; j < gridSize; j++) {
      grid[i][j] = gridData[i][j] || null;  // Set from JSON or null if undefined
    }
  }

  // Set up button click event for saving grid configuration
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
      rect(i * cellSize, j * cellSize, cellSize, cellSize);
      
      if (grid[i][j] != null) {
        fill(colors[grid[i][j]]);
        rect(i * cellSize, j * cellSize, cellSize, cellSize);
      }
    }
  }
}

function mousePressed() {
  let gridX = floor(mouseX / cellSize);
  let gridY = floor(mouseY / cellSize);
  
  if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
    grid[gridX][gridY] = (grid[gridX][gridY] == null) ? floor(random(colors.length)) : null;
  }
}

function saveGridConfiguration() {
  // Convert grid array to JSON format
  let gridJSON = JSON.stringify(grid);

  // Post to GitHub or other storage via API call or GitHub Actions
  console.log("Grid Configuration Saved:", gridJSON);
  
  // You would use a GitHub Action or API to actually save this JSON to a repository
}