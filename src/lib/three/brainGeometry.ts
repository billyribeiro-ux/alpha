/**
 * Single continuous cortex mesh — whole brain, not two floating halves.
 * Subtle longitudinal fissure as a groove only (anatomical, not a split).
 */
import { BufferGeometry, Float32BufferAttribute, Vector3 } from 'three';

function hash(n: number): number {
	const x = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
	return x - Math.floor(x);
}

function noise3(x: number, y: number, z: number): number {
	const ix = Math.floor(x);
	const iy = Math.floor(y);
	const iz = Math.floor(z);
	const fx = x - ix;
	const fy = y - iy;
	const fz = z - iz;
	const u = fx * fx * (3 - 2 * fx);
	const v = fy * fy * (3 - 2 * fy);
	const w = fz * fz * (3 - 2 * fz);
	const id = (i: number, j: number, k: number) => hash(i + j * 57 + k * 131);
	const n000 = id(ix, iy, iz);
	const n100 = id(ix + 1, iy, iz);
	const n010 = id(ix, iy + 1, iz);
	const n110 = id(ix + 1, iy + 1, iz);
	const n001 = id(ix, iy, iz + 1);
	const n101 = id(ix + 1, iy, iz + 1);
	const n011 = id(ix, iy + 1, iz + 1);
	const n111 = id(ix + 1, iy + 1, iz + 1);
	const x00 = n000 * (1 - u) + n100 * u;
	const x10 = n010 * (1 - u) + n110 * u;
	const x01 = n001 * (1 - u) + n101 * u;
	const x11 = n011 * (1 - u) + n111 * u;
	const y0 = x00 * (1 - v) + x10 * v;
	const y1 = x01 * (1 - v) + x11 * v;
	return y0 * (1 - w) + y1 * w;
}

function fbm(x: number, y: number, z: number, oct = 5): number {
	let sum = 0;
	let a = 0.5;
	let f = 1;
	for (let i = 0; i < oct; i++) {
		sum += noise3(x * f, y * f, z * f) * a;
		f *= 2.02;
		a *= 0.5;
	}
	return sum;
}

/**
 * Unit sphere direction → continuous cortex surface.
 * One connected volume. Midline is a shallow groove, not a gap.
 */
export function brainPoint(nx: number, ny: number, nz: number, out: Vector3): Vector3 {
	// Whole-brain ellipsoid (wider L/R, longer A/P, flatter top)
	let x = nx * 1.2;
	let y = ny * 0.84;
	let z = nz * 1.06;

	// Longitudinal fissure = shallow groove only (surface dips, mesh stays connected)
	const mid = Math.exp(-x * x * 28);
	y -= mid * 0.07;
	// tiny pinch, not a split
	x *= 1 - mid * 0.04;

	// Frontal (anterior +Z)
	if (z > 0) {
		z *= 1.07;
		y += z * 0.04;
	} else {
		z *= 1.03;
	}

	// Crown
	if (y > 0.25) {
		y *= 1.05;
	}

	// Temporal lobes (lower sides) — continuous bulge
	const temporal = Math.max(0, Math.abs(x) - 0.32) * Math.max(0, 0.12 - y);
	y -= temporal * 0.55;
	x += Math.sign(x || 1) * temporal * 0.28;

	// Sylvian-like indent (surface only)
	const sylvian =
		Math.exp(-Math.pow((y - 0.02) * 3.8, 2)) * Math.exp(-Math.pow((z - 0.08) * 2.0, 2));
	y -= sylvian * 0.08 * Math.abs(x);

	// Cerebellum-ish posterior inferior (still connected)
	if (z < -0.22 && y < 0.12) {
		const c = (-z - 0.22) * Math.max(0, 0.18 - y);
		y -= c * 0.4;
		z -= c * 0.15;
	}

	// Brainstem stub (connected inferior)
	if (y < -0.48 && Math.abs(x) < 0.4 && Math.abs(z) < 0.45) {
		const s = (-y - 0.48) * 1.15;
		x *= Math.max(0.4, 1 - s * 0.45);
		z *= Math.max(0.45, 1 - s * 0.35);
		y -= s * 0.12;
	}

	// Gyri / sulci
	const g1 = fbm(x * 4.0, y * 5.2, z * 4.0, 5);
	const g2 = fbm(x * 9.0 + 2.1, y * 10.5, z * 9.0, 3);
	const g3 = fbm(x * 17, y * 19, z * 17, 2);
	const sulcus = Math.abs(Math.sin(y * 13 + g1 * 2.5)) * 0.028;
	// Reduce folds in midline so groove stays clean
	const foldScale = 1 - mid * 0.65;
	const fold = ((g1 - 0.45) * 0.12 + (g2 - 0.5) * 0.045 + (g3 - 0.5) * 0.018 - sulcus) * foldScale;

	const r = Math.hypot(x, y, z) || 1;
	const scale = 1 + fold;
	out.set((x / r) * r * scale, (y / r) * r * scale, (z / r) * r * scale);
	return out;
}

/** One watertight-ish sphere topology deformed into a whole brain. */
export function createBrainGeometry(segW = 128, segH = 80): BufferGeometry {
	const positions: number[] = [];
	const uvs: number[] = [];
	const indices: number[] = [];
	const tmp = new Vector3();

	for (let iy = 0; iy <= segH; iy++) {
		const v = iy / segH;
		const phi = v * Math.PI;
		for (let ix = 0; ix <= segW; ix++) {
			const u = ix / segW;
			const theta = u * Math.PI * 2;
			const nx = Math.sin(phi) * Math.cos(theta);
			const ny = Math.cos(phi);
			const nz = Math.sin(phi) * Math.sin(theta);
			brainPoint(nx, ny, nz, tmp);
			// Uniform scale into scene units
			positions.push(tmp.x * 1.32, tmp.y * 1.32, tmp.z * 1.32);
			uvs.push(u, 1 - v);
		}
	}

	const stride = segW + 1;
	for (let iy = 0; iy < segH; iy++) {
		for (let ix = 0; ix < segW; ix++) {
			const a = iy * stride + ix;
			const b = a + stride;
			const c = a + 1;
			const d = b + 1;
			indices.push(a, b, c, c, b, d);
		}
	}

	const geo = new BufferGeometry();
	geo.setAttribute('position', new Float32BufferAttribute(positions, 3));
	geo.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
	geo.setIndex(indices);
	geo.computeVertexNormals();
	geo.computeBoundingSphere();
	return geo;
}

/** Muse S electrode cluster on continuous surface. */
export const MUSE_SITES: { id: string; dir: [number, number, number] }[] = [
	{ id: 'AF7', dir: [-0.55, 0.32, 0.78] },
	{ id: 'AF8', dir: [0.55, 0.32, 0.78] },
	{ id: 'Tp9', dir: [-0.95, -0.08, -0.05] },
	{ id: 'Tp10', dir: [0.95, -0.08, -0.05] },
	{ id: 'Fpz', dir: [0, 0.4, 0.9] }
];

export function surfaceFromDir(dir: [number, number, number], out: Vector3): Vector3 {
	const len = Math.hypot(dir[0], dir[1], dir[2]) || 1;
	brainPoint(dir[0] / len, dir[1] / len, dir[2] / len, out);
	out.multiplyScalar(1.32 * 1.02);
	return out;
}
