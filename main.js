/* == Player Stats Data == */
/* ======================= */

const defaultPlayerStats = {
  games: [],
  points: 0,
  tasks: [],
  history: [],
};

function savePlayerStats(stats) {
  localStorage.setItem('playerStats', JSON.stringify(stats));
}

function loadPlayerStats() {
  const storedStats = localStorage.getItem('playerStats');
  if (storedStats) {
    return JSON.parse(storedStats);
  } else {
    // WARNING: this might cause issues later if nested object is shallow cloned
    const defaultStats = { ...defaultPlayerStats };
    savePlayerStats(defaultStats);
    return defaultStats;
  }
}

function doTask(stats, taskName) {
  for (let task of stats.tasks) {
    if (task.name === taskName) {
      stats.points += task.points;
      stats.history.push(task.name);
      savePlayerStats(stats);
      render();
      return;
    }
  }
  alert("Task not found!");
}

let playerStats = loadPlayerStats();

/* == Element Rendering == */
/* ======================= */
const gameElement = (title) => `
<div class="games-list__game">
  <img src="./images/game-icon.png" class="games-list__game-icon" />
  ${title}
</div>
`;

const taskElement = (task) => `
<div class="task-list__task" onclick="doTask(playerStats, '${task.name}')">
  <img src="./images/task-icon.png" class="task-list__task-icon" />
  <div class="task-list__task-name">${task.name}</div>
  <div class="task-list__task-description">${task.description}</div>
  <div class="task-list__task-points">${task.points}</div>
</div>
`;

const playerStatsElement = (stats) => `
<div>Points: <span class="green">${stats.points}</span></div>
<div>Completed Tasks: <span class="pink">${stats.history.length}</span></div>
<div>History Log:</div>
<div id="task-history">${stats.history.join("\n")}</div>
`;

function render() {
  const gameElements = playerStats.games.map((game) => gameElement(game.name));
  document.getElementById("games-list").innerHTML = gameElements.join("\n");

  const taskElements = playerStats.tasks.map((task) => taskElement(task));
  document.getElementById("task-list").innerHTML = taskElements.join("\n");

  document.getElementById("player-stats").innerHTML =
    playerStatsElement(playerStats);
}

render();

/* Canvas Loop + Rendering */
/* ======================= */
const crossHairImage = new Image();
crossHairImage.src = "./images/crosshair.png";

const shipOneImage = new Image();
shipOneImage.src = "./images/ship_one.png";

const shipTwoImage = new Image();
shipTwoImage.src = "./images/ship_two.png";

const shipThreeImage = new Image();
shipThreeImage.src = "./images/ship_three.png";

const shipFourImage = new Image();
shipFourImage.src = "./images/ship_four.png";

const shipImages = [
  shipOneImage,
  shipTwoImage,
  shipThreeImage,
  shipFourImage
];

const canvas = document.getElementById("game");
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;
const context = canvas.getContext("2d");

let mouseX = 0;
let mouseY = 0;
let isRunning = false;
let animationFrameId = null;
let laserShots = [];

let ships = [];
let stars = [];

/* 3D starfield variables */
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const focalLength = 800;

// INITIALIZERS
function initShips(numShips) {
  ships = [];
  for (let i = 0; i < numShips; i++) {
    ships.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      distance: 200 + Math.random() * 800,     // “Depth” away from camera
      distanceVel: 1 + Math.random() * 1,      // How fast distance decreases
      xVel: (Math.random() - 0.5) * 0.5,       // Horizontal drift
      yVel: (Math.random() - 0.5) * 0.1,       // Vertical drift
      level: Math.floor(Math.random() * 4)     // Type of ship
    });
  }
}

function initStars(numStars) {
  stars = [];
  for (let i = 0; i < numStars; i++) {
    stars.push({
      x: (Math.random() - 0.5) * canvas.width,  // Start randomly around center
      y: (Math.random() - 0.5) * canvas.height, // "
      z: Math.random() * 2000,                 // Random depth
      speed: 1 + Math.random() * 3             // Speed star travels
    });
  }
}

// Call our initializers
initShips(10);
initStars(250);

function gameLoop() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  // Background color
  context.fillStyle = '#313652';
  context.fillRect(0, 0, canvas.width, canvas.height);

  // 1) Update and draw stars (3D effect)
  context.fillStyle = 'white';
  for (let star of stars) {
    // Move star closer
    star.z -= star.speed;
    // If star passes beyond our focal point, reset it
    if (star.z < 1) {
      star.x = (Math.random() - 0.5) * canvas.width;
      star.y = (Math.random() - 0.5) * canvas.height;
      star.z = 2000;
      star.speed = 1 + Math.random() * 3;
    }
    // Project x, y using perspective
    const scale = focalLength / star.z;
    const screenX = centerX + (star.x * scale);
    const screenY = centerY + (star.y * scale);
    // Size can be scaled if desired; here just use a constant or scale
    const starSize = Math.max(1, 4 * (1.0 - star.z / 2000));

    context.fillRect(screenX, screenY, starSize, starSize);
  }

  // 2) Update ships
  for (let ship of ships) {
    ship.distance -= ship.distanceVel; // move closer
    ship.x += ship.xVel;
    ship.y += ship.yVel;

    // If the ship passes "through" us (distance < 0), reposition it far away again
    if (ship.distance < 0) {
      ship.distance = 800 + Math.random() * 400;
      ship.x = Math.random() * canvas.width;
      ship.y = Math.random() * canvas.height;
    }
  }

  // 3) Sort ships by distance
  ships.sort((a, b) => b.distance - a.distance);

  // 4) Draw ships
  for (let ship of ships) {
    let scale = 1 - (ship.distance / 1000);  // Tweak as desired
    if (scale < 0.1) {
      scale = 0.1;
    }

    context.save();
    context.translate(ship.x, ship.y);
    context.scale(scale, scale);
    context.drawImage(shipImages[ship.level], 0, 0);
    context.restore();
  }

  // 5) Crosshair
  context.drawImage(crossHairImage, mouseX - 16, mouseY - 16);

  // 6) Laser shots
  const now = performance.now();
  for (let i = laserShots.length - 1; i >= 0; i--) {
    let shot = laserShots[i];
    let elapsed = now - shot.startTime;
    let t = elapsed / shot.duration;
    if (t > 1) t = 1;
    let currentX = shot.startX + t * (shot.endX - shot.startX);
    let currentY = shot.startY + t * (shot.endY - shot.startY);
    context.beginPath();
    context.moveTo(shot.startX, shot.startY);
    context.lineTo(currentX, currentY);
    context.strokeStyle = "yellow";
    context.lineWidth = 2;
    context.stroke();
    if (elapsed > shot.duration) {
      laserShots.splice(i, 1);
    }
  }

  // Continue game loop
  if (isRunning) {
    animationFrameId = requestAnimationFrame(gameLoop);
  }
}

/* === Event Listeners === */
/* ======================= */
window.addEventListener("resize", () => {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
});

document.getElementById("game").addEventListener("mouseenter", () => {
  animationFrameId = requestAnimationFrame(gameLoop);
  isRunning = true;
});

document.getElementById("game").addEventListener("mouseleave", () => {
  cancelAnimationFrame(animationFrameId);
  isRunning = false;
});

document.getElementById("game").addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = event.clientX - rect.left;
  mouseY = event.clientY - rect.top;
});

document.getElementById("game").addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  laserShots.push({
    startX: canvas.width / 2,
    startY: canvas.height,
    endX: x,
    endY: y,
    startTime: performance.now(),
    duration: 200
  });
});

document.getElementById("start-game").addEventListener("click", () => {
  const name = prompt("Game name:");
  if (name) {
    playerStats.games.push({name});
    savePlayerStats(playerStats);
    render();
  }
});

document.getElementById("add-task").addEventListener("click", () => {
  const name = prompt("Task name:");
  const description = prompt("Task description:");
  const points = Number(prompt("Task points:"));
  if (name && description && !isNaN(points)) {
    playerStats.tasks.push({name, description, points});
    savePlayerStats(playerStats);
    render();
  }
});

document.getElementById("restart").addEventListener("click", () => {
  // WARNING: this might cause issues later if nested object is shallow cloned
  playerStats.games = [];
  playerStats.points = 0;
  playerStats.history = [];
  savePlayerStats(playerStats);
  render();
  // Also re-init the ships/stars if desired:
  initShips(10);
  initStars(250);
});
