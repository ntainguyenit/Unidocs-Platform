// Realistic animated low-poly pedestrians batched into InstancedMeshes across 3 streets and campus crosswalks
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Road definitions matching campus world coordinate systems
const ROAD_SPECS = {
    nh: { cx: -10.0, cz: 85.5, rotY: 0 },
    ltk: { cx: -116.5, cz: 16.0, rotY: -1.6106 },
    dd: { cx: -27.08, cz: -77.78, rotY: -0.4461 }
};

// Transform longitudinal U and lateral V into world coordinates without array allocation
function writeUvToWorld(road, u, v, out) {
    const ux = Math.cos(road.rotY);
    const uz = Math.sin(road.rotY);
    const px = -uz;
    const pz = ux;
    out.x = road.cx + u * ux + v * px;
    out.z = road.cz + u * uz + v * pz;
}

// Strip extraneous attributes before merging shared subparts
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

// Build merged baseball cap geometry with curved visor
function createCapGeometry() {
    const dome = new THREE.SphereGeometry(0.125, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.45);
    const visor = new THREE.BoxGeometry(0.15, 0.016, 0.10);
    visor.translate(0, 0.04, -0.11);
    visor.rotateX(-0.15);
    return mergeCleanParts([dome, visor]);
}

// Build merged leg and shoe geometry pivoting at hip joint
function createLegWithShoeGeometry() {
    const thigh = new THREE.CylinderGeometry(0.048, 0.040, 0.68, 8);
    thigh.translate(0, -0.34, 0);
    const shoe = new THREE.BoxGeometry(0.088, 0.052, 0.15);
    shoe.translate(0, -0.68, -0.02);
    return mergeCleanParts([thigh, shoe]);
}

// Build merged arm and hand geometry pivoting at shoulder joint
function createArmGeometry() {
    const arm = new THREE.CylinderGeometry(0.038, 0.032, 0.46, 8);
    arm.translate(0, -0.23, 0);
    const hand = new THREE.SphereGeometry(0.036, 6, 6);
    hand.translate(0, -0.46, 0);
    return mergeCleanParts([arm, hand]);
}

// Palette presets for Hue university students and bustling city pedestrians
const SHIRT_PALETTE = [
    0xf8fafc, // HUSC crisp white student uniform
    0x1e3a8a, // HUSC royal navy polo
    0x0284c7, // Sky blue casual shirt
    0xdc2626, // Crimson red polo
    0xeab308, // Warm sunshine yellow
    0x8b5cf6, // Hue imperial lavender purple
    0x0d9488, // Emerald teal shirt
    0xf97316, // Vibrant orange activewear
    0xec4899, // Pastel magenta shirt
    0x334155  // Modern slate casual tee
];

const PANTS_PALETTE = [
    0x1e293b, // Dark charcoal trousers
    0x334155, // Denim blue jeans
    0x78716c, // Khaki tailored pants
    0x0f172a  // Pure midnight black
];

const SKIN_PALETTE = [
    0xfcd34d, // Light warm tone
    0xfde047, // Fair golden tone
    0xfbbf24, // Sun-kissed Hue tone
    0xd97706  // Tanned tone
];

const HAIR_PALETTE = [
    0x171717, // Natural black
    0x262626, // Soft charcoal
    0x451a03  // Dark espresso brown
];

// Check whether pedestrian walk signal is active and has adequate safety duration
function isPedestrianWalkAllowed(cfg, signalState) {
    if (!signalState) return false;
    const interKey = cfg.signalIntersection || 'nh';
    const axisKey = cfg.signalAxis || 'ew';
    const inter = signalState[interKey];
    if (!inter) return false;
    const vehicleState = inter[axisKey + 'State'];
    const remainingSec = inter[axisKey + 'Sec'] ?? 0;
    // Walk is allowed only when vehicles are stopped on RED and countdown has >= 10s remaining
    return vehicleState === 'red' && remainingSec >= 10;
}

// Pedestrian roster distributing walkers along sidewalks of all 3 streets and active zebra crosswalks
const PEDESTRIAN_CONFIGS = [
    // 1. Nguyen Hue South Sidewalk (commercial side across from school gate)
    { id: 'nh-s-1', road: 'nh', u: -70, v: 10.4, uMin: -85, uMax: 130, dir: 1, speed: 1.30, headwear: 'cap', shirt: 0, pants: 0, bag: true },
    { id: 'nh-s-2', road: 'nh', u: -30, v: 10.6, uMin: -85, uMax: 130, dir: -1, speed: 1.25, headwear: 'non_la', shirt: 5, pants: 1, bag: false },
    { id: 'nh-s-3', road: 'nh', u: 15, v: 10.3, uMin: -85, uMax: 130, dir: 1, speed: 1.35, headwear: 'hair', shirt: 2, pants: 2, bag: true },
    { id: 'nh-s-4', road: 'nh', u: 60, v: 10.7, uMin: -85, uMax: 130, dir: -1, speed: 1.22, headwear: 'hair', shirt: 4, pants: 0, bag: false },
    { id: 'nh-s-5', road: 'nh', u: 105, v: 10.4, uMin: -85, uMax: 130, dir: 1, speed: 1.32, headwear: 'non_la', shirt: 6, pants: 3, bag: false },

    // 2. Nguyen Hue North Sidewalk (campus gate, tree promenade, and front fence)
    { id: 'nh-n-1', road: 'nh', u: -65, v: -10.4, uMin: -85, uMax: 125, dir: 1, speed: 1.28, headwear: 'hair', shirt: 0, pants: 0, bag: true },
    { id: 'nh-n-2', road: 'nh', u: -25, v: -10.2, uMin: -85, uMax: 125, dir: -1, speed: 1.32, headwear: 'cap', shirt: 1, pants: 1, bag: true },
    { id: 'nh-n-3', road: 'nh', u: 20, v: -10.6, uMin: -85, uMax: 125, dir: 1, speed: 1.24, headwear: 'non_la', shirt: 5, pants: 2, bag: false },
    { id: 'nh-n-4', road: 'nh', u: 70, v: -10.3, uMin: -85, uMax: 125, dir: -1, speed: 1.36, headwear: 'hair', shirt: 7, pants: 3, bag: false },
    { id: 'nh-n-5', road: 'nh', u: 110, v: -10.5, uMin: -85, uMax: 125, dir: 1, speed: 1.20, headwear: 'hair', shirt: 8, pants: 0, bag: false },

    // 3. Ly Thuong Kiet Middle East Sidewalk (flanking sports pitch and university tree fence)
    { id: 'ltk-me-1', road: 'ltk', u: -40, v: 9.5, uMin: -50, uMax: 28, dir: 1, speed: 1.28, headwear: 'hair', shirt: 0, pants: 0, bag: true },
    { id: 'ltk-me-2', road: 'ltk', u: -10, v: 9.7, uMin: -50, uMax: 28, dir: -1, speed: 1.34, headwear: 'cap', shirt: 2, pants: 2, bag: false },
    { id: 'ltk-me-3', road: 'ltk', u: 18, v: 9.4, uMin: -50, uMax: 28, dir: 1, speed: 1.26, headwear: 'hair', shirt: 4, pants: 1, bag: true },

    // 4. Ly Thuong Kiet Middle West Sidewalk (flanking Techcombank, DongA Bank, commercial promenade)
    { id: 'ltk-mw-1', road: 'ltk', u: -35, v: -9.5, uMin: -50, uMax: 28, dir: -1, speed: 1.30, headwear: 'hair', shirt: 6, pants: 1, bag: false },
    { id: 'ltk-mw-2', road: 'ltk', u: -5, v: -9.7, uMin: -50, uMax: 28, dir: 1, speed: 1.22, headwear: 'cap', shirt: 7, pants: 0, bag: true },
    { id: 'ltk-mw-3', road: 'ltk', u: 15, v: -9.3, uMin: -50, uMax: 28, dir: -1, speed: 1.35, headwear: 'non_la', shirt: 5, pants: 2, bag: false },

    // 5. Ly Thuong Kiet North Sidewalk (north of Dong Da junction, in front of Viettel building)
    { id: 'ltk-nw-1', road: 'ltk', u: 80, v: -9.5, uMin: 72, uMax: 125, dir: 1, speed: 1.30, headwear: 'hair', shirt: 1, pants: 0, bag: true },
    { id: 'ltk-nw-2', road: 'ltk', u: 110, v: -9.7, uMin: 72, uMax: 125, dir: -1, speed: 1.25, headwear: 'cap', shirt: 3, pants: 1, bag: false },
    { id: 'ltk-ne-1', road: 'ltk', u: 90, v: 9.5, uMin: 72, uMax: 125, dir: 1, speed: 1.32, headwear: 'non_la', shirt: 9, pants: 3, bag: false },

    // 6. Dong Da South-East Sidewalk (Gate 38, Nha H, and student motorbike lot)
    { id: 'dd-c-1', road: 'dd', u: -60, v: 9.4, uMin: -76, uMax: 145, dir: 1, speed: 1.32, headwear: 'hair', shirt: 0, pants: 0, bag: true },
    { id: 'dd-c-2', road: 'dd', u: -20, v: 9.6, uMin: -76, uMax: 145, dir: -1, speed: 1.26, headwear: 'cap', shirt: 1, pants: 1, bag: true },
    { id: 'dd-c-3', road: 'dd', u: 25, v: 9.3, uMin: -76, uMax: 145, dir: 1, speed: 1.38, headwear: 'hair', shirt: 3, pants: 2, bag: false },
    { id: 'dd-c-4', road: 'dd', u: 75, v: 9.5, uMin: -76, uMax: 145, dir: -1, speed: 1.24, headwear: 'non_la', shirt: 5, pants: 3, bag: false },
    { id: 'dd-c-5', road: 'dd', u: 120, v: 9.4, uMin: -76, uMax: 145, dir: 1, speed: 1.30, headwear: 'hair', shirt: 2, pants: 0, bag: true },

    // 7. Dong Da North-West Sidewalk (opposite sidewalk flanking residential area)
    { id: 'dd-w-1', road: 'dd', u: -50, v: -9.4, uMin: -76, uMax: 145, dir: -1, speed: 1.25, headwear: 'non_la', shirt: 4, pants: 1, bag: false },
    { id: 'dd-w-2', road: 'dd', u: -10, v: -9.6, uMin: -76, uMax: 145, dir: 1, speed: 1.34, headwear: 'cap', shirt: 6, pants: 0, bag: true },
    { id: 'dd-w-3', road: 'dd', u: 45, v: -9.3, uMin: -76, uMax: 145, dir: -1, speed: 1.28, headwear: 'hair', shirt: 8, pants: 2, bag: false },
    { id: 'dd-w-4', road: 'dd', u: 95, v: -9.5, uMin: -76, uMax: 145, dir: 1, speed: 1.36, headwear: 'hair', shirt: 7, pants: 3, bag: true },

    // 8. Zebra Crosswalk across Dong Da at LTK Junction (governed by Dong Da EW traffic signal)
    { id: 'dd-cw-1', road: 'dd', isCrosswalk: true, u: -86.6, v: -9.2, vMin: -9.2, vMax: 9.2, curbDist: 8.0, dir: 1, speed: 1.22, signalIntersection: 'dd', signalAxis: 'ew', headwear: 'cap', shirt: 0, pants: 1, bag: true },
    { id: 'dd-cw-2', road: 'dd', isCrosswalk: true, u: -86.6, v: 9.2, vMin: -9.2, vMax: 9.2, curbDist: 8.0, dir: -1, speed: 1.26, signalIntersection: 'dd', signalAxis: 'ew', headwear: 'hair', shirt: 2, pants: 0, bag: false },

    // 9. Zebra Crosswalk across LTK South of Dong Da Junction (governed by LTK NS traffic signal)
    { id: 'ltk-cw-s1', road: 'ltk', isCrosswalk: true, u: 35.7, v: -9.5, vMin: -9.5, vMax: 9.5, curbDist: 8.4, dir: 1, speed: 1.24, signalIntersection: 'dd', signalAxis: 'ns', headwear: 'non_la', shirt: 5, pants: 2, bag: false },
    { id: 'ltk-cw-s2', road: 'ltk', isCrosswalk: true, u: 35.7, v: 9.5, vMin: -9.5, vMax: 9.5, curbDist: 8.4, dir: -1, speed: 1.28, signalIntersection: 'dd', signalAxis: 'ns', headwear: 'hair', shirt: 1, pants: 0, bag: true },

    // 10. Zebra Crosswalk across LTK North of Dong Da Junction (governed by LTK NS traffic signal)
    { id: 'ltk-cw-n1', road: 'ltk', isCrosswalk: true, u: 64.5, v: -9.5, vMin: -9.5, vMax: 9.5, curbDist: 8.4, dir: 1, speed: 1.20, signalIntersection: 'dd', signalAxis: 'ns', headwear: 'hair', shirt: 3, pants: 1, bag: true },
    { id: 'ltk-cw-n2', road: 'ltk', isCrosswalk: true, u: 64.5, v: 9.5, vMin: -9.5, vMax: 9.5, curbDist: 8.4, dir: -1, speed: 1.25, signalIntersection: 'dd', signalAxis: 'ns', headwear: 'cap', shirt: 7, pants: 3, bag: false },

    // 11. Zebra Crosswalk across Nguyen Hue at Main Campus Gate 77 (governed by Nguyen Hue EW signal)
    { id: 'nh-cw-1', road: 'nh', isCrosswalk: true, u: -3.0, v: -10.3, vMin: -10.3, vMax: 10.3, curbDist: 8.6, dir: 1, speed: 1.22, signalIntersection: 'nh', signalAxis: 'ew', headwear: 'hair', shirt: 0, pants: 0, bag: true },
    { id: 'nh-cw-2', road: 'nh', isCrosswalk: true, u: -3.0, v: 10.3, vMin: -10.3, vMax: 10.3, curbDist: 8.6, dir: -1, speed: 1.20, signalIntersection: 'nh', signalAxis: 'ew', headwear: 'cap', shirt: 8, pants: 2, bag: false },

    // 12. Zebra Crosswalk across Nguyen Hue East of LTK Junction (governed by Nguyen Hue EW signal)
    { id: 'nh-cw-ltk', road: 'nh', isCrosswalk: true, u: -93.2, v: -10.3, vMin: -10.3, vMax: 10.3, curbDist: 8.6, dir: 1, speed: 1.25, signalIntersection: 'nh', signalAxis: 'ew', headwear: 'non_la', shirt: 6, pants: 1, bag: false },

    // 13. Zebra Crosswalk across LTK North of Nguyen Hue Junction (governed by LTK NS signal)
    { id: 'ltk-cw-nh', road: 'ltk', isCrosswalk: true, u: -58.3, v: -9.5, vMin: -9.5, vMax: 9.5, curbDist: 8.4, dir: 1, speed: 1.22, signalIntersection: 'nh', signalAxis: 'ns', headwear: 'hair', shirt: 4, pants: 0, bag: true }
];

// Initialize and manage instanced pedestrian crowd system (8 draw calls total for all 38 pedestrians)
export function createPedestrianSystem(scene, hardwareProfile = { tier: 'medium' }) {
    const tier = typeof hardwareProfile === 'string' ? hardwareProfile : (hardwareProfile?.tier || 'medium');
    const castShadows = tier === 'high';

    // Shared part geometries
    const headGeom = new THREE.SphereGeometry(0.12, 10, 8);
    const hairGeom = new THREE.SphereGeometry(0.126, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.58);
    const nonLaGeom = new THREE.ConeGeometry(0.24, 0.11, 14);
    const capGeom = createCapGeometry();
    const torsoGeom = new THREE.CylinderGeometry(0.13, 0.105, 0.48, 10);
    const backpackGeom = new THREE.BoxGeometry(0.20, 0.26, 0.10);
    const legGeom = createLegWithShoeGeometry();
    const armGeom = createArmGeometry();

    // Shared materials with per-instance colors where varied across pedestrians
    const coloredPartMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.82, metalness: 0.05 });
    const bagMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.88, metalness: 0.05 });
    const strawMat = new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.85, metalness: 0.05 });

    const total = PEDESTRIAN_CONFIGS.length;
    let bagCount = 0;
    let nonLaCount = 0;
    let capCount = 0;
    let hairCount = 0;

    // Pre-assign stable instance slots per pedestrian
    const posScratch = { x: 0, z: 0 };
    const pedestrians = PEDESTRIAN_CONFIGS.map((cfg, idx) => {
        const road = ROAD_SPECS[cfg.road];
        writeUvToWorld(road, cfg.u, cfg.v, posScratch);
        let initYaw = 0;
        if (cfg.isCrosswalk) {
            const px = -Math.sin(road.rotY) * cfg.dir;
            const pz = Math.cos(road.rotY) * cfg.dir;
            initYaw = Math.atan2(-px, -pz);
        } else {
            const ux = Math.cos(road.rotY) * cfg.dir;
            const uz = Math.sin(road.rotY) * cfg.dir;
            initYaw = Math.atan2(-ux, -uz);
        }

        const bagIdx = cfg.bag ? bagCount++ : -1;
        let headWearIdx = -1;
        if (cfg.headwear === 'non_la') headWearIdx = nonLaCount++;
        else if (cfg.headwear === 'cap') headWearIdx = capCount++;
        else headWearIdx = hairCount++;

        return {
            index: idx,
            bagIdx,
            headWearIdx,
            config: cfg,
            u: cfg.u,
            v: cfg.v,
            dir: cfg.dir,
            speed: cfg.speed,
            lastX: posScratch.x,
            lastZ: posScratch.z,
            targetYaw: initYaw,
            isWaiting: false,
            hasCrossedThisPhase: false,
            walkPhase: Math.random() * Math.PI * 2
        };
    });

    // Allocate 8 InstancedMeshes replacing ~304 individual character meshes
    const torsoInst = new THREE.InstancedMesh(torsoGeom, coloredPartMat, total);
    const headInst = new THREE.InstancedMesh(headGeom, coloredPartMat, total);
    const armInst = new THREE.InstancedMesh(armGeom, coloredPartMat, total * 2);
    const legInst = new THREE.InstancedMesh(legGeom, coloredPartMat, total * 2);
    const bagInst = bagCount > 0 ? new THREE.InstancedMesh(backpackGeom, bagMat, bagCount) : null;
    const nonLaInst = nonLaCount > 0 ? new THREE.InstancedMesh(nonLaGeom, strawMat, nonLaCount) : null;
    const capInst = capCount > 0 ? new THREE.InstancedMesh(capGeom, coloredPartMat, capCount) : null;
    const hairInst = hairCount > 0 ? new THREE.InstancedMesh(hairGeom, coloredPartMat, hairCount) : null;

    const allInsts = [torsoInst, headInst, armInst, legInst, bagInst, nonLaInst, capInst, hairInst].filter(Boolean);
    for (const inst of allInsts) {
        inst.frustumCulled = false;
        inst.castShadow = castShadows;
        inst.receiveShadow = false;
        scene.add(inst);
    }

    // Assign per-instance palette colors once at startup
    const tmpColor = new THREE.Color();
    for (let i = 0; i < pedestrians.length; i++) {
        const p = pedestrians[i];
        const cfg = p.config;
        const shirtHex = SHIRT_PALETTE[cfg.shirt % SHIRT_PALETTE.length];
        const pantsHex = PANTS_PALETTE[cfg.pants % PANTS_PALETTE.length];
        const skinHex = SKIN_PALETTE[cfg.id.charCodeAt(cfg.id.length - 1) % SKIN_PALETTE.length];
        const hairHex = HAIR_PALETTE[cfg.id.charCodeAt(0) % HAIR_PALETTE.length];

        tmpColor.setHex(shirtHex);
        torsoInst.setColorAt(i, tmpColor);

        tmpColor.setHex(skinHex);
        headInst.setColorAt(i, tmpColor);
        armInst.setColorAt(i * 2, tmpColor);
        armInst.setColorAt(i * 2 + 1, tmpColor);

        tmpColor.setHex(pantsHex);
        legInst.setColorAt(i * 2, tmpColor);
        legInst.setColorAt(i * 2 + 1, tmpColor);

        if (cfg.headwear === 'cap' && capInst) {
            capInst.setColorAt(p.headWearIdx, tmpColor);
        } else if (cfg.headwear !== 'non_la' && hairInst) {
            tmpColor.setHex(hairHex);
            hairInst.setColorAt(p.headWearIdx, tmpColor);
        }
    }
    torsoInst.instanceColor.needsUpdate = true;
    headInst.instanceColor.needsUpdate = true;
    armInst.instanceColor.needsUpdate = true;
    legInst.instanceColor.needsUpdate = true;
    if (capInst && capInst.instanceColor) capInst.instanceColor.needsUpdate = true;
    if (hairInst && hairInst.instanceColor) hairInst.instanceColor.needsUpdate = true;

    // Pooled transform objects guaranteeing zero per-frame allocations
    const rootObj = new THREE.Object3D();
    const torsoObj = new THREE.Object3D();
    const headObj = new THREE.Object3D();
    const partObj = new THREE.Object3D();
    const torsoWorldMat = new THREE.Matrix4();
    const headWorldMat = new THREE.Matrix4();
    const partWorldMat = new THREE.Matrix4();

    // Write world instance transforms for all parts of one pedestrian
    const syncPedestrianPose = (p, worldX, worldZ, yaw, torsoY, headYaw, legSwing, armSwing) => {
        const i = p.index;
        const cfg = p.config;

        rootObj.position.set(worldX, 0.015, worldZ);
        rootObj.rotation.set(0, yaw, 0);
        rootObj.updateMatrix();

        // Torso pivot
        torsoObj.position.set(0, torsoY, 0);
        torsoObj.rotation.set(0, 0, 0);
        torsoObj.updateMatrix();
        torsoWorldMat.multiplyMatrices(rootObj.matrix, torsoObj.matrix);
        torsoInst.setMatrixAt(i, torsoWorldMat);

        // Optional backpack attached to torso
        if (p.bagIdx >= 0 && bagInst) {
            partObj.position.set(0, 0, 0.13);
            partObj.rotation.set(0, 0, 0);
            partObj.updateMatrix();
            partWorldMat.multiplyMatrices(torsoWorldMat, partObj.matrix);
            bagInst.setMatrixAt(p.bagIdx, partWorldMat);
        }

        // Head pivot and headwear
        headObj.position.set(0, 0.38, 0);
        headObj.rotation.set(0, headYaw, 0);
        headObj.updateMatrix();
        headWorldMat.multiplyMatrices(torsoWorldMat, headObj.matrix);
        headInst.setMatrixAt(i, headWorldMat);

        if (cfg.headwear === 'non_la' && nonLaInst) {
            partObj.position.set(0, 0.10, 0);
            partObj.rotation.set(0, 0, 0);
            partObj.updateMatrix();
            partWorldMat.multiplyMatrices(headWorldMat, partObj.matrix);
            nonLaInst.setMatrixAt(p.headWearIdx, partWorldMat);
        } else if (cfg.headwear === 'cap' && capInst) {
            partObj.position.set(0, 0.05, 0);
            partObj.rotation.set(0, 0, 0);
            partObj.updateMatrix();
            partWorldMat.multiplyMatrices(headWorldMat, partObj.matrix);
            capInst.setMatrixAt(p.headWearIdx, partWorldMat);
        } else if (hairInst) {
            partObj.position.set(0, 0.03, 0);
            partObj.rotation.set(0, 0, 0);
            partObj.updateMatrix();
            partWorldMat.multiplyMatrices(headWorldMat, partObj.matrix);
            hairInst.setMatrixAt(p.headWearIdx, partWorldMat);
        }

        // Left and right arms swinging relative to torso pivot
        partObj.position.set(-0.165, 0.19, 0);
        partObj.rotation.set(-armSwing, 0, 0);
        partObj.updateMatrix();
        partWorldMat.multiplyMatrices(torsoWorldMat, partObj.matrix);
        armInst.setMatrixAt(i * 2, partWorldMat);

        partObj.position.set(0.165, 0.19, 0);
        partObj.rotation.set(armSwing, 0, 0);
        partObj.updateMatrix();
        partWorldMat.multiplyMatrices(torsoWorldMat, partObj.matrix);
        armInst.setMatrixAt(i * 2 + 1, partWorldMat);

        // Left and right legs swinging relative to root hip joint
        partObj.position.set(-0.075, 0.72, 0);
        partObj.rotation.set(legSwing, 0, 0);
        partObj.updateMatrix();
        partWorldMat.multiplyMatrices(rootObj.matrix, partObj.matrix);
        legInst.setMatrixAt(i * 2, partWorldMat);

        partObj.position.set(0.075, 0.72, 0);
        partObj.rotation.set(-legSwing, 0, 0);
        partObj.updateMatrix();
        partWorldMat.multiplyMatrices(rootObj.matrix, partObj.matrix);
        legInst.setMatrixAt(i * 2 + 1, partWorldMat);
    };

    // Seed initial poses cleanly before first render
    for (let i = 0; i < pedestrians.length; i++) {
        const p = pedestrians[i];
        syncPedestrianPose(p, p.lastX, p.lastZ, p.targetYaw, 0.94, 0, 0, 0);
    }
    for (const inst of allInsts) {
        inst.instanceMatrix.needsUpdate = true;
    }

    // Advance walking motion, reciprocal limb swing, and strict traffic signal compliance
    const updatePedestrians = (dt, elapsedSec = 0, signalState = null) => {
        if (dt <= 0 || dt > 0.2) return;

        for (let i = 0; i < pedestrians.length; i++) {
            const p = pedestrians[i];
            const cfg = p.config;

            let worldX = p.lastX;
            let worldZ = p.lastZ;

            if (cfg.isCrosswalk) {
                const road = ROAD_SPECS[cfg.road];
                const curbDist = cfg.curbDist || 8.4;
                const walkAllowed = isPedestrianWalkAllowed(cfg, signalState);

                // Reset phase completion latch when vehicle light is green or yellow
                if (!walkAllowed) {
                    p.hasCrossedThisPhase = false;
                }

                // Check whether pedestrian is waiting at starting curb
                const atStartCurb = (p.dir > 0 && p.v <= -curbDist) || (p.dir < 0 && p.v >= curbDist);

                if (atStartCurb && (!walkAllowed || p.hasCrossedThisPhase)) {
                    p.isWaiting = true;
                    p.v = p.dir > 0 ? cfg.vMin : cfg.vMax;
                } else {
                    p.isWaiting = false;
                    p.v += p.dir * p.speed * dt;

                    // Reached opposing curb safely
                    if (p.v >= cfg.vMax) {
                        p.v = cfg.vMax;
                        p.dir = -1;
                        p.isWaiting = true;
                        p.hasCrossedThisPhase = true;
                    } else if (p.v <= cfg.vMin) {
                        p.v = cfg.vMin;
                        p.dir = 1;
                        p.isWaiting = true;
                        p.hasCrossedThisPhase = true;
                    }
                }

                writeUvToWorld(road, cfg.u, p.v, posScratch);
                worldX = posScratch.x;
                worldZ = posScratch.z;

                // Face strictly across road in direction of crossing
                const px = -Math.sin(road.rotY) * p.dir;
                const pz = Math.cos(road.rotY) * p.dir;
                p.targetYaw = Math.atan2(-px, -pz);
            } else {
                // Sidewalk walkers patrolling strictly within sidewalk bounds
                p.isWaiting = false;
                const road = ROAD_SPECS[cfg.road];
                p.u += p.dir * p.speed * dt;
                if (p.u >= cfg.uMax) {
                    p.u = cfg.uMax;
                    p.dir = -1;
                } else if (p.u <= cfg.uMin) {
                    p.u = cfg.uMin;
                    p.dir = 1;
                }
                writeUvToWorld(road, cfg.u, p.v, posScratch);
                worldX = posScratch.x;
                worldZ = posScratch.z;

                // Tangent heading strictly aligned so character model faces forward
                const ux = Math.cos(road.rotY) * p.dir;
                const uz = Math.sin(road.rotY) * p.dir;
                p.targetYaw = Math.atan2(-ux, -uz);
            }

            p.lastX = worldX;
            p.lastZ = worldZ;

            // Animate limbs: idle standing when waiting for light, natural swinging when walking
            let torsoY;
            let headYaw;
            let legSwing;
            let armSwing;
            if (p.isWaiting) {
                legSwing = 0;
                armSwing = 0;
                torsoY = 0.94 + Math.sin(elapsedSec * 2.0 + i) * 0.005;
                headYaw = Math.sin(elapsedSec * 1.2 + i) * 0.08;
            } else {
                p.walkPhase += dt * p.speed * 4.2;
                legSwing = Math.sin(p.walkPhase) * 0.44;
                armSwing = Math.sin(p.walkPhase) * 0.36;
                torsoY = 0.94 + Math.abs(Math.sin(p.walkPhase)) * 0.035;
                headYaw = Math.sin(p.walkPhase * 0.5) * 0.08;
            }

            syncPedestrianPose(p, worldX, worldZ, p.targetYaw, torsoY, headYaw, legSwing, armSwing);
        }

        for (const inst of allInsts) {
            inst.instanceMatrix.needsUpdate = true;
        }
    };

    // Allow dynamic graphics quality switching to toggle pedestrian shadows cleanly
    updatePedestrians.setShadowTier = (nextTier) => {
        const enable = nextTier === 'high';
        for (const inst of allInsts) {
            inst.castShadow = enable;
        }
    };

    return updatePedestrians;
}
