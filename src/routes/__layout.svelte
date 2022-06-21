<script lang="ts">
	import '../app.css';
</script>

<main>
	<slot />
</main>

<style>
	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-width: 100vw;
		min-height: 100vh;
		margin: 0 auto;
		box-sizing: border-box;
		background-color: hsl(0, 0%, 5%);
	}
</style>
