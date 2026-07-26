<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { ui } from '$lib/state/ui.svelte';
	import { ensureGsap, ScrollTrigger } from '$lib/motion/gsap-setup';
	import { initSmoothScroll, destroySmoothScroll } from '$lib/motion/smooth-scroll';
	import { initStudyReveals } from '$lib/motion/reveals';
	import Nav from '$lib/components/ui/Nav.svelte';
	import ApplyModal from '$lib/components/ui/ApplyModal.svelte';

	let { children } = $props();

	onMount(() => {
		if (!browser) return;

		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		const applyMotionPref = () => {
			ui.reducedMotion = mq.matches;
		};
		applyMotionPref();
		mq.addEventListener('change', applyMotionPref);

		ensureGsap();
		initSmoothScroll(ui.reducedMotion);

		const onScroll = () => {
			const doc = document.documentElement;
			const max = doc.scrollHeight - window.innerHeight;
			ui.scrollProgress = max > 0 ? Math.min(1, window.scrollY / max) : 0;

			const ids = [
				'hero',
				'hypothesis',
				'equipment',
				'pillars',
				'journey',
				'schedule',
				'assessments',
				'notes',
				'apply'
			];
			const y = window.scrollY + window.innerHeight * 0.32;
			let current = 'hero';
			for (const id of ids) {
				const el = document.getElementById(id);
				if (el && el.offsetTop <= y) current = id;
			}
			ui.activeSection = current;
		};

		window.addEventListener('scroll', onScroll, { passive: true });
		onScroll();

		// Defer reveals until after first paint (hero owns the open)
		let killReveals: (() => void) | undefined;
		const boot = window.setTimeout(() => {
			killReveals = initStudyReveals(document);
			ScrollTrigger.refresh();
		}, 120);

		return () => {
			window.clearTimeout(boot);
			killReveals?.();
			mq.removeEventListener('change', applyMotionPref);
			window.removeEventListener('scroll', onScroll);
			document.body.style.overflow = '';
			destroySmoothScroll();
			ScrollTrigger.getAll().forEach((t) => t.kill());
		};
	});

	$effect(() => {
		if (!browser) return;
		document.body.style.overflow = ui.applyOpen ? 'hidden' : '';
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="grain" aria-hidden="true"></div>
<a class="skip" href="#main">Skip to content</a>
<Nav />
{@render children()}
<ApplyModal />

<style>
	.skip {
		position: absolute;
		left: -999px;
		top: 0.5rem;
		z-index: 200;
		background: var(--alpha-blue);
		color: #fff;
		padding: 0.5rem 1rem;
		border-radius: 8px;
	}

	.skip:focus {
		left: 0.5rem;
	}
</style>
