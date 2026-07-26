<script lang="ts">
	import { notes, study } from '$lib/data/content';
	import WarningIcon from 'phosphor-svelte/lib/WarningIcon';
	import LockIcon from 'phosphor-svelte/lib/LockIcon';
	import DoorOpenIcon from 'phosphor-svelte/lib/DoorOpenIcon';
	import ClipboardTextIcon from 'phosphor-svelte/lib/ClipboardTextIcon';
	import type { Component } from 'svelte';

	const icons: Record<(typeof notes)[number]['icon'], Component> = {
		warning: WarningIcon,
		lock: LockIcon,
		door: DoorOpenIcon,
		clipboard: ClipboardTextIcon
	};

	const docs = ['Risk', 'Privacy', 'Consent', 'Compliance'] as const;
</script>

<section id="notes" class="section-shell" aria-labelledby="notes-title">
	<div class="reveal">
		<p class="section-label">Study conditions</p>
		<h2 id="notes-title" class="section-title">Things to know before you enroll interest</h2>
		<p class="section-desc">
			These are the real constraints of a human-subjects style trading protocol — not marketing fine
			print.
		</p>
	</div>

	<div class="grid">
		{#each notes as note, i (note.title)}
			{@const Icon = icons[note.icon]}
			<article class="note card-surface reveal">
				<div class="doc-tag">{docs[i]}</div>
				<h3>
					<span class="icon"><Icon size={18} weight="duotone" /></span>
					{note.title}
				</h3>
				<p>{note.body}</p>
			</article>
		{/each}
	</div>

	<p class="compliance reveal">
		Compliance target: <strong>{study.compliance}</strong>. Struggling beats ghosting — the PI needs
		honest participation, not perfect streaks.
	</p>
</section>

<style>
	.grid {
		display: grid;
		gap: 1.15rem;
	}

	@media (min-width: 760px) {
		.grid {
			grid-template-columns: 1fr 1fr;
		}
	}

	.note {
		padding: 1.65rem 1.65rem 1.5rem;
		border-radius: 14px;
		position: relative;
	}

	.doc-tag {
		position: absolute;
		top: 1rem;
		right: 1rem;
		font-size: 0.58rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--alpha-faint);
	}

	h3 {
		margin: 0 0 0.75rem;
		font-size: 1rem;
		font-weight: 600;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding-right: 4rem;
	}

	.icon {
		color: var(--alpha-muted);
		display: grid;
	}

	p {
		margin: 0;
		font-size: 0.9rem;
		color: var(--alpha-muted);
		line-height: 1.7;
	}

	.compliance {
		margin: 1.5rem 0 0;
		font-size: 0.88rem;
		color: var(--alpha-faint);
		line-height: 1.6;
	}

	.compliance strong {
		color: var(--alpha-text);
		font-weight: 600;
	}
</style>
