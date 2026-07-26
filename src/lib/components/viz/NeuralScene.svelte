<script lang="ts">
	/**
	 * Hollow white 3D cortex — waves visible navigating through the shell.
	 * Functional nodes (circles) refined; network pulses stay parented to brain.
	 */
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { ui } from '$lib/state/ui.svelte';
	import { ALPHA_HZ, alphaPower, stressIndex } from '$lib/motion/signals';
	import { createBrainGeometry, MUSE_SITES, surfaceFromDir } from '$lib/three/brainGeometry';
	import {
		BAND_META,
		BRAIN_REGIONS,
		NETWORK_EDGES,
		regionPositions,
		type BandId
	} from '$lib/three/brainRegions';
	import { ensureGsap } from '$lib/motion/gsap-setup';

	let canvasEl: HTMLCanvasElement | undefined = $state();
	let failed = $state(false);
	let status = $state('Loading neural model…');

	let focusRegion = $state<(typeof BRAIN_REGIONS)[number] | null>(null);
	let bands = $state({
		delta: 18,
		theta: 24,
		alpha: 52,
		beta: 28,
		gamma: 12
	});
	let mode = $state<'baseline' | 'core' | 'live'>('core');

	onMount(() => {
		if (!browser || !canvasEl) {
			failed = true;
			return;
		}

		let disposed = false;
		let raf = 0;
		let renderer: import('three').WebGLRenderer | undefined;
		let resizeObs: ResizeObserver | undefined;
		let pmrem: import('three').PMREMGenerator | undefined;

		const pointer = { down: false, px: 0, py: 0, moved: false };
		const orbit = { yaw: -0.55, pitch: 0.18 };
		let onPointerDown: ((e: PointerEvent) => void) | undefined;
		let onPointerMove: ((e: PointerEvent) => void) | undefined;
		let onPointerUp: ((e: PointerEvent) => void) | undefined;
		let onPointerLeave: ((e: PointerEvent) => void) | undefined;
		let onWheel: ((e: WheelEvent) => void) | undefined;

		void (async () => {
			try {
				const THREE = await import('three');
				const { RoomEnvironment } = await import('three/addons/environments/RoomEnvironment.js');
				if (disposed || !canvasEl) return;

				status = 'Building hollow cortex…';
				await new Promise<void>((r) => requestAnimationFrame(() => r()));

				const scene = new THREE.Scene();
				const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 50);
				let camDist = 4.35;
				camera.position.set(0.2, 0.4, camDist);

				renderer = new THREE.WebGLRenderer({
					canvas: canvasEl,
					alpha: true,
					antialias: true,
					powerPreference: 'high-performance'
				});
				renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
				renderer.setClearColor(0x000000, 0);
				renderer.toneMapping = THREE.ACESFilmicToneMapping;
				renderer.toneMappingExposure = 1.12;
				renderer.outputColorSpace = THREE.SRGBColorSpace;

				pmrem = new THREE.PMREMGenerator(renderer);
				scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

				const root = new THREE.Group();
				root.rotation.set(orbit.pitch, orbit.yaw, 0);
				scene.add(root);

				// Cool clinical lighting so white shell reads clean
				scene.add(new THREE.AmbientLight(0xffffff, 0.45));
				const key = new THREE.DirectionalLight(0xffffff, 1.4);
				key.position.set(2.8, 4.2, 3.2);
				scene.add(key);
				const fill = new THREE.DirectionalLight(0xdce9ff, 0.55);
				fill.position.set(-3, 1.2, 1.5);
				scene.add(fill);
				const rim = new THREE.DirectionalLight(0x8ec5ff, 0.4);
				rim.position.set(0, -1.5, -3);
				scene.add(rim);

				const brainGeo = createBrainGeometry();
				brainGeo.computeVertexNormals();

				// ——— Hollow white shell (see-through cortex) ———
				const shellMat = new THREE.ShaderMaterial({
					transparent: true,
					depthWrite: false,
					side: THREE.DoubleSide,
					uniforms: {
						uTime: { value: 0 },
						uAlpha: { value: 0.55 },
						uBeta: { value: 0.3 },
						uTheta: { value: 0.25 },
						uMode: { value: 1 },
						uFocus: { value: new THREE.Vector3(99, 99, 99) },
						uFocusStr: { value: 0 }
					},
					vertexShader: /* glsl */ `
						varying vec3 vPos;
						varying vec3 vWorld;
						varying vec3 vN;
						void main() {
							vPos = position;
							vec4 w = modelMatrix * vec4(position, 1.0);
							vWorld = w.xyz;
							vN = normalize(normalMatrix * normal);
							gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
						}
					`,
					fragmentShader: /* glsl */ `
						uniform float uTime;
						uniform float uAlpha;
						uniform float uBeta;
						uniform float uTheta;
						uniform float uMode;
						uniform vec3 uFocus;
						uniform float uFocusStr;
						varying vec3 vPos;
						varying vec3 vWorld;
						varying vec3 vN;

						void main() {
							vec3 viewDir = normalize(cameraPosition - vWorld);
							vec3 n = normalize(vN);
							// Two-sided fresnel for hollow shell
							float ndv = abs(dot(n, viewDir));
							float fres = pow(1.0 - ndv, 1.65);

							// White porcelain shell — denser on edges, open faces
							vec3 white = vec3(0.96, 0.97, 0.99);
							float shellA = 0.06 + fres * 0.55;

							// Traveling waves navigate the cortex (slow, readable)
							// Alpha: posterior-dominant rings
							float aPhase = uTime * 0.55;
							float aWave = sin(length(vPos.yz) * 9.0 - aPhase * 6.2831 + vPos.x * 2.0);
							aWave = smoothstep(0.15, 0.95, aWave * 0.5 + 0.5);
							float posterior = smoothstep(0.4, -0.75, vPos.z);
							float aAmt = aWave * uAlpha * (0.4 + posterior * 0.7);

							// Beta: frontal pulses
							float bWave = sin(vPos.z * 14.0 + vPos.y * 8.0 - uTime * 1.1 * 6.2831);
							bWave = smoothstep(0.25, 0.9, bWave * 0.5 + 0.5);
							float frontal = smoothstep(-0.15, 0.9, vPos.z);
							float bAmt = bWave * uBeta * (0.25 + frontal * 0.85);

							// Theta: temporal / deep
							float tWave = sin(abs(vPos.x) * 10.0 + vPos.y * 6.0 - uTime * 0.32 * 6.2831);
							tWave = smoothstep(0.2, 0.85, tWave * 0.5 + 0.5);
							float temporal = smoothstep(0.4, 1.0, abs(vPos.x));
							float tAmt = tWave * uTheta * (0.2 + temporal * 0.65);

							// Spherical fronts expanding through volume (navigation)
							float front1 = abs(length(vPos - vec3(0.35, 0.4, -0.25)) - mod(uTime * 0.22, 1.6));
							float front2 = abs(length(vPos - vec3(-0.3, 0.35, 0.45)) - mod(uTime * 0.18 + 0.5, 1.5));
							float ring1 = exp(-front1 * front1 * 80.0) * uAlpha;
							float ring2 = exp(-front2 * front2 * 70.0) * uBeta * 0.7;

							aAmt *= 0.8 + uMode * 0.15;
							bAmt *= 0.5 + step(1.5, uMode) * 0.5;

							vec3 cAlpha = vec3(0.2, 0.55, 1.0);
							vec3 cBeta = vec3(0.95, 0.25, 0.22);
							vec3 cTheta = vec3(0.15, 0.85, 0.72);

							vec3 signal = cAlpha * (aAmt * 0.85 + ring1 * 0.9)
								+ cBeta * (bAmt * 0.75 + ring2 * 0.7)
								+ cTheta * tAmt * 0.7;

							float focusGlow = exp(-distance(vPos, uFocus) * 5.0) * uFocusStr;
							signal += cAlpha * focusGlow;

							// Composite: white shell + vivid waves (additive feel)
							vec3 col = white * (0.75 + fres * 0.35) + signal * 1.15;
							float a = clamp(shellA + length(signal) * 0.55 + focusGlow * 0.35, 0.04, 0.92);
							gl_FragColor = vec4(col, a);
						}
					`
				});

				const shell = new THREE.Mesh(brainGeo, shellMat);
				shell.renderOrder = 1;
				root.add(shell);

				// Inner ghost — barely-there second shell for depth (true hollow feel)
				const innerShell = new THREE.Mesh(
					brainGeo,
					new THREE.MeshPhysicalMaterial({
						color: 0xffffff,
						metalness: 0,
						roughness: 0.35,
						transparent: true,
						opacity: 0.04,
						side: THREE.BackSide,
						depthWrite: false
					})
				);
				innerShell.scale.setScalar(0.92);
				innerShell.renderOrder = 0;
				root.add(innerShell);

				// Fine white wireframe for anatomical read
				const wire = new THREE.Mesh(
					brainGeo,
					new THREE.MeshBasicMaterial({
						color: 0xffffff,
						wireframe: true,
						transparent: true,
						opacity: 0.09,
						depthWrite: false
					})
				);
				wire.scale.setScalar(1.003);
				wire.renderOrder = 2;
				root.add(wire);

				// ——— Network ———
				const positions = regionPositions();
				const netGroup = new THREE.Group();
				root.add(netGroup);

				// eslint-disable-next-line
				const nodeMeshes = new Map<string, import('three').Mesh>();
				// eslint-disable-next-line
				const nodeGroups = new Map<string, import('three').Group>();
				const pickables: import('three').Object3D[] = [];

				const coreGeo = new THREE.SphereGeometry(0.028, 16, 16);
				const ringGeo = new THREE.TorusGeometry(0.048, 0.0045, 10, 36);
				const haloGeo = new THREE.SphereGeometry(0.062, 16, 16);

				for (const r of BRAIN_REGIONS) {
					const p = positions.get(r.id);
					if (!p) continue;

					const g = new THREE.Group();
					g.position.copy(p);
					g.userData = { regionId: r.id };

					const col = new THREE.Color(r.color);

					// Soft halo
					const halo = new THREE.Mesh(
						haloGeo,
						new THREE.MeshBasicMaterial({
							color: col,
							transparent: true,
							opacity: 0.12,
							depthWrite: false
						})
					);
					g.add(halo);

					// Precision ring
					const ring = new THREE.Mesh(
						ringGeo,
						new THREE.MeshBasicMaterial({
							color: col,
							transparent: true,
							opacity: 0.85,
							depthWrite: false
						})
					);
					// Orient ring to face outward from origin
					ring.lookAt(0, 0, 0);
					ring.rotateX(Math.PI / 2);
					g.add(ring);

					// Core contact
					const core = new THREE.Mesh(
						coreGeo,
						new THREE.MeshBasicMaterial({
							color: col.clone().lerp(new THREE.Color(0xffffff), 0.25),
							transparent: true,
							opacity: 0.98
						})
					);
					core.userData = { regionId: r.id };
					g.add(core);

					netGroup.add(g);
					nodeMeshes.set(r.id, core);
					nodeGroups.set(r.id, g);
					pickables.push(core, ring, halo);
					// store region on all children for pick
					halo.userData = { regionId: r.id };
					ring.userData = { regionId: r.id };
				}

				// Edges — brighter on white shell
				const edgePairs: { a: string; b: string }[] = [];
				const edgePositions: number[] = [];
				for (const [a, b] of NETWORK_EDGES) {
					const pa = positions.get(a);
					const pb = positions.get(b);
					if (!pa || !pb) continue;
					// slight inward so lines sit inside hollow shell
					const ia = pa.clone().multiplyScalar(0.96);
					const ib = pb.clone().multiplyScalar(0.96);
					edgePositions.push(ia.x, ia.y, ia.z, ib.x, ib.y, ib.z);
					edgePairs.push({ a, b });
				}
				const edgeGeo = new THREE.BufferGeometry();
				edgeGeo.setAttribute(
					'position',
					new THREE.Float32BufferAttribute(new Float32Array(edgePositions), 3)
				);
				const edgeMat = new THREE.LineBasicMaterial({
					color: 0x5eb0ff,
					transparent: true,
					opacity: 0.55,
					depthWrite: false
				});
				const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
				edgeLines.frustumCulled = false;
				edgeLines.renderOrder = 3;
				netGroup.add(edgeLines);

				// Signal packets traveling pathways (visible inside hollow brain)
				const pulseGeo = new THREE.SphereGeometry(0.02, 12, 12);
				const pulses: {
					mesh: import('three').Mesh;
					a: string;
					b: string;
					t: number;
					speed: number;
					mat: import('three').MeshBasicMaterial;
				}[] = [];
				const pulseCount = Math.min(8, edgePairs.length);
				for (let i = 0; i < pulseCount; i++) {
					const e = edgePairs[i % edgePairs.length];
					const mat = new THREE.MeshBasicMaterial({
						color: i % 3 === 0 ? 0x3b8beb : i % 3 === 1 ? 0x2bbfa0 : 0xd4a853,
						transparent: true,
						opacity: 0.95,
						depthWrite: false
					});
					const mesh = new THREE.Mesh(pulseGeo, mat);
					mesh.frustumCulled = false;
					mesh.renderOrder = 4;
					netGroup.add(mesh);
					pulses.push({
						mesh,
						a: e.a,
						b: e.b,
						t: i / pulseCount,
						speed: 0.12 + (i % 3) * 0.03,
						mat
					});
				}

				// Internal expanding wave shells (navigation through volume)
				const waveFronts: import('three').Mesh[] = [];
				const sources = [
					positions.get('parietal-r') ?? new THREE.Vector3(0.4, 0.5, -0.2),
					positions.get('dlpfc-l') ?? new THREE.Vector3(-0.45, 0.4, 0.55),
					positions.get('occ-r') ?? new THREE.Vector3(0.25, 0.15, -0.8)
				];
				const wfGeo = new THREE.SphereGeometry(0.15, 28, 20);
				const wfColors = [0x3b8beb, 0xb82020, 0x2bbfa0];
				for (let i = 0; i < 3; i++) {
					const wf = new THREE.Mesh(
						wfGeo,
						new THREE.MeshBasicMaterial({
							color: wfColors[i],
							transparent: true,
							opacity: 0.14,
							wireframe: true,
							depthWrite: false,
							side: THREE.DoubleSide
						})
					);
					wf.position.copy(sources[i]);
					wf.renderOrder = 2;
					root.add(wf);
					waveFronts.push(wf);
				}

				// Muse contacts on shell
				const museGroup = new THREE.Group();
				root.add(museGroup);
				const contactGeo = new THREE.SphereGeometry(0.026, 12, 12);
				const museMeshes: import('three').Mesh[] = [];
				const tmp = new THREE.Vector3();
				for (const site of MUSE_SITES) {
					surfaceFromDir(site.dir, tmp);
					const m = new THREE.Mesh(
						contactGeo,
						new THREE.MeshBasicMaterial({
							color: 0x1a8cff,
							transparent: true,
							opacity: 0.95
						})
					);
					m.position.copy(tmp).multiplyScalar(1.025);
					museGroup.add(m);
					museMeshes.push(m);
				}
				const bandPts: import('three').Vector3[] = [];
				for (let i = 0; i <= 32; i++) {
					const u = i / 32;
					const a = Math.PI * 0.2 + u * Math.PI * 0.6;
					bandPts.push(
						new THREE.Vector3(
							Math.cos(a) * 0.76,
							0.26 + Math.sin(a) * 0.07,
							0.52 + Math.sin(a) * 0.1
						)
					);
				}
				museGroup.add(
					new THREE.Mesh(
						new THREE.TubeGeometry(new THREE.CatmullRomCurve3(bandPts), 32, 0.014, 6, false),
						new THREE.MeshBasicMaterial({
							color: 0x2a3344,
							transparent: true,
							opacity: 0.75
						})
					)
				);

				const podium = new THREE.Mesh(
					new THREE.CylinderGeometry(1.4, 1.5, 0.03, 48),
					new THREE.MeshBasicMaterial({
						color: 0x0a0c12,
						transparent: true,
						opacity: 0.75
					})
				);
				podium.position.y = -1.08;
				scene.add(podium);

				const raycaster = new THREE.Raycaster();
				raycaster.params.Line = { threshold: 0.05 };
				const ndc = new THREE.Vector2();

				function setFocus(id: string | null) {
					if (!id) {
						focusRegion = null;
						shellMat.uniforms.uFocusStr.value = 0;
						return;
					}
					const r = BRAIN_REGIONS.find((x) => x.id === id) ?? null;
					focusRegion = r;
					const p = positions.get(id);
					if (p) {
						shellMat.uniforms.uFocus.value.copy(p);
						shellMat.uniforms.uFocusStr.value = 1;
					}
				}

				onPointerDown = (e: PointerEvent) => {
					pointer.down = true;
					pointer.moved = false;
					pointer.px = e.clientX;
					pointer.py = e.clientY;
					canvasEl!.setPointerCapture(e.pointerId);
				};

				onPointerMove = (e: PointerEvent) => {
					if (!pointer.down) return;
					const dx = e.movementX || e.clientX - pointer.px;
					const dy = e.movementY || e.clientY - pointer.py;
					if (Math.abs(dx) + Math.abs(dy) > 1) pointer.moved = true;
					orbit.yaw += dx * 0.0065;
					orbit.pitch = Math.max(-0.42, Math.min(0.55, orbit.pitch + dy * 0.005));
					root.rotation.y = orbit.yaw;
					root.rotation.x = orbit.pitch;
					pointer.px = e.clientX;
					pointer.py = e.clientY;
				};

				onPointerUp = (e: PointerEvent) => {
					pointer.down = false;
					if (!pointer.moved) {
						const rect = canvasEl!.getBoundingClientRect();
						ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
						ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
						raycaster.setFromCamera(ndc, camera);
						root.updateMatrixWorld(true);
						const hits = raycaster.intersectObjects(pickables, false);
						if (hits[0]) setFocus(hits[0].object.userData.regionId as string);
						else setFocus(null);
					}
					try {
						canvasEl!.releasePointerCapture(e.pointerId);
					} catch {
						/* ignore */
					}
				};

				onPointerLeave = () => {
					pointer.down = false;
				};

				onWheel = (e: WheelEvent) => {
					e.preventDefault();
					camDist = Math.max(3.2, Math.min(6.2, camDist + e.deltaY * 0.0025));
				};

				canvasEl.addEventListener('pointerdown', onPointerDown);
				canvasEl.addEventListener('pointermove', onPointerMove);
				canvasEl.addEventListener('pointerup', onPointerUp);
				canvasEl.addEventListener('pointercancel', onPointerUp);
				canvasEl.addEventListener('pointerleave', onPointerLeave);
				canvasEl.addEventListener('wheel', onWheel, { passive: false });

				function resize() {
					if (!canvasEl || !renderer) return;
					const parent = canvasEl.parentElement;
					const w = parent?.clientWidth || window.innerWidth;
					const h = parent?.clientHeight || window.innerHeight;
					camera.aspect = w / h;
					camera.updateProjectionMatrix();
					renderer.setSize(w, h, false);
				}
				resize();
				resizeObs = new ResizeObserver(resize);
				if (canvasEl.parentElement) resizeObs.observe(canvasEl.parentElement);

				if (!ui.reducedMotion) {
					const gsap = ensureGsap();
					const proxy = { d: 5.4 };
					camDist = 5.4;
					gsap.to(proxy, {
						d: 4.35,
						duration: 1.8,
						ease: 'power2.out',
						onUpdate: () => {
							camDist = proxy.d;
						}
					});
				}

				camera.position.set(0.15, 0.35, camDist);
				camera.lookAt(0, 0.05, 0);
				renderer.render(scene, camera);
				status = '';

				const clock = new THREE.Clock();
				let modeTimer = 0;
				let lastT = 0;
				let uiAccum = 0;
				let frame = 0;
				let localBands = { ...bands };
				let localMode: typeof mode = mode;

				function tick() {
					if (disposed || !renderer) return;
					const t = clock.getElapsedTime();
					const dt = Math.min(0.05, t - lastT || 0.016);
					lastT = t;
					frame++;

					const dragging = pointer.down;
					const aPow = ui.reducedMotion ? 0.55 : alphaPower(t * 0.45);
					const stress = ui.reducedMotion ? 0.3 : stressIndex(t * 0.45);

					modeTimer += dt;
					if (modeTimer > 10) {
						modeTimer = 0;
						localMode =
							localMode === 'baseline' ? 'core' : localMode === 'core' ? 'live' : 'baseline';
					}
					const modeVal = localMode === 'baseline' ? 0 : localMode === 'core' ? 1 : 2;

					const alphaPct = Math.min(
						85,
						Math.max(15, Math.round((localMode === 'core' ? 48 : 32) + aPow * 40 - stress * 10))
					);
					const betaPct = Math.min(
						70,
						Math.max(
							10,
							Math.round(
								(localMode === 'live' ? 35 : 18) + stress * 35 + (localMode === 'core' ? -5 : 0)
							)
						)
					);
					const thetaPct = Math.min(45, Math.round(18 + (0.2 + Math.sin(t * 0.25) * 0.08) * 40));
					localBands = {
						delta: Math.round(12 + (1 - aPow) * 10),
						theta: thetaPct,
						alpha: alphaPct,
						beta: betaPct,
						gamma: Math.round(8 + aPow * 8 + (localMode === 'live' ? 6 : 0))
					};

					uiAccum += dt;
					if (uiAccum >= 0.22) {
						uiAccum = 0;
						bands = localBands;
						mode = localMode;
					}

					// Slow wave time so paths are watchable
					shellMat.uniforms.uTime.value = t * 0.55;
					shellMat.uniforms.uAlpha.value = localBands.alpha / 100;
					shellMat.uniforms.uBeta.value = localBands.beta / 100;
					shellMat.uniforms.uTheta.value = localBands.theta / 100;
					shellMat.uniforms.uMode.value = modeVal;
					if (focusRegion) {
						shellMat.uniforms.uFocusStr.value = Math.max(
							0.85,
							shellMat.uniforms.uFocusStr.value * 0.98
						);
					} else {
						shellMat.uniforms.uFocusStr.value *= 0.96;
					}

					if (!ui.reducedMotion && !dragging) {
						// Parallax scroll linkage
						const scrollInfluenceYaw = ui.scrollProgress * 2.5;
						const scrollInfluencePitch = ui.scrollProgress * 0.4;
						orbit.yaw += 0.001; // Keep slight idle

						root.rotation.y = orbit.yaw + scrollInfluenceYaw;
						root.rotation.x = orbit.pitch - scrollInfluencePitch;

						// Intense glow when scrolled down
						const glowBoost = ui.scrollProgress * 1.5;
						shellMat.uniforms.uAlpha.value = Math.min(1.0, localBands.alpha / 100 + glowBoost);
					}

					if (!dragging) {
						const breath = 1 + Math.sin(t * 0.4) * 0.004 + aPow * 0.006;
						shell.scale.setScalar(breath);
						innerShell.scale.setScalar(breath * 0.92);
						wire.scale.setScalar(breath * 1.003);
					}

					camera.position.x = Math.sin(orbit.yaw * 0.12) * 0.12;
					camera.position.y = 0.35 + orbit.pitch * 0.18;
					camera.position.z = camDist;
					camera.lookAt(0, 0.05, 0);

					// Packets travel pathways inside hollow volume
					for (const p of pulses) {
						p.t += dt * p.speed * 0.65;
						if (p.t > 1) p.t -= 1;
						const pa = positions.get(p.a);
						const pb = positions.get(p.b);
						if (!pa || !pb) continue;
						const ia = pa.clone().multiplyScalar(0.96);
						const ib = pb.clone().multiplyScalar(0.96);
						p.mesh.position.lerpVectors(ia, ib, p.t);
						p.mat.opacity = 0.4 + Math.sin(p.t * Math.PI) * 0.55;
					}

					if (frame % 2 === 0) {
						edgeMat.opacity = 0.4 + aPow * 0.25;
					}

					// Expanding shells navigate through hollow cortex
					for (let i = 0; i < waveFronts.length; i++) {
						const wf = waveFronts[i];
						const phase = (t * 0.18 + i / waveFronts.length) % 1;
						wf.scale.setScalar(0.35 + phase * 2.2);
						(wf.material as import('three').MeshBasicMaterial).opacity =
							(1 - phase) * 0.2 * (0.5 + aPow);
						wf.position.copy(sources[i]);
					}

					if (frame % 3 === 0) {
						for (const r of BRAIN_REGIONS) {
							const g = nodeGroups.get(r.id);
							if (!g) continue;
							const boost =
								r.band === 'alpha'
									? localBands.alpha / 100
									: r.band === 'beta'
										? localBands.beta / 100
										: localBands.theta / 100;
							const focused = focusRegion?.id === r.id;
							g.scale.setScalar((0.95 + boost * 0.2) * (focused ? 1.35 : 1));
						}
					}

					for (const m of museMeshes) {
						const mat = m.material as import('three').MeshBasicMaterial;
						mat.opacity = 0.75 + aPow * 0.25;
					}

					renderer.render(scene, camera);
					raf = requestAnimationFrame(tick);
				}
				tick();
			} catch (err) {
				console.error(err);
				failed = true;
				status = 'Neural model failed to load';
			}
		})();

		return () => {
			disposed = true;
			cancelAnimationFrame(raf);
			if (canvasEl) {
				if (onPointerDown) canvasEl.removeEventListener('pointerdown', onPointerDown);
				if (onPointerMove) canvasEl.removeEventListener('pointermove', onPointerMove);
				if (onPointerUp) canvasEl.removeEventListener('pointerup', onPointerUp);
				if (onPointerUp) canvasEl.removeEventListener('pointercancel', onPointerUp);
				if (onPointerLeave) canvasEl.removeEventListener('pointerleave', onPointerLeave);
				if (onWheel) canvasEl.removeEventListener('wheel', onWheel);
			}
			resizeObs?.disconnect();
			pmrem?.dispose();
			renderer?.dispose();
		};
	});

	const bandOrder: BandId[] = ['delta', 'theta', 'alpha', 'beta', 'gamma'];
</script>

<div class="lab">
	<div class="viewport">
		{#if !failed}
			<canvas bind:this={canvasEl} class="canvas"></canvas>
		{:else}
			<div class="fallback"></div>
		{/if}
		<div class="vignette"></div>
		{#if status}
			<div class="status">{status}</div>
		{/if}
		<p class="hint">
			Drag to orbit · Scroll to zoom · Click a node · Watch waves navigate the shell
		</p>
	</div>

	<aside class="panel left">
		<header>
			<span class="live-dot"></span>
			Spectral model
		</header>
		{#each bandOrder as id (id)}
			{@const meta = BAND_META[id]}
			{@const val = bands[id]}
			<div class="band" class:target={id === 'alpha'} class:hot={id === 'beta'}>
				<div class="band-top">
					<span class="name" style:color={meta.color}>{meta.label}</span>
					<span class="hz">{meta.hz}</span>
					<span class="pct">{val}%</span>
				</div>
				<div class="bar">
					<div class="fill" style:width="{val}%" style:background={meta.color}></div>
				</div>
				<p class="proto">{meta.protocol}</p>
			</div>
		{/each}
	</aside>

	<aside class="panel right">
		<header>Protocol phase</header>
		<div class="modes">
			<span class:on={mode === 'baseline'}>Baseline</span>
			<span class:on={mode === 'core'}>CORE α</span>
			<span class:on={mode === 'live'}>Live trade</span>
		</div>
		<p class="mode-copy">
			{#if mode === 'baseline'}
				Eyes-open / eyes-closed snapshot. Establish individual α peak before intervention.
			{:else if mode === 'core'}
				Pre-market CORE ALPHA: binaural session targeting {ALPHA_HZ.min}–{ALPHA_HZ.max} Hz calm focus
				before the open.
			{:else}
				Live session: Muse on, Mind Monitor recording — catch α→β transitions at decision points.
			{/if}
		</p>

		<header class="mt">Network focus</header>
		{#if focusRegion}
			<div class="focus-card" style:--c={focusRegion.color}>
				<strong>{focusRegion.name}</strong>
				<p>{focusRegion.role}</p>
				<span class="chip">{BAND_META[focusRegion.band].label}</span>
			</div>
		{:else}
			<p class="idle">Select a cortical node to inspect function × trading relevance.</p>
		{/if}

		<header class="mt">Signal path</header>
		<ol class="path">
			<li>Visual (occipital) ← chart</li>
			<li>Parietal α — calm attention</li>
			<li>DLPFC — plan / inhibit</li>
			<li>Motor — execute 1 contract</li>
		</ol>
	</aside>
</div>

<style>
	.lab {
		position: absolute;
		inset: 0;
		display: grid;
		grid-template-columns: minmax(0, 200px) 1fr minmax(0, 220px);
		pointer-events: none;
	}

	.viewport {
		position: relative;
		grid-column: 1 / -1;
		grid-row: 1;
		min-height: 100%;
	}

	.canvas {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		display: block;
		pointer-events: auto;
		cursor: grab;
		touch-action: none;
	}

	.canvas:active {
		cursor: grabbing;
	}

	.vignette {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background:
			radial-gradient(ellipse 55% 50% at 50% 42%, transparent 15%, rgba(7, 7, 8, 0.4) 100%),
			linear-gradient(
				180deg,
				rgba(7, 7, 8, 0.2) 0%,
				transparent 18%,
				transparent 58%,
				rgba(7, 7, 8, 0.9) 100%
			);
	}

	.status,
	.hint {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		pointer-events: none;
		z-index: 2;
	}

	.status {
		top: 42%;
		font-size: 0.72rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--alpha-faint);
	}

	.hint {
		bottom: 0.65rem;
		font-size: 0.58rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--alpha-faint);
		opacity: 0.9;
		text-align: center;
		max-width: 90vw;
	}

	.panel {
		position: relative;
		z-index: 3;
		grid-row: 1;
		align-self: center;
		margin: 0 0.65rem;
		padding: 0.85rem 0.75rem;
		border-radius: 14px;
		border: 1px solid rgba(46, 46, 53, 0.95);
		background: rgba(10, 12, 16, 0.82);
		backdrop-filter: blur(14px);
		pointer-events: auto;
		max-height: min(70vh, 420px);
		overflow: auto;
	}

	.panel.left {
		grid-column: 1;
	}
	.panel.right {
		grid-column: 3;
	}

	header {
		font-size: 0.62rem;
		font-weight: 700;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--alpha-blue);
		margin: 0 0 0.65rem;
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}
	header.mt {
		margin-top: 0.9rem;
	}

	.live-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--alpha-blue);
		box-shadow: 0 0 8px var(--alpha-blue);
		animation: pulse 2.8s ease-in-out infinite;
	}

	.band {
		margin-bottom: 0.55rem;
		padding: 0.35rem 0.4rem;
		border-radius: 8px;
		border: 1px solid transparent;
	}
	.band.target {
		border-color: rgba(59, 139, 235, 0.35);
		background: rgba(59, 139, 235, 0.06);
	}
	.band.hot {
		border-color: rgba(184, 32, 32, 0.25);
	}
	.band-top {
		display: flex;
		align-items: baseline;
		gap: 0.35rem;
		margin-bottom: 0.2rem;
	}
	.name {
		font-size: 0.72rem;
		font-weight: 700;
	}
	.hz {
		font-size: 0.58rem;
		color: var(--alpha-faint);
		flex: 1;
	}
	.pct {
		font-size: 0.72rem;
		font-variant-numeric: tabular-nums;
		font-weight: 600;
	}
	.bar {
		height: 4px;
		border-radius: 2px;
		background: rgba(36, 36, 41, 0.9);
		overflow: hidden;
	}
	.fill {
		height: 100%;
		border-radius: 2px;
	}
	.proto {
		margin: 0.2rem 0 0;
		font-size: 0.58rem;
		color: var(--alpha-faint);
		line-height: 1.35;
	}

	.modes {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
		margin-bottom: 0.55rem;
	}
	.modes span {
		font-size: 0.6rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		padding: 0.3rem 0.45rem;
		border-radius: 999px;
		border: 1px solid var(--alpha-border);
		color: var(--alpha-faint);
	}
	.modes span.on {
		color: var(--alpha-text);
		border-color: rgba(59, 139, 235, 0.45);
		background: rgba(59, 139, 235, 0.12);
	}
	.mode-copy,
	.idle {
		margin: 0;
		font-size: 0.72rem;
		color: var(--alpha-muted);
		line-height: 1.5;
	}
	.focus-card {
		padding: 0.55rem 0.6rem;
		border-radius: 10px;
		border: 1px solid color-mix(in srgb, var(--c) 40%, var(--alpha-border));
		background: color-mix(in srgb, var(--c) 10%, transparent);
	}
	.focus-card strong {
		display: block;
		font-size: 0.88rem;
		margin-bottom: 0.25rem;
	}
	.focus-card p {
		margin: 0 0 0.4rem;
		font-size: 0.72rem;
		color: var(--alpha-muted);
		line-height: 1.4;
	}
	.chip {
		display: inline-block;
		font-size: 0.58rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--c);
	}
	.path {
		margin: 0;
		padding-left: 1.1rem;
		font-size: 0.7rem;
		color: var(--alpha-muted);
		line-height: 1.65;
	}
	.fallback {
		position: absolute;
		inset: 18% 28% 28%;
		border-radius: 45%;
		background: radial-gradient(ellipse at 50% 40%, rgba(255, 255, 255, 0.12), transparent 70%);
	}
	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.35;
		}
	}
	@media (max-width: 960px) {
		.lab {
			grid-template-columns: 1fr;
		}
		.panel {
			display: none;
		}
	}
</style>
