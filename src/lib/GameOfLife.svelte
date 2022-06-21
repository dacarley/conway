<script lang="ts">
	import { onRender, metrics, grid, gridWidth, gridHeight, worker, randomize } from './game';
	import { browser } from '$app/env';

	randomize($grid);

	let buffer: Uint8Array;

	$: launchWorker($gridWidth, $gridHeight);
	$: buffer = new Uint8Array($grid);

	function launchWorker(gridWidth: number, gridHeight: number) {
		if (!browser) {
			return;
		}

		if ($worker) {
			$worker.terminate();
		}

		worker.set(new Worker('/worker.js'));

		$worker.postMessage({
			action: 'init',
			params: {
				grid: $grid,
				gridWidth,
				gridHeight
			}
		});

		$worker.addEventListener('message', (e) => {
			switch (e.data.action) {
				case 'metrics':
					metrics.set(e.data.metrics);
					break;

				case 'running':
				case 'stopped':
					break;

				default:
					console.log('Message from worker:', e);
			}
		});
	}

	const aliveFillStyle = 'darkgreen';

	onRender((props, _dt) => {
		const { context, width, height, gridWidth, gridHeight, cellSize, offsetX, offsetY } = props;
		context.fillStyle = aliveFillStyle;

		for (let y = 0; y < height; y += cellSize) {
			for (let x = 0; x < width; x += cellSize) {
				const row = ((Math.floor((y - offsetY) / cellSize) % gridHeight) + gridHeight) % gridHeight;
				const col = ((Math.floor((x - offsetX) / cellSize) % gridWidth) + gridWidth) % gridWidth;

				if (buffer[row * gridWidth + col]) {
					context.fillRect(x, y, cellSize, cellSize);
				}
			}
		}
	});
</script>

<!-- The following allows this component to nest children -->
<slot />
