<script lang="ts">
	/**
	 * 90-day journey — paced like the study: preload → foundation → integration → mastery.
	 * Rail fill scrubs slowly with scroll (progress over months, not a snap).
	 */
	import { onMount } from 'svelte';
	import { phases } from '$lib/data/content';
	import { ensureGsap, ScrollTrigger } from '$lib/motion/gsap-setup';
	import { tempo } from '$lib/motion/tempo';
	import { ui } from '$lib/state/ui.svelte';
	import CheckIcon from 'phosphor-svelte/lib/CheckIcon';

	let root: HTMLElement | undefined = $state();
	let active = $state(0);

	onMount(() => {
		if (!root || ui.reducedMotion) return;
		const gsap = ensureGsap();
		const ctx = gsap.context(() => {
			const cards = gsap.utils.toArray<HTMLElement>('.phase-card');
			cards.forEach((card, i) => {
				ScrollTrigger.create({
					trigger: card,
					start: 'top 65%',
					end: 'bottom 45%',
					onEnter: () => (active = i),
					onEnterBack: () => (active = i)
				});

				gsap.from(card, {
					scrollTrigger: {
						trigger: card,
						start: 'top 88%',
						toggleActions: 'play none none reverse'
					},
					x: i % 2 === 0 ? -28 : 28,
					opacity: 0,
					duration: tempo.phaseDuration,
					delay: i * 0.06,
					ease: 'power2.out'
				});
			});

			// Protocol progress — scrubbed, heavy lag so it feels like a long arc
			gsap.fromTo(
				'.phase-rail-fill',
				{ scaleY: 0 },
				{
					scaleY: 1,
					ease: 'none',
					scrollTrigger: {
						trigger: '.phases',
						start: 'top 70%',
						end: 'bottom 35%',
						scrub: tempo.phaseRailScrub
					},
					transformOrigin: 'top center'
				}
			);
		}, root);
		return () => ctx.revert();
	});
</script>

<section id="journey" class="section-shell" bind:this={root} aria-labelledby="journey-title">
	<div class="reveal">
		<p class="section-label">90-day structure</p>
		<h2 id="journey-title" class="section-title">The journey</h2>
		<p class="section-desc">
			Four phases, in order. Paper first. Live one-contract from Day 6. No skipping to “prove it”
			before baseline exists — that would break the science.
		</p>
	</div>

	<div class="phases">
		<div class="phase-rail" aria-hidden="true">
			<div class="phase-rail-fill"></div>
		</div>

		{#each phases as phase, i (phase.id)}
			<article class="phase-card" class:is-active={active === i} style:--phase={phase.color}>
				<div class="dot-col" aria-hidden="true">
					<span class="dot"></span>
				</div>
				<div class="phase-content card-surface">
					<p class="tag">{phase.tag}</p>
					<h3>{phase.title}</h3>
					<p class="body">{phase.body}</p>
					<ul>
						{#each phase.bullets as bullet (bullet)}
							<li>
								<span class="check"><CheckIcon size={12} weight="bold" /></span>
								{bullet}
							</li>
						{/each}
					</ul>
				</div>
			</article>
		{/each}
	</div>
</section>

<style>
	.phases {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding-left: 0.25rem;
	}

	.phase-rail {
		position: absolute;
		left: 23px;
		top: 12px;
		bottom: 12px;
		width: 2px;
		background: var(--alpha-border);
		border-radius: 2px;
		overflow: hidden;
	}

	.phase-rail-fill {
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, #980000, #3b8beb, #2bbfa0, #d4a853);
		transform-origin: top center;
		will-change: transform;
	}

	.phase-card {
		display: grid;
		grid-template-columns: 50px 1fr;
		gap: 1.25rem;
		padding: 1.1rem 0;
	}

	.dot-col {
		display: flex;
		justify-content: center;
		padding-top: 1.6rem;
		z-index: 1;
	}

	.dot {
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: var(--phase);
		border: 3px solid var(--alpha-bg);
		box-shadow: 0 0 0 0 color-mix(in srgb, var(--phase) 35%, transparent);
		transition:
			box-shadow 0.8s cubic-bezier(0.22, 1, 0.36, 1),
			transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.phase-card.is-active .dot {
		transform: scale(1.12);
		box-shadow: 0 0 0 8px color-mix(in srgb, var(--phase) 16%, transparent);
	}

	.phase-content {
		padding: 1.75rem 1.6rem;
		border-radius: 14px;
		transition:
			border-color 0.7s ease,
			box-shadow 0.9s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.phase-card.is-active .phase-content {
		border-color: color-mix(in srgb, var(--phase) 35%, var(--alpha-border));
		box-shadow: 0 16px 48px -30px color-mix(in srgb, var(--phase) 50%, transparent);
	}

	.tag {
		margin: 0 0 0.35rem;
		font-size: 0.65rem;
		font-weight: 600;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--phase);
	}

	h3 {
		margin: 0 0 0.7rem;
		font-family: var(--font-display);
		font-size: 1.35rem;
		font-weight: 600;
	}

	.body {
		margin: 0 0 1rem;
		font-size: 0.92rem;
		color: var(--alpha-muted);
		line-height: 1.7;
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.45rem;
	}

	li {
		display: flex;
		gap: 0.55rem;
		align-items: flex-start;
		font-size: 0.88rem;
		color: var(--alpha-muted);
		line-height: 1.55;
	}

	.check {
		flex-shrink: 0;
		margin-top: 0.15rem;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		display: grid;
		place-items: center;
		background: color-mix(in srgb, var(--phase) 16%, transparent);
		color: var(--phase);
	}
</style>
