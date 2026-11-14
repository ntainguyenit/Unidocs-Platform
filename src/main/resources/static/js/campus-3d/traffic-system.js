// Smooth extruded low-poly two-way traffic with safe-distance braking and object pooling
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const CAR_PALETTE = [
    0xf8fafc, // pearl white
    0x94a3b8, // silver metallic
    0x1e293b, // dark slate
    0xdc2626, // crimson red
    0x2563eb, // royal blue
    0xd97706, // amber gold
    0x0d9488  // teal
];

const MOTO_BODY_PALETTE = [
    0xe11d48,
    0x1d4ed8,
    0xf8fafc,
    0x334155,
    0x16a34a,
    0xf59e0b
];

const HELMET_PALETTE = [
    0xf8fafc,
    0x1e3a8a,
    0xdc2626,
    0x0f172a,
    0xfacc15,
    0x059669
];

const ROAD_CORRIDORS = [
    {
        id: 'nguyen-hue',
        axis: 'ew',
        cx: -10.0,
        cz: 85.5,
        rotY: 0,
        minU: -148,
        maxU: 148,
        carLane: 2.6,
        motoLane: 4.8,
        carsPerDir: 5,
        motosPerDir: 6,
        stopLinesPos: [{ u: -117.0, intersection: 'nh', axis: 'ew' }],
        stopLinesNeg: [{ u: 90.4, intersection: 'nh', axis: 'ew' }]
    },
    {
        id: 'dong-da',
        axis: 'ew',
        cx: -16.26,
        cz: -82.96,
        rotY: -0.4461,
        minU: -184,
        maxU: 160,
        carLane: 2.4,
        motoLane: 4.4,
        carsPerDir: 4,
        motosPerDir: 5,
        stopLinesPos: [{ u: -130.7, intersection: 'dd', axis: 'ew' }],
        stopLinesNeg: [{ u: 95.9, intersection: 'dd', axis: 'ew' }]
    },
    {
        id: 'ly-thuong-kiet',
        axis: 'ns',
        cx: -116.5,
        cz: 16.0,
        rotY: -1.6106,
        minU: -128,
        maxU: 128,
        carLane: 2.5,
        motoLane: 4.6,
        carsPerDir: 4,
        motosPerDir: 5,
        stopLinesPos: [
            { u: -83.55, intersection: 'nh', axis: 'ns' },
            { u: 33.0, intersection: 'dd', axis: 'ns' }
        ],
        stopLinesNeg: [
            { u: -67.2, intersection: 'dd', axis: 'ns' },
            { u: 55.55, intersection: 'nh', axis: 'ns' }
        ]
    }
];

// Strip mismatched attributes before merging procedural low-poly subparts cleanly
function mergeCleanParts(parts) {
    const prepped = parts.map((raw) => {
        const g = raw.index ? raw.toNonIndexed() : raw.clone();
        if (g.attributes.uv) g.deleteAttribute('uv');
        return g;
    });
    const merged = mergeGeometries(prepped, false);
    prepped.forEach((g) => g.dispose());
    return merged;
}

// Build smooth contoured sedan silhouette with wheel well arches and raked cabin
function createCarBodyGeometry() {
    const s = new THREE.Shape();
    s.moveTo(-2.04, 0.28);
    s.lineTo(-1.64, 0.24);
    s.quadraticCurveTo(-1.62, 0.66, -1.28, 0.66);
    s.quadraticCurveTo(-0.94, 0.66, -0.92, 0.24);
    s.lineTo(0.92, 0.24);
    s.quadraticCurveTo(0.94, 0.66, 1.28, 0.66);
    s.quadraticCurveTo(1.62, 0.66, 1.64, 0.24);
    s.lineTo(1.98, 0.24);
    s.quadraticCurveTo(2.14, 0.28, 2.14, 0.44);
    s.lineTo(2.06, 0.62);
    s.quadraticCurveTo(1.65, 0.72, 1.02, 0.78);
    s.lineTo(0.42, 1.31);
    s.quadraticCurveTo(-0.08, 1.38, -0.58, 1.32);
    s.lineTo(-1.42, 0.85);
    s.lineTo(-1.98, 0.78);
    s.quadraticCurveTo(-2.10, 0.70, -2.08, 0.46);
    s.closePath();

    const g = new THREE.ExtrudeGeometry(s, {
        depth: 1.62,
        curveSegments: 4,
        bevelEnabled: true,
        bevelThickness: 0.06,
        bevelSize: 0.035,
        bevelSegments: 1
    });
    g.translate(0, 0, -0.81);
    g.computeVertexNormals();
    return g;
}

// Build dark tinted sloped front/rear windshield and side cabin window belt proud of pillars
function createCarGlassGeometry() {
    const s = new THREE.Shape();
    s.moveTo(-1.51, 0.85);
    s.lineTo(1.11, 0.80);
    s.lineTo(0.51, 1.30);
    s.lineTo(-0.65, 1.30);
    s.closePath();

    const g = new THREE.ExtrudeGeometry(s, {
        depth: 1.72,
        curveSegments: 4,
        bevelEnabled: true,
        bevelThickness: 0.02,
        bevelSize: 0.015,
        bevelSegments: 1
    });
    g.translate(0, 0, -0.86);
    g.computeVertexNormals();
    return g;
}

// Build 5-spoke metallic alloy wheel rim geometry
function createAlloyRimGeometry(radius, width) {
    const parts = [];
    const hub = new THREE.CylinderGeometry(radius * 0.36, radius * 0.36, width * 1.04, 8);
    hub.rotateX(Math.PI * 0.5);
    parts.push(hub);

    for (const sideZ of [-width * 0.44, width * 0.44]) {
        const lipRing = new THREE.TorusGeometry(radius * 0.88, radius * 0.12, 4, 10);
        lipRing.translate(0, 0, sideZ);
        parts.push(lipRing);
    }

    for (let i = 0; i < 5; i++) {
        const spoke = new THREE.BoxGeometry(radius * 0.90, radius * 0.22, width * 0.98);
        spoke.translate(radius * 0.45, 0, 0);
        spoke.rotateZ((i / 5) * Math.PI * 2);
        parts.push(spoke);
    }
    return mergeCleanParts(parts);
}

// Build step-through scooter bodywork shell in local XY profile (+X forward)
function createScooterBodyGeometry() {
    const s = new THREE.Shape();
    s.moveTo(-0.68, 0.52);
    s.lineTo(-0.16, 0.28);
    s.lineTo(0.22, 0.28);
    s.lineTo(0.36, 0.48);
    s.lineTo(0.62, 0.46);
    s.lineTo(0.58, 0.74);
    s.lineTo(0.38, 0.96);
    s.lineTo(0.24, 0.94);
    s.lineTo(0.36, 0.62);
    s.lineTo(0.16, 0.38);
    s.lineTo(-0.08, 0.38);
    s.lineTo(-0.12, 0.72);
    s.lineTo(-0.64, 0.72);
    s.closePath();

    const g = new THREE.ExtrudeGeometry(s, {
        depth: 0.28,
        curveSegments: 4,
        bevelEnabled: true,
        bevelThickness: 0.035,
        bevelSize: 0.03,
        bevelSegments: 1
    });
    g.translate(0, 0, -0.14);
    g.computeVertexNormals();
    return g;
}

// Build scooter fork, handlebars, grips, and dark leather saddle
function createScooterFrameGeometry() {
    const parts = [];
    const saddle = new THREE.CapsuleGeometry(0.11, 0.36, 3, 6);
    saddle.rotateZ(Math.PI * 0.5);
    saddle.scale(1.0, 0.52, 1.15);
    saddle.translate(-0.34, 0.74, 0);
    parts.push(saddle);

    const fork = new THREE.CylinderGeometry(0.025, 0.022, 0.44, 6);
    fork.rotateZ(0.28);
    fork.translate(0.47, 0.41, 0);
    parts.push(fork);

    const stem = new THREE.CylinderGeometry(0.022, 0.026, 0.14, 6);
    stem.translate(0.32, 0.98, 0);
    parts.push(stem);

    const bar = new THREE.CylinderGeometry(0.018, 0.018, 0.52, 6);
    bar.rotateX(Math.PI * 0.5);
    bar.translate(0.32, 1.03, 0);
    parts.push(bar);

    return mergeCleanParts(parts);
}

// Build HUSC student rider white polo shirt torso, sleeves, reaching arms, and white sneakers
function createRiderPoloGeometry() {
    const parts = [];
    const torso = new THREE.CapsuleGeometry(0.115, 0.26, 3, 6);
    torso.scale(0.86, 1.0, 1.15);
    torso.rotateZ(-0.22);
    torso.translate(-0.29, 1.02, 0);
    parts.push(torso);

    for (const side of [-1, 1]) {
        const upperArm = new THREE.CapsuleGeometry(0.038, 0.20, 3, 5);
        upperArm.rotateZ(-0.92);
        upperArm.rotateY(side * -0.16);
        upperArm.translate(-0.14, 1.11, side * 0.135);
        parts.push(upperArm);

        const forearm = new THREE.CapsuleGeometry(0.031, 0.24, 3, 5);
        forearm.rotateZ(-1.32);
        forearm.rotateY(side * -0.14);
        forearm.translate(0.14, 1.04, side * 0.21);
        parts.push(forearm);

        const shoe = new THREE.CapsuleGeometry(0.042, 0.10, 3, 5);
        shoe.rotateZ(Math.PI * 0.5);
        shoe.scale(1.0, 0.65, 1.0);
        shoe.translate(0.08, 0.36, side * 0.13);
        parts.push(shoe);
    }
    return mergeCleanParts(parts);
}

// Build dark navy HUSC polo collar and seated uniform trousers
function createRiderNavyGeometry() {
    const parts = [];
    const collar = new THREE.CylinderGeometry(0.068, 0.086, 0.046, 8);
    collar.rotateZ(-0.22);
    collar.translate(-0.22, 1.24, 0);
    parts.push(collar);

    const pelvis = new THREE.SphereGeometry(0.11, 8, 6);
    pelvis.scale(0.95, 0.65, 1.20);
    pelvis.translate(-0.34, 0.80, 0);
    parts.push(pelvis);

    for (const side of [-1, 1]) {
        const thigh = new THREE.CapsuleGeometry(0.056, 0.26, 3, 6);
        thigh.rotateZ(1.18);
        thigh.translate(-0.16, 0.70, side * 0.11);
        parts.push(thigh);

        const shin = new THREE.CapsuleGeometry(0.046, 0.24, 3, 6);
        shin.rotateZ(-0.14);
        shin.translate(-0.01, 0.50, side * 0.125);
        parts.push(shin);
    }
    return mergeCleanParts(parts);
}

// Build rider helmet shell plus visor brim facing forward (+X)
function createRiderHelmetGeometry() {
    const parts = [];
    const shell = new THREE.SphereGeometry(0.136, 10, 7, 0, Math.PI * 2, 0, Math.PI * 0.62);
    shell.scale(1.08, 0.96, 1.02);
    shell.rotateZ(-0.10);
    shell.translate(-0.19, 1.37, 0);
    parts.push(shell);

    const brim = new THREE.CylinderGeometry(0.142, 0.152, 0.018, 8, 1, false, Math.PI * 0.22, Math.PI * 0.56);
    brim.rotateZ(-0.22);
    brim.translate(-0.14, 1.39, 0);
    parts.push(brim);

    return mergeCleanParts(parts);
}

// Build dual-lobed warm white forward headlight projection beam texture for cars
function createCarHeadlightBeamTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 256, 128);

    const drawLobe = (cy) => {
        const grad = ctx.createRadialGradient(25, cy, 4, 115, cy, 110);
        grad.addColorStop(0, 'rgba(255, 255, 238, 0.85)');
        grad.addColorStop(0.28, 'rgba(255, 248, 215, 0.50)');
        grad.addColorStop(0.65, 'rgba(255, 240, 190, 0.18)');
        grad.addColorStop(1.0, 'rgba(255, 240, 190, 0.0)');

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(12, cy);
        ctx.lineTo(245, cy - 38);
        ctx.quadraticCurveTo(256, cy, 245, cy + 38);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
    };

    drawLobe(48);
    drawLobe(80);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

// Build focused warm white forward headlight projection beam texture for motorbikes
function createMotoHeadlightBeamTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 256, 128);

    const grad = ctx.createRadialGradient(20, 64, 4, 110, 64, 105);
    grad.addColorStop(0, 'rgba(255, 255, 238, 0.88)');
    grad.addColorStop(0.28, 'rgba(255, 248, 215, 0.52)');
    grad.addColorStop(0.65, 'rgba(255, 240, 190, 0.18)');
    grad.addColorStop(1.0, 'rgba(255, 240, 190, 0.0)');

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(10, 64);
    ctx.lineTo(245, 22);
    ctx.quadraticCurveTo(256, 64, 245, 106);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

// Create instanced two-way vehicle pools with safe-distance braking and smooth loop wrapping
export function createRoadTrafficSystem(scene, hardwareProfile = { tier: 'high' }) {
    const lanes = [];
    const carUnits = [];
    const motoUnits = [];
    const allUnits = [];

    const carSpeedTable = [8.8, 12.2, 9.6, 12.8, 10.4];
    const motoSpeedTable = [6.4, 9.2, 7.1, 9.6, 6.9, 8.5];

    for (let roadIdx = 0; roadIdx < ROAD_CORRIDORS.length; roadIdx++) {
        const road = ROAD_CORRIDORS[roadIdx];
        const dirX = Math.cos(road.rotY);
        const dirZ = Math.sin(road.rotY);
        const perpX = -dirZ;
        const perpZ = dirX;

        for (const dirSign of [1, -1]) {
            const tx = dirX * dirSign;
            const tz = dirZ * dirSign;
            const yaw = Math.atan2(-tz, tx);
            const carLat = road.carLane * dirSign;
            const motoLat = road.motoLane * dirSign;
            const stopLines = dirSign > 0 ? (road.stopLinesPos || []) : (road.stopLinesNeg || []);
            const minBound = dirSign > 0 ? road.minU : -road.maxU;
            const maxBound = dirSign > 0 ? road.maxU : -road.minU;
            const span = maxBound - minBound;

            const isInitiallyRed = (sl) => (sl.intersection === 'dd' ? sl.axis === 'ew' : sl.axis === 'ns');

            const sanitizeLaneSpawn = (list, halfVehLen, minClearance) => {
                const vehLen = halfVehLen * 2;
                for (const item of list) {
                    for (const sl of stopLines) {
                        if (isInitiallyRed(sl) && item.u + halfVehLen > sl.u - 0.5 && item.u - halfVehLen < sl.u + 34.0) {
                            item.u = sl.u - halfVehLen - 1.8;
                        }
                    }
                }
                list.sort((a, b) => a.u - b.u);
                for (let k = list.length - 2; k >= 0; k--) {
                    const minGap = vehLen + minClearance + 2.5;
                    if (list[k].u > list[k + 1].u - minGap) {
                        list[k].u = list[k + 1].u - minGap;
                    }
                }
                for (const item of list) {
                    const frontU = item.u + halfVehLen;
                    const nearRedStop = stopLines.some((sl) => isInitiallyRed(sl) && sl.u - frontU >= -0.35 && sl.u - frontU < 22.0);
                    item.curSpeed = nearRedStop ? 0 : item.baseSpeed;
                    item.wx = item.cx + item.dirX * item.u + item.perpX * item.lat;
                    item.wz = item.cz + item.dirZ * item.u + item.perpZ * item.lat;
                }
            };

            const carLaneList = [];
            for (let i = 0; i < road.carsPerDir; i++) {
                const idx = carUnits.length;
                const u0 = minBound + ((i + 0.32 + (dirSign > 0 ? 0.08 : 0.22)) / road.carsPerDir) * span;
                const unit = {
                    isCar: true,
                    roadId: road.id,
                    axis: road.axis,
                    roadPriority: roadIdx,
                    length: 4.30,
                    halfW: 0.90,
                    wheelRadius: 0.30,
                    wheelSpin: 0,
                    cx: road.cx,
                    cz: road.cz,
                    dirX: tx,
                    dirZ: tz,
                    perpX,
                    perpZ,
                    lat: carLat,
                    yaw,
                    minBound,
                    maxBound,
                    span,
                    u: u0,
                    wx: 0,
                    wz: 0,
                    baseSpeed: carSpeedTable[(i + (dirSign > 0 ? 0 : 2)) % carSpeedTable.length],
                    curSpeed: 0,
                    isBraking: false,
                    colorHex: CAR_PALETTE[(idx * 3 + (dirSign > 0 ? 0 : 2)) % CAR_PALETTE.length]
                };
                carUnits.push(unit);
                carLaneList.push(unit);
                allUnits.push(unit);
            }
            sanitizeLaneSpawn(carLaneList, 2.15, 1.6);
            lanes.push({ vehicles: carLaneList, axis: road.axis, stopLines });

            const motoLaneList = [];
            for (let i = 0; i < road.motosPerDir; i++) {
                const idx = motoUnits.length;
                const u0 = minBound + ((i + 0.20 + (i % 2) * 0.14) / road.motosPerDir) * span;
                const unit = {
                    isCar: false,
                    roadId: road.id,
                    axis: road.axis,
                    roadPriority: roadIdx,
                    length: 1.56,
                    halfW: 0.34,
                    wheelRadius: 0.22,
                    wheelSpin: 0,
                    cx: road.cx,
                    cz: road.cz,
                    dirX: tx,
                    dirZ: tz,
                    perpX,
                    perpZ,
                    lat: motoLat,
                    yaw,
                    minBound,
                    maxBound,
                    span,
                    u: u0,
                    wx: 0,
                    wz: 0,
                    baseSpeed: motoSpeedTable[(i + (dirSign > 0 ? 0 : 3)) % motoSpeedTable.length],
                    curSpeed: 0,
                    isBraking: false,
                    bodyHex: MOTO_BODY_PALETTE[(idx * 5 + 1) % MOTO_BODY_PALETTE.length],
                    helmetHex: HELMET_PALETTE[(idx * 3 + 2) % HELMET_PALETTE.length]
                };
                motoUnits.push(unit);
                motoLaneList.push(unit);
                allUnits.push(unit);
            }
            sanitizeLaneSpawn(motoLaneList, 0.78, 1.0);
            lanes.push({ vehicles: motoLaneList, axis: road.axis, stopLines });
        }
    }

    const totalCars = carUnits.length;
    const totalMotos = motoUnits.length;

    // Sedans: extruded body, tinted cabin glass, rubber tires, 5-spoke silver rims, headlights & brake lights
    const carBodyInst = new THREE.InstancedMesh(
        createCarBodyGeometry(),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.28, metalness: 0.38 }),
        totalCars
    );
    carBodyInst.castShadow = true;
    carBodyInst.receiveShadow = true;

    const carGlassInst = new THREE.InstancedMesh(
        createCarGlassGeometry(),
        new THREE.MeshStandardMaterial({ color: 0x111c2d, roughness: 0.12, metalness: 0.78 }),
        totalCars
    );

    const carTireGeom = new THREE.CylinderGeometry(0.30, 0.30, 0.22, 12);
    carTireGeom.rotateX(Math.PI * 0.5);
    const carWheelsInst = new THREE.InstancedMesh(
        carTireGeom,
        new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.86, metalness: 0.08 }),
        totalCars * 4
    );

    const carRimsInst = new THREE.InstancedMesh(
        createAlloyRimGeometry(0.19, 0.236),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.20, metalness: 0.88 }),
        totalCars * 4
    );

    const carLightGeom = new THREE.BoxGeometry(0.12, 0.16, 0.38);
    const carHeadlightMat = new THREE.MeshBasicMaterial({ color: 0x475569, toneMapped: false });
    const carHeadlightsInst = new THREE.InstancedMesh(
        carLightGeom,
        carHeadlightMat,
        totalCars * 2
    );
    const carTaillightsInst = new THREE.InstancedMesh(
        new THREE.BoxGeometry(0.10, 0.14, 0.36),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
        totalCars * 2
    );

    // Scooters & HUSC Student Riders: contoured shell, handlebars/saddle, polo rider, navy pants, head, helmet, alloy wheels
    const isLowTier = hardwareProfile.tier === 'low';
    const motoBodyInst = new THREE.InstancedMesh(
        createScooterBodyGeometry(),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.30, metalness: 0.30 }),
        totalMotos
    );
    motoBodyInst.castShadow = !isLowTier;

    const motoFrameInst = new THREE.InstancedMesh(
        createScooterFrameGeometry(),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.68, metalness: 0.22 }),
        totalMotos
    );

    const motoTireGeom = new THREE.CylinderGeometry(0.22, 0.22, 0.11, 10);
    motoTireGeom.rotateX(Math.PI * 0.5);
    const motoWheelsInst = new THREE.InstancedMesh(
        motoTireGeom,
        new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.88, metalness: 0.08 }),
        totalMotos * 2
    );

    const motoRimsInst = new THREE.InstancedMesh(
        createAlloyRimGeometry(0.135, 0.122),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.22, metalness: 0.86 }),
        totalMotos * 2
    );

    const motoRiderPoloInst = new THREE.InstancedMesh(
        createRiderPoloGeometry(),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.68, metalness: 0.03 }),
        totalMotos
    );
    motoRiderPoloInst.castShadow = !isLowTier;

    const motoRiderNavyInst = new THREE.InstancedMesh(
        createRiderNavyGeometry(),
        new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.72, metalness: 0.04 }),
        totalMotos
    );
    motoRiderNavyInst.castShadow = !isLowTier;

    const motoHeadGeom = new THREE.SphereGeometry(0.115, 10, 6);
    motoHeadGeom.translate(-0.19, 1.35, 0);
    const motoRiderHeadInst = new THREE.InstancedMesh(
        motoHeadGeom,
        new THREE.MeshStandardMaterial({ color: 0xf2c5a6, roughness: 0.72 }),
        totalMotos
    );

    const motoHelmetInst = new THREE.InstancedMesh(
        createRiderHelmetGeometry(),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.24, metalness: 0.25 }),
        totalMotos
    );

    const motoHeadLightMat = new THREE.MeshBasicMaterial({ color: 0x475569, toneMapped: false });
    const motoHeadLightInst = new THREE.InstancedMesh(
        new THREE.BoxGeometry(0.09, 0.13, 0.18),
        motoHeadLightMat,
        totalMotos
    );
    const motoTailLightInst = new THREE.InstancedMesh(
        new THREE.BoxGeometry(0.06, 0.09, 0.16),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
        totalMotos
    );

    // Warm white forward ground projection light beams for cars and motorbikes
    const carBeamTex = createCarHeadlightBeamTexture();
    const motoBeamTex = createMotoHeadlightBeamTexture();

    const carBeamMat = new THREE.MeshBasicMaterial({
        map: carBeamTex,
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false
    });
    const motoBeamMat = new THREE.MeshBasicMaterial({
        map: motoBeamTex,
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false
    });

    const carBeamGeom = new THREE.PlaneGeometry(12.0, 4.2);
    carBeamGeom.rotateX(-Math.PI * 0.5);
    carBeamGeom.translate(8.15, 0.038, 0);

    const motoBeamGeom = new THREE.PlaneGeometry(8.5, 2.2);
    motoBeamGeom.rotateX(-Math.PI * 0.5);
    motoBeamGeom.translate(4.90, 0.038, 0);

    const carBeamInst = new THREE.InstancedMesh(carBeamGeom, carBeamMat, totalCars);
    carBeamInst.visible = false;

    const motoBeamInst = new THREE.InstancedMesh(motoBeamGeom, motoBeamMat, totalMotos);
    motoBeamInst.visible = false;

    const col = new THREE.Color();
    for (let i = 0; i < totalCars; i++) {
        carBodyInst.setColorAt(i, col.setHex(carUnits[i].colorHex));
        carTaillightsInst.setColorAt(i * 2, col.setHex(0xb91c1c));
        carTaillightsInst.setColorAt(i * 2 + 1, col.setHex(0xb91c1c));
    }
    carBodyInst.instanceColor.needsUpdate = true;
    carTaillightsInst.instanceColor.needsUpdate = true;

    for (let i = 0; i < totalMotos; i++) {
        motoBodyInst.setColorAt(i, col.setHex(motoUnits[i].bodyHex));
        motoHelmetInst.setColorAt(i, col.setHex(motoUnits[i].helmetHex));
        motoTailLightInst.setColorAt(i, col.setHex(0xb91c1c));
    }
    motoBodyInst.instanceColor.needsUpdate = true;
    motoHelmetInst.instanceColor.needsUpdate = true;
    motoTailLightInst.instanceColor.needsUpdate = true;

    const trafficMeshes = [
        carBodyInst,
        carGlassInst,
        carWheelsInst,
        carRimsInst,
        carHeadlightsInst,
        carTaillightsInst,
        carBeamInst,
        motoBodyInst,
        motoFrameInst,
        motoWheelsInst,
        motoRimsInst,
        motoRiderPoloInst,
        motoRiderNavyInst,
        motoRiderHeadInst,
        motoHelmetInst,
        motoHeadLightInst,
        motoTailLightInst,
        motoBeamInst
    ];
    for (const inst of trafficMeshes) {
        inst.frustumCulled = false;
        scene.add(inst);
    }

    // Dynamic SpotLight pool illuminating road surfaces in front of closest moving vehicles
    const spotLights = [];
    const spotCount = 4;
    for (let s = 0; s < spotCount; s++) {
        const spot = new THREE.SpotLight(0xffffee, 0, 28, Math.PI * 0.22, 0.65, 1.2);
        spot.castShadow = false;
        spot.visible = false;
        scene.add(spot);
        scene.add(spot.target);
        spotLights.push(spot);
    }

    const spotCandidates = [];
    for (let i = 0; i < allUnits.length; i++) {
        spotCandidates.push({ unit: null, distSq: 999999 });
    }

    let isNightMode = false;
    const setNightMode = (night) => {
        isNightMode = Boolean(night);
        if (isNightMode) {
            carHeadlightMat.color.setHex(0xffffee);
            motoHeadLightMat.color.setHex(0xffffee);
            carBeamMat.opacity = 0.85;
            motoBeamMat.opacity = 0.82;
            carBeamInst.visible = true;
            motoBeamInst.visible = true;
            carBeamInst.instanceMatrix.needsUpdate = true;
            motoBeamInst.instanceMatrix.needsUpdate = true;
        } else {
            carHeadlightMat.color.setHex(0x475569);
            motoHeadLightMat.color.setHex(0x475569);
            carBeamMat.opacity = 0.0;
            motoBeamMat.opacity = 0.0;
            carBeamInst.visible = false;
            motoBeamInst.visible = false;
            for (let s = 0; s < spotCount; s++) {
                spotLights[s].visible = false;
                spotLights[s].intensity = 0;
            }
        }
    };

    // Pooled reusable transform helpers preventing per-frame allocations
    const parentObj = new THREE.Object3D();
    const childObj = new THREE.Object3D();
    const worldMat = new THREE.Matrix4();
    const brakeColor = new THREE.Color(0xff3b3b);
    const cruiseTailColor = new THREE.Color(0xb91c1c);

    const carWheelOffsets = [
        [1.28, 0.30, 0.81],
        [1.28, 0.30, -0.81],
        [-1.28, 0.30, 0.81],
        [-1.28, 0.30, -0.81]
    ];
    const headlightOffsets = [[2.13, 0.50, 0.58], [2.13, 0.50, -0.58]];
    const taillightOffsets = [[-2.12, 0.58, 0.58], [-2.12, 0.58, -0.58]];
    const motoWheelOffsets = [[0.54, 0.22, 0], [-0.54, 0.22, 0]];

    const setChildTransform = (inst, index, lx, ly, lz, rotZ = 0) => {
        childObj.position.set(lx, ly, lz);
        childObj.rotation.set(0, 0, rotZ);
        childObj.scale.setScalar(1);
        childObj.updateMatrix();
        worldMat.multiplyMatrices(parentObj.matrix, childObj.matrix);
        inst.setMatrixAt(index, worldMat);
    };

    // Advance vehicles with signal stop-line braking, safe headway control, and zero-overlap clamping
    const updateTraffic = (dt, playerState = null, signalState = null) => {
        let remDt = dt > 0 ? Math.min(dt, 0.25) : 0;

        while (remDt > 1e-5) {
            const clampedDt = Math.min(remDt, 0.05);
            remDt -= clampedDt;
            for (const u of allUnits) {
                u.wx = u.cx + u.dirX * u.u + u.perpX * u.lat;
                u.wz = u.cz + u.dirZ * u.u + u.perpZ * u.lat;
            }

            for (const lane of lanes) {
                const list = lane.vehicles;
                list.sort((a, b) => a.u - b.u);
                const n = list.length;
                const stopLines = lane.stopLines;

                for (let k = 0; k < n; k++) {
                    const v = list[k];
                    const hl = v.length * 0.5;
                    const stopGap = v.isCar ? 2.5 : 1.5;
                    const hasLeader = k + 1 < n;
                    const leader = hasLeader ? list[k + 1] : null;
                    let effGap = leader ? (leader.u - v.u - hl - leader.length * 0.5) : 999;
                    let effLeaderSpeed = leader ? leader.curSpeed : v.baseSpeed;
                    let activeStopU = null;

                    // Stop smoothly behind each intersection stop line matching its live Red or Yellow signal phase
                    const frontU = v.u + hl;
                    for (let sIdx = 0; sIdx < stopLines.length; sIdx++) {
                        const sl = stopLines[sIdx];
                        const sigObj = sl.intersection === 'dd'
                            ? (signalState && signalState.dd ? signalState.dd : signalState)
                            : (signalState && signalState.nh ? signalState.nh : signalState);
                        const slPhase = sigObj ? sigObj[sl.axis + 'State'] : 'green';
                        if (slPhase !== 'red' && slPhase !== 'yellow') continue;

                        const minBrakeDist = slPhase === 'yellow' ? Math.max(0.25, (v.curSpeed * v.curSpeed) / 32.0) : -0.35;
                        const distToLine = sl.u - frontU;
                        if (distToLine >= minBrakeDist && distToLine < 42.0) {
                            const sigGap = Math.max(0, distToLine - 0.55) + stopGap;
                            if (sigGap < effGap) {
                                effGap = sigGap;
                                effLeaderSpeed = 0;
                            }
                            if (activeStopU === null || sl.u < activeStopU) {
                                activeStopU = sl.u;
                            }
                        }
                    }

                    // Yield cleanly to cross-traffic already occupying an intersection box
                    for (const other of allUnits) {
                        if (other.roadId === v.roadId) continue;
                        const dx = other.wx - v.wx;
                        const dz = other.wz - v.wz;
                        if (dx * dx + dz * dz > 784) continue;

                        const fwd = dx * v.dirX + dz * v.dirZ;
                        if (fwd <= 0) continue;

                        const lat = Math.abs(dx * v.perpX + dz * v.perpZ);
                        const crossProjW = Math.abs(other.dirX * v.perpX + other.dirZ * v.perpZ) * (other.length * 0.5) + other.halfW;
                        const crossProjL = Math.abs(other.dirX * v.dirX + other.dirZ * v.dirZ) * (other.length * 0.5) + other.halfW;
                        const otherFwdToV = (-dx) * other.dirX + (-dz) * other.dirZ;

                        if (lat < v.halfW + crossProjW + 0.95) {
                            const crossGap = fwd - hl - crossProjL - 0.55;
                            if (crossGap < effGap) {
                                effGap = crossGap;
                                effLeaderSpeed = 0;
                            }
                        } else if (other.curSpeed > 0.6 && lat < v.halfW + crossProjW + 7.5 && otherFwdToV > -other.length * 0.5 && otherFwdToV < 18.0) {
                            const vArrival = Math.max(0, fwd - hl) / Math.max(2.0, v.baseSpeed);
                            const oArrival = Math.max(0, otherFwdToV - other.length * 0.5) / Math.max(2.0, other.baseSpeed);
                            if (otherFwdToV < 2.2 || oArrival + 0.45 < vArrival || (Math.abs(oArrival - vArrival) <= 0.45 && other.roadPriority < v.roadPriority)) {
                                const crossGap = fwd - hl - crossProjL - 1.4;
                                if (crossGap < effGap) {
                                    effGap = crossGap;
                                    effLeaderSpeed = 0;
                                }
                            }
                        }
                    }

                    // Yield smoothly if explorer steps onto or closely near this traffic lane
                    if (playerState) {
                        const dx = playerState.x - v.cx;
                        const dz = playerState.z - v.cz;
                        const pu = dx * v.dirX + dz * v.dirZ;
                        const plat = dx * v.perpX + dz * v.perpZ;
                        if (Math.abs(plat - v.lat) < (v.isCar ? 1.65 : 1.05)) {
                            const pedDist = pu - v.u;
                            if (pedDist > 0 && pedDist < 14.0) {
                                const pedGap = pedDist - hl - 0.60;
                                if (pedGap < effGap) {
                                    effGap = pedGap;
                                    effLeaderSpeed = 0;
                                }
                            }
                        }
                    }

                    const followGap = stopGap + v.curSpeed * 1.15;
                    let targetSpeed = v.baseSpeed;
                    if (effGap <= stopGap) {
                        targetSpeed = 0;
                    } else if (effGap < followGap) {
                        const t = (effGap - stopGap) / Math.max(0.1, followGap - stopGap);
                        targetSpeed = Math.min(v.baseSpeed, effLeaderSpeed + (v.baseSpeed - effLeaderSpeed) * t * 0.65);
                        targetSpeed = Math.max(0, targetSpeed);
                    }

                    if (targetSpeed < v.curSpeed) {
                        const decelRate = effGap <= stopGap * 0.85 ? 26.0 : 14.5;
                        v.curSpeed = Math.max(targetSpeed, v.curSpeed - decelRate * clampedDt);
                        v.isBraking = true;
                    } else {
                        v.curSpeed = Math.min(targetSpeed, v.curSpeed + 5.6 * clampedDt);
                        v.isBraking = v.curSpeed < 0.7;
                    }

                    v.u += v.curSpeed * clampedDt;
                    v.wheelSpin -= (v.curSpeed * clampedDt) / v.wheelRadius;

                    // Strict stop-line barrier clamp preventing any vehicle creeping across on Red/Yellow
                    if (activeStopU !== null) {
                        const maxStopU = activeStopU - hl - 0.35;
                        if (v.u > maxStopU) {
                            v.u = maxStopU;
                            v.curSpeed = 0;
                            v.isBraking = true;
                        }
                    }

                    // Strict bumper-to-bumper anti-penetration clamp
                    const minClearance = v.isCar ? 1.6 : 1.0;
                    if (leader) {
                        const maxU = leader.u - (hl + leader.length * 0.5 + minClearance);
                        if (v.u > maxU) {
                            v.u = maxU;
                            v.curSpeed = Math.min(v.curSpeed, leader.curSpeed);
                            v.isBraking = true;
                        }
                    }

                    if (v.u > v.maxBound) {
                        let minU = v.maxBound;
                        for (const other of list) {
                            if (other !== v && other.u < minU) minU = other.u;
                        }
                        const wrappedRearU = minU - (v.length + minClearance + 4.0);
                        v.u = Math.min(v.u - v.span, wrappedRearU);
                        v.curSpeed = Math.min(v.curSpeed, list[0].curSpeed);
                    }
                }
            }
        }

        let carBrakeDirty = false;
        let motoBrakeDirty = false;

        for (let i = 0; i < totalCars; i++) {
            const v = carUnits[i];
            const wx = v.cx + v.dirX * v.u + v.perpX * v.lat;
            const wz = v.cz + v.dirZ * v.u + v.perpZ * v.lat;
            const distEdge = Math.min(v.u - v.minBound, v.maxBound - v.u);
            const edgeFade = Math.min(1, Math.max(0.01, distEdge / 5.0));

            parentObj.position.set(wx, -0.015, wz);
            parentObj.rotation.set(0, v.yaw, 0);
            parentObj.scale.setScalar(edgeFade);
            parentObj.updateMatrix();

            carBodyInst.setMatrixAt(i, parentObj.matrix);
            carGlassInst.setMatrixAt(i, parentObj.matrix);
            carBeamInst.setMatrixAt(i, parentObj.matrix);

            for (let w = 0; w < 4; w++) {
                const [ox, oy, oz] = carWheelOffsets[w];
                setChildTransform(carWheelsInst, i * 4 + w, ox, oy, oz, v.wheelSpin);
                setChildTransform(carRimsInst, i * 4 + w, ox, oy, oz, v.wheelSpin);
            }
            const tCol = v.isBraking ? brakeColor : cruiseTailColor;
            const brakeChanged = v.lastIsBraking !== v.isBraking;
            if (brakeChanged) {
                v.lastIsBraking = v.isBraking;
                carBrakeDirty = true;
            }
            for (let l = 0; l < 2; l++) {
                const [hx, hy, hz] = headlightOffsets[l];
                setChildTransform(carHeadlightsInst, i * 2 + l, hx, hy, hz);
                const [tx, ty, tz] = taillightOffsets[l];
                setChildTransform(carTaillightsInst, i * 2 + l, tx, ty, tz);
                if (brakeChanged) carTaillightsInst.setColorAt(i * 2 + l, tCol);
            }
        }

        for (let i = 0; i < totalMotos; i++) {
            const m = motoUnits[i];
            const wx = m.cx + m.dirX * m.u + m.perpX * m.lat;
            const wz = m.cz + m.dirZ * m.u + m.perpZ * m.lat;
            const distEdge = Math.min(m.u - m.minBound, m.maxBound - m.u);
            const edgeFade = Math.min(1, Math.max(0.01, distEdge / 5.0));

            parentObj.position.set(wx, -0.015, wz);
            parentObj.rotation.set(0, m.yaw, 0);
            parentObj.scale.setScalar(edgeFade);
            parentObj.updateMatrix();

            motoBodyInst.setMatrixAt(i, parentObj.matrix);
            motoFrameInst.setMatrixAt(i, parentObj.matrix);
            motoRiderPoloInst.setMatrixAt(i, parentObj.matrix);
            motoRiderNavyInst.setMatrixAt(i, parentObj.matrix);
            motoRiderHeadInst.setMatrixAt(i, parentObj.matrix);
            motoHelmetInst.setMatrixAt(i, parentObj.matrix);
            motoBeamInst.setMatrixAt(i, parentObj.matrix);
            setChildTransform(motoHeadLightInst, i, 0.60, 0.68, 0);
            setChildTransform(motoTailLightInst, i, -0.70, 0.64, 0);
            if (m.lastIsBraking !== m.isBraking) {
                m.lastIsBraking = m.isBraking;
                motoTailLightInst.setColorAt(i, m.isBraking ? brakeColor : cruiseTailColor);
                motoBrakeDirty = true;
            }

            for (let w = 0; w < 2; w++) {
                const [ox, oy, oz] = motoWheelOffsets[w];
                setChildTransform(motoWheelsInst, i * 2 + w, ox, oy, oz, m.wheelSpin);
                setChildTransform(motoRimsInst, i * 2 + w, ox, oy, oz, m.wheelSpin);
            }
        }

        carBodyInst.instanceMatrix.needsUpdate = true;
        carGlassInst.instanceMatrix.needsUpdate = true;
        carWheelsInst.instanceMatrix.needsUpdate = true;
        carRimsInst.instanceMatrix.needsUpdate = true;
        carHeadlightsInst.instanceMatrix.needsUpdate = true;
        carTaillightsInst.instanceMatrix.needsUpdate = true;
        if (carBrakeDirty) carTaillightsInst.instanceColor.needsUpdate = true;
        motoBodyInst.instanceMatrix.needsUpdate = true;
        motoFrameInst.instanceMatrix.needsUpdate = true;
        motoWheelsInst.instanceMatrix.needsUpdate = true;
        motoRimsInst.instanceMatrix.needsUpdate = true;
        motoRiderPoloInst.instanceMatrix.needsUpdate = true;
        motoRiderNavyInst.instanceMatrix.needsUpdate = true;
        motoRiderHeadInst.instanceMatrix.needsUpdate = true;
        motoHelmetInst.instanceMatrix.needsUpdate = true;
        motoHeadLightInst.instanceMatrix.needsUpdate = true;
        motoTailLightInst.instanceMatrix.needsUpdate = true;
        if (motoBrakeDirty) motoTailLightInst.instanceColor.needsUpdate = true;

        if (isNightMode) {
            carBeamInst.instanceMatrix.needsUpdate = true;
            motoBeamInst.instanceMatrix.needsUpdate = true;

            // Direct dynamic spotlights to illuminate road surface in front of nearest vehicles
            const px = playerState ? playerState.x : 0;
            const pz = playerState ? playerState.z : 40;

            let candCount = 0;
            for (let i = 0; i < allUnits.length; i++) {
                const u = allUnits[i];
                const dx = u.wx - px;
                const dz = u.wz - pz;
                const distSq = dx * dx + dz * dz;
                if (distSq < 4900) {
                    const slot = spotCandidates[candCount++];
                    slot.unit = u;
                    slot.distSq = distSq;
                }
            }

            for (let i = 0; i < candCount - 1; i++) {
                for (let j = i + 1; j < candCount; j++) {
                    if (spotCandidates[j].distSq < spotCandidates[i].distSq) {
                        const tmpU = spotCandidates[i].unit;
                        const tmpD = spotCandidates[i].distSq;
                        spotCandidates[i].unit = spotCandidates[j].unit;
                        spotCandidates[i].distSq = spotCandidates[j].distSq;
                        spotCandidates[j].unit = tmpU;
                        spotCandidates[j].distSq = tmpD;
                    }
                }
            }

            for (let s = 0; s < spotCount; s++) {
                const spot = spotLights[s];
                if (s < candCount) {
                    const cand = spotCandidates[s];
                    const u = cand.unit;
                    const fwdOffset = u.isCar ? 2.15 : 0.62;
                    const lightY = u.isCar ? 0.62 : 0.68;
                    const targetDist = u.isCar ? 8.5 : 5.8;
                    const fx = u.wx + u.dirX * fwdOffset;
                    const fz = u.wz + u.dirZ * fwdOffset;

                    spot.position.set(fx, lightY, fz);
                    spot.target.position.set(fx + u.dirX * targetDist, 0.02, fz + u.dirZ * targetDist);
                    spot.target.updateMatrixWorld();

                    const dist = Math.sqrt(cand.distSq);
                    const edgeFade = dist > 50 ? Math.max(0, (70 - dist) / 20) : 1.0;
                    spot.intensity = (u.isCar ? 2.8 : 1.8) * edgeFade;
                    spot.visible = spot.intensity > 0.05;
                } else {
                    spot.visible = false;
                    spot.intensity = 0;
                }
            }
        } else {
            for (let s = 0; s < spotCount; s++) {
                if (spotLights[s].visible) {
                    spotLights[s].visible = false;
                    spotLights[s].intensity = 0;
                }
            }
        }
    };

    updateTraffic.setNightMode = setNightMode;

    updateTraffic.setShadowTier = (tier) => {
        const castSmall = tier !== 'low' && tier !== 'off';
        carBodyInst.castShadow = tier !== 'off';
        motoBodyInst.castShadow = castSmall;
        motoRiderPoloInst.castShadow = castSmall;
        motoRiderNavyInst.castShadow = castSmall;
    };

    // Seed initial GPU instance transforms before first frame render
    updateTraffic(0, null);
    return updateTraffic;
}
