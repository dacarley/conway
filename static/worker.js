onmessage = function (e) {
    switch (e.data.action) {
        case "init":
            init(e.data.params);
            run();
            break;

        case "run":
            run();
            break;

        case "stop":
            running = false;
            break;

        case "processBlock":
            processBlock(e.data.params);
            break;

        default:
            return;
    }
}

let workers = [];

let running = false;
let grid;
let gridWidth;
let gridHeight;
let generations = 0;

function init(params) {
    ({ gridWidth, gridHeight, grid } = params);

    const numWorkers = navigator.hardwareConcurrency;
    for (let i = 0; i < numWorkers; ++i) {
        const worker = new Worker("./worker.js");
        workers.push({
            worker
        });
    }
}

async function fastLoop(cb) {
    return new Promise(resolve => {
        const channel = new MessageChannel();

        const loop = async () => {
            if (await cb()) {
                channel.port2.postMessage("");
            } else {
                resolve();
            }
        }

        channel.port1.onmessage = loop;
        loop();
    })
}

const FPSTracker = {
    start() {
        prevTime = performance.now();
        frames = 0;
    },

    tick() {
        const time = performance.now();
        frames++;
        if (time >= prevTime + 1000) {
            const fps = (frames * 1000) / (time - prevTime);
            prevTime = time;
            frames = 0;

            postMessage({
                action: "metrics",
                metrics: { fps, generations }
            });
        }
    }
}

function copyArrayBuffer(src, dst, start, length) {
    const srcBuffer = new Uint8Array(src, start, length);
    const dstBuffer = new Uint8Array(dst, start, length);
    dstBuffer.set(srcBuffer);
}

async function run() {
    if (running) {
        return;
    }

    postMessage({ action: "running" });

    running = true;
    FPSTracker.start();

    await fastLoop(async () => {
        FPSTracker.tick();

        const numRows = Math.ceil(gridHeight / workers.length);

        await Promise.all(
            workers.map((worker, index) => new Promise(resolve => {
                const startRow = index * numRows;

                if (worker.scratchGrid?.byteLength != grid.byteLength) {
                    worker.scratchGrid = new SharedArrayBuffer(grid.byteLength);
                }

                worker.worker.onmessage = (e) => {
                    resolve();
                }
                worker.worker.postMessage({
                    action: "processBlock",
                    params: {
                        grid,
                        scratchGrid: worker.scratchGrid,
                        gridWidth,
                        gridHeight,
                        startRow,
                        numRows
                    }
                });
            }))
        );

        workers.forEach((worker, index) => {
            const startRow = index * numRows;
            const start = startRow * gridWidth;
            const end = Math.min(grid.byteLength, (startRow + numRows) * gridWidth);
            const length = end - start;
            copyArrayBuffer(worker.scratchGrid, grid, start, length);
        });

        ++generations;

        return running;
    });

    postMessage({ action: "stopped" });
}

function processBlock(params) {
    const { grid, scratchGrid, gridWidth, gridHeight, startRow, numRows } = params;

    const gridBuffer = new Uint8Array(grid);
    const scratchBuffer = new Uint8Array(scratchGrid);

    function getCell(row, col) {
        row = (row + gridHeight) % gridHeight;
        col = (col + gridWidth) % gridWidth;
        return gridBuffer[row * gridWidth + col];
    }

    for (let row = startRow; row < (startRow + numRows); ++row) {
        for (let col = 0; col < gridWidth; ++col) {
            const count =
                getCell(row - 1, col - 1) +
                getCell(row - 1, col) +
                getCell(row - 1, col + 1) +
                getCell(row, col - 1) +
                getCell(row, col + 1) +
                getCell(row + 1, col - 1) +
                getCell(row + 1, col) +
                getCell(row + 1, col + 1);

            const i = row * gridWidth + col;
            const isAlive = gridBuffer[i] === 1;

            scratchBuffer[i] = count === 3 || (isAlive && count == 2);
        }
    }

    postMessage("done");
}
