<script lang="ts">
	import { loadFile } from '$lib/loader';
	import { grid, metrics, gridWidth, gridHeight, cellSize, worker, randomize } from '$lib/game';
	import { templates } from '$lib/templates';

	let fileOpenInput: HTMLInputElement;
	let metricsText: Array<string>;
	let isRunning = true;

	$: {
		const fps = $metrics.fps.toFixed(1);
		const heapMB = ((performance as any)?.memory?.totalJSHeapSize / 2 ** 20).toFixed(3);
		metricsText = [`${fps} FPS`, `${heapMB} MB Heap`, `${$metrics.generations} generations`];
	}

	function onFileOpen() {
		fileOpenInput.click();
	}

	async function onFileOpenInput() {
		const file = fileOpenInput?.files?.[0];
		if (!file) {
			return;
		}

		const result = await loadFile(file);

		grid.set(result.grid);
		gridWidth.set(result.width);
		gridHeight.set(result.height);
	}

	function toggleRun() {
		if (isRunning) {
			return stop();
		} else {
			return run();
		}
	}

	function listenUntil(
		target: Worker,
		eventType: keyof EventSourceEventMap,
		predicate: (evt: MessageEvent) => boolean
	) {
		return new Promise((resolve) => {
			const internalHandler = (evt: Event) => {
				if (predicate(evt as MessageEvent)) {
					target.removeEventListener(eventType, internalHandler);
					resolve(evt);
				}
			};
			target.addEventListener(eventType, internalHandler);
		});
	}

	async function stop() {
		if (!isRunning) {
			return;
		}

		isRunning = false;
		$worker.postMessage({ action: 'stop' });

		await listenUntil($worker, 'message', (evt) => {
			return evt?.data?.action === 'stopped';
		});
	}

	async function run() {
		if (isRunning) {
			return;
		}

		isRunning = true;
		$worker.postMessage({ action: 'run' });

		await listenUntil($worker, 'message', (evt) => {
			return evt?.data?.action === 'running';
		});
	}

	async function clearGrid() {
		await stop();

		const buffer = new Uint8Array($grid);
		for (let i = 0; i < buffer.length; ++i) {
			buffer[i] = 0;
		}
	}

	async function restart(cb: Function) {
		await stop();
		await cb();
		await run();
	}

	function randomizeGrid() {
		restart(() => randomize($grid));
	}

	async function insertTemplate(name: keyof typeof templates) {
		restart(() => {
			const template = templates[name];
			const lines = template.trim().split('\n');
			const buffer = new Uint8Array($grid);

			for (let [row, line] of lines.entries()) {
				for (let [col, char] of line.trim().split('').entries()) {
					buffer[row * $gridWidth + col] = char === '*' ? 1 : 0;
				}
			}
		});
	}
</script>

<div class="ui-overlay">
	<button on:click={onFileOpen} id="file-open-button">Open...</button>
	<input
		bind:this={fileOpenInput}
		on:change={onFileOpenInput}
		type="file"
		id="file-open-input"
		style="display:none"
	/>
	<div class="spacer" />

	<button on:click={() => cellSize.set($cellSize + 1)}>Larger Cells</button>
	<button on:click={() => cellSize.set(Math.max(1, $cellSize - 1))}>Smaller Cells</button>

	<div class="spacer" />

	<button on:click={toggleRun}>{isRunning ? 'Stop' : 'Run'}</button>
	<button on:click={() => clearGrid()}>Clear</button>
	<button on:click={() => randomizeGrid()}>Random</button>

	<div class="spacer" />

	<button on:click={() => insertTemplate('gosperGun')}>Gosper</button>
	<button on:click={() => insertTemplate('flux')}>Flux</button>
	<button on:click={() => insertTemplate('pulsar')}>Pulsar</button>

	<div class="spacer" />

	{#each metricsText as text}
		<div id="metrics">{text}</div>
	{/each}
</div>

<style>
	.ui-overlay {
		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;
		width: 200px;
		background-color: hsla(0, 0%, 100%, 20%);
		display: flex;
		flex-direction: column;
	}

	#metrics {
		color: white;
	}

	.spacer {
		height: 20px;
	}
</style>
