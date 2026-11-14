// Realistic animated low-poly pedestrians bustling on sidewalks of 3 streets and campus crosswalk
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Road definitions matching campus world coordinate systems
const ROAD_SPECS = {
    nh: { cx: -10.0, cz: 85.5, rotY: 0 },
    ltk: { cx: -116.5, cz: 16.0, rotY: -1.6106 },
    dd: { cx: -27.08, cz: -77.78, rotY: -0.4461 }
};

// Transform longitudinal U and lateral V into world coordinates
function uvToWorld(road, u, v) {
    const ux = Math.cos(road.rotY);
    const uz = Math.sin(road.rotY);
    const px = -uz;
    const pz = ux;
    return [road.cx + u * ux + v * px, road.cz + u * uz + v * pz];
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

// Shared materials cache to eliminate redundant WebGL state switches
class MaterialCache {
    constructor() {
        this.cache = new Map();
    }

    get(colorHex, roughness = 0.82) {
        const key = `${colorHex}_${roughness}`;
        if (!this.cache.has(key)) {
            this.cache.set(key, new THREE.MeshStandardMaterial({
                color: colorHex,
                roughness: roughness,
                metalness: 0.05
            }));
        }
        return this.cache.get(key);
    }
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

// Pedestrian roster distributing walkers along sidewalks of all 3 streets
const PEDESTRIAN_CONFIGS = [
    // 1. Nguyen Hue South Sidewalk (commercial side across from school gate)
    { id: 'nh-s-1', road: 'nh', u: -120, v: 10.3, uMin: -138, uMax: 138, dir: 1, speed: 1.35, headwear: 'cap', shirt: 0, pants: 0, bag: true },
    { id: 'nh-s-2', road: 'nh', u: -75, v: 10.7, uMin: -138, uMax: 138, dir: -1, speed: 1.22, headwear: 'non_la', shirt: 5, pants: 1, bag: false },
    { id: 'nh-s-3', road: 'nh', u: -30, v: 10.2, uMin: -138, uMax: 138, dir: 1, speed: 1.40, headwear: 'hair', shirt: 2, pants: 2, bag: true },
    { id: 'nh-s-4', road: 'nh', u: 15, v: 10.6, uMin: -138, uMax: 138, dir: -1, speed: 1.28, headwear: 'hair', shirt: 4, pants: 0, bag: false },
    { id: 'nh-s-5', road: 'nh', u: 55, v: 10.3, uMin: -138, uMax: 138, dir: 1, speed: 1.32, headwear: 'non_la', shirt: 6, pants: 3, bag: false },
    { id: 'nh-s-6', road: 'nh', u: 95, v: 10.8, uMin: -138, uMax: 138, dir: -1, speed: 1.25, headwear: 'cap', shirt: 1, pants: 1, bag: true },
    { id: 'nh-s-7', road: 'nh', u: 130, v: 10.4, uMin: -138, uMax: 138, dir: -1, speed: 1.38, headwear: 'hair', shirt: 3, pants: 0, bag: false },

    // 2. Nguyen Hue North Sidewalk (campus gate, tree promenade, and front fence)
    { id: 'nh-n-1', road: 'nh', u: -110, v: -10.4, uMin: -130, uMax: 130, dir: 1, speed: 1.30, headwear: 'hair', shirt: 0, pants: 0, bag: true },
    { id: 'nh-n-2', road: 'nh', u: -70, v: -10.2, uMin: -130, uMax: 130, dir: -1, speed: 1.26, headwear: 'cap', shirt: 1, pants: 1, bag: true },
    { id: 'nh-n-3', road: 'nh', u: -35, v: -10.6, uMin: -130, uMax: 130, dir: 1, speed: 1.36, headwear: 'non_la', shirt: 5, pants: 2, bag: false },
    { id: 'nh-n-4', road: 'nh', u: -5, v: -10.3, uMin: -130, uMax: 130, dir: -1, speed: 1.20, headwear: 'hair', shirt: 0, pants: 0, bag: true },
    { id: 'nh-n-5', road: 'nh', u: 35, v: -10.7, uMin: -130, uMax: 130, dir: 1, speed: 1.42, headwear: 'hair', shirt: 7, pants: 3, bag: false },
    { id: 'nh-n-6', road: 'nh', u: 75, v: -10.3, uMin: -130, uMax: 130, dir: -1, speed: 1.24, headwear: 'cap', shirt: 2, pants: 1, bag: true },
    { id: 'nh-n-7', road: 'nh', u: 115, v: -10.5, uMin: -130, uMax: 130, dir: 1, speed: 1.34, headwear: 'hair', shirt: 8, pants: 0, bag: false },

    // 3. Nguyen Hue Zebra Crosswalk at Main Gate (pedestrians crossing road safely)
    { id: 'nh-cw-1', road: 'nh-cross', u: -2.2, v: -9.8, vMin: -10.3, vMax: 10.3, dir: 1, speed: 1.18, headwear: 'hair', shirt: 0, pants: 0, bag: true },
    { id: 'nh-cw-2', road: 'nh-cross', u: -2.8, v: 9.5, vMin: -10.3, vMax: 10.3, dir: -1, speed: 1.22, headwear: 'cap', shirt: 3, pants: 1, bag: false },

    // 4. Ly Thuong Kiet East Sidewalk (flanking soccer pitch and university tree fence)
    { id: 'ltk-e-1', road: 'ltk', u: -70, v: -9.5, uMin: -85, uMax: 75, dir: 1, speed: 1.30, headwear: 'hair', shirt: 0, pants: 0, bag: true },
    { id: 'ltk-e-2', road: 'ltk', u: -35, v: -9.8, uMin: -85, uMax: 75, dir: -1, speed: 1.25, headwear: 'cap', shirt: 2, pants: 2, bag: false },
    { id: 'ltk-e-3', road: 'ltk', u: 0, v: -9.3, uMin: -85, uMax: 75, dir: 1, speed: 1.38, headwear: 'hair', shirt: 4, pants: 1, bag: true },
    { id: 'ltk-e-4', road: 'ltk', u: 35, v: -9.6, uMin: -85, uMax: 75, dir: -1, speed: 1.22, headwear: 'non_la', shirt: 5, pants: 3, bag: false },
    { id: 'ltk-e-5', road: 'ltk', u: 65, v: -9.4, uMin: -85, uMax: 75, dir: 1, speed: 1.34, headwear: 'hair', shirt: 1, pants: 0, bag: true },

    // 5. Ly Thuong Kiet West Sidewalk (opposite residential sidewalk)
    { id: 'ltk-w-1', road: 'ltk', u: -60, v: 9.5, uMin: -85, uMax: 80, dir: -1, speed: 1.28, headwear: 'hair', shirt: 6, pants: 1, bag: false },
    { id: 'ltk-w-2', road: 'ltk', u: -20, v: 9.7, uMin: -85, uMax: 80, dir: 1, speed: 1.35, headwear: 'cap', shirt: 7, pants: 0, bag: true },
    { id: 'ltk-w-3', road: 'ltk', u: 25, v: 9.3, uMin: -85, uMax: 80, dir: -1, speed: 1.20, headwear: 'non_la', shirt: 5, pants: 2, bag: false },
    { id: 'ltk-w-4', road: 'ltk', u: 60, v: 9.6, uMin: -85, uMax: 80, dir: 1, speed: 1.32, headwear: 'hair', shirt: 9, pants: 3, bag: false },

    // 6. Dong Da Campus Sidewalk (Gate 38, Nha H, and student motorbike lot)
    { id: 'dd-c-1', road: 'dd', u: -90, v: 9.3, uMin: -105, uMax: 105, dir: 1, speed: 1.32, headwear: 'hair', shirt: 0, pants: 0, bag: true },
    { id: 'dd-c-2', road: 'dd', u: -50, v: 9.5, uMin: -105, uMax: 105, dir: -1, speed: 1.26, headwear: 'cap', shirt: 1, pants: 1, bag: true },
    { id: 'dd-c-3', road: 'dd', u: -10, v: 9.2, uMin: -105, uMax: 105, dir: 1, speed: 1.40, headwear: 'hair', shirt: 3, pants: 2, bag: false },
    { id: 'dd-c-4', road: 'dd', u: 40, v: 9.6, uMin: -105, uMax: 105, dir: -1, speed: 1.22, headwear: 'non_la', shirt: 5, pants: 3, bag: false },
    { id: 'dd-c-5', road: 'dd', u: 85, v: 9.4, uMin: -105, uMax: 105, dir: 1, speed: 1.36, headwear: 'hair', shirt: 2, pants: 0, bag: true },

    // 7. Dong Da North-West Sidewalk (opposite sidewalk flanking residential area)
    { id: 'dd-w-1', road: 'dd', u: -80, v: -9.3, uMin: -105, uMax: 105, dir: -1, speed: 1.24, headwear: 'non_la', shirt: 4, pants: 1, bag: false },
    { id: 'dd-w-2', road: 'dd', u: -30, v: -9.5, uMin: -105, uMax: 105, dir: 1, speed: 1.34, headwear: 'cap', shirt: 6, pants: 0, bag: true },
    { id: 'dd-w-3', road: 'dd', u: 20, v: -9.2, uMin: -105, uMax: 105, dir: -1, speed: 1.28, headwear: 'hair', shirt: 8, pants: 2, bag: false },
    { id: 'dd-w-4', road: 'dd', u: 70, v: -9.6, uMin: -105, uMax: 105, dir: 1, speed: 1.30, headwear: 'hair', shirt: 7, pants: 3, bag: true }
];

// Initialize and manage pedestrian crowd system across 3 campus streets
export function createPedestrianSystem(scene, hardwareProfile = 'medium') {
    const matCache = new MaterialCache();

    // Reusable shared geometries eliminating duplicate geometry allocations
    const headGeom = new THREE.SphereGeometry(0.12, 10, 8);
    const hairGeom = new THREE.SphereGeometry(0.126, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.58);
    const nonLaGeom = new THREE.ConeGeometry(0.24, 0.11, 14);
    const capGeom = createCapGeometry();
    const torsoGeom = new THREE.CylinderGeometry(0.13, 0.105, 0.48, 10);
    const backpackGeom = new THREE.BoxGeometry(0.20, 0.26, 0.10);
    const legGeom = createLegWithShoeGeometry();
    const armGeom = createArmGeometry();

    const castShadows = hardwareProfile !== 'low';

    // Construct individual modular pedestrian mesh hierarchy
    function buildPedestrianCharacter(cfg) {
        const root = new THREE.Group();
        root.name = `pedestrian_${cfg.id}`;

        const shirtMat = matCache.get(SHIRT_PALETTE[cfg.shirt]);
        const pantsMat = matCache.get(PANTS_PALETTE[cfg.pants]);
        const skinMat = matCache.get(SKIN_PALETTE[cfg.id.charCodeAt(cfg.id.length - 1) % SKIN_PALETTE.length]);
        const hairMat = matCache.get(HAIR_PALETTE[cfg.id.charCodeAt(0) % HAIR_PALETTE.length]);

        // Torso pivot node accommodating natural walking bobbing motion
        const torsoPivot = new THREE.Group();
        torsoPivot.position.set(0, 0.94, 0);

        const torsoMesh = new THREE.Mesh(torsoGeom, shirtMat);
        torsoMesh.castShadow = castShadows;
        torsoMesh.position.set(0, 0, 0);
        torsoPivot.add(torsoMesh);

        // Optional student backpack attached to posterior torso
        if (cfg.bag) {
            const bagMesh = new THREE.Mesh(backpackGeom, matCache.get(0x1e293b, 0.88));
            bagMesh.position.set(0, 0, 0.13);
            bagMesh.castShadow = castShadows;
            torsoPivot.add(bagMesh);
        }

        // Head and neck assembly
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.38, 0);

        const headMesh = new THREE.Mesh(headGeom, skinMat);
        headMesh.castShadow = castShadows;
        headGroup.add(headMesh);

        // Add characteristic headwear (Vietnamese non la, baseball cap, or styled hair)
        if (cfg.headwear === 'non_la') {
            const strawMat = matCache.get(0xfde047, 0.85);
            const nonLa = new THREE.Mesh(nonLaGeom, strawMat);
            nonLa.position.set(0, 0.10, 0);
            nonLa.castShadow = castShadows;
            headGroup.add(nonLa);
        } else if (cfg.headwear === 'cap') {
            const capMat = matCache.get(PANTS_PALETTE[cfg.pants % PANTS_PALETTE.length]);
            const cap = new THREE.Mesh(capGeom, capMat);
            cap.position.set(0, 0.05, 0);
            cap.castShadow = castShadows;
            headGroup.add(cap);
        } else {
            const hair = new THREE.Mesh(hairGeom, hairMat);
            hair.position.set(0, 0.03, 0);
            hair.castShadow = castShadows;
            headGroup.add(hair);
        }
        torsoPivot.add(headGroup);

        // Left and right swing arms pivoting at shoulders
        const leftArm = new THREE.Mesh(armGeom, skinMat);
        leftArm.position.set(-0.165, 0.19, 0);
        leftArm.castShadow = castShadows;
        torsoPivot.add(leftArm);

        const rightArm = new THREE.Mesh(armGeom, skinMat);
        rightArm.position.set(0.165, 0.19, 0);
        rightArm.castShadow = castShadows;
        torsoPivot.add(rightArm);

        root.add(torsoPivot);

        // Left and right legs pivoting at pelvic joints
        const leftLeg = new THREE.Mesh(legGeom, pantsMat);
        leftLeg.position.set(-0.075, 0.72, 0);
        leftLeg.castShadow = castShadows;
        root.add(leftLeg);

        const rightLeg = new THREE.Mesh(legGeom, pantsMat);
        rightLeg.position.set(0.075, 0.72, 0);
        rightLeg.castShadow = castShadows;
        root.add(rightLeg);

        return {
            root,
            torsoPivot,
            headGroup,
            leftArm,
            rightArm,
            leftLeg,
            rightLeg,
            config: cfg,
            u: cfg.u,
            v: cfg.v,
            dir: cfg.dir,
            speed: cfg.speed,
            walkPhase: Math.random() * Math.PI * 2
        };
    }

    // Build all pedestrian instances and attach to scene
    const pedestrians = PEDESTRIAN_CONFIGS.map((cfg) => {
        const p = buildPedestrianCharacter(cfg);
        scene.add(p.root);
        return p;
    });

    // Advance walking motion, reciprocal limb swing, and boundaries every frame
    return function updatePedestrians(dt, elapsedSec = 0) {
        if (dt <= 0 || dt > 0.2) return;

        for (let i = 0; i < pedestrians.length; i++) {
            const p = pedestrians[i];
            const cfg = p.config;

            let worldX = 0;
            let worldZ = 0;
            let targetYaw = 0;

            if (cfg.road === 'nh-cross') {
                // Crosswalk walkers crossing between sidewalks
                p.v += p.dir * p.speed * dt;
                if (p.v >= cfg.vMax) {
                    p.v = cfg.vMax;
                    p.dir = -1;
                } else if (p.v <= cfg.vMin) {
                    p.v = cfg.vMin;
                    p.dir = 1;
                }
                const road = ROAD_SPECS.nh;
                const pos = uvToWorld(road, p.u, p.v);
                worldX = pos[0];
                worldZ = pos[1];

                // Lateral heading perpendicular to road axis
                targetYaw = p.dir > 0 ? 0 : Math.PI;
            } else {
                // Sidewalk walkers patrolling along road axis
                const road = ROAD_SPECS[cfg.road];
                p.u += p.dir * p.speed * dt;
                if (p.u >= cfg.uMax) {
                    p.u = cfg.uMax;
                    p.dir = -1;
                } else if (p.u <= cfg.uMin) {
                    p.u = cfg.uMin;
                    p.dir = 1;
                }
                const pos = uvToWorld(road, p.u, p.v);
                worldX = pos[0];
                worldZ = pos[1];

                // Tangent heading aligned with street longitudinal orientation
                const ux = Math.cos(road.rotY) * p.dir;
                const uz = Math.sin(road.rotY) * p.dir;
                targetYaw = Math.atan2(ux, uz) + Math.PI;
            }

            // Stand flush on sidewalk top surface
            p.root.position.set(worldX, 0.015, worldZ);
            p.root.rotation.y = targetYaw;

            // Animate natural reciprocal gait cycle
            p.walkPhase += dt * p.speed * 4.2;
            const legSwing = Math.sin(p.walkPhase) * 0.44;
            const armSwing = Math.sin(p.walkPhase) * 0.36;

            p.leftLeg.rotation.x = legSwing;
            p.rightLeg.rotation.x = -legSwing;
            p.leftArm.rotation.x = -armSwing;
            p.rightArm.rotation.x = armSwing;

            // Natural vertical bounce and gentle head gaze
            p.torsoPivot.position.y = 0.94 + Math.abs(Math.sin(p.walkPhase)) * 0.035;
            p.headGroup.rotation.y = Math.sin(p.walkPhase * 0.5) * 0.08;
        }
    };
}
