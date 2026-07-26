<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { ui } from '$lib/state/ui.svelte';

	interface Props {
		height?: number;
		highlightAlpha?: boolean;
	}

	let { height = 180, highlightAlpha = true }: Props = $props();

	let host: HTMLDivElement | undefined = $state();

	onMount(() => {
		if (!browser || !host) return;

		let disposed = false;
		let raf = 0;
		let cleanupResize: (() => void) | undefined;

		void (async () => {
			const d3 = await import('d3');
			if (disposed || !host) return;

			const bands = [
				{ id: 'delta', label: 'Δ Delta', color: '#6b6560', amp: 0.35, freq: 0.35 },
				{ id: 'theta', label: 'Θ Theta', color: '#9a9590', amp: 0.45, freq: 0.7 },
				{ id: 'alpha', label: 'α Alpha 8–12 Hz', color: '#3b8beb', amp: 0.9, freq: 1.35 },
				{ id: 'beta', label: 'β Beta', color: '#b82020', amp: 0.55, freq: 2.4 }
			] as const;

			const svg = d3
				.select(host)
				.append('svg')
				.attr('width', '100%')
				.attr('height', height)
				.attr('role', 'img')
				.attr('aria-label', 'Animated multi-band EEG waveform visualization');

			const defs = svg.append('defs');
			const glow = defs
				.append('filter')
				.attr('id', 'eeg-glow')
				.attr('x', '-20%')
				.attr('y', '-50%')
				.attr('width', '140%')
				.attr('height', '200%');
			glow.append('feGaussianBlur').attr('stdDeviation', 2.2).attr('result', 'coloredBlur');
			const merge = glow.append('feMerge');
			merge.append('feMergeNode').attr('in', 'coloredBlur');
			merge.append('feMergeNode').attr('in', 'SourceGraphic');

			const g = svg.append('g');
			const legend = svg.append('g').attr('class', 'legend');

			const n = 160;
			const series = bands.map(() => new Array<number>(n).fill(0));
			const paths = bands.map((b) =>
				g
					.append('path')
					.attr('fill', 'none')
					.attr('stroke', b.color)
					.attr('stroke-width', b.id === 'alpha' && highlightAlpha ? 2.4 : 1.35)
					.attr('stroke-linecap', 'round')
					.attr('opacity', b.id === 'alpha' ? 0.95 : 0.55)
					.attr('filter', b.id === 'alpha' ? 'url(#eeg-glow)' : null)
					.attr('data-band', b.id)
			);

			// Alpha band highlight zone
			const alphaZone = g
				.append('rect')
				.attr('fill', 'url(#alpha-fill)')
				.attr('opacity', 0.12)
				.attr('rx', 8);

			const alphaGrad = defs
				.append('linearGradient')
				.attr('id', 'alpha-fill')
				.attr('x1', '0%')
				.attr('x2', '0%')
				.attr('y1', '0%')
				.attr('y2', '100%');
			alphaGrad
				.append('stop')
				.attr('offset', '0%')
				.attr('stop-color', '#3b8beb')
				.attr('stop-opacity', 0.35);
			alphaGrad
				.append('stop')
				.attr('offset', '100%')
				.attr('stop-color', '#3b8beb')
				.attr('stop-opacity', 0);

			bands.forEach((b, i) => {
				const row = legend.append('g').attr('transform', `translate(${i * 118}, 0)`);
				row
					.append('line')
					.attr('x1', 0)
					.attr('x2', 16)
					.attr('y1', 8)
					.attr('y2', 8)
					.attr('stroke', b.color)
					.attr('stroke-width', 2.5)
					.attr('stroke-linecap', 'round');
				row
					.append('text')
					.attr('x', 22)
					.attr('y', 11)
					.attr('fill', '#9a9590')
					.attr('font-size', 11)
					.attr('font-family', 'DM Sans, sans-serif')
					.text(b.label);
			});

			function layout() {
				if (!host) return { w: 0, h: height };
				const w = host.clientWidth;
				svg.attr('viewBox', `0 0 ${w} ${height}`);
				legend.attr('transform', `translate(12, ${height - 22})`);
				alphaZone
					.attr('x', 0)
					.attr('y', height * 0.22)
					.attr('width', w)
					.attr('height', height * 0.38);
				return { w, h: height };
			}

			let dims = layout();
			const ro = new ResizeObserver(() => {
				dims = layout();
			});
			ro.observe(host);
			cleanupResize = () => ro.disconnect();

			const line = d3
				.line<number>()
				.x((_, i) => (i / (n - 1)) * dims.w)
				.y((d) => d)
				.curve(d3.curveBasis);

			let t0 = performance.now();

			function frame(now: number) {
				if (disposed) return;
				const t = (now - t0) / 1000;
				const mid = dims.h * 0.42;
				const ampScale = dims.h * 0.12;

				bands.forEach((b, bi) => {
					const arr = series[bi];
					for (let i = 0; i < n - 1; i++) arr[i] = arr[i + 1];
					const noise = Math.sin(t * b.freq * 6 + bi) * b.amp;
					const burst =
						b.id === 'alpha'
							? Math.sin(t * 1.1) * 0.35 + Math.sin(t * 3.7) * 0.15
							: Math.sin(t * 0.7 + bi) * 0.12;
					arr[n - 1] = mid + (noise + burst) * ampScale * (ui.reducedMotion ? 0.3 : 1);
					// stack bands slightly
					arr[n - 1] += (bi - 1.5) * 8;
					paths[bi].attr('d', line(arr) ?? '');
				});

				raf = requestAnimationFrame(frame);
			}

			if (ui.reducedMotion) {
				// static snapshot
				bands.forEach((b, bi) => {
					const arr = series[bi];
					const mid = dims.h * 0.42;
					for (let i = 0; i < n; i++) {
						arr[i] = mid + Math.sin(i * 0.12 * b.freq + bi) * b.amp * dims.h * 0.1 + (bi - 1.5) * 8;
					}
					paths[bi].attr('d', line(arr) ?? '');
				});
			} else {
				raf = requestAnimationFrame(frame);
			}
		})();

		return () => {
			disposed = true;
			cancelAnimationFrame(raf);
			cleanupResize?.();
			// eslint-disable-next-line svelte/no-dom-manipulating
			if (host) host.innerHTML = '';
		};
	});
</script>

<div class="eeg-wrap card-surface" style:--h="{height}px">
	<div class="eeg-head">
		<span class="eeg-live"><span class="dot"></span> Live EEG model</span>
		<span class="eeg-note">Illustrative multi-band signal · not participant data</span>
	</div>
	<div class="eeg-host" bind:this={host} style:height="{height}px"></div>
</div>

<style>
	.eeg-wrap {
		padding: 1rem 0.75rem 0.5rem;
		overflow: hidden;
	}

	.eeg-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		padding: 0 0.75rem 0.5rem;
		flex-wrap: wrap;
	}

	.eeg-live {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--alpha-blue);
	}

	.dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--alpha-blue);
		box-shadow: 0 0 12px var(--alpha-blue);
		animation: pulse 1.6s ease-in-out infinite;
	}

	.eeg-note {
		font-size: 0.72rem;
		color: var(--alpha-faint);
	}

	.eeg-host {
		width: 100%;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.45;
			transform: scale(0.85);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.dot {
			animation: none;
		}
	}
</style>
