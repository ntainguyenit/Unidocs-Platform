// Smart 4-corner cantilever traffic light poles with live 7-segment LED countdowns and cyclic intersection controller
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const GREEN_SEC = 13;
const YELLOW_SEC = 3;
const CLEARANCE_SEC = 3;
const HALF_CYCLE_SEC = GREEN_SEC + YELLOW_SEC + CLEARANCE_SEC;
const FULL_CYCLE_SEC = HALF_CYCLE_SEC * 2;

const COLOR_MAP = {
    green: { hex: '#22c55e', glow: 'rgba(34, 197, 94, 0.55)', label: 'XANH', bulbOn: 0x22ff66, visorTint: 0x0b2a17 },
    yellow: { hex: '#facc15', glow: 'rgba(250, 204, 21, 0.55)', label: 'VÀNG', bulbOn: 0xffd426, visorTint: 0x332808 },
    red: { hex: '#ef4444', glow: 'rgba(239, 68, 68, 0.55)', label: 'ĐỎ', bulbOn: 0xff2b2b, visorTint: 0x330d0d }
};

// 7-segment truth table ordered: [top, topRight, bottomRight, bottom, bottomLeft, topLeft, middle]
const SEG_DIGITS = {
    '0': [1, 1, 1, 1, 1, 1, 0],
    '1': [0, 1, 1, 0, 0, 0, 0],
    '2': [1, 1, 0, 1, 1, 0, 1],
    '3': [1, 1, 1, 1, 0, 0, 1],
    '4': [0, 1, 1, 0, 0, 1, 1],
    '5': [1, 0, 1, 1, 0, 1, 1],
    '6': [1, 0, 1, 1, 1, 1, 1],
    '7': [1, 1, 1, 0, 0, 0, 0],
    '8': [1, 1, 1, 1, 1, 1, 1],
    '9': [1, 1, 1, 1, 0, 1, 1]
};

// Draw a crisp skewed 7-segment LED digit onto a 2D canvas without heavy CPU shadowBlur
function drawLedDigit(ctx, ch, x, y, w, h, activeColor, glowColor) {
    const segs = SEG_DIGITS[ch] || SEG_DIGITS['8'];
    const t = Math.max(4, w * 0.19);
    const pad = t * 0.45;
    const halfH = h * 0.5;

    const bars = [
        [x + pad, y, w - pad * 2, t],
        [x + w - t, y + pad, t, halfH - pad * 1.4],
        [x + w - t, y + halfH + pad * 0.4, t, halfH - pad * 1.4],
        [x + pad, y + h - t, w - pad * 2, t],
        [x, y + halfH + pad * 0.4, t, halfH - pad * 1.4],
        [x, y + pad, t, halfH - pad * 1.4],
        [x + pad, y + halfH - t * 0.5, w - pad * 2, t]
    ];

    const r = t * 0.42;
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 4;
    for (let i = 0; i < 7; i++) {
        const [bx, by, bw, bh] = bars[i];
        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, r);
        if (segs[i]) {
            ctx.stroke();
            ctx.fillStyle = activeColor;
            ctx.fill();
        } else {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.fill();
        }
    }
}

// Create a shared dynamic CanvasTexture for 2-digit 7-segment countdown displays without mipmap stalls
function createCountdownLedTexture(maxAnisotropy = 4) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 192;
    const ctx = canvas.getContext('2d');
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.generateMipmaps = false;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.anisotropy = 1;

    let lastKey = '';
    const redraw = (sec, phase) => {
        const clamped = Math.max(1, Math.min(99, sec | 0));
        const key = `${phase}:${clamped}`;
        if (key === lastKey) return;
        lastKey = key;

        const txt = String(clamped).padStart(2, '0');
        const col = COLOR_MAP[phase]?.hex || '#22c55e';
        const glow = COLOR_MAP[phase]?.glow || 'rgba(34, 197, 94, 0.45)';

        ctx.fillStyle = '#070b13';
        ctx.fillRect(0, 0, 256, 192);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 6;
        ctx.strokeRect(5, 5, 246, 182);

        drawLedDigit(ctx, txt[0], 34, 24, 78, 144, col, glow);
        drawLedDigit(ctx, txt[1], 144, 24, 78, 144, col, glow);
        tex.needsUpdate = true;
    };

    redraw(10, 'green');
    return { tex, redraw };
}

// Create a crisp canvas icon texture showing red standing vs green walking pedestrian figure
function createPedestrianTexture(isGo) {
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 128;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#070b13';
    ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 120, 120);

    const fg = isGo ? '#22c55e' : '#ef4444';
    ctx.fillStyle = fg;
    ctx.strokeStyle = fg;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.arc(isGo ? 64 : 44, 30, 11, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = 9;
    if (isGo) {
        ctx.beginPath(); ctx.moveTo(64, 44); ctx.lineTo(64, 76); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(64, 52); ctx.lineTo(44, 68); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(64, 52); ctx.lineTo(84, 66); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(64, 76); ctx.lineTo(46, 106); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(64, 76); ctx.lineTo(82, 106); ctx.stroke();
    } else {
        ctx.beginPath(); ctx.moveTo(44, 44); ctx.lineTo(44, 78); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(32, 68); ctx.lineTo(56, 68); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(37, 106); ctx.lineTo(44, 78); ctx.lineTo(51, 106); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.14)';
        ctx.beginPath(); ctx.arc(84, 30, 9, 0, Math.PI * 2); ctx.fill();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

// Compute current alternating phase state and countdown integer for both orthogonal road axes
function computeCycleState(cycleTime) {
    const t = ((cycleTime % FULL_CYCLE_SEC) + FULL_CYCLE_SEC) % FULL_CYCLE_SEC;

    let ewState;
    let ewSec;
    if (t < GREEN_SEC) {
        ewState = 'green';
        ewSec = Math.ceil(GREEN_SEC - t);
    } else if (t < GREEN_SEC + YELLOW_SEC) {
        ewState = 'yellow';
        ewSec = Math.ceil(GREEN_SEC + YELLOW_SEC - t);
    } else {
        ewState = 'red';
        ewSec = Math.ceil(FULL_CYCLE_SEC - t);
    }

    let nsState;
    let nsSec;
    if (t < HALF_CYCLE_SEC) {
        nsState = 'red';
        nsSec = Math.ceil(HALF_CYCLE_SEC - t);
    } else if (t < HALF_CYCLE_SEC + GREEN_SEC) {
        nsState = 'green';
        nsSec = Math.ceil(HALF_CYCLE_SEC + GREEN_SEC - t);
    } else if (t < HALF_CYCLE_SEC + GREEN_SEC + YELLOW_SEC) {
        nsState = 'yellow';
        nsSec = Math.ceil(HALF_CYCLE_SEC + GREEN_SEC + YELLOW_SEC - t);
    } else {
        nsState = 'red';
        nsSec = Math.ceil(FULL_CYCLE_SEC - t) + HALF_CYCLE_SEC;
    }

    return { ewState, ewSec, nsState, nsSec };
}

// Create shared geometry pool reused across all 8 cantilever poles for 60 FPS GPU efficiency
function createSharedPoleGeometries() {
    const armGeom = new THREE.CylinderGeometry(0.056, 0.088, 7.35, 10);
    armGeom.rotateZ(Math.PI * 0.5);
    const visorGeom = new THREE.CylinderGeometry(0.135, 0.135, 0.16, 12, 1, true, -Math.PI * 0.62, Math.PI * 1.24);
    visorGeom.rotateX(Math.PI * 0.5);

    return {
        basePlate: new THREE.CylinderGeometry(0.38, 0.42, 0.07, 12),
        fin: new THREE.BoxGeometry(0.18, 0.26, 0.035),
        shaft: new THREE.CylinderGeometry(0.115, 0.148, 6.45, 12),
        topCap: new THREE.CylinderGeometry(0.06, 0.115, 0.18, 12),
        clampCollar: new THREE.CylinderGeometry(0.165, 0.165, 0.34, 12),
        arm: armGeom,
        brace: new THREE.BoxGeometry(0.95, 0.075, 0.075),
        housingHoriz: new THREE.BoxGeometry(1.24, 0.44, 0.24),
        housingVert: new THREE.BoxGeometry(0.44, 1.18, 0.24),
        visor: visorGeom,
        lens: new THREE.CircleGeometry(0.115, 16),
        ledBoxBig: new THREE.BoxGeometry(0.78, 0.62, 0.19),
        ledScreenBig: new THREE.PlaneGeometry(0.78 * 0.88, 0.62 * 0.84),
        ledBoxSmall: new THREE.BoxGeometry(0.48, 0.36, 0.19),
        ledScreenSmall: new THREE.PlaneGeometry(0.48 * 0.88, 0.36 * 0.84),
        pedBox: new THREE.BoxGeometry(0.36, 0.34, 0.20),
        pedScreen: new THREE.PlaneGeometry(0.28, 0.26),
        miniStrip: new THREE.BoxGeometry(0.12, 0.32, 0.08)
    };
}

// Clone geometry with optional UV removal and bake world/local matrix into non-indexed buffer
function bakePartGeometry(baseGeom, matrix, keepUv = false) {
    const g = baseGeom.index ? baseGeom.toNonIndexed() : baseGeom.clone();
    if (!keepUv && g.attributes.uv) g.deleteAttribute('uv');
    g.applyMatrix4(matrix);
    return g;
}

// Build batched local templates for static steel structure, black housings, and per-pole screen/lens offsets
function buildPoleBatchedTemplates(geom) {
    const dummy = new THREE.Object3D();
    const steelParts = [];
    const cabinetParts = [];
    const screenDescs = [];
    const lensDescs = { red: [], yellow: [], green: [] };

    const pushStaticPart = (target, baseGeom, px, py, pz, rx = 0, ry = 0, rz = 0) => {
        dummy.position.set(px, py, pz);
        dummy.rotation.set(rx, ry, rz);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        target.push(bakePartGeometry(baseGeom, dummy.matrix, false));
    };

    // 1. Anchored steel base plate, 4 gussets, vertical mast, cap, cantilever arm, and diagonal brace
    pushStaticPart(steelParts, geom.basePlate, 0, 0.035, 0);
    for (let g = 0; g < 4; g++) {
        const ang = (g * Math.PI) * 0.5 + Math.PI * 0.25;
        pushStaticPart(steelParts, geom.fin, Math.cos(ang) * 0.21, 0.15, Math.sin(ang) * 0.21, 0, -ang, 0);
    }
    pushStaticPart(steelParts, geom.shaft, 0, 3.225, 0);
    pushStaticPart(steelParts, geom.topCap, 0, 6.54, 0);
    pushStaticPart(steelParts, geom.arm, -3.675, 5.65, 0);
    pushStaticPart(steelParts, geom.brace, -0.46, 5.38, 0, 0, 0, 0.56);

    // 2. Clamp collar and signal housings, visors, LED boxes, and trunk pedestrian housing
    pushStaticPart(cabinetParts, geom.clampCollar, 0, 5.65, 0);

    const addSignalAspectHead = (px, py, pz, horizontal) => {
        pushStaticPart(cabinetParts, horizontal ? geom.housingHoriz : geom.housingVert, px, py, pz);
        const order = ['red', 'yellow', 'green'];
        const offsets = [-0.37, 0, 0.37];
        for (let i = 0; i < 3; i++) {
            const key = order[i];
            const ox = horizontal ? offsets[i] : 0;
            const oy = horizontal ? 0 : -offsets[i];
            lensDescs[key].push({ geom: geom.lens, x: px + ox, y: py + oy, z: pz + 0.125 });
            pushStaticPart(cabinetParts, geom.visor, px + ox, py + oy + 0.01, pz + 0.20);
        }
    };

    const addCountdownBox = (px, py, pz, isBig) => {
        pushStaticPart(cabinetParts, isBig ? geom.ledBoxBig : geom.ledBoxSmall, px, py, pz);
        screenDescs.push({
            geom: isBig ? geom.ledScreenBig : geom.ledScreenSmall,
            x: px,
            y: py,
            z: pz + 0.098
        });
    };

    addSignalAspectHead(-6.05, 5.65, 0.16, true);
    addCountdownBox(-4.88, 5.65, 0.15, true);
    addSignalAspectHead(-3.35, 5.65, 0.16, true);
    addCountdownBox(-2.18, 5.65, 0.15, true);
    addCountdownBox(0, 4.18, 0.22, false);
    addSignalAspectHead(0, 3.32, 0.23, false);

    pushStaticPart(cabinetParts, geom.pedBox, 0, 2.25, 0.20);
    pushStaticPart(cabinetParts, geom.miniStrip, 0, 1.58, 0.17);

    const poleSteelGeom = mergeGeometries(steelParts, false);
    const poleCabinetGeom = mergeGeometries(cabinetParts, false);
    steelParts.forEach((g) => g.dispose());
    cabinetParts.forEach((g) => g.dispose());

    return {
        poleSteelGeom,
        poleCabinetGeom,
        screenDescs,
        lensDescs,
        pedDesc: { geom: geom.pedScreen, x: 0, y: 2.25, z: 0.305 }
    };
}

// Create coordinated dual 4-corner smart traffic light systems at LTK x Nguyen Hue and LTK x Dong Da
export function createSmartIntersectionSystem(scene, hardwareProfile = { tier: 'high', maxAnisotropy: 4 }) {
    const sharedGeom = createSharedPoleGeometries();
    const templates = buildPoleBatchedTemplates(sharedGeom);
    const isLowTier = hardwareProfile.tier === 'low';
    const maxAniso = hardwareProfile.maxAnisotropy || 4;

    const poleMat = new THREE.MeshStandardMaterial({ color: 0x5c6e8c, metalness: 0.64, roughness: 0.34 });
    const cabinetMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.32, roughness: 0.56, side: THREE.DoubleSide });
    const pedWalkMatShared = new THREE.MeshBasicMaterial({ map: createPedestrianTexture(true) });
    const pedStopMatShared = new THREE.MeshBasicMaterial({ map: createPedestrianTexture(false) });

    const makeAxisBundle = () => {
        const led = createCountdownLedTexture(maxAniso);
        return {
            bulbs: {
                red: new THREE.MeshBasicMaterial({ color: COLOR_MAP.red.visorTint }),
                yellow: new THREE.MeshBasicMaterial({ color: COLOR_MAP.yellow.visorTint }),
                green: new THREE.MeshBasicMaterial({ color: COLOR_MAP.green.visorTint })
            },
            led,
            ledMat: new THREE.MeshBasicMaterial({ map: led.tex }),
            pedWalkMat: pedWalkMatShared,
            pedStopMat: pedStopMatShared,
            screenParts: [],
            lensParts: { red: [], yellow: [], green: [] },
            pedParts: []
        };
    };

    const intersectionBundles = {
        nh: { ew: makeAxisBundle(), ns: makeAxisBundle() },
        dd: { ew: makeAxisBundle(), ns: makeAxisBundle() }
    };

    // Exact directional tangents for Ly Thuong Kiet (-1.6106 rad) and Dong Da (-0.4461 rad)
    const ltkDirX = Math.cos(-1.6106);
    const ltkDirZ = Math.sin(-1.6106);
    const ltkSouthFacingYaw = Math.atan2(-ltkDirX, -ltkDirZ);
    const ltkNorthFacingYaw = Math.atan2(ltkDirX, ltkDirZ);

    const ddDirX = Math.cos(-0.4461);
    const ddDirZ = Math.sin(-0.4461);
    const ddSwFacingYaw = Math.atan2(-ddDirX, -ddDirZ);
    const ddNeFacingYaw = Math.atan2(ddDirX, ddDirZ);

    // Install 4 cantilever poles at NH x LTK and 4 cantilever poles at DD x LTK facing oncoming lanes
    const poleSpecs = [
        // Ly Thuong Kiet x Nguyen Hue (South Main Intersection)
        { id: 'nh_ne', intersection: 'nh', axis: 'ew', x: -104.6, z: 75.6, rotY: Math.PI * 0.5 },
        { id: 'nh_sw', intersection: 'nh', axis: 'ew', x: -122.8, z: 95.4, rotY: -Math.PI * 0.5 },
        { id: 'nh_nw', intersection: 'nh', axis: 'ns', x: -123.4, z: 75.7, rotY: ltkNorthFacingYaw },
        { id: 'nh_se', intersection: 'nh', axis: 'ns', x: -104.2, z: 95.3, rotY: ltkSouthFacingYaw },
        // Ly Thuong Kiet x Dong Da (Rear North Intersection)
        { id: 'dd_sw', intersection: 'dd', axis: 'ew', x: -127.94, z: -19.34, rotY: ddSwFacingYaw },
        { id: 'dd_ne', intersection: 'dd', axis: 'ew', x: -109.00, z: -48.81, rotY: ddNeFacingYaw },
        { id: 'dd_nw', intersection: 'dd', axis: 'ns', x: -128.28, z: -46.08, rotY: ltkNorthFacingYaw },
        { id: 'dd_se', intersection: 'dd', axis: 'ns', x: -109.05, z: -21.83, rotY: ltkSouthFacingYaw }
    ];

    const poleSteelInst = new THREE.InstancedMesh(templates.poleSteelGeom, poleMat, poleSpecs.length);
    poleSteelInst.castShadow = true;
    poleSteelInst.receiveShadow = true;
    poleSteelInst.frustumCulled = false;

    const poleCabinetInst = new THREE.InstancedMesh(templates.poleCabinetGeom, cabinetMat, poleSpecs.length);
    poleCabinetInst.castShadow = !isLowTier;
    poleCabinetInst.receiveShadow = false;
    poleCabinetInst.frustumCulled = false;

    const poleObj = new THREE.Object3D();
    const localObj = new THREE.Object3D();
    const worldMat = new THREE.Matrix4();

    poleSpecs.forEach((spec, idx) => {
        poleObj.position.set(spec.x, 0.006, spec.z);
        poleObj.rotation.set(0, spec.rotY, 0);
        poleObj.scale.setScalar(1);
        poleObj.updateMatrix();
        poleSteelInst.setMatrixAt(idx, poleObj.matrix);
        poleCabinetInst.setMatrixAt(idx, poleObj.matrix);

        const bundle = intersectionBundles[spec.intersection][spec.axis];
        for (const sd of templates.screenDescs) {
            localObj.position.set(sd.x, sd.y, sd.z);
            localObj.rotation.set(0, 0, 0);
            localObj.updateMatrix();
            worldMat.multiplyMatrices(poleObj.matrix, localObj.matrix);
            bundle.screenParts.push(bakePartGeometry(sd.geom, worldMat, true));
        }
        for (const phaseKey of ['red', 'yellow', 'green']) {
            for (const ld of templates.lensDescs[phaseKey]) {
                localObj.position.set(ld.x, ld.y, ld.z);
                localObj.rotation.set(0, 0, 0);
                localObj.updateMatrix();
                worldMat.multiplyMatrices(poleObj.matrix, localObj.matrix);
                bundle.lensParts[phaseKey].push(bakePartGeometry(ld.geom, worldMat, false));
            }
        }
        localObj.position.set(templates.pedDesc.x, templates.pedDesc.y, templates.pedDesc.z);
        localObj.rotation.set(0, 0, 0);
        localObj.updateMatrix();
        worldMat.multiplyMatrices(poleObj.matrix, localObj.matrix);
        bundle.pedParts.push(bakePartGeometry(templates.pedDesc.geom, worldMat, true));
    });

    poleSteelInst.instanceMatrix.needsUpdate = true;
    poleCabinetInst.instanceMatrix.needsUpdate = true;
    scene.add(poleSteelInst, poleCabinetInst);

    // Emit merged static signal overlays per intersection axis (20 static draw calls total across 8 poles)
    const axisEntries = [];
    for (const intersectionKey of ['nh', 'dd']) {
        for (const axisKey of ['ew', 'ns']) {
            const bundle = intersectionBundles[intersectionKey][axisKey];

            const ledMerged = mergeGeometries(bundle.screenParts, false);
            bundle.screenParts.forEach((g) => g.dispose());
            const ledMesh = new THREE.Mesh(ledMerged, bundle.ledMat);
            ledMesh.matrixAutoUpdate = false;
            ledMesh.updateMatrix();
            scene.add(ledMesh);

            for (const phaseKey of ['red', 'yellow', 'green']) {
                const lensMerged = mergeGeometries(bundle.lensParts[phaseKey], false);
                bundle.lensParts[phaseKey].forEach((g) => g.dispose());
                const lensMesh = new THREE.Mesh(lensMerged, bundle.bulbs[phaseKey]);
                lensMesh.matrixAutoUpdate = false;
                lensMesh.updateMatrix();
                scene.add(lensMesh);
            }

            const pedMerged = mergeGeometries(bundle.pedParts, false);
            bundle.pedParts.forEach((g) => g.dispose());
            const pedMesh = new THREE.Mesh(pedMerged, bundle.pedWalkMat);
            pedMesh.matrixAutoUpdate = false;
            pedMesh.updateMatrix();
            scene.add(pedMesh);

            axisEntries.push({
                intersection: intersectionKey,
                axis: axisKey,
                pedMesh,
                pedWalkMat: bundle.pedWalkMat,
                pedStopMat: bundle.pedStopMat
            });
        }
    }
    Object.values(sharedGeom).forEach((g) => g.dispose());

    // Alternating green-wave offsets: NH starts EW Green (09s), DD starts LTK Green (09s)
    let cycleClockNh = 4.0;
    let cycleClockDd = 4.0 + HALF_CYCLE_SEC;
    const latestSnapshot = {
        ewState: 'green',
        ewSec: 9,
        nsState: 'red',
        nsSec: 14,
        cycleSec: 4.0,
        nh: { ewState: 'green', ewSec: 9, nsState: 'red', nsSec: 14 },
        dd: { ewState: 'red', ewSec: 14, nsState: 'green', nsSec: 9 }
    };

    const applyAxisVisuals = (intersectionKey, axisKey, state, sec) => {
        const bundle = intersectionBundles[intersectionKey][axisKey];
        for (const phaseKey of ['red', 'yellow', 'green']) {
            bundle.bulbs[phaseKey].color.setHex(
                state === phaseKey ? COLOR_MAP[phaseKey].bulbOn : COLOR_MAP[phaseKey].visorTint
            );
        }
        bundle.led.redraw(sec, state);
    };

    // Advance phase clocks, update all 8 signal masts + LEDs, and return authoritative dual snapshot
    const updateSignals = (dt) => {
        if (dt > 0) {
            const step = Math.min(dt, 0.25);
            cycleClockNh = (cycleClockNh + step) % FULL_CYCLE_SEC;
            cycleClockDd = (cycleClockDd + step) % FULL_CYCLE_SEC;
        }
        const stNh = computeCycleState(cycleClockNh);
        const stDd = computeCycleState(cycleClockDd);

        latestSnapshot.ewState = stNh.ewState;
        latestSnapshot.ewSec = stNh.ewSec;
        latestSnapshot.nsState = stNh.nsState;
        latestSnapshot.nsSec = stNh.nsSec;
        latestSnapshot.cycleSec = cycleClockNh;
        latestSnapshot.nh.ewState = stNh.ewState;
        latestSnapshot.nh.ewSec = stNh.ewSec;
        latestSnapshot.nh.nsState = stNh.nsState;
        latestSnapshot.nh.nsSec = stNh.nsSec;
        latestSnapshot.dd.ewState = stDd.ewState;
        latestSnapshot.dd.ewSec = stDd.ewSec;
        latestSnapshot.dd.nsState = stDd.nsState;
        latestSnapshot.dd.nsSec = stDd.nsSec;

        applyAxisVisuals('nh', 'ew', stNh.ewState, stNh.ewSec);
        applyAxisVisuals('nh', 'ns', stNh.nsState, stNh.nsSec);
        applyAxisVisuals('dd', 'ew', stDd.ewState, stDd.ewSec);
        applyAxisVisuals('dd', 'ns', stDd.nsState, stDd.nsSec);

        for (const entry of axisEntries) {
            const sig = entry.intersection === 'dd' ? stDd : stNh;
            const isPedWalk = (entry.axis === 'ew' ? sig.ewState : sig.nsState) === 'green';
            entry.pedMesh.material = isPedWalk ? entry.pedWalkMat : entry.pedStopMat;
        }
        return latestSnapshot;
    };

    const setShadowTier = (tier) => {
        poleCabinetInst.castShadow = tier !== 'low';
    };

    updateSignals(0);

    return {
        updateSignals,
        setShadowTier,
        getSnapshot: () => ({
            ...latestSnapshot,
            nh: { ...latestSnapshot.nh },
            dd: { ...latestSnapshot.dd }
        })
    };
}
