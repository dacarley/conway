export function animationLoop(fn: () => unknown) {
    let frame: number;

    async function loop() {
        frame = requestAnimationFrame(loop);
        await fn();
    }

    loop();

    return () => {
        cancelAnimationFrame(frame);
    };
}