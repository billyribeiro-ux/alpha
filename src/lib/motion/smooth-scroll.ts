import Lenis from 'lenis';
import { gsap, ScrollTrigger, ensureGsap } from './gsap-setup';
import { tempo } from './tempo';

let lenis: Lenis | null = null;
let tickerFn: ((time: number) => void) | null = null;

export function initSmoothScroll(reducedMotion: boolean): Lenis | null {
	if (typeof window === 'undefined') return null;
	if (reducedMotion) return null;

	ensureGsap();
	destroySmoothScroll();

	// Unhurried — reading a protocol, not infinite-scroll feed
	lenis = new Lenis({
		duration: tempo.scrollDuration,
		easing: (t) => 1 - Math.pow(1 - t, 3),
		smoothWheel: true,
		touchMultiplier: 1.15,
		wheelMultiplier: 0.85
	});

	lenis.on('scroll', ScrollTrigger.update);

	tickerFn = (time: number) => {
		lenis?.raf(time * 1000);
	};
	gsap.ticker.add(tickerFn);
	gsap.ticker.lagSmoothing(0);

	document.documentElement.classList.add('lenis', 'lenis-smooth');
	return lenis;
}

export function destroySmoothScroll() {
	if (tickerFn) {
		gsap.ticker.remove(tickerFn);
		tickerFn = null;
	}
	if (lenis) {
		lenis.destroy();
		lenis = null;
	}
	document.documentElement.classList.remove('lenis', 'lenis-smooth');
}

export function getLenis() {
	return lenis;
}

export function scrollToId(id: string) {
	const el = document.getElementById(id.replace(/^#/, ''));
	if (!el) return;
	if (lenis) {
		lenis.scrollTo(el, { offset: -72, duration: tempo.scrollToDuration });
	} else {
		el.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}
}
