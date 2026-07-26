<script lang="ts">
	import { onMount } from 'svelte';
	import { schedule, study } from '$lib/data/content';
	import { ensureGsap, ScrollTrigger } from '$lib/motion/gsap-setup';
	import { ui } from '$lib/state/ui.svelte';
	import { tempo } from '$lib/motion/tempo';
	import ClockIcon from 'phosphor-svelte/lib/ClockIcon';

	let root: HTMLElement | undefined = $state();

	onMount(() => {
		if (!root || ui.reducedMotion) return;
		const gsap = ensureGsap();
		const ctx = gsap.context(() => {
			const blocks = root!.querySelectorAll('.block');
			gsap.set(blocks, { opacity: 0, y: 24 });
			ScrollTrigger.create({
				trigger: root,
				start: 'top 72%',
				once: true,
				onEnter: () => {
					gsap.to(blocks, {
						opacity: 1,
						y: 0,
						duration: tempo.revealDuration,
						stagger: 0.18,
						ease: tempo.revealEase
					});
					// One-shot “session clock” fill — like a real market day unfolding once
					gsap.fromTo(
						'.day-fill',
						{ scaleX: 0 },
						{
							scaleX: 1,
							duration: 2.4,
							ease: 'power1.inOut',
							delay: 0.2,
							transformOrigin: 'left center'
						}
					);
				}
			});
		}, root);
		return () => ctx.revert();
	});
</script>

<section id="schedule" class="section-shell" bind:this={root} aria-labelledby="schedule-title">
	<div class="reveal">
		<p class="section-label">A real study day</p>
		<h2 id="schedule-title" class="section-title">The daily program</h2>
		<p class="section-desc">
			Added load ≈ {study.dailyCommitment} on top of the trading you already do. This is a session checklist
			— not a motivational loop.
		</p>
	</div>

	<div class="day-meter" aria-hidden="true">
		<span>Pre-market</span>
		<div class="day-track"><span class="day-fill"></span></div>
		<span>Evening</span>
	</div>

	<div class="grid">
		{#each schedule as block (block.title)}
			<article class="card-surface block" style:--accent={block.accent}>
				<p class="time-label">
					<ClockIcon size={13} weight="bold" />
					{block.timeLabel}
				</p>
				<h3>{block.title}</h3>
				<ul>
					{#each block.items as item (item.text)}
						<li>
							<span class="time">{item.time}</span>
							<span class="text">{item.text}</span>
						</li>
					{/each}
				</ul>
			</article>
		{/each}
	</div>
</section>

<style>
	.day-meter {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin: 0 0 1.75rem;
		font-size: 0.62rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--alpha-faint);
	}

	.day-track {
		flex: 1;
		height: 3px;
		border-radius: 2px;
		background: var(--alpha-border);
		overflow: hidden;
	}

	.day-fill {
		display: block;
		height: 100%;
		width: 100%;
		transform: scaleX(0);
		transform-origin: left center;
		background: linear-gradient(90deg, #3b8beb, #b82020, #2bbfa0, #d4a853);
	}

	.grid {
		display: grid;
		gap: 1.15rem;
	}

	@media (min-width: 760px) {
		.grid {
			grid-template-columns: 1fr 1fr;
		}
	}

	.block {
		padding: 1.75rem;
		border-radius: 14px;
		transition: border-color 0.7s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.block:hover {
		border-color: color-mix(in srgb, var(--accent) 30%, var(--alpha-border));
	}

	.time-label {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		margin: 0 0 0.55rem;
		font-size: 0.65rem;
		font-weight: 600;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--accent);
	}

	h3 {
		margin: 0 0 1rem;
		font-size: 1.08rem;
		font-weight: 600;
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.55rem;
	}

	li {
		display: grid;
		grid-template-columns: 58px 1fr;
		gap: 0.65rem;
		font-size: 0.88rem;
		color: var(--alpha-muted);
		line-height: 1.5;
		padding: 0.35rem 0;
		border-top: 1px solid rgba(36, 36, 41, 0.7);
	}

	li:first-child {
		border-top: none;
	}

	.time {
		font-size: 0.76rem;
		font-weight: 500;
		color: var(--alpha-faint);
		padding-top: 0.1rem;
		font-variant-numeric: tabular-nums;
	}
</style>
