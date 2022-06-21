<script lang="ts">
	import Background from '$lib/Background.svelte';
	import Canvas from '$lib/Canvas.svelte';
	import GameOfLife from '$lib/GameOfLife.svelte';
	import UILayer from '$lib/UILayer.svelte';
	import { offsetX, offsetY } from '$lib/game';

	let lastMouseMoveX: number;
	let lastMouseMoveY: number;

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

	<UILayer />
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
</style>
