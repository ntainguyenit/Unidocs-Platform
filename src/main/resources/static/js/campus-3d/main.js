// Main entry point initializing adaptive Three.js WebGLRenderer, batched GLB loading, pre-warmed flycam intro, and smooth render loop
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { setupCampusEnvironment, applyCampusMaterialEnhancements } from './materials-env.js';
import { setupPlayerAndCamera } from './player-controls.js';
import { setupCampusHud } from './hud-ui.js';

const STORAGE_KEY = 'unidocs_husc_campus_3d_v1';

// Read user-overridden graphics preset safely before initializing WebGL context
function readManualQualityOverride() {
    const validTiers = new Set(['low', 'medium', 'high']);
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { qualityManual: false, quality: null };
        const parsed = JSON.parse(raw);
        if (parsed && parsed.qualityManual && validTiers.has(parsed.quality)) {
            return { qualityManual: true, quality: parsed.quality };
        }
    } catch (_) {
        // Ignore malformed localStorage state
    }
    return { qualityManual: false, quality: null };
}

// Probe WebGL renderer string, CPU cores, device RAM, and pointer form-factor before constructing Three.js renderer
function detectHardwareProfile() {
    let rendererStr = '';
    try {
        const probeCanvas = document.createElement('canvas');
        probeCanvas.width = 1;
        probeCanvas.height = 1;
        const gl = probeCanvas.getContext('webgl2')
            || probeCanvas.getContext('webgl')
            || probeCanvas.getContext('experimental-webgl');
        if (gl) {
            const dbg = gl.getExtension('WEBGL_debug_renderer_info');
            const unmasked = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : '';
            const std = gl.getParameter(gl.RENDERER) || '';
            rendererStr = `${unmasked} ${std}`.toLowerCase();
            gl.getExtension('WEBGL_lose_context')?.loseContext();
        }
    } catch (_) {
        // Ignore restricted probe failures
    }

    const isSoftware = /swiftshader|llvmpipe|softpipe|microsoft basic|virgl|software|mesa offscreen|warp/i.test(rendererStr);
    const isLegacyGpu = /mali-[4gt]|mali-g3|mali-g5[0-2]|adreno\s*\(tm\)\s*[1-5]\d\d|powervr|intel\(r\)\s*(hd|gma)|geforce\s*[1-7]\d0|radeon\s*(hd\s*[2-7]|r[35])/i.test(rendererStr);
    const cores = navigator.hardwareConcurrency || 4;
    const mem = navigator.deviceMemory || 8;
    const isCoarsePointer = Boolean(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);

    let tier = 'high';
    if (isSoftware || isLegacyGpu || cores <= 2 || mem <= 2) {
        tier = 'low';
    } else if (isCoarsePointer || cores <= 4 || mem <= 4) {
        tier = 'medium';
    }

    const maxAnisotropy = tier === 'low' ? 1 : (tier === 'medium' ? 2 : 8);
    return { tier, isSoftware, maxAnisotropy, rendererStr };
}

// Unpack quantized/interleaved Meshopt GLB buffers into Float32 attributes and merge by material (~24 draw calls)
function batchStaticCampusModel(campusModel) {
    campusModel.updateMatrixWorld(true);
    const buckets = new Map();
    const removableGeoms = [];
    const tmpPos = new THREE.Vector3();
    const tmpNorm = new THREE.Vector3();
    const normalMat = new THREE.Matrix3();

    campusModel.traverse((obj) => {
        if (!obj.isMesh || !obj.geometry || !obj.material) return;
        const mat = Array.isArray(obj.material) ? obj.material[0] : obj.material;
        const src = obj.geometry;
        const posAttr = src.attributes?.position;
        if (!mat || !posAttr) return;

        const needsUv = Boolean(
            mat.name === 'GateCeramicTile'
            || mat.map || mat.bumpMap || mat.normalMap || mat.emissiveMap
            || mat.alphaMap || mat.roughnessMap || mat.metalnessMap || mat.aoMap
        );
        const normAttr = src.attributes.normal;
        const uvAttr = needsUv ? src.attributes.uv : null;
        const idxAttr = src.index;
        const vertCount = idxAttr ? idxAttr.count : posAttr.count;
        if (vertCount <= 0) return;

        removableGeoms.push(src);

        const posArr = new Float32Array(vertCount * 3);
        const normArr = new Float32Array(vertCount * 3);
        const uvArr = needsUv ? new Float32Array(vertCount * 2) : null;
        normalMat.getNormalMatrix(obj.matrixWorld);

        for (let k = 0; k < vertCount; k++) {
            const vi = idxAttr ? idxAttr.getX(k) : k;
            tmpPos.set(posAttr.getX(vi), posAttr.getY(vi), posAttr.getZ(vi)).applyMatrix4(obj.matrixWorld);
            posArr[k * 3] = tmpPos.x;
            posArr[k * 3 + 1] = tmpPos.y;
            posArr[k * 3 + 2] = tmpPos.z;

            if (normAttr) {
                tmpNorm.set(normAttr.getX(vi), normAttr.getY(vi), normAttr.getZ(vi)).applyMatrix3(normalMat);
                const nLenSq = tmpNorm.lengthSq();
                if (nLenSq > 1e-8) tmpNorm.multiplyScalar(1 / Math.sqrt(nLenSq));
                else tmpNorm.set(0, 1, 0);
                normArr[k * 3] = tmpNorm.x;
                normArr[k * 3 + 1] = tmpNorm.y;
                normArr[k * 3 + 2] = tmpNorm.z;
            } else {
                normArr[k * 3 + 1] = 1;
            }

            if (uvArr && uvAttr) {
                uvArr[k * 2] = uvAttr.getX(vi);
                uvArr[k * 2 + 1] = uvAttr.getY(vi);
            }
        }

        const unpacked = new THREE.BufferGeometry();
        unpacked.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
        unpacked.setAttribute('normal', new THREE.BufferAttribute(normArr, 3));
        if (uvArr) unpacked.setAttribute('uv', new THREE.BufferAttribute(uvArr, 2));

        const key = `${mat.uuid}|${uvArr ? '1' : '0'}`;
        let bucket = buckets.get(key);
        if (!bucket) {
            bucket = { material: mat, geoms: [] };
            buckets.set(key, bucket);
        }
        bucket.geoms.push(unpacked);
    });

    for (const oldGeom of removableGeoms) {
        oldGeom.dispose();
    }

    const batchedGroup = new THREE.Group();
    batchedGroup.name = 'HuscCampusBatched';
    for (const bucket of buckets.values()) {
        if (bucket.geoms.length === 0) continue;
        const mat = bucket.material;
        const isReflectiveGlass = (mat.metalness || 0) > 0.6 && (mat.roughness || 1) < 0.25;
        const merged = mergeGeometries(bucket.geoms, false);
        if (merged) {
            for (const part of bucket.geoms) part.dispose();
            merged.computeBoundingBox();
            merged.computeBoundingSphere();
            const mesh = new THREE.Mesh(merged, mat);
            mesh.castShadow = !isReflectiveGlass;
            mesh.receiveShadow = true;
            mesh.matrixAutoUpdate = false;
            mesh.updateMatrix();
            batchedGroup.add(mesh);
        } else {
            // Keep unmerged part meshes rather than ever dropping geometry
            for (const part of bucket.geoms) {
                part.computeBoundingBox();
                part.computeBoundingSphere();
                const mesh = new THREE.Mesh(part, mat);
                mesh.castShadow = !isReflectiveGlass;
                mesh.receiveShadow = true;
                mesh.matrixAutoUpdate = false;
                mesh.updateMatrix();
                batchedGroup.add(mesh);
            }
        }
    }
    return batchedGroup.children.length > 0 ? batchedGroup : campusModel;
}

async function bootstrapCampus3D() {
    const canvas = document.getElementById('campusCanvas');
    const loadingScreen = document.getElementById('loadingScreen');
    const loadingProgressBar = document.getElementById('loadingProgressBar');
    const loadingProgressText = document.getElementById('loadingProgressText');

    const hardwareProfile = detectHardwareProfile();
    const { qualityManual, quality: manualQuality } = readManualQualityOverride();
    let effectiveTier = qualityManual ? manualQuality : hardwareProfile.tier;
    const activeProfile = { ...hardwareProfile, tier: effectiveTier, defaultTier: hardwareProfile.tier };

    // Initialize WebGLRenderer with hardware-appropriate AA and high-performance power hint
    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: effectiveTier === 'high',
            powerPreference: 'high-performance',
            preserveDrawingBuffer: false
        });
    } catch (err) {
        if (loadingProgressText) {
            loadingProgressText.textContent = 'Trình duyệt hoặc thiết bị chưa hỗ trợ WebGL 3D. Vui lòng bật tăng tốc phần cứng.';
        }
        return;
    }

    const capMaxAniso = renderer.capabilities?.getMaxAnisotropy ? renderer.capabilities.getMaxAnisotropy() : 4;
    activeProfile.maxAnisotropy = Math.max(1, Math.min(activeProfile.maxAnisotropy, capMaxAniso));

    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.2, 650);

    // Resize listener adapting canvas aspect ratio across desktop resize and mobile rotation
    const handleResize = () => {
        const w = canvas.clientWidth || window.innerWidth;
        const h = canvas.clientHeight || window.innerHeight;
        camera.aspect = w / Math.max(1, h);
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
    };
    window.addEventListener('resize', handleResize);

    // Setup daylight, adaptive shadow maps, sky, gardens, signage, traffic, and instanced foliage
    const envController = setupCampusEnvironment(scene, renderer, activeProfile);

    // Runtime adaptive FPS governor state preventing hitches on constrained GPUs
    let govStage = 0;
    let avgFrameMs = 16.7;
    let govCooldownUntil = performance.now() + 2600;
    let isManualLocked = qualityManual;

    // Late-bound HUD reference for keyboard shortcut callbacks
    let hudController = null;
    const playerController = setupPlayerAndCamera(scene, camera, canvas, {
        onIntroComplete: () => {
            govCooldownUntil = performance.now() + 2600;
            avgFrameMs = 16.7;
            if (hudController) {
                hudController.syncIntroVisibility(false);
                setTimeout(() => {
                    if (!playerController.getState().introPlaying) {
                        hudController.showToast('Chào mừng đến ĐHKH Huế 3D! Đang ở Góc nhìn toàn cảnh', 'info');
                    }
                }, 180);
            }
        },
        onInteract: () => hudController && hudController.executeContextAction(),
        onSnapshot: () => hudController && hudController.triggerSnapshot(),
        onToggleCamera: () => hudController && hudController.toggleCameraMode(),
        onIntroSceneChange: (title) => hudController && hudController.setIntroSubTitle(title),
        onCinematicDip: (cb) => hudController && hudController.triggerCinematicDip(cb),
        onClearCinematicDip: () => hudController && hudController.clearCinematicDip()
    });

    // Synchronous on-demand snapshot capture keeping preserveDrawingBuffer=false
    const captureFrameDataUrl = () => {
        renderer.render(scene, camera);
        return canvas.toDataURL('image/png');
    };

    hudController = setupCampusHud({
        playerController,
        envController,
        hardwareProfile: activeProfile,
        onCaptureFrame: captureFrameDataUrl,
        onManualQualityChange: (nextTier) => {
            isManualLocked = true;
            effectiveTier = nextTier;
            govStage = 0;
            avgFrameMs = 16.7;
            govCooldownUntil = performance.now() + 5000;
        },
        onResetQualityToAuto: (defaultTier) => {
            isManualLocked = false;
            effectiveTier = defaultTier;
            govStage = 0;
            avgFrameMs = 16.7;
            govCooldownUntil = performance.now() + 2600;
        }
    });

    // Animation loop initialized ONLY after GLB batching, shader compile, and silent warm-up finish
    let loopStarted = false;
    let lastFrameMs = performance.now();
    let elapsedSec = 0;

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            lastFrameMs = performance.now();
        }
    });

    const stepGovernor = (rawMs, nowMs) => {
        if (playerController.getState().introPlaying) return;
        if (rawMs < 200) {
            avgFrameMs = avgFrameMs * 0.9 + rawMs * 0.1;
        }
        if (isManualLocked || nowMs < govCooldownUntil || govStage >= 3) return;

        const w = canvas.clientWidth || window.innerWidth;
        const h = canvas.clientHeight || window.innerHeight;
        if (govStage === 0 && avgFrameMs > 36) {
            govStage = 1;
            renderer.setPixelRatio(Math.min(renderer.getPixelRatio(), 1.0));
            renderer.setSize(w, h, false);
            envController.setShadowCadence(4, false);
            govCooldownUntil = nowMs + 2800;
        } else if (govStage === 1 && avgFrameMs > 42) {
            govStage = 2;
            renderer.setPixelRatio(Math.min(renderer.getPixelRatio(), 0.85));
            renderer.setSize(w, h, false);
            envController.setShadowCadence(8, false);
            govCooldownUntil = nowMs + 2800;
        } else if (govStage === 2 && avgFrameMs > 48) {
            govStage = 3;
            renderer.setPixelRatio(Math.min(renderer.getPixelRatio(), 0.75));
            renderer.setSize(w, h, false);
            envController.setShadowCadence(0, true);
            govCooldownUntil = nowMs + 5000;
        }
    };

    const startAnimationLoop = () => {
        if (loopStarted) return;
        loopStarted = true;
        lastFrameMs = performance.now();
        govCooldownUntil = lastFrameMs + 2500;
        const animate = () => {
            requestAnimationFrame(animate);
            const nowMs = performance.now();
            const rawMs = nowMs - lastFrameMs;
            const rawDt = rawMs * 0.001;
            const dt = Number.isFinite(rawDt) ? Math.max(0.0001, Math.min(0.25, rawDt)) : 0.016;
            lastFrameMs = nowMs;
            elapsedSec += dt;

            stepGovernor(rawMs, nowMs);
            playerController.update(dt);
            envController.updateEnvironment(elapsedSec, dt, playerController.getState());
            hudController.updateFrame(dt);
            renderer.render(scene, camera);
        };
        animate();
    };

    // Load Meshopt-compressed HUSC architecture GLB model and pre-warm pipeline before starting Intro
    await MeshoptDecoder.ready;
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);

    const nextAnimationFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

    loader.load(
        '/models/husc-campus.glb',
        async (gltf) => {
            if (loadingProgressBar) loadingProgressBar.style.width = '92%';
            if (loadingProgressText) loadingProgressText.textContent = 'Đang tối ưu hình học ĐHKH Huế 3D...';

            applyCampusMaterialEnhancements(gltf.scene, activeProfile.maxAnisotropy);
            const batchedCampus = batchStaticCampusModel(gltf.scene);
            scene.add(batchedCampus);

            if (loadingProgressBar) loadingProgressBar.style.width = '96%';
            if (loadingProgressText) loadingProgressText.textContent = 'Đang khởi tạo đồ họa WebGL...';

            // Pre-compile all active shaders and upload every VBO/texture without aspect-ratio frustum gaps
            const warmupPipelineBehindCurtain = async () => {
                const culledRestore = [];
                scene.traverse((obj) => {
                    if (obj.isMesh && obj.frustumCulled) {
                        culledRestore.push(obj);
                        obj.frustumCulled = false;
                    }
                });
                envController.requestShadowRefresh();
                if (typeof renderer.compileAsync === 'function') {
                    await renderer.compileAsync(scene, camera);
                } else {
                    renderer.compile(scene, camera);
                }
                playerController.sampleIntroPose(0);
                renderer.render(scene, camera);
                playerController.sampleIntroPose(0.5);
                renderer.render(scene, camera);
                playerController.sampleIntroPose(1.0);
                renderer.render(scene, camera);
                camera.position.set(-10, 88, 128);
                camera.lookAt(-12, 4, -5);
                renderer.render(scene, camera);
                camera.position.set(-12.5, 2.2, 82.0);
                camera.lookAt(-12.5, 1.2, 78.8);
                renderer.render(scene, camera);
                for (const obj of culledRestore) {
                    obj.frustumCulled = true;
                }
                playerController.prepareIntroStartFrame();
                renderer.render(scene, camera);
                await nextAnimationFrame();
            };

            // Measure consecutive rAF-aligned render intervals behind curtain without single-VSync bias
            const measureRafCadence = () => new Promise((resolve) => {
                const gaps = [];
                const cpuTimes = [];
                let prevTs = 0;
                let count = 0;
                const tick = (ts) => {
                    if (prevTs > 0) gaps.push(ts - prevTs);
                    prevTs = ts;
                    const t0 = performance.now();
                    envController.requestShadowRefresh();
                    renderer.render(scene, camera);
                    cpuTimes.push(performance.now() - t0);
                    count += 1;
                    if (count < 4) {
                        requestAnimationFrame(tick);
                    } else {
                        const sGap = [...gaps].sort((a, b) => a - b);
                        const sCpu = [...cpuTimes].sort((a, b) => a - b);
                        resolve({
                            medGapMs: sGap[Math.floor(sGap.length * 0.5)] || 16.7,
                            medCpuMs: sCpu[Math.floor(sCpu.length * 0.5)] || 4.0
                        });
                    }
                };
                requestAnimationFrame(tick);
            });

            await warmupPipelineBehindCurtain();
            const { medGapMs, medCpuMs } = await measureRafCadence();

            // Finalize adaptive GPU tier & fillrate before compiling final active shadow/shader variants
            if (!isManualLocked) {
                let calibratedTier = effectiveTier;
                if (medGapMs > 44 || medCpuMs > 30) {
                    calibratedTier = 'low';
                } else if ((medGapMs > 28 || medCpuMs > 20) && effectiveTier === 'high') {
                    calibratedTier = 'medium';
                }
                let needRewarm = false;
                if (calibratedTier !== effectiveTier) {
                    effectiveTier = calibratedTier;
                    envController.setQualityLevel(calibratedTier, true);
                    hudController.setCalibratedQuality(calibratedTier);
                    needRewarm = true;
                }
                if (effectiveTier === 'low' && (activeProfile.isSoftware || medGapMs > 44 || medCpuMs > 30)) {
                    const w = canvas.clientWidth || window.innerWidth;
                    const h = canvas.clientHeight || window.innerHeight;
                    const isLargeViewport = w * h > 850000;
                    const ultraLowPr = activeProfile.isSoftware
                        ? (isLargeViewport ? 0.65 : 0.85)
                        : (isLargeViewport ? 0.78 : 0.88);
                    renderer.setPixelRatio(Math.min(renderer.getPixelRatio(), ultraLowPr));
                    renderer.setSize(w, h, false);
                    envController.setShadowCadence(0, true);
                    govStage = 3;
                    needRewarm = true;
                }
                if (needRewarm) {
                    await warmupPipelineBehindCurtain();
                }
            }

            if (loadingProgressBar) loadingProgressBar.style.width = '100%';
            if (loadingProgressText) loadingProgressText.textContent = '100% · Sẵn sàng khám phá!';
            await nextAnimationFrame();
            await nextAnimationFrame();

            // Launch Flycam Intro cleanly at steady frame pace and dissolve curtain seamlessly
            hudController.syncIntroVisibility(true);
            playerController.startIntroFlycam();
            startAnimationLoop();

            requestAnimationFrame(() => {
                loadingScreen.classList.add('is-faded');
                const hideCurtain = () => { loadingScreen.hidden = true; };
                loadingScreen.addEventListener('transitionend', hideCurtain, { once: true });
                setTimeout(hideCurtain, 280);
            });
        },
        (evt) => {
            if (evt.total > 0) {
                const pct = Math.min(90, Math.round((evt.loaded / evt.total) * 90));
                if (loadingProgressBar) loadingProgressBar.style.width = `${pct}%`;
                if (loadingProgressText) loadingProgressText.textContent = `Đang tải mô hình ĐHKH Huế 3D... ${pct}%`;
            }
        },
        (error) => {
            console.error('Failed to load HUSC 3D GLB model:', error);
            if (loadingProgressText) {
                loadingProgressText.textContent = 'Không thể tải mô hình 3D. Vui lòng tải lại trang.';
            }
        }
    );
}

bootstrapCampus3D();
