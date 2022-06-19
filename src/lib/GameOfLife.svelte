<script lang="ts">
	import { onMount } from 'svelte';
	import { renderable, grid, gridWidth, gridHeight } from './game';

	let scratchGrid: Array<number>;

	for (let i = 0; i < $grid.length; ++i) {
		$grid[i] = Math.random() > 0.5 ? 1 : 0;
	}

	const aliveFillStyle = 'darkgreen';

	function getCell(row: number, col: number) {
		row = (row + $gridHeight) % $gridHeight;
		col = (col + $gridWidth) % $gridWidth;
		const value = $grid[row * $gridWidth + col];

		return isFinite(value) ? value : 0;
	}

	function applyRules() {
		if (!scratchGrid) {
			scratchGrid = new Array($gridWidth * $gridHeight);
		}

		for (let row = 0; row < $gridHeight; ++row) {
			for (let col = 0; col < $gridWidth; ++col) {
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

				const i = row * $gridWidth + col;
				if (isAlive && (count === 2 || count === 3)) {
					scratchGrid[i] = 1;
				} else if (!isAlive && count === 3) {
					scratchGrid[i] = 1;
				} else {
					scratchGrid[i] = 0;
				}
			}
		}

		const temp = $grid;
		grid.set(scratchGrid);
		scratchGrid = temp;
	}

	renderable((props, _dt) => {
		const { context, width, height, gridWidth, gridHeight, cellSize, offsetX, offsetY } = props;
		context.fillStyle = aliveFillStyle;

		for (let y = 0; y < height; y += cellSize) {
			for (let x = 0; x < width; x += cellSize) {
				const row = ((Math.floor((y - offsetY) / cellSize) % gridHeight) + gridHeight) % gridHeight;
				const col = ((Math.floor((x - offsetX) / cellSize) % gridWidth) + gridWidth) % gridWidth;

				if ($grid[row * gridWidth + col]) {
					context.fillRect(x, y, cellSize, cellSize);
				}
			}
		}
	});

	onMount(() => {
		let prevTime = performance.now();
		let frames = 0;

		const loop = () => {
			let time = performance.now();
			frames++;
			if (time >= prevTime + 1000) {
				// const fps = (frames * 1000) / (time - prevTime);
				// console.log(`${fps.toFixed(1)} FPS`);
				prevTime = time;
				frames = 0;
			}

			setTimeout(loop, 0);

			applyRules();
		};

		loop();
	});
</script>

<!-- The following allows this component to nest children -->
<slot />
