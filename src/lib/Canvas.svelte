<script lang="ts">
	import { onMount } from 'svelte';
	import { width, height, canvas, context, pixelRatio, props, time, entities } from './game';
	import { animationLoop } from './utils';

	export let killLoopOnError = true;
	export let attributes: CanvasRenderingContext2DSettings = {
		desynchronized: true
	};

	let canvasElem: HTMLCanvasElement;
	let frame: number;

	onMount(() => {
		handleResize();

		canvas.set(canvasElem);
		context.set($canvas.getContext('2d', attributes) as CanvasRenderingContext2D);

		return animationLoop(render);
	});

	async function render() {
		$context.save();
		$context.scale($pixelRatio, $pixelRatio);
		$entities.forEach(async (entity) => {
			try {
				await entity.render($props);
			} catch (err) {
				console.error(err);
				if (killLoopOnError) {
					cancelAnimationFrame(frame);
					console.warn('Animation loop stopped due to an error');
				}
			}
		});
		$context.restore();
	}

	function handleResize() {
		width.set(window.innerWidth);
		height.set(window.innerHeight);
		pixelRatio.set(window.devicePixelRatio);
	}
</script>

<!-- svelte-ignore component-name-lowercase -->
<canvas
	bind:this={canvasElem}
	width={$width * $pixelRatio}
	height={$height * $pixelRatio}
	style="width: {$width}px; height: {$height}px;"
/>
<svelte:window on:resize|passive={handleResize} />
<slot />
