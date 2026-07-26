<script lang="ts">
	import { study } from '$lib/data/content';
	import { assets } from '$lib/data/assets';
</script>

<footer class="footer">
	<div class="inner">
		<div class="marks">
			<img
				class="tt-logo"
				src={assets.trickTradesLogo.src}
				alt={assets.trickTradesLogo.alt}
				width="64"
				height="64"
				decoding="async"
				loading="lazy"
			/>
			<img
				class="alpha-mark"
				src={assets.projectAlpha.src}
				alt={assets.projectAlpha.alt}
				width={assets.projectAlpha.width}
				height={assets.projectAlpha.height}
				decoding="async"
				loading="lazy"
			/>
		</div>
		<p class="brand">{study.name} Neurofeedback Research Study</p>
		<p class="meta">{study.org} × {study.investigator.name}</p>
		<p class="copy">
			© {new Date().getFullYear()} {study.org}. For informational purposes. Not investment advice.
		</p>
	</div>
</footer>

<style>
	.footer {
		padding: 3.5rem 1.5rem 4rem;
		border-top: 1px solid var(--alpha-border);
		text-align: center;
	}

	.inner {
		max-width: 640px;
		margin: 0 auto;
	}

	.marks {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.35rem;
	}

	.tt-logo {
		width: 56px;
		height: 56px;
		object-fit: cover;
		border-radius: 12px;
		background: #000;
		box-shadow: 0 8px 28px -12px rgba(0, 0, 0, 0.8);
	}

	.alpha-mark {
		width: min(280px, 70vw);
		height: auto;
		aspect-ratio: 721 / 293;
		object-fit: contain;
		opacity: 0.92;
		mix-blend-mode: screen;
	}

	.brand {
		margin: 0 0 0.4rem;
		font-family: var(--font-display);
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--alpha-muted);
	}

	.meta,
	.copy {
		margin: 0;
		font-size: 0.82rem;
		color: var(--alpha-faint);
		line-height: 1.75;
	}

	.copy {
		margin-top: 0.75rem;
	}
</style>
