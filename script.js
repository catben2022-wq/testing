const grid = document.getElementById("grid");
const toolButtons = Array.from(document.querySelectorAll(".tool-button"));
const currentTool = document.getElementById("current-tool");
const moneyEl = document.getElementById("money");
const populationEl = document.getElementById("population");
const incomeEl = document.getElementById("income");
const endTurnButton = document.getElementById("end-turn");
const clearGridButton = document.getElementById("clear-grid");

const tools = {
  road: { cost: 10, label: "Road", income: 0, population: 0 },
  house: { cost: 50, label: "House", income: 5, population: 4 },
  park: { cost: 30, label: "Park", income: 1, population: 1 },
  market: { cost: 70, label: "Market", income: 12, population: 2 },
};

const previewClasses = Object.keys(tools).map((tool) => `preview-${tool}`);

let selectedTool = null;
let money = 500;
let population = 0;
let income = 0;

const tiles = [];

function updateStats() {
  moneyEl.textContent = `$${money}`;
  populationEl.textContent = population;
  incomeEl.textContent = `$${income} / turn`;
}

function clearPreview(tileElement) {
  tileElement.classList.remove("preview", ...previewClasses);
}

function setActiveTool(tool) {
  selectedTool = tool;
  toolButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.tool === tool);
  });
  tiles.forEach((tile) => clearPreview(tile.element));
  if (tool) {
    const toolInfo = tools[tool];
    currentTool.textContent = `${toolInfo.label} selected ($${toolInfo.cost}). Click a tile to build.`;
  } else {
    currentTool.textContent = "Select a tool to begin building.";
  }
}

function rebuildTotals() {
  population = tiles.reduce((total, tile) => total + tile.population, 0);
  income = tiles.reduce((total, tile) => total + tile.income, 0);
  updateStats();
}

function applyTile(index, tool) {
  const tile = tiles[index];
  tile.type = tool;
  tile.population = tools[tool].population;
  tile.income = tools[tool].income;
  tile.element.className = `city-tile ${tool}`;
  tile.element.textContent = "";
  tile.element.dataset.type = tool;
  tile.element.setAttribute("aria-label", `${tools[tool].label} tile ${index + 1}`);
}

function handleTileClick(index) {
  if (!selectedTool) {
    currentTool.textContent = "Pick a tool before building.";
    return;
  }

  const tile = tiles[index];
  if (tile.type) {
    currentTool.textContent = "That tile is already occupied.";
    return;
  }

  const cost = tools[selectedTool].cost;
  if (money < cost) {
    currentTool.textContent = "Not enough money to build there.";
    return;
  }

  money -= cost;
  applyTile(index, selectedTool);
  rebuildTotals();
}

function buildGrid() {
  for (let i = 0; i < 100; i += 1) {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "city-tile";
    tile.setAttribute("role", "gridcell");
    tile.setAttribute("aria-label", `Empty city tile ${i + 1}`);
    tile.addEventListener("click", () => handleTileClick(i));
    tile.addEventListener("mouseenter", () => {
      if (selectedTool && !tiles[i].type) {
        clearPreview(tile);
        tile.classList.add("preview", `preview-${selectedTool}`);
      }
    });
    tile.addEventListener("mouseleave", () => {
      clearPreview(tile);
    });
    grid.appendChild(tile);
    tiles.push({ element: tile, type: null, population: 0, income: 0 });
  }
}

function clearGrid() {
  tiles.forEach((tile, index) => {
    tile.type = null;
    tile.population = 0;
    tile.income = 0;
    tile.element.className = "city-tile";
    tile.element.textContent = "";
    tile.element.removeAttribute("data-type");
    tile.element.setAttribute("aria-label", `Empty city tile ${index + 1}`);
    clearPreview(tile.element);
  });
  population = 0;
  income = 0;
  updateStats();
  currentTool.textContent = "City cleared. Select a tool to rebuild.";
}

function endTurn() {
  money += income;
  updateStats();
  currentTool.textContent = `Turn ended. You earned $${income}.`;
}

toolButtons.forEach((button) => {
  button.addEventListener("click", () => setActiveTool(button.dataset.tool));
});

endTurnButton.addEventListener("click", endTurn);
clearGridButton.addEventListener("click", clearGrid);

buildGrid();
updateStats();
