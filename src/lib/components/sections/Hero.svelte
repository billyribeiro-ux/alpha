<script lang="ts">
	/**
	 * Full-bleed cortex stage. Copy sits in a bottom glass dock —
	 * never covering the 3D brain.
	 */
	import { onMount } from 'svelte';
	import { study } from '$lib/data/content';
	import { assets } from '$lib/data/assets';
	import { ui } from '$lib/state/ui.svelte';
	import { ensureGsap } from '$lib/motion/gsap-setup';
	import { magnetic } from '$lib/actions/magnetic';
	import { splitText } from '$lib/actions/split-text';
	import { scrollToId } from '$lib/motion/smooth-scroll';
	import NeuralScene from '$lib/components/viz/NeuralScene.svelte';
	import NeuroTradeHud from '$lib/components/viz/NeuroTradeHud.svelte';
	import ArrowDownIcon from 'phosphor-svelte/lib/ArrowDownIcon';

	let root: HTMLElement | undefined = $state();

	onMount(() => {
		if (!root || ui.reducedMotion) return;
		const gsap = ensureGsap();
		const ctx = gsap.context(() => {
			const tl = gsap.timeline({ delay: 0.2 });

			// Dock entrance
			tl.from('.dock', {
				y: 40,
				opacity: 0,
				duration: 1,
				ease: 'power3.out'
			});

			// Split text reveal on the title
			tl.from(
				'.split-word',
				{
					yPercent: 100,
					opacity: 0,
					duration: 0.8,
					stagger: 0.05,
					ease: 'power4.out'
				},
				'-=0.6'
			);

			// Stagger rest of dock items
			tl.from(
				'.dock > *:not(.brand), .kicker-row',
				{
					y: 20,
					opacity: 0,
					stagger: 0.05,
					duration: 0.7,
					ease: 'power2.out'
				},
				'-=0.5'
			);
		}, root);
		return () => ctx.revert();
	});
</script>

<section id="hero" class="hero" bind:this={root} aria-labelledby="hero-title">
	<!-- Ambient Glow Spotlights -->
	<div class="bg-spot-red" style="top: -100px; left: 50%; transform: translateX(-50%);"></div>

	<!-- FULL VIEWPORT: brain only -->
	<div class="stage-wrap">
		<NeuralScene />
	</div>

	<!-- Docked content under the model -->
	<div class="dock">
		<div class="brand">
			<img
				class="badge"
				src={assets.trickTradesLogo.src}
				alt={assets.trickTradesLogo.alt}
				width="36"
				height="36"
				decoding="async"
			/>
			<div>
				<div class="kicker-row">
					<p class="kicker">{study.brand} research</p>
					<span class="live-badge"><span class="dot"></span> Enrolling</span>
				</div>
				<h1 id="hero-title" use:splitText>Project <em>ALPHA</em></h1>
			</div>
		</div>

		<p class="sub">{study.tagline}</p>
		<p class="bridge">
			<strong>Muse EEG</strong> · α {study.alphaBand.minHz}–{study.alphaBand.maxHz} Hz training ·
			<strong>one-contract</strong> live execution · measured by
			{study.investigator.name}
		</p>

		<div class="hud"><NeuroTradeHud /></div>

		<p class="disc">[{study.disclaimer.toUpperCase()}]</p>

		<div class="meta">
			<div><span class="v">{study.days}</span><span class="l">Days</span></div>
			<div><span class="v">{study.participants}</span><span class="l">Traders</span></div>
			<div><span class="v sm">Krigolson</span><span class="l">PI</span></div>
		</div>

		<div class="actions">
			<button class="btn-primary" use:magnetic={0.18} onclick={() => ui.openApply()}>
				Apply for the study
			</button>
			<button class="btn-ghost" onclick={() => scrollToId('hypothesis')}>Protocol</button>
		</div>
	</div>

	<button class="scroll" type="button" onclick={() => scrollToId('hypothesis')} aria-label="Scroll">
		<span>Explore</span>
		<ArrowDownIcon size={14} weight="bold" />
	</button>
</section>

<style>
	.hero {
		position: relative;
		min-height: 100svh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.stage-wrap {
		position: relative;
		flex: 1;
		min-height: 58svh;
	}

	.dock {
		position: relative;
		z-index: 3;
		width: min(680px, calc(100% - 1.5rem));
		margin: -1rem auto 0;
		padding: 1.35rem 1.25rem 1.75rem;
		border-radius: 18px 18px 0 0;
		border: 1px solid rgba(46, 46, 53, 0.95);
		border-bottom: none;
		background: linear-gradient(180deg, rgba(12, 14, 18, 0.94), rgba(10, 10, 12, 0.99));
		backdrop-filter: blur(18px) saturate(1.15);
		box-shadow: 0 -30px 80px -30px rgba(0, 0, 0, 0.85);
		text-align: center;
	}

	.brand {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		margin-bottom: 0.85rem;
		text-align: left;
	}

	.badge {
		width: 36px;
		height: 36px;
		border-radius: 9px;
		object-fit: cover;
		background: #000;
	}

	.kicker-row {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin-bottom: 0.2rem;
	}

	.kicker {
		margin: 0;
		font-size: 0.62rem;
		font-weight: 600;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--alpha-faint);
	}

	h1 {
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(1.7rem, 4vw, 2.35rem);
		font-weight: 700;
		line-height: 1.1;
		letter-spacing: -0.02em;
	}

	h1 em {
		font-style: italic;
	}

	h1 em,
	h1 em :global(.split-word) {
		background: linear-gradient(135deg, #ff4d4d 0%, #e03232 50%, #ff7373 100%);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		display: inline-block;
	}

	.sub {
		margin: 0 auto 0.5rem;
		max-width: 520px;
		font-size: 0.98rem;
		color: var(--alpha-muted);
		line-height: 1.7;
	}

	.bridge {
		margin: 0 auto 0.85rem;
		max-width: 480px;
		font-size: 0.82rem;
		color: var(--alpha-faint);
		line-height: 1.55;
	}

	.bridge strong {
		color: var(--alpha-text);
		font-weight: 600;
	}

	.hud {
		margin-bottom: 0.65rem;
	}

	.disc {
		margin: 0 0 1rem;
		font-size: 0.6rem;
		letter-spacing: 0.14em;
		font-weight: 600;
		color: var(--alpha-faint);
	}

	.meta {
		display: flex;
		justify-content: center;
		gap: 1.75rem;
		margin-bottom: 1.25rem;
	}

	.meta .v {
		display: block;
		font-family: var(--font-display);
		font-size: 1.35rem;
		font-weight: 600;
	}

	.meta .v.sm {
		font-size: 1.05rem;
	}

	.meta .l {
		font-size: 0.6rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--alpha-faint);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
		justify-content: center;
	}

	.scroll {
		position: absolute;
		right: 1.1rem;
		bottom: 1.1rem;
		z-index: 4;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.58rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--alpha-faint);
	}

	@media (max-width: 640px) {
		.stage-wrap {
			min-height: 50svh;
		}
		.scroll {
			display: none;
		}
	}

	@media (min-width: 960px) {
		.stage-wrap {
			min-height: 64svh;
		}
		.dock {
			padding: 1.6rem 1.75rem 2rem;
			margin-top: -1.5rem;
		}
	}
</style>
