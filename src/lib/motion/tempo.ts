/**
 * Motion tempo for Project ALPHA — paced like the real protocol, not a product trailer.
 *
 * Reality anchors:
 * - Alpha band 8–12 Hz is a *brain* frequency; UI should not flicker at that rate.
 * - Sessions are 10–30 min; reveals should feel measured, like opening a lab notebook.
 * - Paper → live day 6; 90-day arc — progress reads as gradual, not snap.
 */
export const tempo = {
	/** Soft scroll (Lenis) — unhurried page through a protocol document */
	scrollDuration: 1.75,
	scrollToDuration: 1.85,

	/** Section enter — calm attention settling */
	revealDuration: 1.45,
	revealEase: 'power2.out' as const,
	revealY: 36,
	revealStagger: 0.16,
	revealStart: 'top 82%',

	/** Journey phase cards — walk before you run */
	phaseDuration: 1.55,
	phaseStagger: 0.22,
	phaseRailScrub: 1.4,

	/** Magnetic CTAs — slight, clinical precision not arcade snap */
	magneticStrength: 0.14,
	magneticSettleMs: 480,

	/** EEG / ECG / session path monitors — near real instrument refresh feel */
	/** Buffer shift: ~12–18 Hz visual sample (readable, not frantic) */
	monitorTickMs: 48,
	/** How many samples to advance per tick (1 = slow chart drift) */
	monitorStep: 1,
	/** Display readout refresh (Hz-ish for meters, not every paint) */
	readoutHz: 4,

	/** Wave dividers — long period, like breathing / pre-market settle */
	dividerPeriodSec: 14,

	/** Hover / card transitions */
	hoverSec: 0.55,
	cardLift: 3
} as const;
