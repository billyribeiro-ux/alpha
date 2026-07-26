<script lang="ts">
	import { assessments } from '$lib/data/content';
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';
</script>

<section id="assessments" class="section-shell" aria-labelledby="assess-title">
	<div class="reveal">
		<p class="section-label">Study visits</p>
		<h2 id="assess-title" class="section-title">Assessment schedule</h2>
		<p class="section-desc">
			Three hard checkpoints — brain snapshot + questionnaire each time. Same structure a real
			protocol uses: baseline, mid, final (+ delayed follow-up).
		</p>
	</div>

	<div class="track reveal" aria-hidden="true">
		<span class="node">T0</span>
		<span class="bar"></span>
		<span class="node">T45</span>
		<span class="bar"></span>
		<span class="node">T90</span>
		<span class="bar thin"></span>
		<span class="node late">T180</span>
	</div>

	<div class="grid">
		{#each assessments as a, i (a.title)}
			<article class="card card-surface reveal">
				<p class="when">{a.when}</p>
				<h3>{a.title}</h3>
				<ul>
					{#each a.items as item (item)}
						<li>
							<span class="arrow"><ArrowRightIcon size={12} weight="bold" /></span>
							{item}
						</li>
					{/each}
				</ul>
				{#if i === 2}
					<p class="follow">Includes Day 180 follow-up — durability after the protocol ends.</p>
				{/if}
			</article>
		{/each}
	</div>
</section>

<style>
	.track {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0 0 1.75rem;
		font-size: 0.65rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		color: var(--alpha-faint);
	}

	.node {
		padding: 0.3rem 0.5rem;
		border-radius: 6px;
		border: 1px solid var(--alpha-border);
		background: var(--alpha-surface);
		font-variant-numeric: tabular-nums;
	}

	.node.late {
		border-color: color-mix(in srgb, var(--alpha-gold) 40%, var(--alpha-border));
		color: var(--alpha-gold);
	}

	.bar {
		flex: 1;
		height: 2px;
		background: linear-gradient(90deg, var(--alpha-blue), var(--alpha-teal));
		opacity: 0.45;
		border-radius: 1px;
	}

	.bar.thin {
		opacity: 0.25;
		background: var(--alpha-gold);
	}

	.grid {
		display: grid;
		gap: 1.15rem;
	}

	@media (min-width: 800px) {
		.grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.card {
		padding: 1.75rem;
		border-radius: 14px;
		text-align: center;
		display: flex;
		flex-direction: column;
	}

	.when {
		margin: 0 0 0.45rem;
		font-size: 0.65rem;
		font-weight: 600;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--alpha-faint);
	}

	h3 {
		margin: 0 0 1rem;
		font-family: var(--font-display);
		font-size: 1.2rem;
		font-weight: 600;
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		text-align: left;
		display: grid;
		gap: 0.4rem;
		flex: 1;
	}

	li {
		display: flex;
		gap: 0.45rem;
		align-items: flex-start;
		font-size: 0.84rem;
		color: var(--alpha-muted);
		line-height: 1.5;
	}

	.arrow {
		color: var(--alpha-faint);
		margin-top: 0.15rem;
		flex-shrink: 0;
	}

	.follow {
		margin: 1rem 0 0;
		font-size: 0.72rem;
		color: var(--alpha-gold);
		line-height: 1.45;
		text-align: left;
	}
</style>
