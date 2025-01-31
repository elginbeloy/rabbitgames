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
  <div>Completed Tasks: <span class="pink">${stats.points}</span></div>
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

/* === Event Listeners === */
/* ======================= */
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
    console.log(playerStats);
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
