<script lang="ts">
	import { onMount, setContext } from 'svelte';

	import {
		key,
		width,
		height,
		canvas as canvasStore,
		context as contextStore,
		pixelRatio,
		props,
		time
	} from './game';

	import type { Entity } from './game';

	export let killLoopOnError = true;
	export let attributes: CanvasRenderingContext2DSettings = {
		desynchronized: true
	};

	let listeners: Entity[] = [];
	let canvas: HTMLCanvasElement;
	let context: CanvasRenderingContext2D;
	let frame: number;

	onMount(() => {
		handleResize();

		// prepare canvas stores
		context = canvas.getContext('2d', attributes) as CanvasRenderingContext2D;
		canvasStore.set(canvas);
		contextStore.set(context);

		// setup entities
		listeners.forEach(async (entity) => {
			if (entity.setup) {
				await entity.setup($props);
			}
			entity.ready = true;
		});

		// start game loop
		return createLoop((elapsed, dt) => {
			time.set(elapsed);
			render(dt);
		});
	});

	setContext(key, {
		add(entity: Entity) {
			this.remove(entity);
			listeners.push(entity);
		},
		remove(entity: Entity) {
			const idx = listeners.indexOf(entity);
			if (idx >= 0) listeners.splice(idx, 1);
		}
	});

	function render(dt: number) {
		context.save();
		context.scale($pixelRatio, $pixelRatio);
		listeners.forEach((entity) => {
			try {
				if (entity.mounted && entity.ready && entity.render) {
					entity.render($props, dt);
				}
			} catch (err) {
				console.error(err);
				if (killLoopOnError) {
					cancelAnimationFrame(frame);
					console.warn('Animation loop stopped due to an error');
				}
			}
		});
		context.restore();
	}

	function handleResize() {
		width.set(window.innerWidth);
		height.set(window.innerHeight);
		pixelRatio.set(window.devicePixelRatio);
	}

	function createLoop(fn: (elapsed: number, dt: number) => void) {
		let elapsed = 0;
		let lastTime = performance.now();
		(function loop() {
			frame = requestAnimationFrame(loop);
			const beginTime = performance.now();
			const dt = (beginTime - lastTime) / 1000;
			lastTime = beginTime;
			elapsed += dt;
			fn(elapsed, dt);
		})();
		return () => {
			cancelAnimationFrame(frame);
		};
	}
</script>

<canvas
	bind:this={canvas}
	width={$width * $pixelRatio}
	height={$height * $pixelRatio}
	style="width: {$width}px; height: {$height}px;"
/>
<svelte:window on:resize|passive={handleResize} />
<slot />
