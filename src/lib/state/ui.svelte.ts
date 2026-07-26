/** Shared UI state for conversion modals and scroll progress. */

class UiState {
	applyOpen = $state(false);
	scrollProgress = $state(0);
	activeSection = $state('hero');
	reducedMotion = $state(false);

	openApply() {
		this.applyOpen = true;
	}

	closeApply() {
		this.applyOpen = false;
	}
}

export const ui = new UiState();
