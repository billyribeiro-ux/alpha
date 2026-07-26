/**
 * Shared signal generators for Project ALPHA visuals.
 * Fuses neurophysiology (EEG/ECG) with market microstructure motifs.
 * All outputs are illustrative — not real participant or market data.
 */

/** Alpha target band (Hz) from study protocol. */
export const ALPHA_HZ = { min: 8, max: 12, center: 10 } as const;

/** Classic ECG QRS-like spike train (normalized −1..1). */
export function ecgSample(t: number, phase = 0): number {
	const x = ((t * 1.15 + phase) % 1 + 1) % 1;
	// Baseline wander
	let y = Math.sin(t * 0.7 + phase) * 0.04;
	// P wave
	if (x > 0.12 && x < 0.2) y += Math.sin(((x - 0.12) / 0.08) * Math.PI) * 0.18;
	// QRS complex
	if (x > 0.28 && x < 0.32) y -= (x - 0.28) * 8;
	if (x >= 0.32 && x < 0.36) y += 1.4 - Math.abs(x - 0.34) * 35;
	if (x >= 0.36 && x < 0.4) y -= (0.4 - x) * 6;
	// T wave
	if (x > 0.48 && x < 0.62) y += Math.sin(((x - 0.48) / 0.14) * Math.PI) * 0.35;
	return y;
}

/** EEG band sample (illustrative, not clinical). */
export function eegBandSample(
	t: number,
	opts: { freqHz: number; amp: number; phase?: number; noise?: number }
): number {
	const { freqHz, amp, phase = 0, noise = 0.08 } = opts;
	const carrier = Math.sin(t * Math.PI * 2 * freqHz * 0.35 + phase) * amp;
	const burst = Math.sin(t * 0.9 + phase * 2) * 0.22 * amp;
	const n = (Math.sin(t * 17.3 + phase * 9) + Math.sin(t * 31.1 + phase)) * noise * amp;
	return carrier + burst + n;
}

/** Synthetic mid-price path with mild mean-reversion + jumps (for chart motif). */
export function priceSample(t: number, seed = 0): number {
	const slow = Math.sin(t * 0.22 + seed) * 0.55;
	const mid = Math.sin(t * 0.71 + seed * 1.7) * 0.28;
	const micro = Math.sin(t * 3.4 + seed * 0.4) * 0.08;
	const jump = Math.sin(t * 0.11 + seed) > 0.97 ? Math.sin(t * 40) * 0.25 : 0;
	return slow + mid + micro + jump;
}

/** Map alpha power (0..1) — calm → high. */
export function alphaPower(t: number): number {
	const base = 0.55 + Math.sin(t * 0.65) * 0.22 + Math.sin(t * 1.9) * 0.08;
	return Math.min(1, Math.max(0.15, base));
}

/** High-beta “stress / FOMO” inverse of alpha (illustrative). */
export function stressIndex(t: number): number {
	return Math.min(1, Math.max(0, 1 - alphaPower(t) + Math.sin(t * 2.4) * 0.08));
}
