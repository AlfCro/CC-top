<script>
	let { children } = $props();
</script>

<svelte:head>
	<title>Glad App</title>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
</svelte:head>

{@render children()}

<style>
	:global(*) {
		box-sizing: border-box;
		margin: 0;
		padding: 0;
	}

	:global(body) {
		font-family: 'Nunito', sans-serif;
		background: linear-gradient(135deg, #fff9c4 0%, #fce4ec 50%, #e8f5e9 100%);
		min-height: 100vh;
	}
</style>
