import { tempo } from '$lib/motion/tempo';

/** Subtle magnetic pull — precise, not arcade. */
export function magnetic(node: HTMLElement, strength: number = tempo.magneticStrength) {
	let amount = strength;
	let frame = 0;
	const settle = `${tempo.magneticSettleMs}ms cubic-bezier(0.22, 1, 0.36, 1)`;

	function onMove(e: PointerEvent) {
		const rect = node.getBoundingClientRect();
		const x = e.clientX - rect.left - rect.width / 2;
		const y = e.clientY - rect.top - rect.height / 2;
		cancelAnimationFrame(frame);
		frame = requestAnimationFrame(() => {
			node.style.transition = 'transform 80ms linear';
			node.style.transform = `translate3d(${x * amount}px, ${y * amount}px, 0)`;
		});
	}

	function onLeave() {
		cancelAnimationFrame(frame);
		node.style.transition = `transform ${settle}`;
		node.style.transform = 'translate3d(0,0,0)';
	}

	node.style.willChange = 'transform';
	node.addEventListener('pointermove', onMove);
	node.addEventListener('pointerleave', onLeave);

	return {
		update(s: number) {
			amount = s;
		},
		destroy() {
			cancelAnimationFrame(frame);
			node.removeEventListener('pointermove', onMove);
			node.removeEventListener('pointerleave', onLeave);
		}
	};
}
