import { getContext, onMount, onDestroy } from 'svelte';
import { writable, derived, type Writable, type Readable } from 'svelte/store';

type RenderFunction = (props: GameProps, dt?: number) => void;
type SetupFunction = (props: GameProps) => Promise<any> | any;

type Renderable = RenderFunction | {
	render: RenderFunction;
	setup: SetupFunction;
};

export type GameProps = {
	cellSize: number,
	gridWidth: number,
	gridHeight: number,
	grid: Array<number>,
	context: CanvasRenderingContext2D,
	canvas: HTMLCanvasElement,
	width: number,
	height: number,
	offsetX: number,
	offsetY: number,
	pixelRatio: number,
	time: number
}

export type Entity = {
	ready: boolean;
	mounted: boolean;
	render?: RenderFunction;
	setup?: SetupFunction;
};

export type GameApi = {
	add: (entity: Entity) => void;
	remove: (entity: Entity) => void;
}

// Some props for the app
export const cellSize = writable(3);
export const gridWidth = writable(200);
export const gridHeight = writable(200);
export const grid = writable<Array<number>>(new Array(200 * 200));
export const offsetX = writable(0);
export const offsetY = writable(0);
export const width = writable(0);
export const height = writable(0);
export const pixelRatio = writable(0);
export const context = writable<CanvasRenderingContext2D>();
export const canvas = writable<HTMLCanvasElement>();
export const time = writable(0);

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
	time
});

export const key = Symbol();

export const renderable = (render: Renderable) => {
	const api: GameApi = getContext(key);

	const element: Entity = {
		ready: false,
		mounted: false
	};

	if (typeof render === 'function') element.render = render;
	else if (render) {
		if (render.render) element.render = render.render;
		if (render.setup) element.setup = render.setup;
	}

	api.add(element);

	onMount(() => {
		element.mounted = true;
		return () => {
			api.remove(element);
			element.mounted = false;
		};
	});
}

function deriveObject<T>(obj: { [P in keyof(T)]: Writable<T[P]>}) : Readable<T> {
	const keys = Object.keys(obj);
	const list: any[] = Object.values(obj);

	return derived(list, (array) => {
		return array.reduce((dict: Record<string, any>, value: any, i: number) => {
			dict[keys[i]] = value;
			return dict;
		}, {}) as T;
	});
}
