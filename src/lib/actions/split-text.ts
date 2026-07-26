export function splitText(node: HTMLElement) {
	// A simple split text implementation that breaks text into words
	// wrapped in <span> so GSAP can animate them.
	// Preserve inner HTML structure if possible, but for simple headers, text is fine.
	// Since h1 might contain <em>, we'll need to parse child nodes for a true split.
	// For Project ALPHA, we'll do a simple childNode traversal.

	const splitNodes = (parent: HTMLElement) => {
		const children = Array.from(parent.childNodes);
		parent.innerHTML = '';

		children.forEach((child) => {
			if (child.nodeType === Node.TEXT_NODE) {
				const words = (child.textContent || '').split(' ').filter((w) => w.length > 0);
				words.forEach((word, i) => {
					const outer = document.createElement('span');
					outer.style.display = 'inline-block';
					outer.style.overflow = 'hidden';
					outer.style.verticalAlign = 'top';

					const inner = document.createElement('span');
					inner.style.display = 'inline-block';
					inner.innerText = word;
					inner.className = 'split-word';

					outer.appendChild(inner);
					parent.appendChild(outer);

					if (i < words.length - 1) {
						parent.appendChild(document.createTextNode(' '));
					}
				});
				// Add trailing space if original text had one and we aren't at the end
				if (child.textContent?.endsWith(' ')) {
					parent.appendChild(document.createTextNode(' '));
				}
				if (child.textContent?.startsWith(' ')) {
					parent.insertBefore(document.createTextNode(' '), parent.firstChild);
				}
			} else if (child.nodeType === Node.ELEMENT_NODE) {
				const el = child as HTMLElement;
				// Clone the element structure but split its text contents
				const clone = el.cloneNode(false) as HTMLElement;
				clone.innerHTML = el.innerHTML;
				splitNodes(clone); // recursive
				parent.appendChild(clone);
			}
		});
	};

	const originalHTML = node.innerHTML;
	splitNodes(node);

	return {
		destroy() {
			node.innerHTML = originalHTML; // Restore original on destroy
		}
	};
}
