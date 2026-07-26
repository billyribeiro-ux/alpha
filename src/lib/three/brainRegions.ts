/**
 * Scientific region / network definitions for Project ALPHA visualization.
 * Maps protocol concepts (α training, attention, executive control) to cortex loci.
 */
import { Vector3 } from 'three';
import { surfaceFromDir } from './brainGeometry';

export type BandId = 'delta' | 'theta' | 'alpha' | 'beta' | 'gamma';

export type BrainRegion = {
	id: string;
	name: string;
	/** Protocol relevance */
	role: string;
	band: BandId;
	/** Unit-ish direction used with surfaceFromDir */
	dir: [number, number, number];
	color: string;
};

/** Functional foci shown on the 3D cortex */
export const BRAIN_REGIONS: BrainRegion[] = [
	{
		id: 'dlpfc-l',
		name: 'L DLPFC',
		role: 'Executive control · impulse (STRENGTH)',
		band: 'beta',
		dir: [-0.55, 0.45, 0.65],
		color: '#b82020'
	},
	{
		id: 'dlpfc-r',
		name: 'R DLPFC',
		role: 'Executive control · planning',
		band: 'beta',
		dir: [0.55, 0.45, 0.65],
		color: '#b82020'
	},
	{
		id: 'pfc-mid',
		name: 'mPFC',
		role: 'Self-monitoring · trade debrief',
		band: 'theta',
		dir: [0, 0.35, 0.85],
		color: '#2bbfa0'
	},
	{
		id: 'parietal-l',
		name: 'L Parietal',
		role: 'Spatial / chart attention',
		band: 'alpha',
		dir: [-0.45, 0.55, -0.35],
		color: '#3b8beb'
	},
	{
		id: 'parietal-r',
		name: 'R Parietal',
		role: 'α peak · calm focus (CORE)',
		band: 'alpha',
		dir: [0.45, 0.55, -0.35],
		color: '#3b8beb'
	},
	{
		id: 'occ-l',
		name: 'L Occipital',
		role: 'Visual stream · price action',
		band: 'alpha',
		dir: [-0.28, 0.12, -0.92],
		color: '#5b9fd4'
	},
	{
		id: 'occ-r',
		name: 'R Occipital',
		role: 'Visual stream · price action',
		band: 'alpha',
		dir: [0.28, 0.12, -0.92],
		color: '#5b9fd4'
	},
	{
		id: 'temp-l',
		name: 'L Temporal',
		role: 'Memory · pattern recognition',
		band: 'theta',
		dir: [-0.95, -0.05, 0.1],
		color: '#2bbfa0'
	},
	{
		id: 'temp-r',
		name: 'R Temporal',
		role: 'Context · market narrative',
		band: 'theta',
		dir: [0.95, -0.05, 0.1],
		color: '#2bbfa0'
	},
	{
		id: 'motor-l',
		name: 'L Motor',
		role: 'Execution · click / order',
		band: 'beta',
		dir: [-0.7, 0.4, 0.05],
		color: '#d4a853'
	},
	{
		id: 'motor-r',
		name: 'R Motor',
		role: 'Execution · click / order',
		band: 'beta',
		dir: [0.7, 0.4, 0.05],
		color: '#d4a853'
	},
	{
		id: 'acc',
		name: 'ACC',
		role: 'Conflict · FOMO / hesitation',
		band: 'theta',
		dir: [0, 0.55, 0.55],
		color: '#e07040'
	}
];

/** Directed edges: signal flow for “interaction” visualization */
export const NETWORK_EDGES: [string, string][] = [
	['occ-l', 'parietal-l'],
	['occ-r', 'parietal-r'],
	['parietal-l', 'dlpfc-l'],
	['parietal-r', 'dlpfc-r'],
	['dlpfc-l', 'motor-l'],
	['dlpfc-r', 'motor-r'],
	['pfc-mid', 'acc'],
	['acc', 'dlpfc-l'],
	['acc', 'dlpfc-r'],
	['temp-l', 'parietal-l'],
	['temp-r', 'parietal-r'],
	['parietal-l', 'parietal-r'],
	['dlpfc-l', 'dlpfc-r'],
	['pfc-mid', 'parietal-r']
];

export function regionPositions(): Map<string, Vector3> {
	const map = new Map<string, Vector3>();
	const tmp = new Vector3();
	for (const r of BRAIN_REGIONS) {
		surfaceFromDir(r.dir, tmp);
		map.set(r.id, tmp.clone().multiplyScalar(1.01));
	}
	return map;
}

export const BAND_META: Record<
	BandId,
	{ label: string; hz: string; color: string; protocol: string }
> = {
	delta: { label: 'Δ Delta', hz: '0.5–4 Hz', color: '#6b6560', protocol: 'Deep rest (off-session)' },
	theta: { label: 'Θ Theta', hz: '4–8 Hz', color: '#2bbfa0', protocol: 'Meditation entry · memory' },
	alpha: { label: 'α Alpha', hz: '8–12 Hz', color: '#3b8beb', protocol: 'CORE target · calm focus' },
	beta: { label: 'β Beta', hz: '12–30 Hz', color: '#b82020', protocol: 'STRENGTH · executive' },
	gamma: { label: 'γ Gamma', hz: '30–80 Hz', color: '#d4a853', protocol: 'Binding · peak insight' }
};
