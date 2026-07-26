<script lang="ts">
	import { pillars } from '$lib/data/content';

	const when = ['Any time of day', 'Pre-market (−60 to open)', 'Every live session'] as const;
	const duration = ['10–15 min', '15–30 min', 'Full session'] as const;
</script>

<section id="pillars" class="section-shell" aria-labelledby="pillars-title">
	<div class="reveal">
		<p class="section-label">Daily protocol</p>
		<h2 id="pillars-title" class="section-title">The three pillars</h2>
		<p class="section-desc">
			Not three apps to open randomly — one daily stack. Miss the stack and the research loses a
			day of usable data.
		</p>
	</div>

	<div class="grid">
		{#each pillars as pillar, i (pillar.num)}
			<article class="pillar card-surface reveal" style:--accent={pillar.accent}>
				<div class="bar" aria-hidden="true"></div>
				<div class="meta">
					<span class="num">{pillar.num}</span>
					<span class="when">{when[i]}</span>
				</div>
				<p class="sub">{pillar.sub}</p>
				<h3>{pillar.title}</h3>
				<p class="dur">{duration[i]}</p>
				<p class="body">{pillar.body}</p>
			</article>
		{/each}
	</div>
</section>

<style>
	.grid {
		display: grid;
		gap: 1.25rem;
	}

	@media (min-width: 860px) {
		.grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.pillar {
		padding: 2rem 1.65rem 1.75rem;
		border-radius: 16px;
		position: relative;
		overflow: hidden;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.pillar:hover {
		transform: translateY(-2px);
	}

	.bar {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: var(--accent);
	}

	.meta {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		margin-bottom: 0.5rem;
		gap: 0.5rem;
	}

	.num {
		font-family: var(--font-display);
		font-size: 2.4rem;
		font-weight: 700;
		line-height: 1;
		color: color-mix(in srgb, var(--accent) 28%, transparent);
	}

	.when {
		font-size: 0.62rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--alpha-faint);
		text-align: right;
	}

	.sub {
		margin: 0 0 0.4rem;
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--accent);
	}

	h3 {
		margin: 0 0 0.35rem;
		font-size: 1.12rem;
		font-weight: 600;
	}

	.dur {
		margin: 0 0 0.85rem;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--alpha-muted);
		font-variant-numeric: tabular-nums;
	}

	.body {
		margin: 0;
		font-size: 0.9rem;
		color: var(--alpha-muted);
		line-height: 1.7;
		flex: 1;
	}
</style>
