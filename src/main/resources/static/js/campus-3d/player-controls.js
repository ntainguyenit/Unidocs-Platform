// Third-person explorer avatar, OBB sliding collision, cinematic flycam intro, and dual camera controller
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CAMPUS_START_POSE, CAMPUS_COLLIDERS, CAMPUS_BOUNDS_POLY } from './world-data.js';
import { createHuscStudentAvatar } from './student-avatar.js';

// Point-in-polygon parity test inside XZ campus perimeter
function pointInPolygon(px, pz, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const xi = poly[i][0];
        const zi = poly[i][1];
        const xj = poly[j][0];
        const zj = poly[j][1];
        const intersect = ((zi > pz) !== (zj > pz)) && (px < ((xj - xi) * (pz - zi)) / (zj - zi + 1e-9) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

// Project point smoothly onto closest polygon boundary segment if outside perimeter
function clampToPolygon(px, pz, poly) {
    if (pointInPolygon(px, pz, poly)) return { x: px, z: pz };
    let bestDistSq = Infinity;
    let bestX = px;
    let bestZ = pz;
    for (let i = 0; i < poly.length; i++) {
        const ax = poly[i][0];
        const az = poly[i][1];
        const bx = poly[(i + 1) % poly.length][0];
        const bz = poly[(i + 1) % poly.length][1];
        const abx = bx - ax;
        const abz = bz - az;
        const lenSq = abx * abx + abz * abz || 1;
        const t = Math.max(0, Math.min(1, ((px - ax) * abx + (pz - az) * abz) / lenSq));
        const cx = ax + t * abx;
        const cz = az + t * abz;
        const dSq = (px - cx) * (px - cx) + (pz - cz) * (pz - cz);
        if (dSq < bestDistSq) {
            bestDistSq = dSq;
            bestX = cx;
            bestZ = cz;
        }
    }
    return { x: bestX, z: bestZ };
}

// Resolve circle vs oriented bounding box (OBB) collision in XZ plane with multi-pass sliding
function resolveOBBCollisions(pos, radius) {
    for (let iter = 0; iter < 3; iter++) {
        let collided = false;
        let x = pos.x;
        let z = pos.z;

        for (const c of CAMPUS_COLLIDERS) {
            const cos = Math.cos(c.angle);
            const sin = Math.sin(c.angle);
            const dx = x - c.cx;
            const dz = z - c.cz;

            // World -> Collider local space inverse Y-rotation
            const lx = dx * cos - dz * sin;
            const lz = dx * sin + dz * cos;

            const clampedX = Math.max(-c.halfW, Math.min(c.halfW, lx));
            const clampedZ = Math.max(-c.halfD, Math.min(c.halfD, lz));
            const offX = lx - clampedX;
            const offZ = lz - clampedZ;
            const distSq = offX * offX + offZ * offZ;

            if (distSq < radius * radius) {
                collided = true;
                let pushLx = lx;
                let pushLz = lz;
                if (distSq > 1e-6) {
                    const dist = Math.sqrt(distSq);
                    const overlap = radius - dist;
                    pushLx += (offX / dist) * overlap;
                    pushLz += (offZ / dist) * overlap;
                } else {
                    // Player center inside box: push out toward shallowest edge
                    const penX = c.halfW - Math.abs(lx);
                    const penZ = c.halfD - Math.abs(lz);
                    if (penX < penZ) {
                        pushLx = (lx >= 0 ? 1 : -1) * (c.halfW + radius);
                    } else {
                        pushLz = (lz >= 0 ? 1 : -1) * (c.halfD + radius);
                    }
                }
                // Local -> World space Y-rotation
                x = c.cx + pushLx * cos + pushLz * sin;
                z = c.cz - pushLx * sin + pushLz * cos;
            }
        }

        const clampedPoly = clampToPolygon(x, z, CAMPUS_BOUNDS_POLY);
        pos.x = clampedPoly.x;
        pos.z = clampedPoly.z;
        if (!collided) break;
    }
}

// Clamp camera segment from lookTarget so it never sits inside solid walls
function clampCameraAgainstWalls(targetPos, desiredCamPos) {
    const dir = new THREE.Vector3().subVectors(desiredCamPos, targetPos);
    const totalLen = dir.length();
    if (totalLen < 0.1) return desiredCamPos;
    dir.normalize();

    let minT = 1.0;
    const sample = new THREE.Vector3();
    for (let s = 1; s <= 10; s++) {
        const t = s / 10;
        sample.copy(targetPos).addScaledVector(dir, totalLen * t);
        if (sample.y > 14.5) continue;
        for (const c of CAMPUS_COLLIDERS) {
            if (c.id.startsWith('col_fence') || c.id.startsWith('col_garden')) continue;
            const cos = Math.cos(c.angle);
            const sin = Math.sin(c.angle);
            const dx = sample.x - c.cx;
            const dz = sample.z - c.cz;
            const lx = dx * cos - dz * sin;
            const lz = dx * sin + dz * cos;
            if (Math.abs(lx) < c.halfW && Math.abs(lz) < c.halfD) {
                minT = Math.min(minT, Math.max(0.25, t - 0.1));
                break;
            }
        }
    }
    return new THREE.Vector3().copy(targetPos).addScaledVector(dir, totalLen * minT);
}

// Create avatar controller, intro flycam spline, keyboard/pointer inputs, and camera switcher
export function setupPlayerAndCamera(scene, camera, domElement, onCallbacks = {}) {
    const avatar = createHuscStudentAvatar();
    avatar.root.position.set(CAMPUS_START_POSE.x, 0, CAMPUS_START_POSE.z);
    avatar.root.rotation.y = CAMPUS_START_POSE.yaw;
    scene.add(avatar.root);

    const orbitControls = new OrbitControls(camera, domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.08;
    orbitControls.screenSpacePanning = false;
    orbitControls.maxPolarAngle = Math.PI * 0.46;
    orbitControls.minPolarAngle = 0.15;
    orbitControls.minDistance = 14;
    orbitControls.maxDistance = 235;
    orbitControls.enabled = false;

    const state = {
        cameraMode: 'fly',
        camYaw: CAMPUS_START_POSE.yaw || 0,
        camPitch: 0.20,
        camDist: 9.2,
        sprintToggle: false,
        walkCycle: 0,
        idleTime: 0,
        moveBlend: 0,
        introPlaying: false,
        introTime: 0,
        introDuration: 17.8
    };

    const EXPLORER_LOOK_Y = 2.15;
    const keys = { w: false, a: false, s: false, d: false };
    const joyVector = { x: 0, y: 0 };

    // Precomputed cinematic multi-shot flycam splines with overhead zoom down, ground zoom up, 360 orbit, and gate landing
    const endHoriz = Math.cos(state.camPitch) * state.camDist;
    const endVert = Math.sin(state.camPitch) * state.camDist + 0.35;
    const endCamX = CAMPUS_START_POSE.x + Math.sin(state.camYaw) * endHoriz;
    const endCamY = EXPLORER_LOOK_Y + endVert;
    const endCamZ = CAMPUS_START_POSE.z + Math.cos(state.camYaw) * endHoriz;

    // Multi-shot cinematic scenes showcasing all 3 surrounding streets and central campus with film cuts
    const INTRO_SHOTS = [
        {
            title: 'TUYẾN 1: ĐƯỜNG NGUYỄN HUỆ · CỔNG CHÍNH 77 NGUYỄN HUỆ',
            duration: 4.2,
            camCurve: new THREE.CatmullRomCurve3([
                new THREE.Vector3(-62, 14.0, 106),
                new THREE.Vector3(-32, 11.5, 99),
                new THREE.Vector3(2, 9.8, 95),
                new THREE.Vector3(34, 8.8, 93)
            ], false, 'centripetal', 0.5),
            lookCurve: new THREE.CatmullRomCurve3([
                new THREE.Vector3(-22, 6.0, 78),
                new THREE.Vector3(-13, 6.5, 76),
                new THREE.Vector3(-8, 6.0, 74),
                new THREE.Vector3(6, 5.5, 72)
            ], false, 'centripetal', 0.5)
        },
        {
            title: 'TUYẾN 2: ĐƯỜNG LÝ THƯỜNG KIỆT · SÂN BÓNG ĐÁ & KHU TÂY',
            duration: 4.0,
            camCurve: new THREE.CatmullRomCurve3([
                new THREE.Vector3(-132, 18.0, 96),
                new THREE.Vector3(-128, 15.0, 52),
                new THREE.Vector3(-124, 13.0, 10),
                new THREE.Vector3(-120, 11.5, -28)
            ], false, 'centripetal', 0.5),
            lookCurve: new THREE.CatmullRomCurve3([
                new THREE.Vector3(-78, 6.5, 45),
                new THREE.Vector3(-72, 7.0, 25),
                new THREE.Vector3(-65, 8.0, 5),
                new THREE.Vector3(-55, 9.0, -15)
            ], false, 'centripetal', 0.5)
        },
        {
            title: 'TUYẾN 3: ĐƯỜNG ĐỐNG ĐA · CỔNG 38 ĐỐNG ĐA & KHU NỘI VIỆN',
            duration: 4.0,
            camCurve: new THREE.CatmullRomCurve3([
                new THREE.Vector3(-68, 16.0, -104),
                new THREE.Vector3(-32, 13.5, -96),
                new THREE.Vector3(8, 11.5, -88),
                new THREE.Vector3(48, 10.0, -80)
            ], false, 'centripetal', 0.5),
            lookCurve: new THREE.CatmullRomCurve3([
                new THREE.Vector3(-32, 6.0, -66),
                new THREE.Vector3(-12, 6.5, -60),
                new THREE.Vector3(12, 5.5, -55),
                new THREE.Vector3(32, 4.8, -50)
            ], false, 'centripetal', 0.5)
        },
        {
            title: 'TOÀ NHÀ TRUNG TÂM · QUAY 360° & BẮT ĐẦU',
            duration: 5.6,
            camCurve: new THREE.CatmullRomCurve3([
                new THREE.Vector3(32, 28.0, 36),
                new THREE.Vector3(-13, 32.0, -28),
                new THREE.Vector3(-52, 26.0, 8),
                new THREE.Vector3(-28, 18.0, 48),
                new THREE.Vector3(-13, 11.5, 104),
                new THREE.Vector3(-12.8, 5.5, 94),
                new THREE.Vector3(endCamX, endCamY, endCamZ)
            ], false, 'centripetal', 0.5),
            lookCurve: new THREE.CatmullRomCurve3([
                new THREE.Vector3(-13, 11.0, 10),
                new THREE.Vector3(-13, 11.0, 10),
                new THREE.Vector3(-13, 11.0, 10),
                new THREE.Vector3(-13, 9.0, 24),
                new THREE.Vector3(-12.5, 3.8, 76),
                new THREE.Vector3(-12.5, 2.0, 82),
                new THREE.Vector3(CAMPUS_START_POSE.x, EXPLORER_LOOK_Y, CAMPUS_START_POSE.z)
            ], false, 'centripetal', 0.5)
        }
    ];

    let currentShotIndex = 0;
    let currentShotTime = 0;
    let isDipTransitioning = false;
    let currentSceneTitle = INTRO_SHOTS[0].title;

    const _introPos = new THREE.Vector3();
    const _introLook = new THREE.Vector3();

    // Precompute CatmullRom arc-length lookup tables during startup so Frame 1 never hitches
    INTRO_SHOTS[0].camCurve.getPointAt(0, _introPos);
    INTRO_SHOTS[0].lookCurve.getPointAt(0, _introLook);

    // Sample normalized Intro spline waypoint cleanly for behind-curtain GPU pre-warm passes
    const sampleIntroPose = (u) => {
        const clampedU = Math.max(0.0, Math.min(1.0, u));
        const totalShots = INTRO_SHOTS.length;
        const shotSpan = 1.0 / totalShots;
        const sIdx = Math.min(totalShots - 1, Math.floor(clampedU / shotSpan));
        const localU = Math.max(0.0, Math.min(1.0, (clampedU - sIdx * shotSpan) / shotSpan));
        const curShot = INTRO_SHOTS[sIdx];
        curShot.camCurve.getPointAt(localU, _introPos);
        curShot.lookCurve.getPointAt(localU, _introLook);
        camera.position.copy(_introPos);
        camera.lookAt(_introLook);
    };

    // Position camera at exact Intro Frame 0 so shader compilation & warm-up match entry view
    const prepareIntroStartFrame = () => {
        orbitControls.enabled = false;
        currentShotIndex = 0;
        currentShotTime = 0;
        isDipTransitioning = false;
        sampleIntroPose(0);
        currentSceneTitle = INTRO_SHOTS[0].title;
        if (onCallbacks.onIntroSceneChange) {
            onCallbacks.onIntroSceneChange(currentSceneTitle);
        }
    };

    // Place camera cleanly at third-person arrival pose matching update() target height
    const snapCameraToExplorer = () => {
        const horizDist = Math.cos(state.camPitch) * state.camDist;
        const vertDist = Math.sin(state.camPitch) * state.camDist + 0.35;
        camera.position.set(
            avatar.root.position.x + Math.sin(state.camYaw) * horizDist,
            EXPLORER_LOOK_Y + vertDist,
            avatar.root.position.z + Math.cos(state.camYaw) * horizDist
        );
        camera.lookAt(avatar.root.position.x, EXPLORER_LOOK_Y, avatar.root.position.z);
    };

    const startIntroFlycam = () => {
        const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reducedMotion) {
            state.introPlaying = false;
            orbitControls.enabled = false;
            setCameraMode('fly');
            if (onCallbacks.onIntroComplete) onCallbacks.onIntroComplete();
            return;
        }
        state.introPlaying = true;
        state.introTime = 0;
        currentShotIndex = 0;
        currentShotTime = 0;
        isDipTransitioning = false;
        currentSceneTitle = INTRO_SHOTS[0].title;
        orbitControls.enabled = false;
        if (onCallbacks.onClearCinematicDip) {
            onCallbacks.onClearCinematicDip();
        }
        if (onCallbacks.onIntroSceneChange) {
            onCallbacks.onIntroSceneChange(currentSceneTitle);
        }
    };

    const skipIntroFlycam = () => {
        if (!state.introPlaying) return;
        state.introPlaying = false;
        state.introTime = state.introDuration;
        isDipTransitioning = false;
        if (onCallbacks.onClearCinematicDip) {
            onCallbacks.onClearCinematicDip();
        }
        if (state.cameraMode === 'fly') {
            setCameraMode('fly');
        } else if (state.cameraMode === 'first-person') {
            setCameraMode('first-person');
        } else {
            snapCameraToExplorer();
        }
        if (onCallbacks.onIntroComplete) onCallbacks.onIntroComplete();
    };

    // Switch between Third-Person Explorer, First-Person Explorer, and Aerial Orbit Flycam modes
    const setCameraMode = (mode) => {
        if (state.introPlaying) {
            skipIntroFlycam();
        }
        if (mode === 'fly') {
            state.cameraMode = 'fly';
            avatar.root.visible = true;
            orbitControls.target.set(-13, 8, 10);
            camera.position.set(-14, 82, 142);
            orbitControls.enabled = true;
            orbitControls.update();
        } else if (mode === 'first-person') {
            state.cameraMode = 'first-person';
            avatar.root.visible = false;
            orbitControls.enabled = false;
            camera.position.set(avatar.root.position.x, 1.62, avatar.root.position.z);
            const lookDirX = -Math.sin(state.camYaw) * Math.cos(state.camPitch);
            const lookDirY = Math.sin(state.camPitch);
            const lookDirZ = -Math.cos(state.camYaw) * Math.cos(state.camPitch);
            camera.lookAt(avatar.root.position.x + lookDirX, 1.62 + lookDirY, avatar.root.position.z + lookDirZ);
        } else {
            state.cameraMode = 'third-person';
            avatar.root.visible = true;
            orbitControls.enabled = false;
            snapCameraToExplorer();
        }
        return state.cameraMode;
    };

    // Teleport explorer cleanly to target landmark coordinates and face forward
    const snapPlayerTo = (x, z, yaw = 0) => {
        if (state.introPlaying) {
            skipIntroFlycam();
        }
        const pos = { x, z };
        resolveOBBCollisions(pos, 0.48);
        avatar.root.position.set(pos.x, 0, pos.z);
        avatar.root.rotation.y = yaw;
        state.camYaw = yaw;
        if (state.cameraMode === 'fly') {
            orbitControls.target.set(pos.x, 1.5, pos.z);
            orbitControls.update();
        } else if (state.cameraMode === 'first-person') {
            camera.position.set(pos.x, 1.62, pos.z);
            const lookDirX = -Math.sin(state.camYaw) * Math.cos(state.camPitch);
            const lookDirY = Math.sin(state.camPitch);
            const lookDirZ = -Math.cos(state.camYaw) * Math.cos(state.camPitch);
            camera.lookAt(pos.x + lookDirX, 1.62 + lookDirY, pos.z + lookDirZ);
        } else {
            snapCameraToExplorer();
        }
    };

    // Robust key matchers supporting physical layout (e.code), standard keys, and Vietnamese Telex/VNI IME
    const isForward = (e) => e.code === 'KeyW' || e.code === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === 'ư' || e.key === 'Ư' || e.key === 'ArrowUp';
    const isBackward = (e) => e.code === 'KeyS' || e.code === 'ArrowDown' || e.key === 's' || e.key === 'S' || e.key === 'ArrowDown';
    const isLeft = (e) => e.code === 'KeyA' || e.code === 'ArrowLeft' || e.key === 'a' || e.key === 'A' || e.key === 'â' || e.key === 'Â' || e.key === 'ArrowLeft';
    const isRight = (e) => e.code === 'KeyD' || e.code === 'ArrowRight' || e.key === 'd' || e.key === 'D' || e.key === 'đ' || e.key === 'Đ' || e.key === 'ArrowRight';

    // Keyboard listeners for desktop WASD/Arrow movement and shortcuts
    const onKeyDown = (e) => {
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) return;
        if (isForward(e)) keys.w = true;
        if (isBackward(e)) keys.s = true;
        if (isLeft(e)) keys.a = true;
        if (isRight(e)) keys.d = true;

        if (state.introPlaying && (e.code === 'Space' || e.key === 'Escape' || isForward(e) || isBackward(e) || isLeft(e) || isRight(e))) {
            e.preventDefault();
            skipIntroFlycam();
            return;
        }
        const k = e.key ? e.key.toLowerCase() : '';
        if (!state.introPlaying && (k === 'v' || e.code === 'KeyV') && onCallbacks.onToggleCamera) onCallbacks.onToggleCamera();
        if (!state.introPlaying && (k === 'e' || e.code === 'KeyE') && onCallbacks.onInteract) onCallbacks.onInteract();
        if (!state.introPlaying && (k === 'c' || e.code === 'KeyC') && onCallbacks.onSnapshot) onCallbacks.onSnapshot();
    };

    const onKeyUp = (e) => {
        if (isForward(e)) keys.w = false;
        if (isBackward(e)) keys.s = false;
        if (isLeft(e)) keys.a = false;
        if (isRight(e)) keys.d = false;
    };

    const resetMovementKeys = () => {
        keys.w = false;
        keys.s = false;
        keys.a = false;
        keys.d = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', resetMovementKeys);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) resetMovementKeys();
    });

    // Smooth pointer orbit drag on canvas in Third-Person and First-Person modes
    let activePointerId = null;
    let lastPx = 0;
    let lastPy = 0;

    domElement.addEventListener('pointerdown', (e) => {
        if (state.introPlaying || (state.cameraMode !== 'third-person' && state.cameraMode !== 'first-person')) return;
        if (activePointerId !== null) return;
        activePointerId = e.pointerId;
        lastPx = e.clientX;
        lastPy = e.clientY;
        domElement.setPointerCapture(e.pointerId);
    });

    domElement.addEventListener('pointermove', (e) => {
        if (e.pointerId !== activePointerId || (state.cameraMode !== 'third-person' && state.cameraMode !== 'first-person')) return;
        const dx = e.clientX - lastPx;
        const dy = e.clientY - lastPy;
        lastPx = e.clientX;
        lastPy = e.clientY;
        state.camYaw -= dx * 0.0052;
        const pitchDelta = state.cameraMode === 'first-person' ? -dy * 0.0042 : dy * 0.0042;
        const minPitch = state.cameraMode === 'first-person' ? -1.15 : -0.38;
        const maxPitch = state.cameraMode === 'first-person' ? 1.15 : 1.12;
        state.camPitch = Math.max(minPitch, Math.min(maxPitch, state.camPitch + pitchDelta));
    });

    const releasePointer = (e) => {
        if (e.pointerId === activePointerId) {
            activePointerId = null;
        }
    };
    domElement.addEventListener('pointerup', releasePointer);
    domElement.addEventListener('pointercancel', releasePointer);

    // Wheel zoom in Third-Person mode (allowing close-up uniform inspection down to 2.0m)
    domElement.addEventListener('wheel', (e) => {
        if (state.introPlaying || state.cameraMode !== 'third-person') return;
        e.preventDefault();
        state.camDist = Math.max(2.0, Math.min(19.0, state.camDist + e.deltaY * 0.008));
    }, { passive: false });

    // Prevent browser context menu inside canvas so right-mouse drag feels native
    domElement.addEventListener('contextmenu', (e) => e.preventDefault());

    const _desiredCamPos = new THREE.Vector3();
    const _lookTarget = new THREE.Vector3();

    // Advance player kinematics, OBB sliding physics, or flycam intro each frame
    const update = (dt) => {
        const safeDt = Number.isFinite(dt) && dt > 0 ? dt : 0.016;
        const clampedDt = Math.min(safeDt, 0.05);

        if (state.introPlaying) {
            const curShot = INTRO_SHOTS[currentShotIndex];
            if (!isDipTransitioning) {
                currentShotTime += Math.min(safeDt, 0.08);
            }

            // Smooth cubic interpolation across the active camera trajectory
            const progress = Math.min(1.0, currentShotTime / curShot.duration);
            const easedT = progress * progress * (3.0 - 2.0 * progress);
            const safeU = Math.max(0.0, Math.min(1.0, easedT));

            curShot.camCurve.getPointAt(safeU, _introPos);
            curShot.lookCurve.getPointAt(safeU, _introLook);
            camera.position.copy(_introPos);
            camera.lookAt(_introLook);

            // Trigger film dip-to-black cut between street scenes or landing upon completion
            if (currentShotTime >= curShot.duration && !isDipTransitioning) {
                if (currentShotIndex < INTRO_SHOTS.length - 1) {
                    isDipTransitioning = true;
                    if (onCallbacks.onCinematicDip) {
                        onCallbacks.onCinematicDip(() => {
                            currentShotIndex++;
                            currentShotTime = 0;
                            isDipTransitioning = false;
                            currentSceneTitle = INTRO_SHOTS[currentShotIndex].title;
                            if (onCallbacks.onIntroSceneChange) {
                                onCallbacks.onIntroSceneChange(currentSceneTitle);
                            }
                            const nextShot = INTRO_SHOTS[currentShotIndex];
                            nextShot.camCurve.getPointAt(0, _introPos);
                            nextShot.lookCurve.getPointAt(0, _introLook);
                            camera.position.copy(_introPos);
                            camera.lookAt(_introLook);
                        });
                    } else {
                        currentShotIndex++;
                        currentShotTime = 0;
                        isDipTransitioning = false;
                        currentSceneTitle = INTRO_SHOTS[currentShotIndex].title;
                        if (onCallbacks.onIntroSceneChange) {
                            onCallbacks.onIntroSceneChange(currentSceneTitle);
                        }
                    }
                } else {
                    skipIntroFlycam();
                }
            }
            return;
        }

        // Compute directional movement input from keyboard and mobile joystick
        let inForward = (keys.w ? 1 : 0) - (keys.s ? 1 : 0) + joyVector.y;
        let inRight = (keys.d ? 1 : 0) - (keys.a ? 1 : 0) + joyVector.x;
        const mag = Math.hypot(inForward, inRight);
        const isMoving = mag > 0.08;

        if (isMoving) {
            if (mag > 1.0) {
                inForward /= mag;
                inRight /= mag;
            }
            const camDirForwardX = -Math.sin(state.camYaw);
            const camDirForwardZ = -Math.cos(state.camYaw);
            const camDirRightX = Math.cos(state.camYaw);
            const camDirRightZ = -Math.sin(state.camYaw);

            // In Fly mode, orient ground WASD motion using current camera azimuth
            let moveX;
            let moveZ;
            if (state.cameraMode === 'fly') {
                const az = orbitControls.getAzimuthalAngle();
                moveX = -Math.sin(az) * inForward + Math.cos(az) * inRight;
                moveZ = -Math.cos(az) * inForward - Math.sin(az) * inRight;
            } else {
                moveX = camDirForwardX * inForward + camDirRightX * inRight;
                moveZ = camDirForwardZ * inForward + camDirRightZ * inRight;
            }

            // Standard smooth movement speed
            const BASE_WALK_SPEED = 7.6;
            const speed = BASE_WALK_SPEED;
            const stepLen = Math.min(1.0, mag) * speed * clampedDt;
            const startX = avatar.root.position.x;
            const startZ = avatar.root.position.z;

            // Attempt full movement first with human-scale collision radius
            const nextPos = {
                x: startX + moveX * stepLen,
                z: startZ + moveZ * stepLen
            };
            resolveOBBCollisions(nextPos, 0.48);

            // If full diagonal move is obstructed, attempt sliding along free component axes
            const movedDistSq = (nextPos.x - startX) ** 2 + (nextPos.z - startZ) ** 2;
            if (movedDistSq < 1e-5 && stepLen > 0.001) {
                const tryX = { x: startX + moveX * stepLen, z: startZ };
                resolveOBBCollisions(tryX, 0.48);
                const distXSq = (tryX.x - startX) ** 2 + (tryX.z - startZ) ** 2;

                const tryZ = { x: startX, z: startZ + moveZ * stepLen };
                resolveOBBCollisions(tryZ, 0.48);
                const distZSq = (tryZ.x - startX) ** 2 + (tryZ.z - startZ) ** 2;

                if (distXSq >= distZSq && distXSq > 1e-5) {
                    nextPos.x = tryX.x;
                    nextPos.z = tryX.z;
                } else if (distZSq > 1e-5) {
                    nextPos.x = tryZ.x;
                    nextPos.z = tryZ.z;
                }
            }

            avatar.root.position.set(nextPos.x, 0, nextPos.z);

            // Smooth shortest-arc avatar yaw interpolation toward heading
            const targetYaw = Math.atan2(-moveX, -moveZ);
            let diff = targetYaw - avatar.root.rotation.y;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            avatar.root.rotation.y += diff * Math.min(1.0, clampedDt * 11.0);

            // Smooth articulated walk stride with natural knee bend, elbow swing, and lanyard badge bounce
            state.moveBlend = Math.min(1.0, state.moveBlend + clampedDt * 8.0);
            state.walkCycle += clampedDt * 8.8;
            const strideAmp = 0.50;
            const swing = Math.sin(state.walkCycle) * strideAmp * state.moveBlend;

            avatar.leftLeg.rotation.x = swing;
            avatar.rightLeg.rotation.x = -swing;
            avatar.leftShin.rotation.x = -Math.max(0, -Math.sin(state.walkCycle + 0.35)) * 0.42 * state.moveBlend;
            avatar.rightShin.rotation.x = -Math.max(0, Math.sin(state.walkCycle + 0.35)) * 0.42 * state.moveBlend;

            avatar.leftArm.rotation.x = -swing * 0.72;
            avatar.rightArm.rotation.x = swing * 0.72;
            avatar.leftForearm.rotation.x = (-0.18 - Math.max(0, -swing) * 0.55) * state.moveBlend;
            avatar.rightForearm.rotation.x = (-0.18 - Math.max(0, swing) * 0.55) * state.moveBlend;

            avatar.bodyPivot.position.y = Math.abs(Math.sin(state.walkCycle)) * 0.042 * state.moveBlend;
            avatar.torsoGroup.position.y = 0;
            avatar.torsoGroup.rotation.y = Math.sin(state.walkCycle) * 0.06 * state.moveBlend;
            avatar.torsoGroup.scale.setScalar(1.0);
            avatar.leftArm.position.y = 1.335;
            avatar.rightArm.position.y = 1.335;
            avatar.headGroup.position.set(0, 1.615, 0.002);
            avatar.headGroup.rotation.set(0.03 * state.moveBlend, -avatar.torsoGroup.rotation.y * 0.5, 0);
            avatar.badgePivot.rotation.x = 0.14 + Math.abs(Math.sin(state.walkCycle)) * 0.09 * state.moveBlend;
            avatar.badgePivot.rotation.z = Math.cos(state.walkCycle) * 0.05 * state.moveBlend;
        } else {
            // Natural idle breathing motion with grounded sneakers, gentle chest lift, and subtle badge settle
            state.moveBlend = Math.max(0.0, state.moveBlend - clampedDt * 8.0);
            state.idleTime += clampedDt;
            const decay = Math.min(1.0, clampedDt * 10.0);

            avatar.leftLeg.rotation.x *= (1 - decay);
            avatar.rightLeg.rotation.x *= (1 - decay);
            avatar.leftShin.rotation.x *= (1 - decay);
            avatar.rightShin.rotation.x *= (1 - decay);

            const breathe = Math.sin(state.idleTime * 2.1);
            const armRelax = 0.03 * Math.sin(state.idleTime * 1.4);
            avatar.leftArm.rotation.x = avatar.leftArm.rotation.x * (1 - decay) + armRelax * decay;
            avatar.rightArm.rotation.x = avatar.rightArm.rotation.x * (1 - decay) - armRelax * decay;
            avatar.leftForearm.rotation.x = avatar.leftForearm.rotation.x * (1 - decay) + (-0.14) * decay;
            avatar.rightForearm.rotation.x = avatar.rightForearm.rotation.x * (1 - decay) + (-0.14) * decay;

            avatar.bodyPivot.position.y *= (1 - decay);
            avatar.torsoGroup.position.y = breathe * 0.004;
            avatar.torsoGroup.rotation.y *= (1 - decay);
            avatar.torsoGroup.scale.set(1 + breathe * 0.013, 1.0, 1 + breathe * 0.017);
            avatar.leftArm.position.y = 1.335 + breathe * 0.004;
            avatar.rightArm.position.y = 1.335 + breathe * 0.004;
            avatar.headGroup.position.set(0, 1.615 + breathe * 0.005, 0.002);
            avatar.headGroup.rotation.set(breathe * 0.015, Math.sin(state.idleTime * 0.85) * 0.05, 0);
            avatar.badgePivot.rotation.x = 0.08 + breathe * 0.025;
            avatar.badgePivot.rotation.z *= (1 - decay);
        }

        // Update active camera transform
        if (state.cameraMode === 'first-person') {
            avatar.root.visible = false;
            camera.position.set(avatar.root.position.x, 1.62, avatar.root.position.z);
            const lookDirX = -Math.sin(state.camYaw) * Math.cos(state.camPitch);
            const lookDirY = Math.sin(state.camPitch);
            const lookDirZ = -Math.cos(state.camYaw) * Math.cos(state.camPitch);
            camera.lookAt(
                avatar.root.position.x + lookDirX,
                1.62 + lookDirY,
                avatar.root.position.z + lookDirZ
            );
        } else if (state.cameraMode === 'third-person') {
            avatar.root.visible = true;
            const lookY = state.camDist < 4.5 ? 1.32 : 2.15;
            _lookTarget.set(avatar.root.position.x, lookY, avatar.root.position.z);
            const horizDist = Math.cos(state.camPitch) * state.camDist;
            const vertDist = Math.sin(state.camPitch) * state.camDist + 0.35;
            _desiredCamPos.set(
                _lookTarget.x + Math.sin(state.camYaw) * horizDist,
                Math.max(0.65, _lookTarget.y + vertDist),
                _lookTarget.z + Math.cos(state.camYaw) * horizDist
            );
            const safeCam = clampCameraAgainstWalls(_lookTarget, _desiredCamPos);
            camera.position.lerp(safeCam, Math.min(1.0, clampedDt * 12.0));
            camera.lookAt(_lookTarget);
        } else {
            avatar.root.visible = true;
            orbitControls.update();
        }
    };

    const setJoystickInput = (nx, ny) => {
        joyVector.x = nx;
        joyVector.y = ny;
    };

    const setSprintToggle = () => {};

    return {
        avatar,
        sampleIntroPose,
        prepareIntroStartFrame,
        startIntroFlycam,
        skipIntroFlycam,
        setCameraMode,
        snapPlayerTo,
        setJoystickInput,
        setSprintToggle,
        update,
        getState: () => ({
            x: avatar.root.position.x,
            z: avatar.root.position.z,
            focusX: state.cameraMode === 'fly' ? orbitControls.target.x : avatar.root.position.x,
            focusZ: state.cameraMode === 'fly' ? orbitControls.target.z : avatar.root.position.z,
            yaw: avatar.root.rotation.y,
            camYaw: state.camYaw,
            cameraMode: state.cameraMode,
            introPlaying: state.introPlaying,
            sprintToggle: false,
            isSprinting: false
        })
    };
}
