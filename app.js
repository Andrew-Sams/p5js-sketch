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
    text("" + donationStats[this.value].count, this.x + this.size / 2, this.y + this.size + 15);
    text("" + donationStats[this.value].sum, this.x + this.size / 2, this.y + this.size + 30);
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