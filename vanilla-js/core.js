import { Render } from "./render.js";
import { UI } from "./ui.js";

function init() {
    Core.grid = new Array(Core.gridWidth * Core.gridHeight);
    Core.scratchGrid = new Array(Core.gridWidth * Core.gridHeight);

    Render.refreshDisplay();

    function loop() {
        setTimeout(loop, 0);

        if (Core.stop) {
            return;
        }

        applyRules();
        Render.refreshDisplay();
        UI.updateMetrics();
    }

    loop();
}

function getCell(row, col) {
    row = (row + Core.gridHeight) % Core.gridHeight;
    col = (col + Core.gridWidth) % Core.gridWidth;
    const value = Core.grid[row * Core.gridWidth + col];

    return isFinite(value) ? value : 0;
}

function applyRules() {
    for (let row = 0; row < Core.gridHeight; ++row) {
        for (let col = 0; col < Core.gridWidth; ++col) {
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

            const i = row * Core.gridWidth + col;
            if (isAlive && (count === 2 || count === 3)) {
                Core.scratchGrid[i] = 1;
            } else if (!isAlive && count === 3) {
                Core.scratchGrid[i] = 1;
            } else {
                Core.scratchGrid[i] = 0;
            }
        }
    }

    const temp = Core.grid;
    Core.grid = Core.scratchGrid;
    Core.scratchGrid = temp;
}

function insertTemplate(template) {
    const lines = template.trim().split("\n");
    for (let [row, line] of lines.entries()) {
        for (let [col, char] of line.trim().split("").entries()) {
            Core.grid[(row * Core.gridWidth) + col] = char === "*" ? 1 : 0;
        }
    }

    Render.refreshDisplay();
}

function clear() {
    for (let i = 0; i < Core.grid.length; ++i) {
        Core.grid[i] = 0;
    }
}

export const Core = {
    stop: true,
    gridWidth: Math.floor(Render.canvasWidth / Render.cellSize),
    gridHeight: Math.floor(Render.canvasHeight / Render.cellSize),

    init,
    insertTemplate,
    clear
};
