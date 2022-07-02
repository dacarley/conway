<script lang="ts">
	import {
		onRender,
		metrics,
		grid,
		gridWidth,
		gridHeight,
		worker,
		randomize,
		cellSize
	} from './game';
	import { browser } from '$app/env';
	import { onMount } from 'svelte';
	import * as Firebase from '$lib/Firebase';

	randomize($grid);

	let buffer: Uint8Array;
	let settings: Record<string, any> = {};

	$: launchWorker($gridWidth, $gridHeight);
	$: buffer = new Uint8Array($grid);

	onMount(async () => {
		Firebase.init();
		settings = await Firebase.getItem('settings');
		console.log({ settings });
		cellSize.set(settings.cellSize);

		cellSize.subscribe(async (cellSize) => {
			console.log({ cellSize });
			await Firebase.setItem('settings', {
				...settings,
				cellSize
			});
		});
	});

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
				gridBuffer: $grid,
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
