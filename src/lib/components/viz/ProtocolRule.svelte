<script lang="ts">
	/** Static protocol rule — no looping animation. */
	interface Props {
		label?: string;
	}
	let { label = '' }: Props = $props();
</script>

<div class="rule" aria-hidden="true">
	<span class="line"></span>
	{#if label}
		<span class="tag">{label}</span>
		<span class="line"></span>
	{/if}
</div>

<style>
	.rule {
		display: flex;
		align-items: center;
		gap: 1rem;
		width: min(1100px, calc(100% - 2rem));
		margin: 0.25rem auto;
		padding: 0.35rem 0;
	}

	.line {
		flex: 1;
		height: 1px;
		background: linear-gradient(90deg, transparent, #2e2e35, transparent);
	}

	.tag {
		flex-shrink: 0;
		font-size: 0.58rem;
		font-weight: 700;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--alpha-faint);
	}
</style>
