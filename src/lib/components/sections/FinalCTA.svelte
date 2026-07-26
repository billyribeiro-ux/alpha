<script lang="ts">
	import { study } from '$lib/data/content';
	import { assets } from '$lib/data/assets';
	import { ui } from '$lib/state/ui.svelte';
	import { magnetic } from '$lib/actions/magnetic';
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';
	import UsersThreeIcon from 'phosphor-svelte/lib/UsersThreeIcon';
	import FlaskIcon from 'phosphor-svelte/lib/FlaskIcon';
	import ShieldCheckIcon from 'phosphor-svelte/lib/ShieldCheckIcon';
</script>

<section id="apply" class="section-shell cta-section" aria-labelledby="cta-title">
	<div class="cta card-surface reveal">
		<div class="glow" aria-hidden="true"></div>
		<img
			class="cta-mark"
			src={assets.projectAlpha.src}
			alt={assets.projectAlpha.alt}
			width={assets.projectAlpha.width}
			height={assets.projectAlpha.height}
			decoding="async"
			loading="lazy"
		/>
		<p class="section-label">Interest form — not acceptance</p>
		<h2 id="cta-title" class="section-title">Train the brain that places the trade</h2>
		<p class="section-desc">
			{study.participants} seats. {study.days} days. Muse EEG + CORE ALPHA + one-contract live
			sessions under {study.investigator.name}. If you can run the stack and accept financial risk,
			register interest — enrollment is separate.
		</p>

		<ul class="perks">
			<li><FlaskIcon size={18} weight="duotone" /> Within-subject research design</li>
			<li>
				<UsersThreeIcon size={18} weight="duotone" /> Cohort cap {study.participants}
			</li>
			<li><ShieldCheckIcon size={18} weight="duotone" /> De-identified data · voluntary exit</li>
		</ul>

		<div class="actions">
			<button class="btn-primary" use:magnetic={0.14} onclick={() => ui.openApply()}>
				Register study interest
				<ArrowRightIcon size={18} weight="bold" />
			</button>
		</div>
		<p class="fine">
			No fabricated outcomes. Interest ≠ seat. {study.accountNote}. Trading can lose money.
		</p>
	</div>
</section>

<style>
	.cta {
		position: relative;
		overflow: hidden;
		padding: clamp(2rem, 5vw, 3.5rem);
		border-radius: 22px;
		text-align: center;
		background:
			radial-gradient(ellipse 80% 70% at 50% 0%, rgba(152, 0, 0, 0.12), transparent 55%),
			radial-gradient(ellipse 60% 50% at 80% 100%, rgba(59, 139, 235, 0.07), transparent 50%),
			var(--alpha-surface);
	}

	.cta-mark {
		display: block;
		width: min(280px, 68vw);
		height: auto;
		aspect-ratio: 721 / 293;
		object-fit: contain;
		margin: 0 auto 1.15rem;
		mix-blend-mode: screen;
		opacity: 0.85;
	}

	.glow {
		position: absolute;
		inset: -40% -20% auto;
		height: 80%;
		background: radial-gradient(circle, rgba(184, 32, 32, 0.1), transparent 60%);
		pointer-events: none;
	}

	.cta :global(.section-desc) {
		margin-inline: auto;
	}

	.perks {
		list-style: none;
		margin: 0 auto 1.75rem;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.65rem 1rem;
		max-width: 720px;
	}

	.perks li {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		font-size: 0.86rem;
		color: var(--alpha-muted);
		padding: 0.45rem 0.8rem;
		border-radius: 999px;
		border: 1px solid var(--alpha-border);
		background: rgba(10, 10, 12, 0.45);
	}

	.actions {
		display: flex;
		justify-content: center;
		margin-bottom: 1rem;
	}

	.fine {
		margin: 0;
		font-size: 0.78rem;
		color: var(--alpha-faint);
		max-width: 480px;
		margin-inline: auto;
		line-height: 1.6;
	}
</style>
