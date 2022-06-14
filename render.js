import { Core } from "./core.js";

const strokeStyle = "#A0A0A0";
const deadFillStyle = "#C0C0C0";
const aliveFillStyle = "#007F00";

const canvas = document.getElementById("canvas");
const canvasParent = document.getElementById("canvas-parent");

canvas.width = canvasParent.clientWidth;
canvas.height = canvasParent.clientHeight;

function drawGrid(ctx) {
    ctx.fillStyle = deadFillStyle;
    ctx.fillRect(0, 0, Render.canvasWidth, Render.canvasHeight);

    ctx.strokeStyle = strokeStyle;
    ctx.beginPath();
    ctx.moveTo(0, Render.canvasHeight);
    ctx.lineTo(Render.canvasWidth, Render.canvasHeight);
    ctx.lineTo(Render.canvasWidth, 0);

    for (let row = 0; row < Core.gridHeight; ++row) {
        ctx.moveTo(0, row * Render.cellSize);
        ctx.lineTo(Render.canvasWidth, row * Render.cellSize);
    }

    for (let col = 0; col < Core.gridWidth; ++col) {
        ctx.moveTo(col * Render.cellSize, 0);
        ctx.lineTo(col * Render.cellSize, Render.canvasHeight);
    }

    ctx.stroke();
}

function refreshDisplay() {
    const ctx = canvas.getContext('2d');

    drawGrid(ctx);

    ctx.fillStyle = aliveFillStyle;

    for (let row = 0; row < Core.gridHeight; ++row) {
        for (let col = 0; col < Core.gridWidth; ++col) {
            if (Core.grid[row * Core.gridWidth + col]) {
                ctx.fillRect(col * Render.cellSize, row * Render.cellSize, Render.cellSize, Render.cellSize);
            }
        }
    }
}

export const Render = {
    cellSize: 3,
    canvasWidth: canvasParent.clientWidth,
    canvasHeight: canvasParent.clientHeight,

    refreshDisplay
}
