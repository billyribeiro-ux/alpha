<script lang="ts">
	/**
	 * One-shot pipeline: how Project ALPHA actually moves data in the field.
	 * No infinite loop — draws once when scrolled into view.
	 */
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { ensureGsap, ScrollTrigger } from '$lib/motion/gsap-setup';
	import { ui } from '$lib/state/ui.svelte';
	import { tempo } from '$lib/motion/tempo';
	import HeadCircuitIcon from 'phosphor-svelte/lib/HeadCircuitIcon';
	import FileCsvIcon from 'phosphor-svelte/lib/FileCsvIcon';
	import ChartLineIcon from 'phosphor-svelte/lib/ChartLineIcon';
	import FlaskIcon from 'phosphor-svelte/lib/FlaskIcon';

	let root: HTMLElement | undefined = $state();

	const steps = [
		{
			icon: HeadCircuitIcon,
			title: 'Muse on head',
			detail: 'EEG read-only. MIND / STRENGTH + live session with Mind Monitor.'
		},
		{
			icon: FileCsvIcon,
			title: 'CSV export',
			detail: 'Raw session files from Mind Monitor. Weekly submit to research team.'
		},
		{
			icon: ChartLineIcon,
			title: 'Size UP log',
			detail: 'Trade times to the minute. Aligns market decisions with brain state.'
		},
		{
			icon: FlaskIcon,
			title: 'Krigolson lab',
			detail: 'De-identified analysis vs your own baseline — not a leaderboard.'
		}
	] as const;

	onMount(() => {
		if (!browser || !root || ui.reducedMotion) {
			root?.classList.add('is-drawn');
			return;
		}
		const gsap = ensureGsap();
		const ctx = gsap.context(() => {
			const stepsEl = root!.querySelectorAll('.step');
			const connectors = root!.querySelectorAll('.connector-fill');
			gsap.set(stepsEl, { opacity: 0, y: 20 });
			gsap.set(connectors, { scaleX: 0, transformOrigin: 'left center' });

			ScrollTrigger.create({
				trigger: root,
				start: 'top 75%',
				once: true,
				onEnter: () => {
					const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
					stepsEl.forEach((el, i) => {
						tl.to(el, { opacity: 1, y: 0, duration: tempo.revealDuration * 0.75 }, i * 0.28);
						if (i < connectors.length) {
							tl.to(
								connectors[i],
								{ scaleX: 1, duration: 0.9, ease: 'power1.inOut' },
								i * 0.28 + 0.35
							);
						}
					});
					tl.add(() => root?.classList.add('is-drawn'));
				}
			});
		}, root);
		return () => ctx.revert();
	});
</script>

<div class="pipeline card-surface" bind:this={root}>
	<div class="head">
		<span class="kicker">Field data path</span>
		<p class="title">What actually gets measured</p>
		<p class="note">
			Illustrative flow of the real stack — Muse · Mind Monitor · Size UP · PI analysis. Not live
			participant feeds.
		</p>
	</div>

	<div class="track">
		{#each steps as step, i (step.title)}
			{@const Icon = step.icon}
			<div class="step">
				<div class="icon"><Icon size={22} weight="duotone" /></div>
				<h3>{step.title}</h3>
				<p>{step.detail}</p>
			</div>
			{#if i < steps.length - 1}
				<div class="connector" aria-hidden="true">
					<span class="connector-fill"></span>
				</div>
			{/if}
		{/each}
	</div>
</div>

<style>
	.pipeline {
		padding: 1.5rem 1.25rem 1.35rem;
		border-radius: 16px;
		height: 100%;
	}

	.head {
		margin-bottom: 1.35rem;
	}

	.kicker {
		display: block;
		font-size: 0.62rem;
		font-weight: 700;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--alpha-blue);
		margin-bottom: 0.4rem;
	}

	.title {
		margin: 0 0 0.4rem;
		font-family: var(--font-display);
		font-size: 1.2rem;
		font-weight: 600;
	}

	.note {
		margin: 0;
		font-size: 0.78rem;
		color: var(--alpha-faint);
		line-height: 1.5;
	}

	.track {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.5rem;
	}

	@media (min-width: 700px) {
		.track {
			grid-template-columns: 1fr 28px 1fr 28px 1fr 28px 1fr;
			align-items: start;
			gap: 0.35rem;
		}
		.connector {
			margin-top: 1.6rem;
		}
	}

	.step {
		text-align: left;
	}

	.icon {
		width: 42px;
		height: 42px;
		border-radius: 12px;
		display: grid;
		place-items: center;
		margin-bottom: 0.65rem;
		background: rgba(59, 139, 235, 0.1);
		color: var(--alpha-blue);
		border: 1px solid rgba(59, 139, 235, 0.2);
	}

	h3 {
		margin: 0 0 0.35rem;
		font-size: 0.88rem;
		font-weight: 600;
	}

	.step p {
		margin: 0;
		font-size: 0.78rem;
		color: var(--alpha-muted);
		line-height: 1.55;
	}

	.connector {
		height: 2px;
		background: var(--alpha-border);
		border-radius: 1px;
		overflow: hidden;
		position: relative;
	}

	.connector-fill {
		display: block;
		height: 100%;
		width: 100%;
		background: linear-gradient(90deg, var(--alpha-blue), var(--alpha-teal));
		transform: scaleX(0);
		transform-origin: left center;
	}

	@media (max-width: 699px) {
		.connector {
			width: 2px;
			height: 20px;
			margin-left: 20px;
		}
		.connector-fill {
			transform-origin: top center;
		}
	}
</style>
