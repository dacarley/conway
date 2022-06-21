import { getContext, onMount } from 'svelte';
import { writable, derived, type Writable, type Readable } from 'svelte/store';

const DEFAULT_GRID_WIDTH = 1000;
const DEFAULT_GRID_HEIGHT = 1000;

type RenderFunction = (props: GameProps, dt?: number) => void;

type Metrics = {
	fps: number,
	generations: number
}

export type GameProps = {
	cellSize: number,
	gridWidth: number,
	gridHeight: number,
	grid: SharedArrayBuffer,
	context: CanvasRenderingContext2D,
	canvas: HTMLCanvasElement,
	width: number,
	height: number,
	offsetX: number,
	offsetY: number,
	pixelRatio: number,
	time: number,
	metrics: Metrics,
	worker: Worker
}

export type Entity = {
	render: RenderFunction;
};

export type GameApi = {
	add: (entity: Entity) => void;
	remove: (entity: Entity) => void;
}

// Some props for the app
export const cellSize = writable(1);
export const gridWidth = writable(DEFAULT_GRID_WIDTH);
export const gridHeight = writable(DEFAULT_GRID_HEIGHT);
export const grid = writable(new SharedArrayBuffer(DEFAULT_GRID_WIDTH * DEFAULT_GRID_HEIGHT));
export const offsetX = writable(250);
export const offsetY = writable(50);
export const width = writable(0);
export const height = writable(0);
export const pixelRatio = writable(0);
export const context = writable<CanvasRenderingContext2D>();
export const canvas = writable<HTMLCanvasElement>();
export const time = writable(0);
export const metrics = writable({ fps: 0, generations: 0 });
export const worker = writable<Worker>();

// A more convenient store for grabbing all game props
export const props = deriveObject<GameProps>({
	cellSize,
	gridWidth,
	gridHeight,
	grid,
	context,
	canvas,
	offsetX,
	offsetY,
	width,
	height,
	pixelRatio,
	time,
	metrics,
	worker
});

export const key = Symbol();

export const onRender = (render: RenderFunction) => {
	const entity: Entity = {
		render: () => { }
	};

	const api: GameApi = getContext(key);
	api.add(entity);

	onMount(() => {
		entity.render = render;
		return () => {
			api.remove(entity);
			entity.render = () => { }
		};
	});
}

export const randomize = (gridBuffer: ArrayBuffer) => {
	const grid = new Uint8Array(gridBuffer);
	for (let i = 0; i < grid.length; ++i) {
		grid[i] = Math.random() > 0.95 ? 1 : 0;
	}
}

function deriveObject<T>(obj: { [P in keyof (T)]: Writable<T[P]> }): Readable<T> {
	const keys = Object.keys(obj);
	const list: any[] = Object.values(obj);

	return derived(list, (array) => {
		return array.reduce((dict: Record<string, any>, value: any, i: number) => {
			dict[keys[i]] = value;
			return dict;
		}, {}) as T;
	});
}
