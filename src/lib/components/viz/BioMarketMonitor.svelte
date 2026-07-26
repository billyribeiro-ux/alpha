<script lang="ts">
	/**
	 * Dual-domain monitor: EEG bands + ECG + synthetic session P&L path.
	 * Communicates the study thesis visually — brain state ↔ trading execution.
	 * Honest label: illustrative model, not live participant data.
	 */
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { ui } from '$lib/state/ui.svelte';
	import {
		ALPHA_HZ,
		alphaPower,
		ecgSample,
		eegBandSample,
		priceSample,
		stressIndex
	} from '$lib/motion/signals';
	import { tempo } from '$lib/motion/tempo';

	interface Props {
		height?: number;
	}

	let { height = 260 }: Props = $props();

	let host: HTMLDivElement | undefined = $state();
	let readouts = $state({
		alphaHz: 10 as number,
		alphaPct: 62,
		stressPct: 28,
		session: '+0.0R',
		bpm: 72
	});

	onMount(() => {
		if (!browser || !host) return;

		let disposed = false;
		let interval = 0;
		let cleanupResize: (() => void) | undefined;
		const t0 = performance.now();

		void (async () => {
			const d3 = await import('d3');
			if (disposed || !host) return;

			const margin = { top: 12, right: 14, bottom: 36, left: 14 };
			const svg = d3
				.select(host)
				.append('svg')
				.attr('width', '100%')
				.attr('height', height)
				.attr('role', 'img')
				.attr(
					'aria-label',
					'Illustrative EEG, ECG, and trading path monitor for Project ALPHA'
				);

			const defs = svg.append('defs');
			const glow = defs
				.append('filter')
				.attr('id', 'bio-glow')
				.attr('x', '-30%')
				.attr('y', '-80%')
				.attr('width', '160%')
				.attr('height', '260%');
			glow.append('feGaussianBlur').attr('stdDeviation', 2.4).attr('result', 'b');
			const m = glow.append('feMerge');
			m.append('feMergeNode').attr('in', 'b');
			m.append('feMergeNode').attr('in', 'SourceGraphic');

			const gGrid = svg.append('g').attr('class', 'grid');
			const gPrice = svg.append('g');
			const gEeg = svg.append('g');
			const gEcg = svg.append('g');
			const gLabels = svg.append('g');

			// Channels
			const n = 180;
			const priceBuf = new Array(n).fill(0);
			const alphaBuf = new Array(n).fill(0);
			const betaBuf = new Array(n).fill(0);
			const ecgBuf = new Array(n).fill(0);

			const pricePath = gPrice
				.append('path')
				.attr('fill', 'none')
				.attr('stroke', '#d4a853')
				.attr('stroke-width', 1.8)
				.attr('stroke-linecap', 'round')
				.attr('opacity', 0.9);

			const priceArea = gPrice
				.append('path')
				.attr('stroke', 'none')
				.attr('fill', 'url(#price-fill)')
				.attr('opacity', 0.2);

			const alphaPath = gEeg
				.append('path')
				.attr('fill', 'none')
				.attr('stroke', '#3b8beb')
				.attr('stroke-width', 2.2)
				.attr('filter', 'url(#bio-glow)')
				.attr('stroke-linecap', 'round');

			const betaPath = gEeg
				.append('path')
				.attr('fill', 'none')
				.attr('stroke', '#b82020')
				.attr('stroke-width', 1.2)
				.attr('opacity', 0.55)
				.attr('stroke-linecap', 'round');

			const ecgPath = gEcg
				.append('path')
				.attr('fill', 'none')
				.attr('stroke', '#2bbfa0')
				.attr('stroke-width', 1.5)
				.attr('stroke-linecap', 'round')
				.attr('opacity', 0.85);

			const alphaBand = gEeg
				.append('rect')
				.attr('fill', 'rgba(59,139,235,0.06)')
				.attr('stroke', 'rgba(59,139,235,0.15)')
				.attr('stroke-width', 1)
				.attr('rx', 4);

			const grad = defs
				.append('linearGradient')
				.attr('id', 'price-fill')
				.attr('x1', '0%')
				.attr('y1', '0%')
				.attr('x2', '0%')
				.attr('y2', '100%');
			grad.append('stop').attr('offset', '0%').attr('stop-color', '#d4a853').attr('stop-opacity', 0.45);
			grad.append('stop').attr('offset', '100%').attr('stop-color', '#d4a853').attr('stop-opacity', 0);

			// Legend chips
			const legend = [
				{ c: '#3b8beb', t: `α EEG ${ALPHA_HZ.min}–${ALPHA_HZ.max} Hz` },
				{ c: '#b82020', t: 'β high (reactivity)' },
				{ c: '#2bbfa0', t: 'ECG cadence' },
				{ c: '#d4a853', t: 'Session path (R)' }
			];
			legend.forEach((item, i) => {
				const x = 12 + i * 128;
				const row = gLabels.append('g').attr('transform', `translate(${x}, 0)`);
				row
					.append('line')
					.attr('x1', 0)
					.attr('x2', 14)
					.attr('y1', 0)
					.attr('y2', 0)
					.attr('stroke', item.c)
					.attr('stroke-width', 2.5)
					.attr('stroke-linecap', 'round');
				row
					.append('text')
					.attr('x', 18)
					.attr('y', 4)
					.attr('fill', '#9a9590')
					.attr('font-size', 10)
					.attr('font-family', 'DM Sans, sans-serif')
					.text(item.t);
			});

			let w = 0;
			let innerH = height - margin.top - margin.bottom;

			function layout() {
				if (!host) return;
				w = host.clientWidth;
				innerH = height - margin.top - margin.bottom;
				svg.attr('viewBox', `0 0 ${w} ${height}`);
				gGrid.selectAll('*').remove();

				// ECG paper + chart grid
				const cols = 24;
				const rows = 8;
				for (let i = 0; i <= cols; i++) {
					const x = margin.left + (i / cols) * (w - margin.left - margin.right);
					gGrid
						.append('line')
						.attr('x1', x)
						.attr('x2', x)
						.attr('y1', margin.top)
						.attr('y2', height - margin.bottom)
						.attr('stroke', i % 4 === 0 ? 'rgba(59,139,235,0.12)' : 'rgba(36,36,41,0.8)')
						.attr('stroke-width', 1);
				}
				for (let j = 0; j <= rows; j++) {
					const y = margin.top + (j / rows) * innerH;
					gGrid
						.append('line')
						.attr('x1', margin.left)
						.attr('x2', w - margin.right)
						.attr('y1', y)
						.attr('y2', y)
						.attr('stroke', j % 2 === 0 ? 'rgba(59,139,235,0.1)' : 'rgba(36,36,41,0.65)')
						.attr('stroke-width', 1);
				}

				// Alpha zone in EEG lane (middle third)
				const eegTop = margin.top + innerH * 0.28;
				const eegH = innerH * 0.32;
				alphaBand
					.attr('x', margin.left)
					.attr('y', eegTop)
					.attr('width', Math.max(0, w - margin.left - margin.right))
					.attr('height', eegH);

				gLabels.attr('transform', `translate(0, ${height - 14})`);
			}

			layout();
			const ro = new ResizeObserver(layout);
			ro.observe(host);
			cleanupResize = () => ro.disconnect();

			const line = d3
				.line<number>()
				.x((_, i) => margin.left + (i / (n - 1)) * Math.max(1, w - margin.left - margin.right))
				.y((d) => d)
				.curve(d3.curveMonotoneX);

			const area = d3
				.area<number>()
				.x((_, i) => margin.left + (i / (n - 1)) * Math.max(1, w - margin.left - margin.right))
				.y0(() => margin.top + innerH * 0.22)
				.y1((d) => d)
				.curve(d3.curveMonotoneX);

			function push(buf: number[], v: number) {
				buf.shift();
				buf.push(v);
			}

			// Simulated instrument time advances slower than wall clock
			// (readable EEG/session path, not hyperactive demo reel)
			let simT = 0;
			const simRate = 0.28;
			let lastReadout = 0;
			const readoutEvery = 1000 / tempo.readoutHz;

			function sample(now: number) {
				if (disposed) return;
				const wall = (now - t0) / 1000;
				simT = wall * simRate;
				const aPow = alphaPower(simT);
				const stress = stressIndex(simT);
				const reduced = ui.reducedMotion ? 0.35 : 1;

				const priceMid = margin.top + innerH * 0.14;
				const eegMid = margin.top + innerH * 0.44;
				const ecgMid = margin.top + innerH * 0.78;
				const amp = innerH * 0.09 * reduced;

				// EEG carrier scaled down so band structure is visible, not a blur
				const px = priceSample(simT, 0) * amp * 0.95 + priceMid;
				const al =
					eegBandSample(simT, {
						freqHz: ALPHA_HZ.center * 0.35,
						amp: 0.75 * aPow + 0.2,
						phase: 0.2,
						noise: 0.06
					}) *
						amp +
					eegMid;
				const be =
					eegBandSample(simT, {
						freqHz: 8,
						amp: 0.4 * stress + 0.12,
						phase: 1.1,
						noise: 0.07
					}) *
						amp *
						0.85 +
					eegMid +
					8;
				// ECG ~1 Hz visual cadence when simRate applied
				const ec = ecgSample(simT * 0.55, 0) * amp * 1.05 + ecgMid;

				for (let s = 0; s < tempo.monitorStep; s++) {
					push(priceBuf, px);
					push(alphaBuf, al);
					push(betaBuf, be);
					push(ecgBuf, ec);
				}

				pricePath.attr('d', line(priceBuf) ?? '');
				priceArea.attr('d', area(priceBuf) ?? '');
				alphaPath.attr('d', line(alphaBuf) ?? '');
				betaPath.attr('d', line(betaBuf) ?? '');
				ecgPath.attr('d', line(ecgBuf) ?? '');

				if (now - lastReadout >= readoutEvery) {
					lastReadout = now;
					const rMult = (priceSample(simT, 2) * 0.35 + aPow * 0.28 - stress * 0.22) * 1.5;
					const sign = rMult >= 0 ? '+' : '';
					readouts = {
						alphaHz: +(ALPHA_HZ.min + aPow * (ALPHA_HZ.max - ALPHA_HZ.min)).toFixed(1),
						alphaPct: Math.round(aPow * 100),
						stressPct: Math.round(stress * 100),
						session: `${sign}${rMult.toFixed(1)}R`,
						bpm: Math.round(62 + stress * 18 + Math.sin(simT * 0.25) * 2)
					};
				}
			}

			// Seed buffers with slow history
			for (let i = 0; i < n; i++) {
				const t = i * 0.08;
				const priceMid = margin.top + innerH * 0.14;
				const eegMid = margin.top + innerH * 0.44;
				const ecgMid = margin.top + innerH * 0.78;
				const amp = innerH * 0.09;
				priceBuf[i] = priceSample(t, 0) * amp + priceMid;
				alphaBuf[i] =
					eegBandSample(t, { freqHz: 3.5, amp: 0.65, phase: 0.2 }) * amp + eegMid;
				betaBuf[i] =
					eegBandSample(t, { freqHz: 7, amp: 0.35, phase: 1.1 }) * amp + eegMid + 8;
				ecgBuf[i] = ecgSample(t * 0.55) * amp + ecgMid;
			}
			sample(performance.now());
			if (!ui.reducedMotion) {
				interval = window.setInterval(() => sample(performance.now()), tempo.monitorTickMs);
			}
		})();

		return () => {
			disposed = true;
			window.clearInterval(interval);
			cleanupResize?.();
			if (host) host.innerHTML = '';
		};
	});
</script>

<div class="monitor card-surface">
	<div class="monitor-chrome">
		<div class="left">
			<span class="live"><span class="dot"></span> Dual feed</span>
			<span class="title">Brain state × session path</span>
		</div>
		<div class="readouts" aria-live="off">
			<div class="chip alpha">
				<span class="k">α power</span>
				<span class="v">{readouts.alphaPct}%</span>
			</div>
			<div class="chip">
				<span class="k">α Hz</span>
				<span class="v">{readouts.alphaHz}</span>
			</div>
			<div class="chip stress">
				<span class="k">β stress</span>
				<span class="v">{readouts.stressPct}%</span>
			</div>
			<div class="chip ecg">
				<span class="k">HR model</span>
				<span class="v">{readouts.bpm}</span>
			</div>
			<div class="chip gold">
				<span class="k">Path</span>
				<span class="v">{readouts.session}</span>
			</div>
		</div>
	</div>
	<div class="host" bind:this={host} style:height="{height}px"></div>
	<p class="disclaimer">
		Illustrative model only — not live participant EEG, ECG, or brokerage data. Study measures real
		signals via Muse + Mind Monitor + Size UP.
	</p>
</div>

<style>
	.monitor {
		padding: 0.85rem 0.75rem 0.65rem;
		border-radius: 16px;
		overflow: hidden;
		background:
			radial-gradient(ellipse 80% 50% at 50% 0%, rgba(59, 139, 235, 0.06), transparent 55%),
			var(--alpha-surface);
	}

	.monitor-chrome {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0 0.5rem 0.55rem;
	}

	.left {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.live {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.65rem;
		font-weight: 700;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--alpha-blue);
	}

	.dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--alpha-blue);
		box-shadow: 0 0 10px var(--alpha-blue);
		animation: pulse 2.8s ease-in-out infinite;
	}

	.title {
		font-size: 0.82rem;
		font-weight: 600;
		color: var(--alpha-text);
	}

	.readouts {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.chip {
		display: flex;
		flex-direction: column;
		min-width: 58px;
		padding: 0.3rem 0.5rem;
		border-radius: 8px;
		border: 1px solid var(--alpha-border);
		background: rgba(10, 10, 12, 0.65);
	}

	.chip .k {
		font-size: 0.58rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--alpha-faint);
	}

	.chip .v {
		font-family: var(--font-display);
		font-size: 0.95rem;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		color: var(--alpha-text);
	}

	.chip.alpha .v {
		color: var(--alpha-blue);
	}
	.chip.stress .v {
		color: var(--alpha-red-bright);
	}
	.chip.ecg .v {
		color: var(--alpha-teal);
	}
	.chip.gold .v {
		color: var(--alpha-gold);
	}

	.host {
		width: 100%;
	}

	.disclaimer {
		margin: 0.35rem 0.5rem 0;
		font-size: 0.68rem;
		color: var(--alpha-faint);
		line-height: 1.45;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.4;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.dot {
			animation: none;
		}
	}
</style>
