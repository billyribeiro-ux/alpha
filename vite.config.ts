import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	ssr: {
		noExternal: ['@threlte/core', '@threlte/extras', 'three']
	},
	optimizeDeps: {
		include: ['three', 'gsap', 'd3', 'lenis']
	}
});
