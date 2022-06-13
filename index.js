const cellSize = 5;
const strokeStyle = "#A0A0A0";
const deadFillStyle = "#C0C0C0";
const aliveFillStyle = "#007F00";

const canvas = document.getElementById("canvas");
const canvasParent = document.getElementById("canvas-parent");

const clearButton = document.getElementById("clear-button")
const randomButton = document.getElementById("random-button")
const goButton = document.getElementById("go-button")
const gosperButton = document.getElementById("gosper-button")
const fluxButton = document.getElementById("flux-button")
const framerateSpan = document.getElementById("framerate")
const generationCounterSpan = document.getElementById("generation-counter")

const canvasWidth = canvas.width = canvasParent.clientWidth;
const canvasHeight = canvas.height = canvasParent.clientHeight;
const gridWidth = Math.floor(canvasWidth / cellSize);
const gridHeight = Math.floor(canvasHeight / cellSize);

const metrics = {
    lastFrameTimestamp: 0,
    framerateHistory: new Array(10_000),
    nextFramerateHistoryEntry: 0,
    generation: 0
}

let stop = true;
let grid = new Array(gridWidth * gridHeight);
let scratchGrid = new Array(gridWidth * gridHeight);

registerEventHandlers();
initRefreshLoop();

/* Function definitions only from here down */

function registerEventHandlers() {
    canvas.addEventListener("mousedown", onCanvasMouseDown);
    canvas.addEventListener("mousemove", onCanvasMouseMove);

    clearButton.addEventListener("click", onClear);
    randomButton.addEventListener("click", onRandom);
    goButton.addEventListener("click", onGo);
    gosperButton.addEventListener("click", onGosper);
    fluxButton.addEventListener("click", onFlux);
}

function initRefreshLoop() {
    refreshDisplay();

    function loop() {
        setTimeout(loop, 0);

        if (stop) {
            return;
        }

        applyRules();
        refreshDisplay();
        updateMetrics();
    }

    loop();
}

function getCell(row, col) {
    row = (row + gridHeight) % gridHeight;
    col = (col + gridWidth) % gridWidth;
    const value = grid[row * gridWidth + col];

    return isFinite(value) ? value : 0;
}

function applyRules() {
    for (let row = 0; row < gridHeight; ++row) {
        for (let col = 0; col < gridWidth; ++col) {
            const isAlive = getCell(row, col) === 1;
            const count =
                getCell(row, col - 1) +
                getCell(row, col + 1) +
                getCell(row - 1, col) +
                getCell(row + 1, col) +
                getCell(row - 1, col - 1) +
                getCell(row - 1, col + 1) +
                getCell(row + 1, col - 1) +
                getCell(row + 1, col + 1);

            const i = row * gridWidth + col;
            if (isAlive && (count === 2 || count === 3)) {
                scratchGrid[i] = 1;
            } else if (!isAlive && count === 3) {
                scratchGrid[i] = 1;
            } else {
                scratchGrid[i] = 0;
            }
        }
    }

    const temp = grid;
    grid = scratchGrid;
    scratchGrid = temp;
}

function drawGrid(ctx) {
    ctx.fillStyle = deadFillStyle;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.strokeStyle = strokeStyle;
    ctx.beginPath();
    ctx.moveTo(0, canvasHeight);
    ctx.lineTo(canvasWidth, canvasHeight);
    ctx.lineTo(canvasWidth, 0);

    for (let row = 0; row < gridHeight; ++row) {
        ctx.moveTo(0, row * cellSize);
        ctx.lineTo(canvasWidth, row * cellSize);
    }

    for (let col = 0; col < gridWidth; ++col) {
        ctx.moveTo(col * cellSize, 0);
        ctx.lineTo(col * cellSize, canvasHeight);
    }

    ctx.stroke();
}

function refreshDisplay() {
    const ctx = canvas.getContext('2d');

    drawGrid(ctx);

    ctx.fillStyle = aliveFillStyle;

    for (let row = 0; row < gridHeight; ++row) {
        for (let col = 0; col < gridWidth; ++col) {
            if (grid[row * gridWidth + col]) {
                ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
            }
        }
    }
}

function updateMetrics() {
    const timestamp = performance.now();
    const elapsed = timestamp - metrics.lastFrameTimestamp;
    metrics.lastFrameTimestamp = timestamp;

    metrics.framerateHistory[metrics.nextFramerateHistoryEntry] = 1000 / elapsed;
    metrics.nextFramerateHistoryEntry = (metrics.nextFramerateHistoryEntry + 1) % metrics.framerateHistory.length;

    const divisor = Math.min(metrics.generation, metrics.framerateHistory.length);
    let framerate = Math.floor(metrics.framerateHistory.reduce((a, b) => a + b, 0) / divisor);

    framerateSpan.innerText = `Framerate: ${framerate} fps`;

    generationCounterSpan.innerText = `Generations: ${++metrics.generation}`;
}

function onGo() {
    stop = !stop;

    goButton.innerText = stop ? "Go" : "Stop";
}

function onRandom() {
    for (let i = 0; i < grid.length; ++i) {
        grid[i] = Math.random() > 0.5 ? 1 : 0;
    }

    refreshDisplay();
}

function onClear() {
    for (let i = 0; i < grid.length; ++i) {
        grid[i] = 0;
    }

    refreshDisplay();
}

function onCanvasMouseDown(evt) {
    const row = Math.floor(evt.offsetY / cellSize);
    const col = Math.floor(evt.offsetX / cellSize);
    index = (row * gridWidth) + col
    grid[index] = grid[index] ? 0 : 1;
    refreshDisplay();
}

function onCanvasMouseMove(evt) {
    if (!evt.buttons) {
        return;
    }

    const row = Math.floor(evt.offsetY / cellSize);
    const col = Math.floor(evt.offsetX / cellSize);
    grid[(row * gridWidth) + col] = 1;
    refreshDisplay();
}

function onGosper() {
    insertTemplate(`
        +--------------------------------------+
        |                         *            |
        |                       * *            |
        |             **      **            ** |
        |            *   *    **            ** |
        | **        *     *   **               |
        | **        *   * **    * *            |
        |           *     *       *            |
        |            *   *                     |
        |             **                       |
        +--------------------------------------+
    `);
}

function onFlux() {
    insertTemplate(`
        +--------------+
        |  **      **  |
        | *  *    *  * |
        | *  *    *  * |
        | *  *    *  * |
        |  **      **  |
        +--------------+
    `);
}

function insertTemplate(template) {
    const lines = template.trim().split("\n");
    for (let [row, line] of lines.entries()) {
        for (let [col, char] of line.trim().split("").entries()) {
            grid[(row * gridWidth) + col] = char === "*" ? 1 : 0;
        }
    }

    refreshDisplay();
}
