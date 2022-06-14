import { Core } from "./core.js";
import { Render } from "./render.js";
import { Loader } from "./loader.js"

export const UI = {
    init: () => {
        registerEventHandlers();
    },

    updateMetrics
}

const metrics = {
    lastFrameTimestamp: 0,
    framerateHistory: new Array(1_000),
    nextFramerateHistoryEntry: 0,
    generation: 0
}

const clearButton = document.getElementById("clear-button")
const fileOpenButton = document.getElementById("file-open-button")
const fileOpenInput = document.getElementById("file-open-input")
const randomButton = document.getElementById("random-button")
const goButton = document.getElementById("go-button")
const gosperButton = document.getElementById("gosper-button")
const sunburstButton = document.getElementById("sunburst-button")
const fluxButton = document.getElementById("flux-button")

const framerateSpan = document.getElementById("framerate")
const generationCounterSpan = document.getElementById("generation-counter")

function registerEventHandlers() {
    canvas.addEventListener("mousedown", onCanvasMouseDown);
    canvas.addEventListener("mousemove", onCanvasMouseMove);

    clearButton.addEventListener("click", onClear);
    fileOpenButton.addEventListener("click", onFileOpen);
    fileOpenInput.addEventListener("change", onFileOpenInputChange)
    randomButton.addEventListener("click", onRandom);
    goButton.addEventListener("click", onGo);
    gosperButton.addEventListener("click", onGosper);
    fluxButton.addEventListener("click", onFlux);
    sunburstButton.addEventListener("click", onSunburst);
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
    Core.stop = !Core.stop;

    goButton.innerText = Core.stop ? "Go" : "Stop";
}

function onFileOpen() {
    fileOpenInput.click();
}

async function onFileOpenInputChange(evt) {
    await Loader.loadFile(evt.target.files[0]);
}

function onRandom() {
    for (let i = 0; i < Core.grid.length; ++i) {
        Core.grid[i] = Math.random() > 0.5 ? 1 : 0;
    }

    Render.refreshDisplay();
}

function onClear() {
    Core.clear();
    Render.refreshDisplay();
}

function onCanvasMouseDown(evt) {
    const row = Math.floor(evt.offsetY / cellSize);
    const col = Math.floor(evt.offsetX / cellSize);
    index = (row * Core.gridWidth) + col
    Core.grid[index] = Core.grid[index] ? 0 : 1;
    refreshDisplay();
}

function onCanvasMouseMove(evt) {
    if (!evt.buttons) {
        return;
    }

    const row = Math.floor(evt.offsetY / cellSize);
    const col = Math.floor(evt.offsetX / cellSize);
    Core.grid[(row * Core.gridWidth) + col] = 1;
    refreshDisplay();
}

function onGosper() {
    Core.insertTemplate(`
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
    Core.insertTemplate(`
        +--------------+
        |  **      **  |
        | *  *    *  * |
        | *  *    *  * |
        | *  *    *  * |
        |  **      **  |
        +--------------+
    `);
}

function onSunburst() {
    Core.insertTemplate(`
        +---------------+
        |   ***   ***   | 
        |               |
        | *    * *    * |
        | *    * *    * |
        | *    * *    * |
        |   ***   ***   |
        |               |
        |   ***   ***   |
        | *    * *    * |
        | *    * *    * |
        | *    * *    * |
        |               |
        |   ***   ***   |
        +---------------+
    `);
}
