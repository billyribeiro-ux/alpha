<script lang="ts">
	import { navLinks, study } from '$lib/data/content';
	import { assets } from '$lib/data/assets';
	import { ui } from '$lib/state/ui.svelte';
	import { scrollToId } from '$lib/motion/smooth-scroll';
	import { magnetic } from '$lib/actions/magnetic';
	import ListIcon from 'phosphor-svelte/lib/ListIcon';
	import XIcon from 'phosphor-svelte/lib/XIcon';

	let open = $state(false);
	let solid = $derived(ui.scrollProgress > 0.02);

	function go(href: string) {
		open = false;
		if (href === '#apply') {
			ui.openApply();
			return;
		}
		scrollToId(href);
	}
</script>

<header class="nav" class:solid aria-label="Primary">
	<div class="nav-inner">
		<a
			class="brand"
			href="#hero"
			onclick={(e) => {
				e.preventDefault();
				go('#hero');
			}}
		>
			<img
				src={assets.trickTradesLogo.src}
				alt={assets.trickTradesLogo.alt}
				width="36"
				height="36"
				class="logo"
				decoding="async"
			/>
			<span class="brand-text">
				<span class="brand-kicker">{study.brand}</span>
				<span class="brand-name">{study.name}</span>
			</span>
		</a>

		<nav class="links" aria-label="Sections">
			{#each navLinks as link (link.href)}
				<a
					href={link.href}
					class:active={ui.activeSection === link.href.slice(1)}
					onclick={(e) => {
						e.preventDefault();
						go(link.href);
					}}
				>
					{link.label}
				</a>
			{/each}
		</nav>

		<div class="nav-cta">
			<button class="btn-primary" use:magnetic={0.2} onclick={() => ui.openApply()}>
				Apply for the study
			</button>
		</div>

		<button
			class="menu-btn"
			type="button"
			aria-label={open ? 'Close menu' : 'Open menu'}
			aria-expanded={open}
			onclick={() => (open = !open)}
		>
			{#if open}
				<XIcon size={22} weight="bold" />
			{:else}
				<ListIcon size={22} weight="bold" />
			{/if}
		</button>
	</div>

	{#if open}
		<div class="mobile-panel">
			{#each navLinks as link (link.href)}
				<a
					href={link.href}
					onclick={(e) => {
						e.preventDefault();
						go(link.href);
					}}
				>
					{link.label}
				</a>
			{/each}
			<button class="btn-primary full" onclick={() => go('#apply')}>Apply for the study</button>
		</div>
	{/if}

	<div class="progress" style:transform="scaleX({ui.scrollProgress})" aria-hidden="true"></div>
</header>

<style>
	.nav {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 60;
		height: var(--nav-h);
		transition:
			background 0.35s ease,
			border-color 0.35s ease,
			backdrop-filter 0.35s ease;
		border-bottom: 1px solid transparent;
	}

	.nav.solid {
		background: rgba(10, 10, 12, 0.72);
		backdrop-filter: blur(18px) saturate(1.2);
		border-bottom-color: rgba(36, 36, 41, 0.9);
	}

	.nav-inner {
		height: 100%;
		width: min(1200px, calc(100% - 2rem));
		margin: 0 auto;
		display: flex;
		align-items: center;
		gap: 1.25rem;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		min-width: 0;
	}

	.logo {
		width: 36px;
		height: 36px;
		border-radius: 8px;
		object-fit: cover;
		background: #000;
		box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.06);
	}

	.brand-text {
		display: flex;
		flex-direction: column;
		line-height: 1.15;
	}

	.brand-kicker {
		font-size: 0.62rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--alpha-faint);
	}

	.brand-name {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 0.95rem;
	}

	.links {
		display: none;
		flex: 1;
		justify-content: center;
		gap: 0.15rem;
	}

	.links a {
		font-size: 0.78rem;
		font-weight: 500;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--alpha-faint);
		padding: 0.45rem 0.65rem;
		border-radius: 999px;
		transition:
			color 0.25s ease,
			background 0.25s ease;
	}

	.links a:hover,
	.links a.active {
		color: var(--alpha-text);
		background: rgba(255, 255, 255, 0.04);
	}

	.nav-cta {
		display: none;
		margin-left: auto;
	}

	.nav-cta :global(.btn-primary) {
		padding: 0.65rem 1.1rem;
		font-size: 0.8rem;
	}

	.menu-btn {
		margin-left: auto;
		display: grid;
		place-items: center;
		width: 42px;
		height: 42px;
		border-radius: 10px;
		border: 1px solid var(--alpha-border);
		background: rgba(17, 17, 20, 0.7);
		color: var(--alpha-text);
	}

	.mobile-panel {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.75rem 1rem 1.25rem;
		background: rgba(10, 10, 12, 0.94);
		backdrop-filter: blur(20px);
		border-bottom: 1px solid var(--alpha-border);
	}

	.mobile-panel a {
		padding: 0.85rem 0.5rem;
		font-size: 0.95rem;
		color: var(--alpha-muted);
		border-bottom: 1px solid rgba(36, 36, 41, 0.6);
	}

	.full {
		width: 100%;
		margin-top: 0.75rem;
	}

	.progress {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 2px;
		transform-origin: left center;
		background: linear-gradient(90deg, var(--alpha-red), var(--alpha-blue), var(--alpha-teal));
		pointer-events: none;
		transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
	}

	@media (min-width: 960px) {
		.links,
		.nav-cta {
			display: flex;
		}
		.menu-btn,
		.mobile-panel {
			display: none;
		}
	}
</style>
