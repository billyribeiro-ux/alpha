<script lang="ts">
	import { onMount } from 'svelte';
	import { ensureGsap } from '$lib/motion/gsap-setup';
	import { ui } from '$lib/state/ui.svelte';
	import { browser } from '$app/environment';

	let cursorEl: HTMLDivElement | undefined = $state();
	let isMagnetic = $state(false);

	onMount(() => {
		if (!browser || ui.reducedMotion || !cursorEl) return;
		const gsap = ensureGsap();
		const el = cursorEl;

		// Set initial position off-screen
		gsap.set(el, { xPercent: -50, yPercent: -50, x: -100, y: -100 });

		const xTo = gsap.quickTo(el, 'x', { duration: 0.25, ease: 'power3' });
		const yTo = gsap.quickTo(el, 'y', { duration: 0.25, ease: 'power3' });

		const onMouseMove = (e: MouseEvent) => {
			xTo(e.clientX);
			yTo(e.clientY);

			// Check for magnetic/interactive elements
			const target = e.target as HTMLElement;
			const isInteractive = target.closest('a, button, .magnetic, input, select, textarea');
			if (isInteractive && !isMagnetic) {
				isMagnetic = true;
				gsap.to(el, {
					scale: 1.8,
					backgroundColor: 'rgba(59, 139, 235, 0.1)',
					borderColor: 'rgba(59, 139, 235, 0.6)',
					duration: 0.3,
					ease: 'power2.out'
				});
			} else if (!isInteractive && isMagnetic) {
				isMagnetic = false;
				gsap.to(el, {
					scale: 1,
					backgroundColor: 'transparent',
					borderColor: 'rgba(232, 230, 227, 0.4)',
					duration: 0.3,
					ease: 'power2.out'
				});
			}
		};

		const onMouseDown = () => gsap.to(el, { scale: 0.8, duration: 0.1 });
		const onMouseUp = () => gsap.to(el, { scale: isMagnetic ? 1.8 : 1, duration: 0.2 });

		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('mousedown', onMouseDown);
		window.addEventListener('mouseup', onMouseUp);

		// Hide cursor when leaving window
		document.body.addEventListener('mouseleave', () => gsap.to(el, { opacity: 0, duration: 0.3 }));
		document.body.addEventListener('mouseenter', () => gsap.to(el, { opacity: 1, duration: 0.3 }));

		// Add custom cursor styling to body
		document.body.style.cursor = 'none';
		const iteratives = document.querySelectorAll('a, button, .magnetic');
		iteratives.forEach((el) => {
			(el as HTMLElement).style.cursor = 'none';
		});

		return () => {
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('mousedown', onMouseDown);
			window.removeEventListener('mouseup', onMouseUp);
			document.body.style.cursor = '';
		};
	});
</script>

{#if !ui.reducedMotion}
	<div class="custom-cursor" bind:this={cursorEl} aria-hidden="true"></div>
{/if}

<style>
	.custom-cursor {
		position: fixed;
		top: 0;
		left: 0;
		width: 14px;
		height: 14px;
		border-radius: 50%;
		border: 1.5px solid rgba(232, 230, 227, 0.4);
		pointer-events: none;
		z-index: 9999;
		mix-blend-mode: difference;
		transition: opacity 0.3s ease;
	}

	@media (max-width: 768px) {
		.custom-cursor {
			display: none;
		}
		:global(body),
		:global(a),
		:global(button) {
			cursor: auto !important;
		}
	}
</style>
