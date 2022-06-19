<script lang="ts">
	import Background from '$lib/Background.svelte';
	import Canvas from '$lib/Canvas.svelte';
	import GameOfLife from '$lib/GameOfLife.svelte';
	import { loadFile } from '$lib/loader';
	import { grid, gridWidth, gridHeight, cellSize, offsetX, offsetY } from '$lib/game';

	let fileOpenInput: HTMLInputElement;
	let lastMouseMoveX: number;
	let lastMouseMoveY: number;

	function onFileOpen() {
		fileOpenInput.click();
	}

	async function onFileOpenInput() {
		console.log('I am here');
		const file = fileOpenInput?.files?.[0];
		if (!file) {
			return;
		}

		const result = await loadFile(file);

		grid.set(result.grid);
		gridWidth.set(result.width);
		gridHeight.set(result.height);
	}

	function onMouseMove(event: MouseEvent) {
		if (!event.buttons) {
			lastMouseMoveX = 0;
			lastMouseMoveY = 0;
			return;
		}

		if (lastMouseMoveX && lastMouseMoveY) {
			offsetX.update((offsetX) => offsetX + (event.x - lastMouseMoveX));
			offsetY.update((offsetY) => offsetY + (event.y - lastMouseMoveY));
		}

		lastMouseMoveX = event.x;
		lastMouseMoveY = event.y;
	}

	function zoom(factor: number) {
		cellSize.set($cellSize * factor);
		offsetX.set($offsetX * factor);
		offsetY.set($offsetY * factor);
	}
</script>

<svelte:head>
	<title>Conway's Game of Life</title>
	<meta name="description" content="Conway's Game of Life" />
</svelte:head>

<section on:mousemove={onMouseMove}>
	<Canvas>
		<Background color="hsl(0, 0%, 0%)" />
		<GameOfLife />
	</Canvas>

	<div class="ui-overlay">
		<label for="file-open-input">
			<button on:click={onFileOpen} id="file-open-button">Open...</button>
			<input
				bind:this={fileOpenInput}
				on:change={onFileOpenInput}
				type="file"
				id="file-open-input"
				style="display:none"
			/>
		</label>

		<button on:click={() => zoom(0.5)}>Zoom Out</button>
		<button on:click={() => zoom(2)}>Zoom In</button>
	</div>
</section>

<style>
	section {
		display: flex;
		height: 100vh;
		flex-direction: column;
		justify-content: stretch;
		align-items: stretch;
		flex: 1;
	}

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
</style>
