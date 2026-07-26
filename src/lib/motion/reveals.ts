import { ensureGsap, gsap, ScrollTrigger } from './gsap-setup';
import { tempo } from './tempo';

/**
 * Slow, protocol-paced scroll reveals for everything below the hero.
 * Uses GSAP (not CSS class flash) so timing stays consistent.
 */
export function initStudyReveals(root: ParentNode = document): () => void {
	ensureGsap();
	const reduces =
		typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	const nodes = Array.from(root.querySelectorAll<HTMLElement>('.reveal'));
	if (reduces) {
		nodes.forEach((el) => {
			el.classList.add('is-visible');
			el.style.opacity = '1';
			el.style.transform = 'none';
		});
		return () => undefined;
	}

	if (typeof document !== 'undefined') {
		document.documentElement.classList.add('js-ready');
	}

	const vh = typeof window !== 'undefined' ? window.innerHeight : 800;

	const ctx = gsap.context(() => {
		// Group by nearest section so staggers feel like one lab panel opening
		const sections = new Map<Element, HTMLElement[]>();
		for (const el of nodes) {
			const section = el.closest('section') ?? el.parentElement ?? document.body;
			const list = sections.get(section) ?? [];
			list.push(el);
			sections.set(section, list);
		}

		for (const [, group] of sections) {
			group.forEach((el, i) => {
				const rect = el.getBoundingClientRect();
				// Hard evidence fix: If element is already in view or past top threshold, reveal immediately!
				if (rect.top < vh * 0.95 && rect.bottom > 0) {
					el.classList.add('is-visible');
					gsap.set(el, { opacity: 1, y: 0 });
					return;
				}

				gsap.set(el, { opacity: 0, y: tempo.revealY, force3D: true });
				ScrollTrigger.create({
					trigger: el,
					start: tempo.revealStart,
					once: true,
					onEnter: () => {
						gsap.to(el, {
							opacity: 1,
							y: 0,
							duration: tempo.revealDuration,
							delay: i * tempo.revealStagger * 0.35,
							ease: tempo.revealEase,
							onComplete: () => {
								el.classList.add('is-visible');
								el.style.willChange = 'auto';
							}
						});
					}
				});
			});
		}
	});

	requestAnimationFrame(() => ScrollTrigger.refresh());
	const t = window.setTimeout(() => ScrollTrigger.refresh(), 500);

	return () => {
		window.clearTimeout(t);
		ctx.revert();
	};
}
