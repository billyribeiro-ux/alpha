<script lang="ts">
	import { equipment, study } from '$lib/data/content';
	import BrainIcon from 'phosphor-svelte/lib/BrainIcon';
	import DeviceMobileIcon from 'phosphor-svelte/lib/DeviceMobileIcon';
	import ChartLineUpIcon from 'phosphor-svelte/lib/ChartLineUpIcon';
	import NotebookIcon from 'phosphor-svelte/lib/NotebookIcon';
	import type { Component } from 'svelte';

	const icons: Record<(typeof equipment)[number]['icon'], Component> = {
		brain: BrainIcon,
		app: DeviceMobileIcon,
		chart: ChartLineUpIcon,
		journal: NotebookIcon
	};

	const roles: Record<string, string> = {
		muse: 'Sensor',
		'muse-app': 'Capture',
		account: 'Market',
		membership: 'Protocol home'
	};
</script>

<section id="equipment" class="section-shell" aria-labelledby="equipment-title">
	<div class="reveal">
		<p class="section-label">Enrollment kit</p>
		<h2 id="equipment-title" class="section-title">What you’ll need before Day −7</h2>
		<p class="section-desc">
			Preloading only starts when gear is ready. Everything below stays yours after the study — this
			is not a rental lab.
		</p>
	</div>

	<ol class="grid">
		{#each equipment as item, i (item.id)}
			{@const Icon = icons[item.icon]}
			<li class="equip-card card-surface reveal" style:--accent={item.accent}>
				<div class="top">
					<span class="step">0{i + 1}</span>
					<span class="role">{roles[item.id]}</span>
				</div>
				<div class="icon-wrap">
					<Icon size={22} weight="duotone" />
				</div>
				<h3>{item.title}</h3>
				<p>{item.body}</p>
			</li>
		{/each}
	</ol>

	<p class="foot reveal">
		Sizing reality: {study.accountNote}. Extra daily load ≈ {study.dailyCommitment}.
	</p>
</section>

<style>
	.grid {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 1.15rem;
		counter-reset: none;
	}

	.equip-card {
		padding: 1.5rem 1.5rem 1.6rem;
		border-radius: 14px;
		display: flex;
		flex-direction: column;
	}

	.equip-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 18px 48px -30px color-mix(in srgb, var(--accent) 45%, transparent);
	}

	.top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.85rem;
	}

	.step {
		font-family: var(--font-display);
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--alpha-faint);
	}

	.role {
		font-size: 0.6rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--accent);
	}

	.icon-wrap {
		width: 44px;
		height: 44px;
		border-radius: 12px;
		display: grid;
		place-items: center;
		margin-bottom: 0.9rem;
		background: color-mix(in srgb, var(--accent) 14%, transparent);
		color: var(--accent);
	}

	h3 {
		margin: 0 0 0.45rem;
		font-size: 1.02rem;
		font-weight: 600;
	}

	p {
		margin: 0;
		font-size: 0.9rem;
		color: var(--alpha-muted);
		line-height: 1.65;
		flex: 1;
	}

	.foot {
		margin: 1.5rem 0 0;
		font-size: 0.82rem;
		color: var(--alpha-faint);
		line-height: 1.55;
	}
</style>
