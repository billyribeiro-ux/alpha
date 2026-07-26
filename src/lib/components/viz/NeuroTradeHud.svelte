<script lang="ts">
	/**
	 * Hero HUD chips — study protocol meets trading terminal.
	 */
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { ui } from '$lib/state/ui.svelte';
	import { ALPHA_HZ, alphaPower, stressIndex } from '$lib/motion/signals';
	import BrainIcon from 'phosphor-svelte/lib/BrainIcon';
	import PulseIcon from 'phosphor-svelte/lib/PulseIcon';
	import ChartLineUpIcon from 'phosphor-svelte/lib/ChartLineUpIcon';
	import TargetIcon from 'phosphor-svelte/lib/TargetIcon';

	let alphaPct = $state(58);
	let stressPct = $state(31);
	let band = $state(`${ALPHA_HZ.min}–${ALPHA_HZ.max} Hz`);

	onMount(() => {
		if (!browser || ui.reducedMotion) return;
		let raf = 0;
		const t0 = performance.now();
		const loop = (now: number) => {
			const t = (now - t0) / 1000;
			alphaPct = Math.round(alphaPower(t) * 100);
			stressPct = Math.round(stressIndex(t) * 100);
			band = `${(ALPHA_HZ.min + alphaPower(t) * 2).toFixed(1)} Hz`;
			raf = requestAnimationFrame(loop);
		};
		raf = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(raf);
	});
</script>

<div class="hud" aria-hidden="true">
	<div class="chip">
		<BrainIcon size={14} weight="duotone" />
		<div>
			<span class="k">Target band</span>
			<span class="v">α {ALPHA_HZ.min}–{ALPHA_HZ.max} Hz</span>
		</div>
	</div>
	<div class="chip live">
		<PulseIcon size={14} weight="duotone" />
		<div>
			<span class="k">α model</span>
			<span class="v">{alphaPct}% · {band}</span>
		</div>
	</div>
	<div class="chip warn">
		<TargetIcon size={14} weight="duotone" />
		<div>
			<span class="k">β reactivity</span>
			<span class="v">{stressPct}%</span>
		</div>
	</div>
	<div class="chip gold">
		<ChartLineUpIcon size={14} weight="duotone" />
		<div>
			<span class="k">Protocol size</span>
			<span class="v">1 contract</span>
		</div>
	</div>
</div>

<style>
	.hud {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.5rem;
		margin: 0 auto 1.75rem;
		max-width: 720px;
	}

	.chip {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.45rem 0.75rem;
		border-radius: 12px;
		border: 1px solid var(--alpha-border);
		background: rgba(10, 10, 12, 0.72);
		backdrop-filter: blur(12px);
		color: var(--alpha-blue);
		text-align: left;
	}

	.chip.live {
		color: var(--alpha-teal);
		border-color: color-mix(in srgb, var(--alpha-blue) 35%, var(--alpha-border));
		box-shadow: 0 0 24px -12px rgba(59, 139, 235, 0.55);
	}

	.chip.warn {
		color: var(--alpha-red-bright);
	}

	.chip.gold {
		color: var(--alpha-gold);
	}

	.chip div {
		display: flex;
		flex-direction: column;
		line-height: 1.15;
	}

	.k {
		font-size: 0.58rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--alpha-faint);
		font-weight: 600;
	}

	.v {
		font-size: 0.78rem;
		font-weight: 600;
		color: var(--alpha-text);
		font-variant-numeric: tabular-nums;
	}
</style>
