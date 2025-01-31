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
`

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

const canvas = document.getElementById("game");
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;
const context = canvas.getContext("2d");
let mouseX = 0;
let mouseY = 0;
let isRunning = false;
let animationFrameId = null;
let laserShots = [];

context.clearRect(0, 0, canvas.width, canvas.height);
context.fillStyle = '#6272A4';
context.fillRect(0, 0, canvas.width, canvas.height);

function gameLoop() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#6272A4';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(shipOneImage, 450, 200);
  context.drawImage(crossHairImage, mouseX - 16, mouseY - 16);

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
  playerStats = { ...defaultPlayerStats };
  savePlayerStats(playerStats);
  render();
});
