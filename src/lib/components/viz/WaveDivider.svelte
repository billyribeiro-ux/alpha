<script lang="ts">
	/**
	 * Between-section instrument baseline: slow α-like undulation + quiet ECG cadence.
	 * Period ~14s — closer to breath / settle time than UI decoration.
	 */
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { ui } from '$lib/state/ui.svelte';
	import { ecgSample, eegBandSample, ALPHA_HZ } from '$lib/motion/signals';
	import { tempo } from '$lib/motion/tempo';

	let host: HTMLDivElement | undefined = $state();

	onMount(() => {
		if (!browser || !host || ui.reducedMotion) return;
		let disposed = false;
		let raf = 0;
		const canvas = document.createElement('canvas');
		canvas.setAttribute('aria-hidden', 'true');
		// eslint-disable-next-line svelte/no-dom-manipulating
		host.appendChild(canvas);
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		function resize() {
			if (!host || !ctx) return;
			const w = host.clientWidth;
			const h = 40;
			canvas.width = w * dpr;
			canvas.height = h * dpr;
			canvas.style.width = `${w}px`;
			canvas.style.height = `${h}px`;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		}
		resize();
		const ro = new ResizeObserver(resize);
		ro.observe(host);

		const t0 = performance.now();
		// Advance simulated time slowly (wall clock * scale)
		const timeScale = (Math.PI * 2) / (tempo.dividerPeriodSec * 1000);

		function draw(now: number) {
			if (disposed || !ctx || !host) return;
			const t = (now - t0) * timeScale;
			const w = host.clientWidth;
			const h = 40;
			const mid = h / 2;
			ctx.clearRect(0, 0, w, h);

			ctx.strokeStyle = 'rgba(46,46,53,0.85)';
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(0, mid);
			ctx.lineTo(w, mid);
			ctx.stroke();

			// Alpha-like carrier (slow)
			ctx.strokeStyle = 'rgba(59,139,235,0.55)';
			ctx.lineWidth = 1.35;
			ctx.beginPath();
			const n = Math.max(40, Math.floor(w / 4));
			for (let i = 0; i <= n; i++) {
				const x = (i / n) * w;
				const u = t + i * 0.035;
				const y =
					mid +
					eegBandSample(u, { freqHz: ALPHA_HZ.center * 0.08, amp: 0.9, phase: 0 }) * 7 +
					ecgSample(u * 0.12, 0.15) * 3.5;
				if (i === 0) ctx.moveTo(x, y);
				else ctx.lineTo(x, y);
			}
			ctx.stroke();

			// Quiet gold micro-structure (session path motif)
			ctx.strokeStyle = 'rgba(212,168,83,0.22)';
			ctx.lineWidth = 1;
			ctx.beginPath();
			for (let i = 0; i <= n; i++) {
				const x = (i / n) * w;
				const u = t * 0.7 + i * 0.028;
				const y = mid + Math.sin(u * 1.1) * 2.2 + Math.sin(u * 0.25) * 1.8;
				if (i === 0) ctx.moveTo(x, y);
				else ctx.lineTo(x, y);
			}
			ctx.stroke();

			raf = requestAnimationFrame(draw);
		}
		raf = requestAnimationFrame(draw);

		return () => {
			disposed = true;
			cancelAnimationFrame(raf);
			ro.disconnect();
			canvas.remove();
		};
	});
</script>

<div class="wave-div" bind:this={host} aria-hidden="true">
	{#if ui.reducedMotion}
		<div class="static-line"></div>
	{/if}
</div>

<style>
	.wave-div {
		width: min(1100px, calc(100% - 2rem));
		margin: 0.35rem auto;
		height: 40px;
		position: relative;
	}

	.static-line {
		position: absolute;
		left: 0;
		right: 0;
		top: 50%;
		height: 1px;
		background: linear-gradient(90deg, transparent, #2e2e35, transparent);
	}
</style>
