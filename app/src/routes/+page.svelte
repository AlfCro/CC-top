<script>
	let count = $state(0);
	let showConfetti = $state(false);
	let mood = $state('glad');

	const moods = [
		{ emoji: '😄', label: 'glad' },
		{ emoji: '🌟', label: 'strålande' },
		{ emoji: '🎉', label: 'festlig' },
		{ emoji: '🌈', label: 'färgglad' },
		{ emoji: '🦋', label: 'lätt' },
		{ emoji: '🌸', label: 'blomstrande' },
	];

	const messages = [
		'Livet är underbart!',
		'Du är fantastisk!',
		'Idag är en bra dag!',
		'Leenden smittar!',
		'Glädje finns överallt!',
		'Du klarar allt!',
	];

	let currentMessage = $state(messages[0]);
	let currentMoodIndex = $state(0);

	function handleClick() {
		count++;
		showConfetti = true;
		currentMessage = messages[count % messages.length];
		currentMoodIndex = count % moods.length;
		mood = moods[currentMoodIndex].label;
		setTimeout(() => (showConfetti = false), 1000);
	}

	const cards = [
		{ emoji: '☀️', title: 'Sol och värme', text: 'Varje dag är full av möjligheter och ljus!' },
		{ emoji: '🌺', title: 'Blommande glädje', text: 'Låt glädjen blomma i ditt hjärta varje dag.' },
		{ emoji: '🎵', title: 'Musikens magi', text: 'Dansa och sjung – livet är en fest!' },
		{ emoji: '🍓', title: 'Söta stunder', text: 'Njut av livets alla söta och härliga ögonblick.' },
		{ emoji: '🦄', title: 'Magiska drömmar', text: 'Drömmar gör livet mer färgglatt och spännande.' },
		{ emoji: '🎈', title: 'Fri som en ballong', text: 'Känn lättheten och friheten i varje andetag.' },
	];
</script>

<main>
	<header class="hero">
		<div class="hero-content">
			<div class="badge">
				{moods[currentMoodIndex].emoji} Känn dig {mood}!
			</div>
			<h1>Välkommen till<br /><span class="highlight">Glädjeappen</span></h1>
			<p class="subtitle">En färgglad plats full av glädje, kärlek och positiva vibbar</p>

			<div class="counter-section">
				<p class="message" class:pop={showConfetti}>{currentMessage}</p>
				<button onclick={handleClick} class="happy-btn">
					Klicka för glädje! {count > 0 ? `(${count})` : ''}
				</button>
				{#if showConfetti}
					<div class="confetti-row">
						{#each ['🎉', '✨', '🌟', '🎊', '💫', '🎈'] as c}
							<span class="confetti-piece">{c}</span>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</header>

	<section class="cards-section">
		<h2>Glädjeord för dagen</h2>
		<div class="cards-grid">
			{#each cards as card}
				<div class="card">
					<div class="card-emoji">{card.emoji}</div>
					<h3>{card.title}</h3>
					<p>{card.text}</p>
				</div>
			{/each}
		</div>
	</section>

	<section class="rainbow-section">
		<h2>Regnbågens färger</h2>
		<div class="rainbow-bar">
			{#each ['#FF6B6B', '#FF9F43', '#FECA57', '#48DBFB', '#FF9FF3', '#54A0FF', '#5F27CD'] as color}
				<div class="rainbow-stripe" style="background:{color}"></div>
			{/each}
		</div>
		<p class="rainbow-text">Precis som regnbågen är livet fullt av vackra färger!</p>
	</section>

	<footer>
		<p>Gjort med <span class="heart">❤️</span> och massor av glädje</p>
		<p class="small">Byggd med Svelte & Bun</p>
	</footer>
</main>

<style>
	main {
		max-width: 1100px;
		margin: 0 auto;
		padding: 0 1.5rem 3rem;
	}

	/* ── Hero ── */
	.hero {
		text-align: center;
		padding: 4rem 1rem 3rem;
	}

	.badge {
		display: inline-block;
		background: linear-gradient(135deg, #ff9ff3, #feca57);
		color: #5f27cd;
		font-weight: 800;
		font-size: 1rem;
		padding: 0.4rem 1.2rem;
		border-radius: 999px;
		margin-bottom: 1.5rem;
		box-shadow: 0 4px 14px rgba(255,159,243,0.5);
	}

	h1 {
		font-size: clamp(2.4rem, 6vw, 4rem);
		font-weight: 900;
		line-height: 1.15;
		color: #2d3436;
		margin-bottom: 1rem;
	}

	.highlight {
		background: linear-gradient(135deg, #fd79a8, #6c5ce7, #00cec9);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.subtitle {
		font-size: 1.2rem;
		color: #636e72;
		max-width: 540px;
		margin: 0 auto 2.5rem;
		line-height: 1.6;
	}

	/* ── Counter ── */
	.counter-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.message {
		font-size: 1.5rem;
		font-weight: 800;
		color: #6c5ce7;
		min-height: 2rem;
		transition: transform 0.2s;
	}

	.message.pop {
		transform: scale(1.15);
	}

	.happy-btn {
		background: linear-gradient(135deg, #fd79a8, #e17055);
		color: white;
		border: none;
		padding: 1rem 2.5rem;
		border-radius: 999px;
		font-size: 1.2rem;
		font-weight: 800;
		font-family: 'Nunito', sans-serif;
		cursor: pointer;
		box-shadow: 0 6px 20px rgba(253,121,168,0.5);
		transition: transform 0.15s, box-shadow 0.15s;
	}

	.happy-btn:hover {
		transform: translateY(-3px) scale(1.04);
		box-shadow: 0 10px 28px rgba(253,121,168,0.6);
	}

	.happy-btn:active {
		transform: scale(0.97);
	}

	.confetti-row {
		display: flex;
		gap: 0.5rem;
		font-size: 1.8rem;
		animation: pop-in 0.4s ease;
	}

	.confetti-piece {
		animation: spin 0.6s ease;
	}

	@keyframes pop-in {
		from { transform: scale(0); opacity: 0; }
		to   { transform: scale(1); opacity: 1; }
	}

	@keyframes spin {
		0%   { transform: rotate(0deg) scale(0.5); }
		60%  { transform: rotate(20deg) scale(1.2); }
		100% { transform: rotate(0deg) scale(1); }
	}

	/* ── Cards ── */
	.cards-section {
		margin-top: 4rem;
	}

	.cards-section h2,
	.rainbow-section h2 {
		text-align: center;
		font-size: 2rem;
		font-weight: 900;
		color: #2d3436;
		margin-bottom: 2rem;
	}

	.cards-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1.5rem;
	}

	.card {
		background: white;
		border-radius: 20px;
		padding: 2rem 1.5rem;
		text-align: center;
		box-shadow: 0 8px 30px rgba(0,0,0,0.07);
		transition: transform 0.2s, box-shadow 0.2s;
		border-top: 5px solid transparent;
		border-image: linear-gradient(135deg, #fd79a8, #6c5ce7, #00cec9) 1;
		border-image-slice: 1;
	}

	.card:hover {
		transform: translateY(-6px);
		box-shadow: 0 16px 40px rgba(0,0,0,0.12);
	}

	.card-emoji {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.card h3 {
		font-size: 1.2rem;
		font-weight: 800;
		color: #2d3436;
		margin-bottom: 0.6rem;
	}

	.card p {
		color: #636e72;
		line-height: 1.6;
		font-size: 0.95rem;
	}

	/* ── Rainbow ── */
	.rainbow-section {
		margin-top: 4rem;
		text-align: center;
	}

	.rainbow-bar {
		display: flex;
		height: 20px;
		border-radius: 999px;
		overflow: hidden;
		margin-bottom: 1.5rem;
		box-shadow: 0 4px 14px rgba(0,0,0,0.12);
	}

	.rainbow-stripe {
		flex: 1;
	}

	.rainbow-text {
		font-size: 1.1rem;
		font-weight: 700;
		color: #6c5ce7;
	}

	/* ── Footer ── */
	footer {
		margin-top: 4rem;
		text-align: center;
		color: #636e72;
		font-weight: 600;
		line-height: 1.8;
	}

	.heart {
		font-size: 1.1rem;
	}

	.small {
		font-size: 0.85rem;
		opacity: 0.7;
	}
</style>
