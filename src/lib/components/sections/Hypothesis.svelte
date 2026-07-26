<script lang="ts">
	import { study } from '$lib/data/content';
	import DataPipeline from '$lib/components/viz/DataPipeline.svelte';
	import BrainIcon from 'phosphor-svelte/lib/BrainIcon';
	import ChartLineUpIcon from 'phosphor-svelte/lib/ChartLineUpIcon';
</script>

<section id="hypothesis" class="section-shell" aria-labelledby="hypothesis-title">
	<div class="intro reveal">
		<p class="section-label">The research question</p>
		<h2 id="hypothesis-title" class="section-title">Why most traders fail</h2>
		<p class="section-desc">{study.problem}</p>
	</div>

	<div class="thesis-row reveal">
		<div class="pill">
			<BrainIcon size={18} weight="duotone" />
			<span>α state {study.alphaBand.minHz}–{study.alphaBand.maxHz} Hz</span>
		</div>
		<span class="x" aria-hidden="true">coupled with</span>
		<div class="pill trade">
			<ChartLineUpIcon size={18} weight="duotone" />
			<span>One-contract live trading</span>
		</div>
	</div>

	<div class="grid">
		<article class="hypothesis card-surface reveal">
			<div class="hyp-label">
				<BrainIcon size={16} weight="duotone" />
				Formal hypothesis
			</div>
			<p class="hyp-body">
				Day traders who learn to achieve and maintain an
				<strong>alpha brainwave state ({study.alphaBand.minHz}–{study.alphaBand.maxHz} Hz)</strong>
				will show reduced emotional reactivity, improved technical execution, shorter learning curves,
				and greater consistency — <em>compared to their own pre-study baseline</em>.
			</p>
			<ul class="hyp-metrics">
				<li>Within-subject design — you are your own control</li>
				<li>Outcomes tied to entries/exits, not vibes</li>
				<li>Learning curve vs your first weeks, not vs gurus</li>
				<li>Consistency over 90 days, not a single lucky session</li>
			</ul>
			<p class="honest">
				No performance guarantees. {study.accountNote}. Losses remain possible.
			</p>
		</article>

		<div class="reveal viz">
			<DataPipeline />
		</div>
	</div>
</section>

<style>
	.thesis-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.65rem 0.85rem;
		margin: -0.5rem 0 2rem;
	}

	.pill {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.55rem 0.9rem;
		border-radius: 999px;
		border: 1px solid color-mix(in srgb, var(--alpha-blue) 30%, var(--alpha-border));
		background: rgba(59, 139, 235, 0.08);
		color: var(--alpha-blue);
		font-size: 0.82rem;
		font-weight: 600;
	}

	.pill.trade {
		border-color: color-mix(in srgb, var(--alpha-gold) 35%, var(--alpha-border));
		background: rgba(212, 168, 83, 0.08);
		color: var(--alpha-gold);
	}

	.pill span {
		color: var(--alpha-text);
	}

	.x {
		color: var(--alpha-faint);
		font-size: 0.75rem;
		font-weight: 500;
		letter-spacing: 0.04em;
	}

	.grid {
		display: grid;
		gap: 1.25rem;
	}

	@media (min-width: 960px) {
		.grid {
			grid-template-columns: 0.95fr 1.05fr;
			align-items: stretch;
		}
	}

	.hypothesis {
		padding: 2.1rem 1.85rem 1.75rem 2.1rem;
		position: relative;
		overflow: hidden;
		height: 100%;
	}

	.hypothesis::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 4px;
		background: linear-gradient(180deg, var(--alpha-red), var(--alpha-blue), var(--alpha-gold));
		border-radius: 4px 0 0 4px;
	}

	.hyp-label {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		font-size: 0.65rem;
		font-weight: 600;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: var(--alpha-blue);
		margin-bottom: 1rem;
	}

	.hyp-body {
		margin: 0 0 1.15rem;
		font-family: var(--font-display);
		font-size: clamp(1.05rem, 2.1vw, 1.22rem);
		line-height: 1.75;
		font-style: italic;
		color: var(--alpha-text);
	}

	.hyp-body strong {
		color: var(--alpha-red-bright);
		font-style: normal;
		font-weight: 600;
	}

	.hyp-body em {
		font-style: normal;
		color: var(--alpha-muted);
	}

	.hyp-metrics {
		list-style: none;
		margin: 0 0 1rem;
		padding: 0;
		display: grid;
		gap: 0.45rem;
	}

	.hyp-metrics li {
		position: relative;
		padding-left: 1.1rem;
		font-size: 0.88rem;
		color: var(--alpha-muted);
		line-height: 1.5;
	}

	.hyp-metrics li::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0.55rem;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--alpha-gold);
	}

	.honest {
		margin: 0;
		font-size: 0.78rem;
		color: var(--alpha-faint);
		line-height: 1.5;
		border-top: 1px solid var(--alpha-border);
		padding-top: 0.85rem;
	}

	.viz {
		min-height: 100%;
	}
</style>
