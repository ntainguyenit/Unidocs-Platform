// Dynamic lighting, sky dome, crisp textures, schematic gardens, signage, and animated GPU wind foliage
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { TREE_PLACEMENTS, TELEPORT_PADS, CAMPUS_LOCATIONS } from './world-data.js';
import { drawHuscShield } from './student-avatar.js';
import { createRoadTrafficSystem } from './traffic-system.js';
import { createSmartIntersectionSystem } from './traffic-lights.js';
import { createAirspaceSystem } from './airspace-system.js';
import { createRooftopFireworks } from './fireworks-system.js';
import { createPedestrianSystem } from './pedestrian-system.js';

// Create crisp white 2:1 horizontal rectangular ceramic tile color & bump maps matching real Gate Tower
function createCeramicTileTextures(maxAnisotropy = 4) {
    const size = 256;
    const tileH = 128;
    const grout = 7;

    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d');

    ctx.fillStyle = '#6c737d';
    ctx.fillRect(0, 0, size, size);

    for (let row = 0; row < 2; row++) {
        const y0 = row * tileH;
        const grad = ctx.createLinearGradient(grout, y0 + grout, size, y0 + tileH);
        grad.addColorStop(0, row === 0 ? '#ffffff' : '#fafcff');
        grad.addColorStop(0.55, '#f8fafc');
        grad.addColorStop(1, '#eef2f6');
        ctx.fillStyle = grad;
        ctx.fillRect(grout, y0 + grout, size - grout, tileH - grout);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(grout, y0 + grout, size - grout, 2);
        ctx.fillRect(grout, y0 + grout, 2, tileH - grout);
        ctx.fillStyle = 'rgba(100, 116, 139, 0.28)';
        ctx.fillRect(grout, y0 + tileH - 2, size - grout, 2);
        ctx.fillRect(size - 2, y0 + grout, 2, tileH - grout);
    }

    const colorTex = new THREE.CanvasTexture(c);
    colorTex.colorSpace = THREE.SRGBColorSpace;
    colorTex.wrapS = THREE.RepeatWrapping;
    colorTex.wrapT = THREE.RepeatWrapping;
    colorTex.anisotropy = Math.min(8, maxAnisotropy);

    const bc = document.createElement('canvas');
    bc.width = size;
    bc.height = size;
    const bctx = bc.getContext('2d');
    bctx.fillStyle = '#383838';
    bctx.fillRect(0, 0, size, size);
    bctx.fillStyle = '#ffffff';
    for (let row = 0; row < 2; row++) {
        bctx.fillRect(grout, row * tileH + grout, size - grout, tileH - grout);
    }

    const bumpTex = new THREE.CanvasTexture(bc);
    bumpTex.wrapS = THREE.RepeatWrapping;
    bumpTex.wrapT = THREE.RepeatWrapping;
    bumpTex.anisotropy = Math.min(8, maxAnisotropy);

    return { colorTex, bumpTex };
}

// Upgrade named GLB materials (e.g. GateCeramicTile) with crisp procedural PBR detail maps
export function applyCampusMaterialEnhancements(campusModel, maxAnisotropy = 4) {
    let tileTextures = null;
    const upgraded = new Set();
    campusModel.traverse((obj) => {
        if (!obj.isMesh || !obj.material) return;
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        for (const m of mats) {
            if (m && m.name === 'GateCeramicTile' && !upgraded.has(m)) {
                if (!tileTextures) tileTextures = createCeramicTileTextures(maxAnisotropy);
                m.color.setHex(0xffffff);
                m.map = tileTextures.colorTex;
                m.bumpMap = tileTextures.bumpTex;
                m.bumpScale = 0.022;
                m.roughness = 0.42;
                m.metalness = 0.04;
                m.emissive.setHex(0xf1f5f9);
                m.emissiveIntensity = 0.08;
                m.needsUpdate = true;
                upgraded.add(m);
            }
        }
    });
}

// Create procedural crisp foliage cluster texture scaled cleanly to GPU capability tier
function createLeafClusterTexture(size = 512, maxAnisotropy = 4) {
    const scale = size / 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.scale(scale, scale);

    // Draw twig stems from center outwards
    ctx.strokeStyle = '#3b4e22';
    ctx.lineWidth = 4;
    for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2 + 0.25;
        ctx.beginPath();
        ctx.moveTo(256, 256);
        ctx.lineTo(256 + Math.cos(ang) * 165, 256 + Math.sin(ang) * 165);
        ctx.stroke();
    }

    // Seeded pseudo-random helper for deterministic sharp botanical leaves
    let seed = 42;
    const rand = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
    };

    const leafColors = ['#1f5f29', '#2b7333', '#36853c', '#459642', '#26682c', '#54a348'];

    for (let i = 0; i < 68; i++) {
        const ring = i < 20 ? 0.25 + rand() * 0.22 : 0.45 + rand() * 0.40;
        const angle = rand() * Math.PI * 2;
        const dist = ring * 185;
        const cx = 256 + Math.cos(angle) * dist;
        const cy = 256 + Math.sin(angle) * dist;
        const leafRot = angle + (rand() - 0.5) * 1.1;
        const lw = 28 + rand() * 24;
        const lh = 13 + rand() * 10;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(leafRot);

        // Pointed ovate leaf silhouette
        ctx.beginPath();
        ctx.moveTo(-lw * 0.55, 0);
        ctx.quadraticCurveTo(-lw * 0.05, -lh, lw * 0.58, 0);
        ctx.quadraticCurveTo(-lw * 0.05, lh, -lw * 0.55, 0);
        ctx.closePath();

        ctx.fillStyle = leafColors[Math.floor(rand() * leafColors.length)];
        ctx.fill();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = '#18471f';
        ctx.stroke();

        // Crisp center vein highlight
        ctx.beginPath();
        ctx.moveTo(-lw * 0.45, 0);
        ctx.lineTo(lw * 0.42, 0);
        ctx.strokeStyle = 'rgba(182, 224, 128, 0.55)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
    }
    ctx.restore();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = Math.min(4, maxAnisotropy);
    return tex;
}

// Create branching tree trunk geometry (merged main trunk plus upper limbs)
function createBranchingTrunkGeometry() {
    const parts = [];
    const mainTrunk = new THREE.CylinderGeometry(0.24, 0.42, 4.4, 7);
    mainTrunk.translate(0, 2.2, 0);
    parts.push(mainTrunk);

    const branchConfigs = [
        { rx: 0.48, rz: 0.36, y: 4.1, len: 2.8, r1: 0.11, r2: 0.18 },
        { rx: -0.45, rz: 0.42, y: 4.3, len: 2.7, r1: 0.10, r2: 0.17 },
        { rx: 0.38, rz: -0.48, y: 4.0, len: 2.9, r1: 0.10, r2: 0.17 },
        { rx: -0.36, rz: -0.40, y: 4.5, len: 2.4, r1: 0.09, r2: 0.15 }
    ];

    for (const cfg of branchConfigs) {
        const b = new THREE.CylinderGeometry(cfg.r1, cfg.r2, cfg.len, 5);
        b.translate(0, cfg.len * 0.5, 0);
        b.rotateX(cfg.rx);
        b.rotateZ(cfg.rz);
        b.translate(0, cfg.y, 0);
        parts.push(b);
    }

    const merged = mergeGeometries(parts, false);
    parts.forEach((p) => p.dispose());
    return merged;
}

// Build sphere-distributed crisp leaf cluster card geometry scaled cleanly per quality tier
function createCanopyCardClusterGeometry(cardCount = 34, cardSize = 3.2) {
    const cards = [];
    const cardGeom = new THREE.PlaneGeometry(cardSize, cardSize);
    const dummy = new THREE.Object3D();
    const crownCenter = new THREE.Vector3(0, 5.1, 0);

    // Distribute multi-angle botanical foliage planes around upper boughs
    let seed = 109;
    const rand = () => {
        seed = (seed * 48271) % 2147483647;
        return (seed - 1) / 2147483646;
    };

    for (let i = 0; i < cardCount; i++) {
        const theta = (i / cardCount) * Math.PI * 2 * 2.6;
        const phi = 0.22 + rand() * 1.18;
        const rad = 0.95 + rand() * 1.72;
        const x = Math.sin(phi) * Math.cos(theta) * rad * 1.12;
        const y = 5.4 + Math.cos(phi) * rad * 0.85 + (rand() - 0.3) * 0.6;
        const z = Math.sin(phi) * Math.sin(theta) * rad * 1.12;

        dummy.position.set(x, y, z);
        dummy.lookAt(x * 2.5, y + 1.8, z * 2.5);
        dummy.rotateZ(rand() * Math.PI * 2);
        const s = 0.78 + rand() * 0.45;
        dummy.scale.set(s, s, s);
        dummy.updateMatrix();

        const cloned = cardGeom.clone();
        cloned.applyMatrix4(dummy.matrix);

        // Gently bend card vertex normals radially outward from crown center for soft self-shading
        const pos = cloned.attributes.position;
        const norm = cloned.attributes.normal;
        const v = new THREE.Vector3();
        for (let k = 0; k < pos.count; k++) {
            v.fromBufferAttribute(pos, k).sub(crownCenter).normalize();
            norm.setXYZ(k, v.x, Math.max(0.2, v.y), v.z);
        }
        norm.needsUpdate = true;
        cards.push(cloned);
    }

    cardGeom.dispose();
    const merged = mergeGeometries(cards, false);
    cards.forEach((c) => c.dispose());
    return merged;
}

// Create instanced GPU-animated foliage and trunks across campus lawns
function createCampusVegetation(scene, windUniform, hardwareProfile = { tier: 'high', maxAnisotropy: 4 }) {
    const canopyTrees = TREE_PLACEMENTS.filter((t) => t.kind === 'canopy');
    const conifers = TREE_PLACEMENTS.filter((t) => t.kind === 'conifer');
    const tier = hardwareProfile.tier || 'high';
    const maxAniso = hardwareProfile.maxAnisotropy || 4;

    const leafTex = createLeafClusterTexture(tier === 'low' ? 256 : 512, maxAniso);
    const trunkGeom = createBranchingTrunkGeometry();
    const cardCount = tier === 'low' ? 16 : (tier === 'medium' ? 24 : 34);
    const cardSize = tier === 'low' ? 3.55 : (tier === 'medium' ? 3.35 : 3.2);
    const canopyGeom = createCanopyCardClusterGeometry(cardCount, cardSize);

    const trunkMat = new THREE.MeshStandardMaterial({
        color: 0x5d4129,
        roughness: 0.92,
        metalness: 0.02
    });

    const leafMat = new THREE.MeshStandardMaterial({
        map: leafTex,
        alphaTest: 0.42,
        side: THREE.DoubleSide,
        roughness: 0.68,
        metalness: 0.02
    });

    // Inject GPU vertex shader wind sway respecting instance matrix phase
    leafMat.onBeforeCompile = (shader) => {
        shader.uniforms.uWindTime = windUniform;
        shader.vertexShader = 'uniform float uWindTime;\n' + shader.vertexShader;
        shader.vertexShader = shader.vertexShader.replace(
            '#include <begin_vertex>',
            `#include <begin_vertex>
            float worldPhase = 0.0;
            #ifdef USE_INSTANCING
                worldPhase = instanceMatrix[3][0] * 0.35 + instanceMatrix[3][2] * 0.27;
            #endif
            float gustHeight = clamp((position.y - 3.2) * 0.28, 0.0, 1.3);
            transformed.x += sin(uWindTime * 1.9 + worldPhase + position.y * 0.5) * 0.14 * gustHeight;
            transformed.z += cos(uWindTime * 1.5 + worldPhase * 1.3 + position.x * 0.4) * 0.11 * gustHeight;`
        );
    };

    // Custom depth material ensures directional shadows cast crisp speckled leaf shapes
    const leafDepthMat = new THREE.MeshDepthMaterial({
        depthPacking: THREE.RGBADepthPacking,
        map: leafTex,
        alphaTest: 0.42
    });
    leafDepthMat.onBeforeCompile = leafMat.onBeforeCompile;

    const trunkInst = new THREE.InstancedMesh(trunkGeom, trunkMat, canopyTrees.length);
    const leafInst = new THREE.InstancedMesh(canopyGeom, leafMat, canopyTrees.length);
    leafInst.customDepthMaterial = leafDepthMat;
    trunkInst.castShadow = true;
    trunkInst.receiveShadow = false;
    // Skip alpha-discard depth pass on low/medium GPUs to preserve TBDR early-Z fillrate
    leafInst.castShadow = tier === 'high';
    leafInst.receiveShadow = true;

    const dummy = new THREE.Object3D();
    canopyTrees.forEach((t, idx) => {
        dummy.position.set(t.x, 0, t.z);
        dummy.rotation.set(0, ((idx * 1.91) % (Math.PI * 2)), 0);
        dummy.scale.setScalar(t.scale);
        dummy.updateMatrix();
        trunkInst.setMatrixAt(idx, dummy.matrix);
        leafInst.setMatrixAt(idx, dummy.matrix);
    });
    trunkInst.instanceMatrix.needsUpdate = true;
    leafInst.instanceMatrix.needsUpdate = true;

    scene.add(trunkInst);
    scene.add(leafInst);

    // Tiered conical conifer shrubs flanking Building A steps (matching Photos 4 & 5)
    const lowerCone = new THREE.ConeGeometry(1.18, 2.7, 9);
    lowerCone.translate(0, 1.45, 0);
    const upperCone = new THREE.ConeGeometry(0.86, 2.2, 9);
    upperCone.translate(0, 2.75, 0);
    const coniferGeom = mergeGeometries([lowerCone, upperCone], false);
    lowerCone.dispose();
    upperCone.dispose();
    const coniferMat = new THREE.MeshStandardMaterial({ color: 0x24582a, roughness: 0.80 });
    const coniferInst = new THREE.InstancedMesh(coniferGeom, coniferMat, conifers.length);
    coniferInst.castShadow = true;
    coniferInst.receiveShadow = true;
    conifers.forEach((c, idx) => {
        dummy.position.set(c.x, 0, c.z);
        dummy.rotation.set(0, idx * 0.7, 0);
        dummy.scale.setScalar(c.scale);
        dummy.updateMatrix();
        coniferInst.setMatrixAt(idx, dummy.matrix);
    });
    coniferInst.instanceMatrix.needsUpdate = true;
    scene.add(coniferInst);

    // Sleek low ornamental stone planter curbs along base of Building A facade (keeping ground windows clear like Photos 4-5)
    const curbMat = new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.84 });
    const curbParts = [];
    const tmpObj = new THREE.Object3D();
    for (const [hx, hw] of [[-28.0, 15.6], [2.0, 15.6]]) {
        const g = new THREE.BoxGeometry(hw, 0.28, 1.4);
        g.translate(hx, 0.14, 16.4);
        curbParts.push(g);
    }
    const planterMesh = new THREE.Mesh(mergeGeometries(curbParts, false), curbMat);
    curbParts.forEach((g) => g.dispose());
    planterMesh.castShadow = tier !== 'low';
    planterMesh.receiveShadow = true;
    scene.add(planterMesh);

    // Small circular stone water basins at center of Front Left (-38.5, 41.5) & Front Right (13.5, 41.5) gardens
    const stoneBasinMat = new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.80 });
    const waterMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.12, metalness: 0.35 });
    const rimParts = [];
    const waterParts = [];
    for (const [bx, bz] of [[-38.5, 41.5], [13.5, 41.5]]) {
        const rim = new THREE.CylinderGeometry(2.15, 2.25, 0.55, 20);
        rim.translate(bx, 0.28, bz);
        rimParts.push(rim);

        const water = new THREE.CylinderGeometry(1.75, 1.75, 0.58, 20);
        water.translate(bx, 0.29, bz);
        waterParts.push(water);
    }
    const basinRimMesh = new THREE.Mesh(mergeGeometries(rimParts, false), stoneBasinMat);
    rimParts.forEach((g) => g.dispose());
    basinRimMesh.castShadow = tier !== 'low';
    basinRimMesh.receiveShadow = true;
    const basinWaterMesh = new THREE.Mesh(mergeGeometries(waterParts, false), waterMat);
    waterParts.forEach((g) => g.dispose());
    scene.add(basinRimMesh, basinWaterMesh);

    // Subtle stone campus garden benches (ghe da) bordering front and central plazas
    const benchGeom = new THREE.BoxGeometry(2.1, 0.45, 0.65);
    benchGeom.translate(0, 0.225, 0);
    const benchMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.72 });
    const benchSpots = [
        [-25.2, 35.0, Math.PI * 0.5], [-25.2, 48.0, Math.PI * 0.5],
        [-0.8, 35.0, Math.PI * 0.5], [-0.8, 48.0, Math.PI * 0.5],
        [-7.25, 2.0, 0], [28.0, 2.0, 0]
    ];
    const benchInst = new THREE.InstancedMesh(benchGeom, benchMat, benchSpots.length);
    benchInst.castShadow = tier === 'high';
    benchInst.receiveShadow = true;
    benchSpots.forEach(([bx, bz, rot], idx) => {
        tmpObj.position.set(bx, 0, bz);
        tmpObj.rotation.set(0, rot, 0);
        tmpObj.scale.setScalar(1);
        tmpObj.updateMatrix();
        benchInst.setMatrixAt(idx, tmpObj.matrix);
    });
    benchInst.instanceMatrix.needsUpdate = true;
    scene.add(benchInst);

    return {
        setShadowTier: (nextTier) => {
            leafInst.castShadow = nextTier === 'high';
            trunkInst.castShadow = nextTier !== 'low';
            coniferInst.castShadow = nextTier !== 'low';
            planterMesh.castShadow = nextTier !== 'low';
            basinRimMesh.castShadow = nextTier !== 'low';
            benchInst.castShadow = nextTier === 'high';
        }
    };
}

// Create rectangular banner or engraved plate CanvasTexture
function createSignTexture(lines, options = {}) {
    const {
        w = 1024,
        h = 256,
        bg = '#1f2937',
        border = null,
        color = '#fef3c7',
        subColor = '#fde68a',
        fontSizes = [68, 46],
        maxAnisotropy = 4
    } = options;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    if (bg !== 'transparent') {
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);
    } else {
        ctx.clearRect(0, 0, w, h);
    }

    if (border) {
        ctx.strokeStyle = border;
        ctx.lineWidth = 8;
        ctx.strokeRect(10, 10, w - 20, h - 20);
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const total = lines.length;
    lines.forEach((text, i) => {
        const fs = fontSizes[i] || fontSizes[fontSizes.length - 1];
        ctx.font = `800 ${fs}px Inter, system-ui, sans-serif`;
        ctx.fillStyle = i === 0 || (total === 3 && i === 1) ? color : subColor;
        const y = total === 1
            ? h * 0.5
            : h * (0.24 + (i / (total - 1)) * 0.52);
        if (bg === 'transparent') {
            ctx.lineWidth = 8;
            ctx.strokeStyle = 'rgba(255,255,255,0.85)';
            ctx.strokeText(text, w * 0.5, y);
        }
        ctx.fillText(text, w * 0.5, y);
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = Math.min(4, maxAnisotropy);
    return tex;
}

// Merge placed rectangular ground decals or planes into a single static draw call
function createMergedGroundQuads(scene, quads, material, receiveShadow = false) {
    const dummy = new THREE.Object3D();
    const parts = [];
    for (const q of quads) {
        const g = new THREE.PlaneGeometry(q.w, q.h);
        dummy.position.set(q.x, q.y, q.z);
        dummy.rotation.set(-Math.PI * 0.5, 0, q.rz || 0);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        g.applyMatrix4(dummy.matrix);
        parts.push(g);
    }
    const merged = mergeGeometries(parts, false);
    parts.forEach((p) => p.dispose());
    const mesh = new THREE.Mesh(merged, material);
    mesh.receiveShadow = receiveShadow;
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    scene.add(mesh);
    return mesh;
}

// Create crisp schematic-matched gardens, paved plaza, asphalt streets, and sports pitches
function createGroundAndGardens(scene, hardwareProfile = { tier: 'high', maxAnisotropy: 4 }) {
    const tier = hardwareProfile.tier || 'high';
    const maxAniso = hardwareProfile.maxAnisotropy || 4;
    const isLowTier = tier === 'low';
    const gardenBasePx = isLowTier ? 14 : (tier === 'medium' ? 22 : 32);
    const circularBasePx = isLowTier ? 14 : (tier === 'medium' ? 20 : 28);
    // 1. Exterior urban surround base plane
    const outerGround = new THREE.Mesh(
        new THREE.PlaneGeometry(520, 520),
        new THREE.MeshStandardMaterial({ color: 0xd5dfe8, roughness: 0.95 })
    );
    outerGround.rotation.x = -Math.PI * 0.5;
    outerGround.position.y = -0.06;
    outerGround.receiveShadow = true;
    scene.add(outerGround);

    // 2. Campus paved stone courtyard matching exact 5-corner pentagon footprint in Plan 61a14ecc
    const campusShape = new THREE.Shape();
    campusShape.moveTo(-104.0, 72.5);
    campusShape.lineTo(84.0, 72.5);
    campusShape.lineTo(84.0, -32.0);
    campusShape.lineTo(30.0, -94.0);
    campusShape.lineTo(-108.0, -28.0);
    campusShape.closePath();

    // Subtle stone paver tile texture
    const paverCanvas = document.createElement('canvas');
    paverCanvas.width = 256;
    paverCanvas.height = 256;
    const pctx = paverCanvas.getContext('2d');
    pctx.fillStyle = '#c8cfd6';
    pctx.fillRect(0, 0, 256, 256);
    pctx.strokeStyle = 'rgba(130, 142, 155, 0.25)';
    pctx.lineWidth = 2;
    for (let x = 0; x <= 256; x += 32) {
        pctx.beginPath(); pctx.moveTo(x, 0); pctx.lineTo(x, 256); pctx.stroke();
        pctx.beginPath(); pctx.moveTo(0, x); pctx.lineTo(256, x); pctx.stroke();
    }
    const paverTex = new THREE.CanvasTexture(paverCanvas);
    paverTex.wrapS = THREE.RepeatWrapping;
    paverTex.wrapT = THREE.RepeatWrapping;
    paverTex.repeat.set(0.18, 0.18);
    paverTex.colorSpace = THREE.SRGBColorSpace;

    const campusGeom = new THREE.ShapeGeometry(campusShape);
    campusGeom.rotateX(Math.PI * 0.5);
    const campusFloor = new THREE.Mesh(
        campusGeom,
        new THREE.MeshStandardMaterial({ map: paverTex, roughness: 0.88, metalness: 0.02 })
    );
    campusFloor.position.y = 0.01;
    campusFloor.receiveShadow = true;
    scene.add(campusFloor);

    // Northwest asphalt parking lot surrounding Khoa Hoa Hoc (Nha D) matching Plan 61a14ecc
    const nwLotShape = new THREE.Shape();
    nwLotShape.moveTo(-99.5, 11.5);
    nwLotShape.lineTo(-54.5, 11.5);
    nwLotShape.lineTo(-54.5, -41.5);
    nwLotShape.lineTo(-103.5, -24.5);
    nwLotShape.closePath();
    const nwLotGeom = new THREE.ShapeGeometry(nwLotShape);
    nwLotGeom.rotateX(Math.PI * 0.5);
    const nwLotMesh = new THREE.Mesh(
        nwLotGeom,
        new THREE.MeshStandardMaterial({ color: 0x6f7782, roughness: 0.88 })
    );
    nwLotMesh.position.y = 0.022;
    nwLotMesh.receiveShadow = true;
    scene.add(nwLotMesh);

    // 3. Surrounding asphalt roads, mitered curbstones, non-overlapping zebra crosswalks, stop lines, and flush sidewalks
    const roadDefs = {
        nh: { cx: -10.0, cz: 85.5, rotY: 0, w: 340, d: 17.0, curb: 0.85, uMin: -170.0, uMax: 170.0 },
        ltk: { cx: -116.5, cz: 16.0, rotY: -1.6106, w: 260, d: 16.0, curb: 0.80, uMin: -130.0, uMax: 130.0 },
        dd: { cx: -27.08, cz: -77.78, rotY: -0.4461, w: 360, d: 15.0, curb: 0.80, uMin: -180.0, uMax: 180.0 }
    };

    const uvToWorld = (road, u, v) => {
        const ux = Math.cos(road.rotY);
        const uz = Math.sin(road.rotY);
        const px = -uz;
        const pz = ux;
        return [road.cx + u * ux + v * px, road.cz + u * uz + v * pz];
    };

    const worldToUv = (road, wx, wz) => {
        const dx = wx - road.cx;
        const dz = wz - road.cz;
        const ux = Math.cos(road.rotY);
        const uz = Math.sin(road.rotY);
        const px = -uz;
        const pz = ux;
        return { u: dx * ux + dz * uz, v: dx * px + dz * pz };
    };

    const lineIntersectPt = (r1, v1, r2, v2) => {
        const d1x = Math.cos(r1.rotY);
        const d1z = Math.sin(r1.rotY);
        const p1x = -d1z;
        const p1z = d1x;
        const d2x = Math.cos(r2.rotY);
        const d2z = Math.sin(r2.rotY);
        const p2x = -d2z;
        const p2z = d2x;
        const c1x = r1.cx + v1 * p1x;
        const c1z = r1.cz + v1 * p1z;
        const c2x = r2.cx + v2 * p2x;
        const c2z = r2.cz + v2 * p2z;
        const det = d1x * (-d2z) - (-d2x) * d1z;
        const u1 = ((c2x - c1x) * (-d2z) - (-d2x) * (c2z - c1z)) / det;
        const u2 = (d1x * (c2z - c1z) - (c2x - c1x) * d1z) / det;
        return { x: c1x + u1 * d1x, z: c1z + u1 * d1z, u1, u2 };
    };

    // Build flat upward-facing ground polygon geometry strictly in XZ plane
    const buildGroundPoly = (pts, yLevel) => {
        let area = 0;
        for (let i = 0; i < pts.length; i++) {
            const [x1, z1] = pts[i];
            const [x2, z2] = pts[(i + 1) % pts.length];
            area += x1 * (-z2) - x2 * (-z1);
        }
        const ordered = area < 0 ? [...pts].reverse() : pts;
        const shape = new THREE.Shape();
        shape.moveTo(ordered[0][0], -ordered[0][1]);
        for (let i = 1; i < ordered.length; i++) {
            shape.lineTo(ordered[i][0], -ordered[i][1]);
        }
        shape.closePath();
        const geom = new THREE.ShapeGeometry(shape);
        geom.rotateX(-Math.PI * 0.5);
        geom.translate(0, yLevel, 0);
        const out = geom.index ? geom.toNonIndexed() : geom;
        if (out !== geom) geom.dispose();
        if (out.attributes.uv) out.deleteAttribute('uv');
        return out;
    };

    // Roadbed surfaces (3 clean matte dark asphalt planes stepped by 0.5mm to avoid junction Z-fighting)
    const roadAsphaltMat = new THREE.MeshStandardMaterial({ color: 0x3c4046, roughness: 0.88 });
    [
        { road: roadDefs.nh, y: -0.020 },
        { road: roadDefs.ltk, y: -0.0205 },
        { road: roadDefs.dd, y: -0.021 }
    ].forEach(({ road, y }) => {
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(road.w, road.d), roadAsphaltMat);
        mesh.rotation.x = -Math.PI * 0.5;
        mesh.rotation.z = -road.rotY;
        mesh.position.set(road.cx, y, road.cz);
        mesh.receiveShadow = true;
        scene.add(mesh);
    });

    // Exact outer corner intersections where NH x LTK and DD x LTK edges meet
    const nhHalfW = roadDefs.nh.d * 0.5;
    const ltkHalfW = roadDefs.ltk.d * 0.5;
    const ddHalfW = roadDefs.dd.d * 0.5;

    // Mitered curbstones strictly stopping at intersection mouths so zero gray band crosses any junction
    const curbGeoms = [];
    const pushMiteredCurb = (pStartOuter, pStartInner, pEndOuter, pEndInner) => {
        curbGeoms.push(buildGroundPoly([pStartOuter, pEndOuter, pEndInner, pStartInner], -0.015));
    };
    const pushRoadSideCurb = (road, vOuter, vInner, uStart, uEnd, startHit = null, endHit = null) => {
        const p0Out = startHit ? [startHit.outer.x, startHit.outer.z] : uvToWorld(road, uStart, vOuter);
        const p0In = startHit ? [startHit.inner.x, startHit.inner.z] : uvToWorld(road, uStart, vInner);
        const p1Out = endHit ? [endHit.outer.x, endHit.outer.z] : uvToWorld(road, uEnd, vOuter);
        const p1In = endHit ? [endHit.inner.x, endHit.inner.z] : uvToWorld(road, uEnd, vInner);
        pushMiteredCurb(p0Out, p0In, p1Out, p1In);
    };

    const curbHitPair = (mainRoad, vOut, vIn, crossRoad, vCross) => ({
        outer: lineIntersectPt(mainRoad, vOut, crossRoad, vCross),
        inner: lineIntersectPt(mainRoad, vIn, crossRoad, vCross)
    });

    // Nguyen Hue curbstones split around Ly Thuong Kiet
    const nhCurbIn = nhHalfW - roadDefs.nh.curb;
    const nhWestN = curbHitPair(roadDefs.nh, -nhHalfW, -nhCurbIn, roadDefs.ltk, -ltkHalfW);
    const nhEastN = curbHitPair(roadDefs.nh, -nhHalfW, -nhCurbIn, roadDefs.ltk, +ltkHalfW);
    const nhWestS = curbHitPair(roadDefs.nh, +nhHalfW, +nhCurbIn, roadDefs.ltk, -ltkHalfW);
    const nhEastS = curbHitPair(roadDefs.nh, +nhHalfW, +nhCurbIn, roadDefs.ltk, +ltkHalfW);
    pushRoadSideCurb(roadDefs.nh, -nhHalfW, -nhCurbIn, roadDefs.nh.uMin, 0, null, nhWestN);
    pushRoadSideCurb(roadDefs.nh, -nhHalfW, -nhCurbIn, 0, roadDefs.nh.uMax, nhEastN, null);
    pushRoadSideCurb(roadDefs.nh, +nhHalfW, +nhCurbIn, roadDefs.nh.uMin, 0, null, nhWestS);
    pushRoadSideCurb(roadDefs.nh, +nhHalfW, +nhCurbIn, 0, roadDefs.nh.uMax, nhEastS, null);

    // Ly Thuong Kiet curbstones split around both NH and DD
    const ltkCurbIn = ltkHalfW - roadDefs.ltk.curb;
    const ltkSwNh = curbHitPair(roadDefs.ltk, -ltkHalfW, -ltkCurbIn, roadDefs.nh, +nhHalfW);
    const ltkNwNh = curbHitPair(roadDefs.ltk, -ltkHalfW, -ltkCurbIn, roadDefs.nh, -nhHalfW);
    const ltkSwDd = curbHitPair(roadDefs.ltk, -ltkHalfW, -ltkCurbIn, roadDefs.dd, +ddHalfW);
    const ltkNwDd = curbHitPair(roadDefs.ltk, -ltkHalfW, -ltkCurbIn, roadDefs.dd, -ddHalfW);
    const ltkSeNh = curbHitPair(roadDefs.ltk, +ltkHalfW, +ltkCurbIn, roadDefs.nh, +nhHalfW);
    const ltkNeNh = curbHitPair(roadDefs.ltk, +ltkHalfW, +ltkCurbIn, roadDefs.nh, -nhHalfW);
    const ltkSeDd = curbHitPair(roadDefs.ltk, +ltkHalfW, +ltkCurbIn, roadDefs.dd, +ddHalfW);
    const ltkNeDd = curbHitPair(roadDefs.ltk, +ltkHalfW, +ltkCurbIn, roadDefs.dd, -ddHalfW);
    pushRoadSideCurb(roadDefs.ltk, -ltkHalfW, -ltkCurbIn, roadDefs.ltk.uMin, 0, null, ltkSwNh);
    pushRoadSideCurb(roadDefs.ltk, -ltkHalfW, -ltkCurbIn, 0, 0, ltkNwNh, ltkSwDd);
    pushRoadSideCurb(roadDefs.ltk, -ltkHalfW, -ltkCurbIn, 0, roadDefs.ltk.uMax, ltkNwDd, null);
    pushRoadSideCurb(roadDefs.ltk, +ltkHalfW, +ltkCurbIn, roadDefs.ltk.uMin, 0, null, ltkSeNh);
    pushRoadSideCurb(roadDefs.ltk, +ltkHalfW, +ltkCurbIn, 0, 0, ltkNeNh, ltkSeDd);
    pushRoadSideCurb(roadDefs.ltk, +ltkHalfW, +ltkCurbIn, 0, roadDefs.ltk.uMax, ltkNeDd, null);

    // Dong Da curbstones split around Ly Thuong Kiet
    const ddCurbIn = ddHalfW - roadDefs.dd.curb;
    const ddWestN = curbHitPair(roadDefs.dd, -ddHalfW, -ddCurbIn, roadDefs.ltk, -ltkHalfW);
    const ddEastN = curbHitPair(roadDefs.dd, -ddHalfW, -ddCurbIn, roadDefs.ltk, +ltkHalfW);
    const ddWestS = curbHitPair(roadDefs.dd, +ddHalfW, +ddCurbIn, roadDefs.ltk, -ltkHalfW);
    const ddEastS = curbHitPair(roadDefs.dd, +ddHalfW, +ddCurbIn, roadDefs.ltk, +ltkHalfW);
    pushRoadSideCurb(roadDefs.dd, -ddHalfW, -ddCurbIn, roadDefs.dd.uMin, 0, null, ddWestN);
    pushRoadSideCurb(roadDefs.dd, -ddHalfW, -ddCurbIn, 0, roadDefs.dd.uMax, ddEastN, null);
    pushRoadSideCurb(roadDefs.dd, +ddHalfW, +ddCurbIn, roadDefs.dd.uMin, 0, null, ddWestS);
    pushRoadSideCurb(roadDefs.dd, +ddHalfW, +ddCurbIn, 0, roadDefs.dd.uMax, ddEastS, null);

    const curbMesh = new THREE.Mesh(
        mergeGeometries(curbGeoms, false),
        new THREE.MeshStandardMaterial({ color: 0xa7b0ba, roughness: 0.88, polygonOffset: true, polygonOffsetFactor: -1 })
    );
    curbGeoms.forEach((g) => g.dispose());
    curbMesh.receiveShadow = true;
    curbMesh.matrixAutoUpdate = false;
    curbMesh.updateMatrix();
    scene.add(curbMesh);

    // Batched crisp opaque white road markings: lane dashes outside junctions, oncoming stop lines, and zebra crosswalks
    const markingQuads = [];
    const pushMarkingRect = (road, uCenter, vCenter, lenAlongU, widthAlongV) => {
        const [wx, wz] = uvToWorld(road, uCenter, vCenter);
        markingQuads.push({ x: wx, y: -0.006, z: wz, w: lenAlongU, h: widthAlongV, rz: -road.rotY });
    };
    const pushDashedStretch = (road, uFrom, uTo) => {
        const dashLen = 2.6;
        const step = 5.4;
        for (let u = uFrom + dashLen * 0.5; u + dashLen * 0.5 <= uTo + 0.001; u += step) {
            pushMarkingRect(road, u, 0, dashLen, 0.42);
        }
    };
    const pushZebraCrosswalk = (road, uCenter, barLen, maxHalfSpan, numBars = 8) => {
        const span = maxHalfSpan * 2.0;
        const barWidth = 0.62;
        const pitch = span / numBars;
        for (let i = 0; i < numBars; i++) {
            const v = -maxHalfSpan + pitch * (i + 0.5);
            pushMarkingRect(road, uCenter, v, barLen, barWidth);
        }
    };
    const pushStopLine = (road, uStop, vSign, asphaltHalfW) => {
        const innerV = 0.36;
        const outerV = asphaltHalfW - 0.30;
        const centerV = vSign * ((innerV + outerV) * 0.5);
        pushMarkingRect(road, uStop, centerV, 0.45, outerV - innerV);
    };

    // Dashed centerlines stop strictly 2.0m before every intersection stop line and skip Gate 77 crosswalk
    pushDashedStretch(roadDefs.nh, -168.0, -119.0);
    pushDashedStretch(roadDefs.nh, -88.4, -7.5);
    pushDashedStretch(roadDefs.nh, 1.5, 168.0);
    pushDashedStretch(roadDefs.ltk, -128.0, -85.55);
    pushDashedStretch(roadDefs.ltk, -53.55, 31.0);
    pushDashedStretch(roadDefs.ltk, 69.2, 128.0);
    pushDashedStretch(roadDefs.dd, -176.0, -120.7);
    pushDashedStretch(roadDefs.dd, -81.9, 176.0);

    // 8 oncoming stop lines confined strictly between road center divider and inner curb edge
    pushStopLine(roadDefs.nh, -90.4, -1, nhCurbIn);
    pushStopLine(roadDefs.nh, -117.0, +1, nhCurbIn);
    pushStopLine(roadDefs.ltk, -55.55, -1, ltkCurbIn);
    pushStopLine(roadDefs.ltk, -83.55, +1, ltkCurbIn);
    pushStopLine(roadDefs.dd, -83.9, -1, ddCurbIn);
    pushStopLine(roadDefs.dd, -118.7, +1, ddCurbIn);
    pushStopLine(roadDefs.ltk, 67.2, -1, ltkCurbIn);
    pushStopLine(roadDefs.ltk, 33.0, +1, ltkCurbIn);

    // 8 intersection zebra crosswalks + 1 Gate 77 crosswalk confined strictly within asphalt carriageways
    pushZebraCrosswalk(roadDefs.nh, -93.2, 2.9, nhCurbIn - 0.35, 8);
    pushZebraCrosswalk(roadDefs.nh, -114.2, 2.9, nhCurbIn - 0.35, 8);
    pushZebraCrosswalk(roadDefs.ltk, -58.3, 2.9, ltkCurbIn - 0.35, 8);
    pushZebraCrosswalk(roadDefs.ltk, -80.7, 2.9, ltkCurbIn - 0.35, 8);
    pushZebraCrosswalk(roadDefs.dd, -86.6, 2.8, ddCurbIn - 0.35, 7);
    pushZebraCrosswalk(roadDefs.dd, -116.0, 2.8, ddCurbIn - 0.35, 7);
    pushZebraCrosswalk(roadDefs.ltk, 64.5, 2.8, ltkCurbIn - 0.35, 8);
    pushZebraCrosswalk(roadDefs.ltk, 35.7, 2.8, ltkCurbIn - 0.35, 8);
    pushZebraCrosswalk(roadDefs.nh, -3.0, 5.4, nhCurbIn - 0.35, 8);

    const markingsMat = new THREE.MeshStandardMaterial({
        color: 0xf4f7fb,
        roughness: 0.72,
        metalness: 0.0,
        emissive: 0x334155,
        emissiveIntensity: 0.10,
        polygonOffset: true,
        polygonOffsetFactor: -2
    });
    createMergedGroundQuads(scene, markingQuads, markingsMat, true);

    // Street name painted text decals cleanly positioned along approach lanes outside junctions
    const addStreetLabels = (road, labelText, offsets) => {
        const dirX = Math.cos(road.rotY);
        const dirZ = Math.sin(road.rotY);
        const perpX = -dirZ;
        const perpZ = dirX;
        const labelTex = createSignTexture([labelText], {
            w: 1024,
            h: 160,
            bg: 'transparent',
            color: '#f1f5f9',
            fontSizes: [72],
            maxAnisotropy: maxAniso
        });
        const labelMat = new THREE.MeshBasicMaterial({
            map: labelTex,
            transparent: true,
            polygonOffset: true,
            polygonOffsetFactor: -3
        });
        for (let i = 0; i < offsets.length; i++) {
            const offset = offsets[i];
            const laneSign = i % 2 === 0 ? 1 : -1;
            const lMesh = new THREE.Mesh(new THREE.PlaneGeometry(24.0, 3.75), labelMat);
            lMesh.rotation.x = -Math.PI * 0.5;
            lMesh.rotation.z = laneSign > 0 ? -road.rotY : -road.rotY + Math.PI;
            lMesh.position.set(
                road.cx + dirX * offset + perpX * (road.d * 0.24 * laneSign),
                -0.002,
                road.cz + dirZ * offset + perpZ * (road.d * 0.24 * laneSign)
            );
            scene.add(lMesh);
        }
    };
    addStreetLabels(roadDefs.nh, 'ĐƯỜNG NGUYỄN HUỆ', [-58, 48]);
    addStreetLabels(roadDefs.ltk, 'ĐƯỜNG LÝ THƯỜNG KIỆT', [-28, 10]);
    addStreetLabels(roadDefs.dd, 'ĐƯỜNG ĐỐNG ĐA', [-54, 34]);

    // Flush corner sidewalk aprons and campus-perimeter sidewalks strictly outside outer road curbstones
    const sidewalkGeoms = [];
    const pushCornerSidewalkApron = (r1, v1Out, leg1, r2, v2Out, leg2) => {
        const c = lineIntersectPt(r1, v1Out, r2, v2Out);
        const p1 = uvToWorld(r1, c.u1 + leg1, v1Out);
        const p2 = uvToWorld(r2, c.u2 + leg2, v2Out);
        const p3 = [p1[0] + p2[0] - c.x, p1[1] + p2[1] - c.z];
        sidewalkGeoms.push(buildGroundPoly([[c.x, c.z], p1, p3, p2], 0.005));
    };

    pushCornerSidewalkApron(roadDefs.nh, -nhHalfW, -8.5, roadDefs.ltk, -ltkHalfW, +8.5);
    pushCornerSidewalkApron(roadDefs.nh, +nhHalfW, -8.5, roadDefs.ltk, -ltkHalfW, -8.5);
    pushCornerSidewalkApron(roadDefs.nh, +nhHalfW, +8.5, roadDefs.ltk, +ltkHalfW, -8.5);
    pushCornerSidewalkApron(roadDefs.dd, +ddHalfW, -8.5, roadDefs.ltk, -ltkHalfW, -8.5);
    pushCornerSidewalkApron(roadDefs.dd, -ddHalfW, -8.5, roadDefs.ltk, -ltkHalfW, +9.0);
    pushCornerSidewalkApron(roadDefs.dd, -ddHalfW, +8.5, roadDefs.ltk, +ltkHalfW, +8.5);

    const nhNePt = lineIntersectPt(roadDefs.nh, -nhHalfW, roadDefs.ltk, +ltkHalfW);
    const ddSePt = lineIntersectPt(roadDefs.dd, +ddHalfW, roadDefs.ltk, +ltkHalfW);
    const nhNeCampus = lineIntersectPt(roadDefs.nh, -13.0, roadDefs.ltk, +10.24);
    const ddSeCampus = lineIntersectPt(roadDefs.dd, +10.0, roadDefs.ltk, +10.24);
    const ddEndU = worldToUv(roadDefs.dd, 30.0, -94.0).u;

    // Exterior sidewalks flanking Nguyen Hue, Ly Thuong Kiet, and Dong Da gates strictly outside curbstones
    sidewalkGeoms.push(buildGroundPoly([
        [nhNePt.x, nhNePt.z],
        uvToWorld(roadDefs.nh, 94.0, -nhHalfW),
        uvToWorld(roadDefs.nh, 94.0, -13.1),
        uvToWorld(roadDefs.nh, nhNePt.u1, -13.1)
    ], 0.005));
    sidewalkGeoms.push(buildGroundPoly([
        [nhNePt.x, nhNePt.z],
        [ddSePt.x, ddSePt.z],
        [ddSeCampus.x, ddSeCampus.z],
        [nhNeCampus.x, nhNeCampus.z]
    ], 0.005));
    sidewalkGeoms.push(buildGroundPoly([
        [ddSePt.x, ddSePt.z],
        uvToWorld(roadDefs.dd, ddEndU, +ddHalfW),
        uvToWorld(roadDefs.dd, ddEndU, +10.1),
        [ddSeCampus.x, ddSeCampus.z]
    ], 0.005));

    const sidewalkMesh = new THREE.Mesh(
        mergeGeometries(sidewalkGeoms, false),
        new THREE.MeshStandardMaterial({ color: 0xb7c0c9, roughness: 0.90 })
    );
    sidewalkGeoms.forEach((g) => g.dispose());
    sidewalkMesh.receiveShadow = true;
    sidewalkMesh.matrixAutoUpdate = false;
    sidewalkMesh.updateMatrix();
    scene.add(sidewalkMesh);

    // 4. Orthogonal Soccer Pitch (San Bong Da) with FIFA turf markings
    const pitchCanvas = document.createElement('canvas');
    pitchCanvas.width = 512;
    pitchCanvas.height = 1024;
    const fctx = pitchCanvas.getContext('2d');
    for (let y = 0; y < 1024; y += 64) {
        fctx.fillStyle = (y / 64) % 2 === 0 ? '#3a6e39' : '#417a40';
        fctx.fillRect(0, y, 512, 64);
    }
    fctx.strokeStyle = 'rgba(255,255,255,0.88)';
    fctx.lineWidth = 6;
    fctx.strokeRect(28, 34, 456, 956);
    fctx.beginPath(); fctx.moveTo(28, 512); fctx.lineTo(484, 512); fctx.stroke();
    fctx.beginPath(); fctx.arc(256, 512, 68, 0, Math.PI * 2); fctx.stroke();
    fctx.strokeRect(128, 34, 256, 128);
    fctx.strokeRect(128, 862, 256, 128);
    fctx.font = '800 44px Inter, sans-serif';
    fctx.fillStyle = 'rgba(255,255,255,0.85)';
    fctx.textAlign = 'center';
    fctx.fillText('SÂN BÓNG ĐÁ', 256, 512);
    const pitchTex = new THREE.CanvasTexture(pitchCanvas);
    pitchTex.colorSpace = THREE.SRGBColorSpace;
    pitchTex.anisotropy = Math.min(4, maxAniso);

    const soccerPitch = new THREE.Mesh(
        new THREE.PlaneGeometry(30.0, 43.0),
        new THREE.MeshStandardMaterial({ map: pitchTex, roughness: 0.92 })
    );
    soccerPitch.rotation.x = -Math.PI * 0.5;
    soccerPitch.position.set(-75.5, 0.035, 36.5);
    soccerPitch.receiveShadow = true;
    scene.add(soccerPitch);

    // 5. Orthogonal Basketball Court (San Bong Ro) with court markings
    const bballCanvas = document.createElement('canvas');
    bballCanvas.width = 512;
    bballCanvas.height = 384;
    const bctx = bballCanvas.getContext('2d');
    bctx.fillStyle = '#8b95a2';
    bctx.fillRect(0, 0, 512, 384);
    bctx.strokeStyle = '#f8fafc';
    bctx.lineWidth = 6;
    bctx.strokeRect(24, 24, 464, 336);
    bctx.beginPath(); bctx.moveTo(256, 24); bctx.lineTo(256, 360); bctx.stroke();
    bctx.beginPath(); bctx.arc(256, 192, 48, 0, Math.PI * 2); bctx.stroke();
    bctx.strokeRect(24, 118, 92, 148);
    bctx.strokeRect(396, 118, 92, 148);
    bctx.font = '800 30px Inter, sans-serif';
    bctx.fillStyle = '#ffffff';
    bctx.textAlign = 'center';
    bctx.fillText('SÂN BÓNG RỔ', 256, 198);
    const bballTex = new THREE.CanvasTexture(bballCanvas);
    bballTex.colorSpace = THREE.SRGBColorSpace;
    const bballCourt = new THREE.Mesh(
        new THREE.PlaneGeometry(18.0, 14.0),
        new THREE.MeshStandardMaterial({ map: bballTex, roughness: 0.85 })
    );
    bballCourt.rotation.x = -Math.PI * 0.5;
    bballCourt.position.set(-31.0, 0.035, -7.5);
    bballCourt.receiveShadow = true;
    scene.add(bballCourt);

    // 6. Front Circular Gardens (Left & Right) + Inner Courtyard & Back E-H-K Circular Ring Gardens (Plan 61a14ecc)
    const drawFrontGardenCanvas = (isRight, worldW, worldD, ringWorldCx, ringWorldCz) => {
        const pxPerM = gardenBasePx;
        const geomScale = pxPerM / 32;
        const w = Math.round(worldW * pxPerM);
        const h = Math.round(worldD * pxPerM);
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#c8cfd6';
        ctx.fillRect(0, 0, w, h);
        ctx.save();
        ctx.scale(geomScale, geomScale);
        const lw = worldW * 32;
        const lh = worldD * 32;

        const drawRoundedBed = () => {
            ctx.beginPath();
            if (!isRight) {
                ctx.moveTo(76, 44);
                ctx.quadraticCurveTo(34, 44, 34, 96);
                ctx.lineTo(34, lh - 102);
                ctx.quadraticCurveTo(34, lh - 46, 86, lh - 46);
                ctx.lineTo(lw - 58, lh - 46);
                ctx.quadraticCurveTo(lw - 28, lh - 46, lw - 28, lh - 102);
                ctx.lineTo(lw - 28, 98);
                ctx.quadraticCurveTo(lw - 28, 44, lw - 82, 44);
                ctx.closePath();
            } else {
                ctx.moveTo(106, 48);
                ctx.quadraticCurveTo(44, 48, 44, 112);
                ctx.lineTo(44, lh - 110);
                ctx.quadraticCurveTo(44, lh - 48, 108, lh - 48);
                ctx.lineTo(lw - 64, lh - 48);
                ctx.quadraticCurveTo(lw - 24, lh - 48, lw - 34, lh - 108);
                ctx.lineTo(lw - 150, 104);
                ctx.quadraticCurveTo(lw - 176, 48, lw - 238, 48);
                ctx.closePath();
            }
        };

        ctx.save();
        drawRoundedBed();
        ctx.fillStyle = '#386f39';
        ctx.fill();
        ctx.lineWidth = 7;
        ctx.strokeStyle = '#69737d';
        ctx.stroke();
        ctx.restore();

        ctx.save();
        drawRoundedBed();
        ctx.clip();

        const pathColor = '#c8cfd6';
        const curbColor = '#6f7982';
        const ringCx = ringWorldCx * 32;
        const ringCy = ringWorldCz * 32;
        const ringR = 176;
        const pathW = 54;

        const strokeCurbedPath = (drawFn) => {
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = curbColor;
            ctx.lineWidth = pathW + 10;
            ctx.beginPath(); drawFn(); ctx.stroke();
            ctx.strokeStyle = pathColor;
            ctx.lineWidth = pathW;
            ctx.beginPath(); drawFn(); ctx.stroke();
        };

        strokeCurbedPath(() => {
            ctx.moveTo(ringCx, 0);
            ctx.lineTo(ringCx, ringCy - ringR + 12);
        });
        strokeCurbedPath(() => {
            ctx.moveTo(ringCx, ringCy + ringR - 12);
            ctx.lineTo(ringCx, lh);
        });

        if (isRight) {
            strokeCurbedPath(() => {
                ctx.moveTo(ringCx + ringR - 12, ringCy);
                ctx.lineTo(lw, ringCy);
            });
            strokeCurbedPath(() => {
                ctx.moveTo(ringCx, 140);
                ctx.lineTo(lw - 180, ringCy);
            });
        }

        ctx.strokeStyle = curbColor;
        ctx.lineWidth = pathW + 10;
        ctx.beginPath(); ctx.arc(ringCx, ringCy, ringR, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = pathColor;
        ctx.lineWidth = pathW;
        ctx.beginPath(); ctx.arc(ringCx, ringCy, ringR, 0, Math.PI * 2); ctx.stroke();

        ctx.restore();
        ctx.restore();
        const tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = Math.min(4, maxAniso);
        return tex;
    };

    const drawCircularGardenCanvas = (worldW, worldD, shapeKind) => {
        const pxPerM = circularBasePx;
        const geomScale = pxPerM / 28;
        const w = Math.round(worldW * pxPerM);
        const h = Math.round(worldD * pxPerM);
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#c8cfd6';
        ctx.fillRect(0, 0, w, h);
        ctx.save();
        ctx.scale(geomScale, geomScale);
        const lw = worldW * 28;
        const lh = worldD * 28;

        const drawBedPath = () => {
            ctx.beginPath();
            if (shapeKind === 'back') {
                // Tapered NE triangle between Nha H, Nha E, and Nha K
                ctx.moveTo(28, 36);
                ctx.lineTo(lw * 0.62, 26);
                ctx.lineTo(lw - 34, lh * 0.56);
                ctx.lineTo(lw - 42, lh - 28);
                ctx.lineTo(28, lh - 28);
                ctx.closePath();
            } else {
                const pad = 22;
                ctx.roundRect(pad, pad, lw - pad * 2, lh - pad * 2, 28);
            }
        };

        ctx.save();
        drawBedPath();
        ctx.fillStyle = '#3b733c';
        ctx.fill();
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#69737d';
        ctx.stroke();
        ctx.restore();

        ctx.save();
        drawBedPath();
        ctx.clip();

        const pathColor = '#c8cfd6';
        const curbColor = '#6f7982';
        const rCx = shapeKind === 'back' ? lw * 0.44 : lw * 0.5;
        const rCy = shapeKind === 'back' ? lh * 0.52 : lh * 0.5;
        const ringR = shapeKind === 'back' ? 112 : 96;
        const pathW = 40;

        const strokePath = (fn) => {
            ctx.lineCap = 'round';
            ctx.strokeStyle = curbColor;
            ctx.lineWidth = pathW + 8;
            ctx.beginPath(); fn(); ctx.stroke();
            ctx.strokeStyle = pathColor;
            ctx.lineWidth = pathW;
            ctx.beginPath(); fn(); ctx.stroke();
        };

        // Radial spokes + circular ring matching SketchUp 4dbedfd4 and Plan 61a14ecc
        strokePath(() => { ctx.moveTo(rCx, 0); ctx.lineTo(rCx, rCy - ringR + 8); });
        strokePath(() => { ctx.moveTo(rCx, rCy + ringR - 8); ctx.lineTo(rCx, lh); });
        strokePath(() => { ctx.moveTo(0, rCy); ctx.lineTo(rCx - ringR + 8, rCy); });
        strokePath(() => { ctx.moveTo(rCx + ringR - 8, rCy); ctx.lineTo(lw, rCy); });

        ctx.strokeStyle = curbColor;
        ctx.lineWidth = pathW + 8;
        ctx.beginPath(); ctx.arc(rCx, rCy, ringR, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = pathColor;
        ctx.lineWidth = pathW;
        ctx.beginPath(); ctx.arc(rCx, rCy, ringR, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
        ctx.restore();

        const tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = Math.min(4, maxAniso);
        return tex;
    };

    const leftGarden = new THREE.Mesh(
        new THREE.PlaneGeometry(27.5, 33.5),
        new THREE.MeshStandardMaterial({ map: drawFrontGardenCanvas(false, 27.5, 33.5, 13.75, 16.75), roughness: 0.90 })
    );
    leftGarden.rotation.x = -Math.PI * 0.5;
    leftGarden.position.set(-38.5, 0.032, 41.5);
    leftGarden.receiveShadow = true;
    scene.add(leftGarden);

    const rightGarden = new THREE.Mesh(
        new THREE.PlaneGeometry(47.0, 33.5),
        new THREE.MeshStandardMaterial({ map: drawFrontGardenCanvas(true, 47.0, 33.5, 14.75, 16.75), roughness: 0.90 })
    );
    rightGarden.rotation.x = -Math.PI * 0.5;
    rightGarden.position.set(22.25, 0.032, 41.5);
    rightGarden.receiveShadow = true;
    scene.add(rightGarden);

    // Inner Left, Inner Right & Back E-H-K circular courtyard gardens
    const innerLeftGarden = new THREE.Mesh(
        new THREE.PlaneGeometry(24.5, 18.0),
        new THREE.MeshStandardMaterial({ map: drawCircularGardenCanvas(24.5, 18.0, 'inner'), roughness: 0.90 })
    );
    innerLeftGarden.rotation.x = -Math.PI * 0.5;
    innerLeftGarden.position.set(-7.25, 0.032, -8.0);
    innerLeftGarden.receiveShadow = true;
    scene.add(innerLeftGarden);

    const innerRightGarden = new THREE.Mesh(
        new THREE.PlaneGeometry(36.0, 18.0),
        new THREE.MeshStandardMaterial({ map: drawCircularGardenCanvas(36.0, 18.0, 'inner'), roughness: 0.90 })
    );
    innerRightGarden.rotation.x = -Math.PI * 0.5;
    innerRightGarden.position.set(28.0, 0.032, -8.0);
    innerRightGarden.receiveShadow = true;
    scene.add(innerRightGarden);

    const backGarden = new THREE.Mesh(
        new THREE.PlaneGeometry(28.0, 24.0),
        new THREE.MeshStandardMaterial({ map: drawCircularGardenCanvas(28.0, 24.0, 'back'), roughness: 0.90 })
    );
    backGarden.rotation.x = -Math.PI * 0.5;
    backGarden.position.set(33.5, 0.032, -47.0);
    backGarden.receiveShadow = true;
    scene.add(backGarden);

    // 7. Secondary green lawn beds between Nha M and Nha H + 2x2 green bike park medians along 38 Dong Da
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x3b713b, roughness: 0.92 });
    createMergedGroundQuads(scene, [
        { x: 4.0, y: 0.028, z: -45.8, w: 18.0, h: 5.2, rz: 0 },
        { x: -32.70, y: 0.028, z: -54.92, w: 12.0, h: 2.2, rz: 0.4461 },
        { x: -31.41, y: 0.028, z: -52.22, w: 12.0, h: 2.2, rz: 0.4461 },
        { x: -18.90, y: 0.028, z: -61.52, w: 11.0, h: 2.2, rz: 0.4461 },
        { x: -17.61, y: 0.028, z: -58.82, w: 11.0, h: 2.2, rz: 0.4461 }
    ], grassMat, true);
}

// Create textured ashlar slate stone base map for gate wall foundation
function createSlateBaseTexture(maxAnisotropy = 4) {
    const w = 512;
    const h = 256;
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#1e242c';
    ctx.fillRect(0, 0, w, h);
    const rowH = 64;
    const colors = ['#38414e', '#454f5f', '#4f5b6d', '#333b47', '#3d4755', '#4a5666'];
    for (let r = 0; r < 4; r++) {
        const y = r * rowH;
        let x = (r % 2 === 0 ? 0 : -32);
        while (x < w + 64) {
            const blockW = 70 + ((x * 17 + r * 31) % 55);
            ctx.fillStyle = colors[(Math.abs(x * 7 + r * 13)) % colors.length];
            ctx.fillRect(x + 2, y + 2, blockW - 4, rowH - 4);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
            ctx.fillRect(x + 2, y + 2, blockW - 4, 3);
            x += blockW;
        }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 1);
    tex.anisotropy = Math.min(8, maxAnisotropy);
    return tex;
}

// Create authentic wide THPT Chuyên Khoa học Huế signboard texture matching Photo 1
function createHuscHighSchoolSignTexture(maxAnisotropy = 4) {
    const w = 2048;
    const h = 920;
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');

    // 1. Top Section with white background and official HUSC emblem
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, 280);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.fillRect(0, 276, w, 4);

    drawHuscShield(ctx, 175, 140, 210);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#0f3c86';
    ctx.font = '800 52px "Inter", "Segoe UI", sans-serif';
    ctx.fillText('ĐẠI HỌC HUẾ', 320, 100);
    ctx.font = '900 66px "Inter", "Segoe UI", sans-serif';
    ctx.fillText('TRƯỜNG ĐẠI HỌC KHOA HỌC', 320, 190);

    // 2. Bottom Section with deep royal navy blue background
    ctx.fillStyle = '#0f3c86';
    ctx.fillRect(0, 280, w, h - 280);

    const blueGrad = ctx.createLinearGradient(0, 280, 0, h);
    blueGrad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
    blueGrad.addColorStop(1, 'rgba(0, 0, 0, 0.20)');
    ctx.fillStyle = blueGrad;
    ctx.fillRect(0, 280, w, h - 280);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 84px "Inter", "Segoe UI", sans-serif';
    ctx.fillText('TRƯỜNG THPT CHUYÊN KHOA HỌC HUẾ', w * 0.5, 440);

    ctx.font = '800 52px "Inter", "Segoe UI", sans-serif';
    ctx.fillStyle = '#f1f5f9';
    ctx.fillText('HUSC HIGH SCHOOL FOR GIFTED STUDENTS', w * 0.5, 545);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.82)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(80, 625);
    ctx.lineTo(w - 80, 625);
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.font = '700 34px "Inter", "Segoe UI", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Website: http://thpt-khhue.thuathienhue.edu.vn', 90, 715);

    ctx.textAlign = 'right';
    ctx.fillText('Điện thoại: 0234 3898936', w - 90, 715);

    ctx.strokeStyle = 'rgba(15, 60, 134, 0.40)';
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, w - 6, h - 6);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = Math.min(8, maxAnisotropy);
    return tex;
}

// Build authentic wide left-wing gate pier, slate foundation, beam, spotlights, and Chuyên Khoa học signboard matching Photo 1
function createDongDaLeftWingGateStructure(scene, maxAniso = 4) {
    const tileTex = createCeramicTileTextures(maxAniso);
    const tileMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: tileTex.colorTex,
        bumpMap: tileTex.bumpTex,
        bumpScale: 0.022,
        roughness: 0.32,
        metalness: 0.05
    });

    const slateTex = createSlateBaseTexture(maxAniso);
    const slateMat = new THREE.MeshStandardMaterial({
        map: slateTex,
        roughness: 0.85,
        metalness: 0.05
    });

    const signTex = createHuscHighSchoolSignTexture(maxAniso);
    const signMat = new THREE.MeshStandardMaterial({
        map: signTex,
        roughness: 0.22,
        metalness: 0.08
    });

    const darkMetalMat = new THREE.MeshStandardMaterial({
        color: 0x1f242d,
        roughness: 0.45,
        metalness: 0.75
    });

    const lampLensMat = new THREE.MeshBasicMaterial({
        color: 0xfffae6
    });

    const group = new THREE.Group();

    // 1. Ashlar slate stone base under widened signboard
    const baseW = 4.82;
    const baseH = 0.80;
    const baseD = 0.48;
    const baseGeom = new THREE.BoxGeometry(baseW, baseH, baseD);
    const baseMesh = new THREE.Mesh(baseGeom, slateMat);
    baseMesh.position.set(0, baseH * 0.5, 0);
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    group.add(baseMesh);

    // 2. High School Signboard Panel (widened for high visibility)
    const signW = 4.80;
    const signH = 2.05;
    const signGeom = new THREE.PlaneGeometry(signW, signH);
    const signMesh = new THREE.Mesh(signGeom, signMat);
    signMesh.position.set(0, baseH + signH * 0.5, baseD * 0.5 + 0.015);
    group.add(signMesh);

    // Solid backing panel for signboard
    const backPanelGeom = new THREE.BoxGeometry(signW, signH, 0.16);
    const backPanelMesh = new THREE.Mesh(backPanelGeom, new THREE.MeshStandardMaterial({ color: 0x2e3440, roughness: 0.7 }));
    backPanelMesh.position.set(0, baseH + signH * 0.5, baseD * 0.5 - 0.08);
    backPanelMesh.castShadow = true;
    group.add(backPanelMesh);

    // 3. Ceramic Tiled Flanking Pillars
    const pilW = 0.60;
    const pilH = 3.35;
    const pilD = 0.62;
    const pilGeom = new THREE.BoxGeometry(pilW, pilH, pilD);

    const leftPil = new THREE.Mesh(pilGeom, tileMat);
    leftPil.position.set(-(baseW * 0.5 + pilW * 0.5), pilH * 0.5, 0.02);
    leftPil.castShadow = true;
    leftPil.receiveShadow = true;

    const rightPil = new THREE.Mesh(pilGeom, tileMat);
    rightPil.position.set(baseW * 0.5 + pilW * 0.5, pilH * 0.5, 0.02);
    rightPil.castShadow = true;
    rightPil.receiveShadow = true;
    group.add(leftPil, rightPil);

    // 4. Overhead Tiled Beam with eave overhang
    const totalW = baseW + pilW * 2 + 0.04;
    const beamH = 0.50;
    const beamD = 0.74;
    const beamGeom = new THREE.BoxGeometry(totalW, beamH, beamD);
    const beamMesh = new THREE.Mesh(beamGeom, tileMat);
    beamMesh.position.set(0, baseH + signH + beamH * 0.5, 0.06);
    beamMesh.castShadow = true;
    beamMesh.receiveShadow = true;
    group.add(beamMesh);

    // 5. Under-beam Spotlights illuminating signboard
    for (const spotX of [-1.40, 1.40]) {
        const spotGroup = new THREE.Group();
        spotGroup.position.set(spotX, baseH + signH - 0.04, baseD * 0.5 + 0.14);

        const brackGeom = new THREE.BoxGeometry(0.06, 0.08, 0.12);
        const brackMesh = new THREE.Mesh(brackGeom, darkMetalMat);
        brackMesh.position.set(0, 0.04, -0.06);

        const lampGeom = new THREE.BoxGeometry(0.22, 0.12, 0.18);
        const lampMesh = new THREE.Mesh(lampGeom, darkMetalMat);
        lampMesh.rotation.x = 0.52;
        lampMesh.position.set(0, -0.05, 0);

        const lensGeom = new THREE.PlaneGeometry(0.18, 0.09);
        const lensMesh = new THREE.Mesh(lensGeom, lampLensMat);
        lensMesh.rotation.x = -Math.PI * 0.5 + 0.52;
        lensMesh.position.set(0, -0.11, -0.03);

        spotGroup.add(brackMesh, lampMesh, lensMesh);
        group.add(spotGroup);
    }

    // 6. Top Decorative Railing above overhead beam
    const railY0 = baseH + signH + beamH;
    const barGeom = new THREE.CylinderGeometry(0.014, 0.014, totalW - 0.1, 6);
    barGeom.rotateZ(Math.PI * 0.5);
    for (let r = 0; r < 3; r++) {
        const barMesh = new THREE.Mesh(barGeom, darkMetalMat);
        barMesh.position.set(0, railY0 + 0.12 + r * 0.12, 0.06);
        group.add(barMesh);
    }
    const stanchGeom = new THREE.CylinderGeometry(0.018, 0.018, 0.44, 6);
    for (const stX of [-2.6, -1.3, 0, 1.3, 2.6]) {
        const stMesh = new THREE.Mesh(stanchGeom, darkMetalMat);
        stMesh.position.set(stX, railY0 + 0.22, 0.06);
        group.add(stMesh);
    }

    // Position group seamlessly on authentic left wing of Gate 38 Dong Da
    const gateAngle = 0.4461;
    group.rotation.y = gateAngle + Math.PI;
    group.position.set(23.35, 0, -90.88);

    scene.add(group);
}

// Add signature signage, Main Gate inscription, Dong Da Gate sign, Nha A marquee, garage roofs, and billowing flags
function createCampusSignageAndFlags(scene, hardwareProfile = { tier: 'high', maxAnisotropy: 4 }) {
    const animatedFlags = [];
    const maxAniso = hardwareProfile.maxAnisotropy || 4;
    const isLowTier = hardwareProfile.tier === 'low';

    const addBillboard = (tex, w, h, x, y, z, rotY = 0, rotX = 0, isTwoWay = false) => {
        const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.FrontSide });
        const geom = new THREE.PlaneGeometry(w, h);
        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(x, y, z);
        mesh.rotation.y = rotY;
        mesh.rotation.x = rotX;
        scene.add(mesh);

        if (isTwoWay) {
            const backMesh = new THREE.Mesh(geom, mat);
            backMesh.position.set(x, y, z);
            backMesh.rotation.y = rotY + Math.PI;
            backMesh.rotation.x = -rotX;
            scene.add(backMesh);
        }
        return mesh;
    };

    // 1. Building A Rooftop 3D Sign (TRƯỜNG ĐẠI HỌC KHOA HỌC) perched crisply on the front concrete cornice (Photos 1-5)
    const roofSignTex = createSignTexture(['TRƯỜNG ĐẠI HỌC KHOA HỌC'], {
        w: 1024, h: 144, bg: 'transparent', color: '#9f1d1b', fontSizes: [68], maxAnisotropy: maxAniso
    });
    addBillboard(roofSignTex, 18.8, 1.75, -13.0, 13.86, 15.96, 0, 0, true);

    // 2. Building A Portico Marquee Board (TRƯỜNG ĐẠI HỌC KHOA HỌC · ĐẠI HỌC HUẾ)
    const porticoTex = createSignTexture(['TRƯỜNG ĐẠI HỌC KHOA HỌC, ĐẠI HỌC HUẾ'], {
        w: 1024, h: 128, bg: '#151418', border: '#c59b41', color: '#fcd34d', fontSizes: [44], maxAnisotropy: maxAniso
    });
    addBillboard(porticoTex, 12.1, 0.82, -13.0, 5.18, 20.19);

    // 3. Main Gate Granite Monument Engraving matching exact 4 lines in Photo 5
    const gateMonumentTex = createSignTexture(
        ['ĐẠI HỌC HUẾ', 'TRƯỜNG ĐẠI HỌC KHOA HỌC', 'HUE UNIVERSITY OF SCIENCES', '77 Nguyễn Huệ, phường Thuận Hóa, TP. Huế'],
        { w: 1024, h: 352, bg: '#6b3b24', border: '#c28b42', color: '#fbbf24', subColor: '#fde68a', fontSizes: [38, 56, 36, 26], maxAnisotropy: maxAniso }
    );
    addBillboard(gateMonumentTex, 10.2, 2.55, -25.4, 2.28, 72.66);

    // 3D Extruded official HUSC Shield plaque suspended in stepped Gate Tower alcove (ce1e9c8e + fe315ae0)
    const shieldCanvas = document.createElement('canvas');
    shieldCanvas.width = 512;
    shieldCanvas.height = 512;
    const sctx = shieldCanvas.getContext('2d');
    drawHuscShield(sctx, 256, 256, 480);
    const shieldTex = new THREE.CanvasTexture(shieldCanvas);
    shieldTex.colorSpace = THREE.SRGBColorSpace;
    shieldTex.anisotropy = Math.min(8, maxAniso);

    const sw = 1.10 * (412.8 / 512) * 0.99;
    const sh = 1.10 * (480 / 512) * 0.99;
    const shieldShape = new THREE.Shape();
    shieldShape.moveTo(-sw * 0.35, sh * 0.50);
    shieldShape.lineTo(sw * 0.35, sh * 0.50);
    shieldShape.lineTo(sw * 0.50, sh * 0.22);
    shieldShape.bezierCurveTo(sw * 0.45, -sh * 0.14, sw * 0.24, -sh * 0.38, 0, -sh * 0.50);
    shieldShape.bezierCurveTo(-sw * 0.24, -sh * 0.38, -sw * 0.45, -sh * 0.14, -sw * 0.50, sh * 0.22);
    shieldShape.closePath();

    const shieldBodyGeom = new THREE.ExtrudeGeometry(shieldShape, {
        depth: 0.12,
        bevelEnabled: true,
        bevelThickness: 0.012,
        bevelSize: 0.010,
        bevelSegments: isLowTier ? 1 : 2,
        curveSegments: isLowTier ? 6 : 12
    });
    shieldBodyGeom.translate(0, 0, -0.06);

    const shieldGroup = new THREE.Group();
    shieldGroup.add(new THREE.Mesh(
        shieldBodyGeom,
        new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.34, metalness: 0.12 })
    ));
    const faceMat = new THREE.MeshStandardMaterial({
        map: shieldTex,
        emissive: 0xffffff,
        emissiveMap: shieldTex,
        emissiveIntensity: 0.22,
        transparent: true,
        alphaTest: 0.40,
        roughness: 0.38,
        metalness: 0.08
    });
    const frontFace = new THREE.Mesh(new THREE.PlaneGeometry(1.10, 1.10), faceMat);
    frontFace.position.z = 0.074;
    const backFace = new THREE.Mesh(new THREE.PlaneGeometry(1.10, 1.10).rotateY(Math.PI), faceMat);
    backFace.position.z = -0.074;
    shieldGroup.add(frontFace, backFace);
    shieldGroup.position.set(-19.0, 7.36, 72.5);
    shieldGroup.rotation.y = Math.PI * 0.5;
    scene.add(shieldGroup);

    // Metallic gold block lettering mounted across East & West faces directly beneath alcove (ce1e9c8e)
    const buildGoldFacadeSign = (isShadowLayer) => {
        const gc = document.createElement('canvas');
        gc.width = 1024;
        gc.height = 144;
        const gctx = gc.getContext('2d');
        const label = 'TRƯỜNG ĐẠI HỌC KHOA HỌC';
        let fontSize = 56;
        gctx.font = `900 ${fontSize}px Inter, "Segoe UI", sans-serif`;
        const measured = gctx.measureText(label).width;
        if (measured > 950) {
            fontSize = Math.floor(fontSize * (950 / measured));
            gctx.font = `900 ${fontSize}px Inter, "Segoe UI", sans-serif`;
        }
        gctx.textAlign = 'center';
        gctx.textBaseline = 'middle';
        if (isShadowLayer) {
            gctx.fillStyle = '#78350f';
            gctx.fillText(label, 514, 75);
        } else {
            const grad = gctx.createLinearGradient(0, 42, 0, 102);
            grad.addColorStop(0, '#fef08a');
            grad.addColorStop(0.42, '#f59e0b');
            grad.addColorStop(0.72, '#d97706');
            grad.addColorStop(1, '#fbbf24');
            gctx.fillStyle = grad;
            gctx.strokeStyle = '#92400e';
            gctx.lineWidth = 2.5;
            gctx.strokeText(label, 512, 72);
            gctx.fillText(label, 512, 72);
        }
        const tex = new THREE.CanvasTexture(gc);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = Math.min(8, maxAniso);
        return tex;
    };

    const goldShadowMat = new THREE.MeshStandardMaterial({
        map: buildGoldFacadeSign(true),
        transparent: true,
        alphaTest: 0.20,
        roughness: 0.45,
        metalness: 0.55
    });
    const goldTex = buildGoldFacadeSign(false);
    const goldFrontMat = new THREE.MeshStandardMaterial({
        map: goldTex,
        emissive: 0x92400e,
        emissiveMap: goldTex,
        emissiveIntensity: 0.40,
        transparent: true,
        alphaTest: 0.20,
        roughness: 0.18,
        metalness: 0.78
    });
    for (const dirSign of [1, -1]) {
        const rotY = dirSign > 0 ? Math.PI * 0.5 : -Math.PI * 0.5;
        const baseMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.96, 0.42), goldShadowMat);
        baseMesh.position.set(-19.0 + dirSign * 0.706, 5.47, 72.5);
        baseMesh.rotation.y = rotY;
        const faceMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.96, 0.42), goldFrontMat);
        faceMesh.position.set(-19.0 + dirSign * 0.718, 5.47, 72.5);
        faceMesh.rotation.y = rotY;
        scene.add(baseMesh, faceMesh);
    }

    // 4. Rear Gate 38 Dong Da banner & THPT Chuyên Khoa học Huế left wing
    const ddGateTex = createSignTexture(['CỔNG 38 ĐỐNG ĐA · ĐHKH HUẾ'], {
        w: 768, h: 128, bg: '#1e293b', border: '#fbbf24', color: '#fef08a', fontSizes: [42], maxAnisotropy: maxAniso
    });
    // Double-sided banner facing outside (0.4461 + Math.PI) towards Dong Da and inside towards campus
    addBillboard(ddGateTex, 8.2, 0.95, 17.58, 5.45, -88.06, 0.4461 + Math.PI, 0, true);

    // Authentic wide left-wing gate pier and THPT Chuyên Khoa học Huế signboard matching Photo 1
    createDongDaLeftWingGateStructure(scene, maxAniso);

    const myThuatTex = createSignTexture(['PHÒNG HỌC MỸ THUẬT'], {
        w: 640, h: 112, bg: '#1f2937', border: '#facc15', color: '#fde047', fontSizes: [42], maxAnisotropy: maxAniso
    });
    addBillboard(myThuatTex, 7.6, 0.85, 4.0, 7.6, -36.3, 0);

    // 5. Garage roof decals (NHÀ ĐỂ XE / NƠI ĐỂ XE) matching Image 1 & Official Plan 61a14ecc
    const garageTex = createSignTexture(['NHÀ ĐỂ XE'], {
        w: 512, h: 128, bg: 'transparent', color: '#ffffff', fontSizes: [64], maxAnisotropy: maxAniso
    });
    const parkingDongDaTex = createSignTexture(['NƠI ĐỂ XE'], {
        w: 512, h: 128, bg: 'transparent', color: '#ffffff', fontSizes: [64], maxAnisotropy: maxAniso
    });
    addBillboard(garageTex, 13.0, 2.6, -64.0, 4.7, 67.5, 0, -Math.PI * 0.48);
    addBillboard(garageTex, 13.0, 2.6, 34.0, 4.7, 67.5, 0, -Math.PI * 0.48);
    addBillboard(parkingDongDaTex, 11.5, 2.4, -29.21, 4.75, -61.80, 0.4461 + Math.PI, Math.PI * 0.48);

    // 6. Monument spiky red-and-green dracaena/croton foliage tufts inside black stone planter (Photo 5)
    const spikeCanvas = document.createElement('canvas');
    spikeCanvas.width = 256;
    spikeCanvas.height = 256;
    const spCtx = spikeCanvas.getContext('2d');
    spCtx.clearRect(0, 0, 256, 256);
    const spikeColors = ['#1f4d28', '#2c6934', '#7f1d1d', '#991b1b', '#4d7c0f'];
    for (let i = 0; i < 16; i++) {
        const angle = -0.75 + (i / 15) * 1.5;
        const len = 135 + (i % 3) * 32;
        spCtx.save();
        spCtx.translate(128, 248);
        spCtx.rotate(angle);
        spCtx.beginPath();
        spCtx.moveTo(-14, 0);
        spCtx.quadraticCurveTo(-8, -len * 0.6, 0, -len);
        spCtx.quadraticCurveTo(8, -len * 0.6, 14, 0);
        spCtx.closePath();
        spCtx.fillStyle = spikeColors[i % spikeColors.length];
        spCtx.fill();
        spCtx.restore();
    }
    const spikeTex = new THREE.CanvasTexture(spikeCanvas);
    spikeTex.colorSpace = THREE.SRGBColorSpace;
    const spikeMat = new THREE.MeshBasicMaterial({ map: spikeTex, alphaTest: 0.35, side: THREE.DoubleSide });
    const spikePlane = new THREE.PlaneGeometry(1.1, 0.85);
    const spikeGroup = new THREE.InstancedMesh(spikePlane, spikeMat, 22);
    const sDummy = new THREE.Object3D();
    for (let i = 0; i < 11; i++) {
        const sx = -29.8 + i * 0.88;
        sDummy.position.set(sx, 1.18, 73.12);
        sDummy.rotation.set(0, (i % 3) * 0.35 - 0.3, 0);
        sDummy.updateMatrix();
        spikeGroup.setMatrixAt(i * 2, sDummy.matrix);
        sDummy.rotation.y += 1.1;
        sDummy.updateMatrix();
        spikeGroup.setMatrixAt(i * 2 + 1, sDummy.matrix);
    }
    spikeGroup.instanceMatrix.needsUpdate = true;
    scene.add(spikeGroup);

    // 7. Fluttering colorful campus flags over Gate + Central Vietnam National Flag on Nha A Balcony (Photo 5)
    const poleMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.72, roughness: 0.28 });
    const flagSpecs = [
        // Main Gate left monument flags matching Photo 5 (green, yellow, blue)
        { x: -29.8, yBase: 4.2, z: 72.4, h: 3.1, color: 0x16a34a, w: 0.95, fh: 0.62 },
        { x: -25.4, yBase: 4.2, z: 72.4, h: 3.1, color: 0xfacc15, w: 0.95, fh: 0.62 },
        { x: -21.2, yBase: 4.2, z: 72.4, h: 3.1, color: 0x2563eb, w: 0.95, fh: 0.62 },
        // Main Gate right overhang canopy flags matching Photo 5 (yellow, blue, orange)
        { x: -7.8, yBase: 4.5, z: 72.4, h: 2.9, color: 0xfacc15, w: 0.95, fh: 0.62 },
        { x: -4.0, yBase: 4.5, z: 72.4, h: 2.9, color: 0x2563eb, w: 0.95, fh: 0.62 },
        { x: -0.2, yBase: 4.5, z: 72.4, h: 2.9, color: 0xf97316, w: 0.95, fh: 0.62 },
        // Nha A Portico 2nd-floor balcony central Vietnam Flag + flanking festive pennants (Photos 1, 2, 4, 5)
        { x: -13.0, yBase: 5.5, z: 20.08, h: 3.4, color: 0xda251d, w: 1.45, fh: 0.96, isStarFlag: true },
        { x: -18.2, yBase: 5.5, z: 20.08, h: 1.5, color: 0xdc2626, w: 0.55, fh: 0.75 },
        { x: -16.0, yBase: 5.5, z: 20.08, h: 1.5, color: 0xfacc15, w: 0.55, fh: 0.75 },
        { x: -10.0, yBase: 5.5, z: 20.08, h: 1.5, color: 0x22c55e, w: 0.55, fh: 0.75 },
        { x: -7.8, yBase: 5.5, z: 20.08, h: 1.5, color: 0xdc2626, w: 0.55, fh: 0.75 }
    ];

    // Gold-star Vietnam flag canvas texture for center mast
    const vnCanvas = document.createElement('canvas');
    vnCanvas.width = 256;
    vnCanvas.height = 170;
    const vctx = vnCanvas.getContext('2d');
    vctx.fillStyle = '#da251d';
    vctx.fillRect(0, 0, 256, 170);
    vctx.fillStyle = '#ffdf00';
    vctx.beginPath();
    for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? 44 : 18;
        const a = (i * Math.PI) / 5 - Math.PI / 2;
        const px = 128 + Math.cos(a) * r;
        const py = 85 + Math.sin(a) * r;
        if (i === 0) vctx.moveTo(px, py);
        else vctx.lineTo(px, py);
    }
    vctx.closePath();
    vctx.fill();
    const vnTex = new THREE.CanvasTexture(vnCanvas);
    vnTex.colorSpace = THREE.SRGBColorSpace;

    const flagPoleGeom = new THREE.CylinderGeometry(0.035, 0.045, 1.0, 6);
    const flagPoleInst = new THREE.InstancedMesh(flagPoleGeom, poleMat, flagSpecs.length);
    const poleDummy = new THREE.Object3D();

    const solidFlags = [];
    const baseSolidFlagGeom = new THREE.PlaneGeometry(1, 1, 4, 1);
    baseSolidFlagGeom.translate(0.5, 0, 0);
    const solidFlagMat = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide, roughness: 0.75 });
    const solidSpecs = flagSpecs.filter((f) => !f.isStarFlag);
    const solidFlagInst = new THREE.InstancedMesh(baseSolidFlagGeom, solidFlagMat, solidSpecs.length);
    const flagCol = new THREE.Color();
    let solidIdx = 0;

    flagSpecs.forEach((f, idx) => {
        poleDummy.position.set(f.x, f.yBase + f.h * 0.5, f.z);
        poleDummy.rotation.set(0, 0, 0);
        poleDummy.scale.set(1, f.h, 1);
        poleDummy.updateMatrix();
        flagPoleInst.setMatrixAt(idx, poleDummy.matrix);

        if (f.isStarFlag) {
            const clothGeom = new THREE.PlaneGeometry(f.w, f.fh, 6, 2);
            clothGeom.translate(f.w * 0.5, 0, 0);
            const clothMat = new THREE.MeshStandardMaterial({ map: vnTex, side: THREE.DoubleSide, roughness: 0.72 });
            const cloth = new THREE.Mesh(clothGeom, clothMat);
            cloth.position.set(f.x, f.yBase + f.h - f.fh * 0.55, f.z);
            cloth.userData.phase = f.x * 0.4;
            scene.add(cloth);
            animatedFlags.push(cloth);
        } else {
            solidFlagInst.setColorAt(solidIdx, flagCol.setHex(f.color));
            solidFlags.push({
                index: solidIdx,
                x: f.x,
                y: f.yBase + f.h - f.fh * 0.55,
                z: f.z,
                w: f.w,
                fh: f.fh,
                phase: f.x * 0.4
            });
            solidIdx += 1;
        }
    });
    flagPoleInst.instanceMatrix.needsUpdate = true;
    solidFlagInst.instanceColor.needsUpdate = true;
    scene.add(flagPoleInst, solidFlagInst);

    // 8. Floating crisp building pin sprites above each roof (matching red HUSC pins in Image 1)
    for (const loc of CAMPUS_LOCATIONS) {
        if (loc.id === 'cong-chinh') continue;
        const c = document.createElement('canvas');
        c.width = 256;
        c.height = 96;
        const ctx = c.getContext('2d');
        ctx.fillStyle = loc.category === 'sport' ? 'rgba(21, 128, 61, 0.90)' : 'rgba(185, 28, 28, 0.92)';
        ctx.beginPath();
        ctx.roundRect(16, 12, 224, 62, 31);
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
        const fontSize = loc.code.length > 7 ? 24 : 30;
        ctx.font = `800 ${fontSize}px Inter, sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(loc.code, 128, 44);

        const spriteTex = new THREE.CanvasTexture(c);
        spriteTex.colorSpace = THREE.SRGBColorSpace;
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: spriteTex, depthTest: true }));
        const badgeY = loc.category === 'sport'
            ? 5.2
            : (loc.id === 'cong-dong-da'
                ? 8.2
                : (loc.id === 'nha-khach'
                    ? 12.5
                    : (loc.id === 'nha-m'
                        ? 8.2
                        : 19.6)));
        sprite.position.set(loc.rect.cx, badgeY, loc.rect.cz);
        const spriteW = loc.code.length > 7 ? 7.6 : 6.4;
        sprite.scale.set(spriteW, 2.4, 1);
        scene.add(sprite);
    }

    return { animatedFlags, solidFlagInst, solidFlags };
}

// Create glowing TRAM DICH CHUYEN teleport beacons + floating signs (matching Reference Photos 2 & 3)
function createTeleportBeacons(scene, hardwareProfile = { maxAnisotropy: 4 }) {
    const beacons = [];
    const maxAniso = hardwareProfile.maxAnisotropy || 4;
    const ringMatBase = new THREE.MeshBasicMaterial({
        color: 0xfbbf24,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide
    });
    const beamMatBase = new THREE.MeshBasicMaterial({
        color: 0xfde68a,
        transparent: true,
        opacity: 0.28,
        side: THREE.DoubleSide,
        depthWrite: false
    });
    const ringGeom = new THREE.RingGeometry(1.15, 1.55, 24);
    const coreGeom = new THREE.CircleGeometry(1.1, 24);
    const beamGeom = new THREE.CylinderGeometry(1.2, 1.4, 2.8, 18, 1, true);

    for (const pad of TELEPORT_PADS) {
        const group = new THREE.Group();
        group.position.set(pad.x, 0.05, pad.z);

        const ring = new THREE.Mesh(ringGeom, ringMatBase);
        ring.rotation.x = -Math.PI * 0.5;
        group.add(ring);

        const core = new THREE.Mesh(coreGeom, beamMatBase);
        core.rotation.x = -Math.PI * 0.5;
        group.add(core);

        const beam = new THREE.Mesh(beamGeom, beamMatBase);
        beam.position.y = 1.4;
        group.add(beam);

        // Crisp dark navy badge sprite "TRẠM DỊCH CHUYỂN"
        const badgeTex = createSignTexture(['TRẠM DỊCH CHUYỂN'], {
            w: 512, h: 120, bg: '#16284c', border: '#fbbf24', color: '#fde047', fontSizes: [40], maxAnisotropy: maxAniso
        });
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: badgeTex, transparent: true }));
        sprite.position.set(0, 3.1, 0);
        sprite.scale.set(5.4, 1.25, 1);
        group.add(sprite);

        group.userData.pad = pad;
        scene.add(group);
        beacons.push(group);
    }
    return beacons;
}

// Create sky dome shader, instanced drifting clouds, street lamp posts, and neutral city backdrop
function createAtmosphereAndProps(scene) {
    // Sky Dome
    const skyGeom = new THREE.SphereGeometry(420, 20, 12);
    const skyUniforms = {
        uTopColor: { value: new THREE.Color(0x2d7bd6) },
        uBottomColor: { value: new THREE.Color(0xd5ecff) },
        uExponent: { value: 0.68 }
    };
    const skyMat = new THREE.ShaderMaterial({
        uniforms: skyUniforms,
        side: THREE.BackSide,
        depthWrite: false,
        vertexShader: `
            varying vec3 vWorldPos;
            void main() {
                vec4 worldPos = modelMatrix * vec4(position, 1.0);
                vWorldPos = worldPos.xyz;
                gl_Position = projectionMatrix * viewMatrix * worldPos;
            }
        `,
        fragmentShader: `
            uniform vec3 uTopColor;
            uniform vec3 uBottomColor;
            uniform float uExponent;
            varying vec3 vWorldPos;
            void main() {
                float h = normalize(vWorldPos).y;
                float t = pow(max(h, 0.0), uExponent);
                gl_FragColor = vec4(mix(uBottomColor, uTopColor, t), 1.0);
            }
        `
    });
    const skyDome = new THREE.Mesh(skyGeom, skyMat);
    scene.add(skyDome);

    // Instanced puffy clouds drifting gently at high altitude (1 draw call across 18 puffs)
    const cloudMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.88
    });
    const puffGeom = new THREE.SphereGeometry(1, 8, 6);
    const cloudClusters = [
        [-120, 95, -140, 1.4], [-40, 105, -180, 1.2], [75, 98, -155, 1.5],
        [-170, 90, 20, 1.1], [150, 102, 10, 1.3], [15, 110, 145, 1.2]
    ].map(([cx, cy, cz, cs], i) => ({ cx, cy, cz, cs, speed: 0.55 + (i % 3) * 0.25 }));
    const puffOffsets = [
        [0, 0, 0, 12, 5.5, 8],
        [-9, -1.2, 2, 8.5, 4.2, 6.5],
        [9.5, -1.0, -1, 9, 4.5, 7]
    ];
    const cloudInst = new THREE.InstancedMesh(puffGeom, cloudMat, cloudClusters.length * puffOffsets.length);
    cloudInst.frustumCulled = false;
    const cloudDummy = new THREE.Object3D();

    const syncCloudInstances = (dt) => {
        let instIdx = 0;
        for (const cl of cloudClusters) {
            if (dt > 0) {
                cl.cx += cl.speed * dt;
                if (cl.cx > 210) cl.cx = -210;
            }
            for (const [ox, oy, oz, rx, ry, rz] of puffOffsets) {
                cloudDummy.position.set(cl.cx + ox * cl.cs, cl.cy + oy * cl.cs, cl.cz + oz * cl.cs);
                cloudDummy.scale.set(rx * cl.cs, ry * cl.cs, rz * cl.cs);
                cloudDummy.updateMatrix();
                cloudInst.setMatrixAt(instIdx++, cloudDummy.matrix);
            }
        }
        cloudInst.instanceMatrix.needsUpdate = true;
    };
    syncCloudInstances(0);
    scene.add(cloudInst);

    // Background urban massing blocks beyond surrounding streets (softly blended into distance fog)
    const cityMat = new THREE.MeshLambertMaterial({ color: 0xc2cbd4 });
    const ctxCoords = [
        [-148, -72, 22, 14, 18], [-146, 12, 22, 18, 20], [-140, 55, 22, 12, 20],
        [-80, 118, 26, 14, 18], [-15, 120, 28, 16, 16], [52, 118, 26, 15, 22],
        [108, 48, 24, 18, 18], [98, -22, 22, 16, 20], [72, -88, 26, 15, 18],
        [-25, -116, 28, 18, 16], [-125, -118, 24, 16, 18]
    ];
    const cityInst = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), cityMat, ctxCoords.length);
    const dummy = new THREE.Object3D();
    ctxCoords.forEach(([x, z, w, h, d], idx) => {
        dummy.position.set(x, h * 0.5 - 0.1, z);
        dummy.scale.set(w, h, d);
        dummy.updateMatrix();
        cityInst.setMatrixAt(idx, dummy.matrix);
    });
    cityInst.instanceMatrix.needsUpdate = true;
    scene.add(cityInst);

    // Street Lamp Posts flanking Main Plaza and Central Inner Courtyard Avenue
    const lampCoords = [[-22.5, 60], [-3.0, 60], [-22.5, 36], [-3.0, 36], [5.4, -2.0], [9.6, -2.0], [5.4, -14.0], [9.6, -14.0]];
    const postGeom = new THREE.CylinderGeometry(0.08, 0.12, 5.2, 8);
    postGeom.translate(0, 2.6, 0);
    const postInst = new THREE.InstancedMesh(
        postGeom,
        new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.4 }),
        lampCoords.length
    );
    const headGeom = new THREE.SphereGeometry(0.28, 10, 8);
    const lampHeadMat = new THREE.MeshBasicMaterial({ color: 0xfef9c3 });
    const headInst = new THREE.InstancedMesh(headGeom, lampHeadMat, lampCoords.length);
    const haloGeom = new THREE.SphereGeometry(0.75, 10, 8);
    const lampHaloMat = new THREE.MeshBasicMaterial({
        color: 0xfde047,
        transparent: true,
        opacity: 0,
        depthWrite: false
    });
    const haloInst = new THREE.InstancedMesh(haloGeom, lampHaloMat, lampCoords.length);
    haloInst.visible = false;
    lampCoords.forEach(([lx, lz], idx) => {
        dummy.position.set(lx, 0, lz);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        postInst.setMatrixAt(idx, dummy.matrix);
        dummy.position.set(lx, 5.25, lz);
        dummy.updateMatrix();
        headInst.setMatrixAt(idx, dummy.matrix);
        haloInst.setMatrixAt(idx, dummy.matrix);
    });
    postInst.instanceMatrix.needsUpdate = true;
    headInst.instanceMatrix.needsUpdate = true;
    haloInst.instanceMatrix.needsUpdate = true;
    scene.add(postInst);
    scene.add(headInst);
    scene.add(haloInst);

    // Twinkling celestial starfield for night atmosphere
    const STAR_COUNT = 650;
    const starPositions = new Float32Array(STAR_COUNT * 3);
    const starPhases = new Float32Array(STAR_COUNT);
    const starSizes = new Float32Array(STAR_COUNT);
    for (let i = 0; i < STAR_COUNT; i++) {
        // Distribute stars randomly across the celestial dome
        const phi = Math.acos(0.12 + Math.random() * 0.88);
        const theta = Math.random() * Math.PI * 2;
        const r = 405 + Math.random() * 10;
        starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        starPositions[i * 3 + 1] = r * Math.cos(phi);
        starPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
        starPhases[i] = Math.random();
        starSizes[i] = 1.8 + Math.random() * 2.2;
    }
    const starGeom = new THREE.BufferGeometry();
    starGeom.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeom.setAttribute('aPhase', new THREE.BufferAttribute(starPhases, 1));
    starGeom.setAttribute('aSize', new THREE.BufferAttribute(starSizes, 1));

    const starUniforms = {
        uTime: { value: 0 },
        uOpacity: { value: 0.0 }
    };
    const starMat = new THREE.ShaderMaterial({
        uniforms: starUniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: `
            attribute float aPhase;
            attribute float aSize;
            uniform float uTime;
            varying float vTwinkle;
            void main() {
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_Position = projectionMatrix * mvPosition;
                float twinkle = 0.5 + 0.5 * sin(uTime * 3.2 + aPhase * 18.8495);
                vTwinkle = 0.35 + 0.65 * twinkle;
                gl_PointSize = aSize * (0.8 + 0.35 * twinkle) * (260.0 / -mvPosition.z);
            }
        `,
        fragmentShader: `
            uniform float uOpacity;
            varying float vTwinkle;
            void main() {
                vec2 coord = gl_PointCoord - vec2(0.5);
                float dist = length(coord);
                if (dist > 0.5) discard;
                float core = 1.0 - smoothstep(0.0, 0.5, dist);
                gl_FragColor = vec4(vec3(0.96, 0.98, 1.0), core * vTwinkle * uOpacity);
            }
        `
    });
    const starPoints = new THREE.Points(starGeom, starMat);
    starPoints.frustumCulled = false;
    starPoints.visible = false;
    scene.add(starPoints);

    // Dynamic shooting star meteor streak across the night sky
    const meteorGroup = new THREE.Group();
    const meteorHeadGeom = new THREE.SphereGeometry(0.55, 6, 6);
    const meteorHeadMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const meteorHeadMesh = new THREE.Mesh(meteorHeadGeom, meteorHeadMat);
    meteorGroup.add(meteorHeadMesh);

    // Meteor glowing trail ribbon
    const meteorTrailGeom = new THREE.BufferGeometry();
    const trailPositions = new Float32Array(12);
    const trailAlphas = new Float32Array([0.0, 0.0, 1.0, 1.0]);
    const trailIndices = new Uint16Array([0, 1, 2, 2, 1, 3]);
    meteorTrailGeom.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    meteorTrailGeom.setAttribute('aAlpha', new THREE.BufferAttribute(trailAlphas, 1));
    meteorTrailGeom.setIndex(new THREE.BufferAttribute(trailIndices, 1));

    const meteorTrailUniforms = { uOpacity: { value: 0.0 } };
    const meteorTrailMat = new THREE.ShaderMaterial({
        uniforms: meteorTrailUniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        vertexShader: `
            attribute float aAlpha;
            varying float vAlpha;
            void main() {
                vAlpha = aAlpha;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float uOpacity;
            varying float vAlpha;
            void main() {
                gl_FragColor = vec4(vec3(0.85, 0.94, 1.0), vAlpha * uOpacity);
            }
        `
    });
    const meteorTrailMesh = new THREE.Mesh(meteorTrailGeom, meteorTrailMat);
    meteorTrailMesh.frustumCulled = false;
    meteorGroup.add(meteorTrailMesh);
    meteorGroup.visible = false;
    scene.add(meteorGroup);

    let isNightActive = false;
    let meteorActive = false;
    let meteorTimer = 2.0;
    let meteorProgress = 0.0;
    const meteorDuration = 0.72;
    const meteorStart = new THREE.Vector3();
    const meteorEnd = new THREE.Vector3();
    const meteorDir = new THREE.Vector3();
    const currentHead = new THREE.Vector3();
    const currentTail = new THREE.Vector3();
    const sideVec = new THREE.Vector3();
    const upVec = new THREE.Vector3(0, 1, 0);

    // Toggle active night sky state
    const setNightSkyActive = (active) => {
        isNightActive = active;
        if (!active) {
            meteorActive = false;
            meteorGroup.visible = false;
            meteorTimer = 2.0;
        }
    };

    // Animate twinkling starfield opacity and shooting star streak trajectory
    const updateNightSky = (elapsedSec, dt) => {
        const targetOpacity = isNightActive ? 1.0 : 0.0;
        const currentOpacity = starUniforms.uOpacity.value;
        const speed = isNightActive ? 2.5 : 3.5;
        const newOpacity = THREE.MathUtils.lerp(currentOpacity, targetOpacity, Math.min(1.0, dt * speed));
        starUniforms.uOpacity.value = newOpacity;
        starUniforms.uTime.value = elapsedSec;
        starPoints.visible = newOpacity > 0.01;

        if (!isNightActive && newOpacity <= 0.01) {
            meteorGroup.visible = false;
            return;
        }

        if (!meteorActive) {
            meteorTimer -= dt;
            if (meteorTimer <= 0) {
                const angle = Math.random() * Math.PI * 2;
                const r = 240 + Math.random() * 80;
                meteorStart.set(Math.cos(angle) * r, 160 + Math.random() * 45, Math.sin(angle) * r);
                meteorDir.set(-meteorStart.x * 0.45 + (Math.random() - 0.5) * 80, -32 - Math.random() * 20, -meteorStart.z * 0.45 + (Math.random() - 0.5) * 80).normalize();
                meteorEnd.copy(meteorStart).addScaledVector(meteorDir, 140 + Math.random() * 50);
                meteorActive = true;
                meteorProgress = 0.0;
                meteorGroup.visible = true;
            }
        } else {
            meteorProgress += dt / meteorDuration;
            if (meteorProgress >= 1.0) {
                meteorActive = false;
                meteorGroup.visible = false;
                meteorTimer = 3.2 + Math.random() * 3.5;
            } else {
                currentHead.lerpVectors(meteorStart, meteorEnd, meteorProgress);
                const streakEnvelope = Math.sin(meteorProgress * Math.PI);
                const tailLen = Math.min(32, 65 * streakEnvelope);
                currentTail.copy(currentHead).addScaledVector(meteorDir, -tailLen);

                meteorHeadMesh.position.copy(currentHead);
                meteorHeadMat.opacity = streakEnvelope * 0.95;
                meteorTrailUniforms.uOpacity.value = streakEnvelope * 0.9;

                sideVec.crossVectors(meteorDir, upVec).normalize().multiplyScalar(1.0);
                const posArr = meteorTrailGeom.attributes.position.array;
                posArr[0] = currentTail.x - sideVec.x * 0.2;
                posArr[1] = currentTail.y - sideVec.y * 0.2;
                posArr[2] = currentTail.z - sideVec.z * 0.2;
                posArr[3] = currentTail.x + sideVec.x * 0.2;
                posArr[4] = currentTail.y + sideVec.y * 0.2;
                posArr[5] = currentTail.z + sideVec.z * 0.2;
                posArr[6] = currentHead.x - sideVec.x;
                posArr[7] = currentHead.y - sideVec.y;
                posArr[8] = currentHead.z - sideVec.z;
                posArr[9] = currentHead.x + sideVec.x;
                posArr[10] = currentHead.y + sideVec.y;
                posArr[11] = currentHead.z + sideVec.z;
                meteorTrailGeom.attributes.position.needsUpdate = true;
            }
        }
    };

    return { skyUniforms, syncCloudInstances, cloudMat, lampHeadMat, lampHaloMat, haloInst, setNightSkyActive, updateNightSky };
}


// Initialize lighting, sky, gardens, signage, animated foliage, and adaptive hardware quality presets
export function setupCampusEnvironment(scene, renderer, hardwareProfile = { tier: 'high', maxAnisotropy: 4, isSoftware: false }) {
    const initialTier = hardwareProfile.tier || 'high';
    const isSoftware = Boolean(hardwareProfile.isSoftware);

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = initialTier === 'low'
        ? THREE.BasicShadowMap
        : (initialTier === 'medium' ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.06;

    // Directional sunlight with adaptive shadow resolution and scaled anti-acne bias
    const sunLight = new THREE.DirectionalLight(0xfff5e4, 2.35);
    sunLight.position.set(78, 118, 72);
    sunLight.castShadow = true;
    const initShadowSize = initialTier === 'high' ? 2048 : 1024;
    sunLight.shadow.mapSize.set(initShadowSize, initShadowSize);
    sunLight.shadow.camera.near = 25;
    sunLight.shadow.camera.far = 310;
    sunLight.shadow.camera.left = -125;
    sunLight.shadow.camera.right = 110;
    sunLight.shadow.camera.top = 110;
    sunLight.shadow.camera.bottom = -115;
    const applyShadowBias = (mapSize) => {
        if (mapSize <= 1024) {
            sunLight.shadow.bias = -0.0015;
            sunLight.shadow.normalBias = 0.16;
        } else {
            sunLight.shadow.bias = -0.0007;
            sunLight.shadow.normalBias = 0.06;
        }
    };
    applyShadowBias(initShadowSize);
    scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight(0xcbe8ff, 0x76856c, 0.88);
    scene.add(hemiLight);

    const fog = new THREE.FogExp2(0xd5ecff, 0.0021);
    scene.fog = fog;
    scene.background = new THREE.Color(0xd5ecff);

    const windUniform = { value: 0 };

    createGroundAndGardens(scene, hardwareProfile);
    const vegController = createCampusVegetation(scene, windUniform, hardwareProfile);
    const flagController = createCampusSignageAndFlags(scene, hardwareProfile);
    const intersectionSignals = createSmartIntersectionSystem(scene, hardwareProfile);
    const updateTraffic = createRoadTrafficSystem(scene, hardwareProfile);
    const teleportBeacons = createTeleportBeacons(scene, hardwareProfile);
    const rooftopFireworks = createRooftopFireworks(scene, hardwareProfile);
    const airspaceSystem = createAirspaceSystem(scene, hardwareProfile);
    const updatePedestrians = createPedestrianSystem(scene, hardwareProfile);
    const {
        skyUniforms,
        syncCloudInstances,
        cloudMat,
        lampHeadMat,
        lampHaloMat,
        haloInst,
        setNightSkyActive,
        updateNightSky
    } = createAtmosphereAndProps(scene);

    let shadowUpdateStride = initialTier === 'low' ? 4 : (initialTier === 'medium' ? 2 : 1);
    let shadowFrameCount = 0;
    let currentShadowSize = initShadowSize;
    renderer.shadowMap.autoUpdate = shadowUpdateStride <= 1;
    renderer.shadowMap.needsUpdate = true;

    const flagDummy = new THREE.Object3D();
    const syncSolidFlags = (elapsedSec) => {
        for (const f of flagController.solidFlags) {
            flagDummy.position.set(f.x, f.y, f.z);
            flagDummy.rotation.set(0, Math.sin(elapsedSec * 4.2 + f.phase) * 0.16, 0);
            flagDummy.scale.set(f.w, f.fh, 1);
            flagDummy.updateMatrix();
            flagController.solidFlagInst.setMatrixAt(f.index, flagDummy.matrix);
        }
        flagController.solidFlagInst.instanceMatrix.needsUpdate = true;
    };
    syncSolidFlags(0);

    // Apply Noon, Hue Sunset, or Night atmosphere preset dynamically with zero shader recompiles
    const setLightingPreset = (mode) => {
        if (mode === 'sunset') {
            sunLight.position.set(-96, 48, 76);
            sunLight.color.setHex(0xffb478);
            sunLight.intensity = 2.15;
            hemiLight.color.setHex(0xffd2a6);
            hemiLight.groundColor.setHex(0x524c5c);
            hemiLight.intensity = 0.72;
            skyUniforms.uTopColor.value.setHex(0x3a4a7a);
            skyUniforms.uBottomColor.value.setHex(0xfdba8c);
            fog.color.setHex(0xf3cba8);
            fog.density = 0.0021;
            scene.background.setHex(0xf3cba8);
            cloudMat.color.setHex(0xfde2cc);
            cloudMat.opacity = 0.86;
            lampHeadMat.color.setHex(0xfef08a);
            lampHaloMat.opacity = 0.22;
            haloInst.visible = true;
            renderer.toneMappingExposure = 1.04;
            setNightSkyActive(false);
            if (updateTraffic && updateTraffic.setNightMode) updateTraffic.setNightMode(false);
        } else if (mode === 'night') {
            sunLight.position.set(-70, 95, -55);
            sunLight.color.setHex(0x93c5fd);
            sunLight.intensity = 0.82;
            hemiLight.color.setHex(0x4b74b8);
            hemiLight.groundColor.setHex(0x1e293b);
            hemiLight.intensity = 0.68;
            skyUniforms.uTopColor.value.setHex(0x050a18);
            skyUniforms.uBottomColor.value.setHex(0x17254a);
            fog.color.setHex(0x111c36);
            fog.density = 0.0023;
            scene.background.setHex(0x111c36);
            cloudMat.color.setHex(0x283652);
            cloudMat.opacity = 0.55;
            lampHeadMat.color.setHex(0xfde047);
            lampHaloMat.opacity = 0.58;
            haloInst.visible = true;
            renderer.toneMappingExposure = 1.12;
            setNightSkyActive(true);
            if (updateTraffic && updateTraffic.setNightMode) updateTraffic.setNightMode(true);
        } else {
            sunLight.position.set(78, 118, 72);
            sunLight.color.setHex(0xfff5e4);
            sunLight.intensity = 2.35;
            hemiLight.color.setHex(0xcbe8ff);
            hemiLight.groundColor.setHex(0x76856c);
            hemiLight.intensity = 0.88;
            skyUniforms.uTopColor.value.setHex(0x2d7bd6);
            skyUniforms.uBottomColor.value.setHex(0xd5ecff);
            fog.color.setHex(0xd5ecff);
            fog.density = 0.0021;
            scene.background.setHex(0xd5ecff);
            cloudMat.color.setHex(0xffffff);
            cloudMat.opacity = 0.88;
            lampHeadMat.color.setHex(0xfef9c3);
            lampHaloMat.opacity = 0;
            haloInst.visible = false;
            renderer.toneMappingExposure = 1.06;
            setNightSkyActive(false);
            if (updateTraffic && updateTraffic.setNightMode) updateTraffic.setNightMode(false);
        }
        renderer.shadowMap.needsUpdate = true;
    };

    // Adjust renderer pixel ratio, shadow size, and shadow update cadence cleanly
    const setQualityLevel = (level, allowShadowTypeChange = true) => {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
        let nextShadowSize = 2048;
        let targetShadowType = THREE.PCFSoftShadowMap;
        if (level === 'low') {
            renderer.setPixelRatio(isSoftware ? 0.9 : 1.0);
            nextShadowSize = 1024;
            shadowUpdateStride = 4;
            targetShadowType = THREE.BasicShadowMap;
        } else if (level === 'medium') {
            renderer.setPixelRatio(Math.min(dpr, 1.25));
            nextShadowSize = 1024;
            shadowUpdateStride = 2;
            targetShadowType = THREE.PCFShadowMap;
        } else {
            renderer.setPixelRatio(dpr);
            nextShadowSize = 2048;
            shadowUpdateStride = 1;
            targetShadowType = THREE.PCFSoftShadowMap;
        }
        if (allowShadowTypeChange && renderer.shadowMap.type !== targetShadowType) {
            renderer.shadowMap.type = targetShadowType;
        }
        if (nextShadowSize !== currentShadowSize) {
            currentShadowSize = nextShadowSize;
            sunLight.shadow.mapSize.set(nextShadowSize, nextShadowSize);
            if (sunLight.shadow.map) {
                sunLight.shadow.map.dispose();
                sunLight.shadow.map = null;
            }
        }
        applyShadowBias(currentShadowSize);
        sunLight.castShadow = true;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.autoUpdate = shadowUpdateStride <= 1;
        renderer.shadowMap.needsUpdate = true;
        vegController.setShadowTier(level);
        intersectionSignals.setShadowTier(level);
        if (updateTraffic.setShadowTier) updateTraffic.setShadowTier(level);
    };

    // Allow adaptive FPS governor to throttle or freeze static shadow maps with zero shader recompiles
    const setShadowCadence = (stride, freezeStatic = false) => {
        if (freezeStatic) {
            vegController.setShadowTier('low');
            intersectionSignals.setShadowTier('low');
            if (updateTraffic.setShadowTier) updateTraffic.setShadowTier('off');
            shadowUpdateStride = 0;
            renderer.shadowMap.autoUpdate = false;
            renderer.shadowMap.needsUpdate = true;
            return;
        }
        shadowUpdateStride = Math.max(1, stride | 0);
        renderer.shadowMap.autoUpdate = shadowUpdateStride <= 1;
        renderer.shadowMap.needsUpdate = true;
    };

    const requestShadowRefresh = () => {
        if (sunLight.castShadow && renderer.shadowMap.enabled) {
            renderer.shadowMap.needsUpdate = true;
        }
    };

    let cloudAccumDt = 0;
    let envFrameCount = 0;

    // Advance wind uniform, drifting clouds, flag ripple, smart traffic signals, vehicle flow, and beacon pulse
    const updateEnvironment = (elapsedSec, dt, playerState = null) => {
        windUniform.value = elapsedSec;
        updateNightSky(elapsedSec, dt);
        rooftopFireworks.update(dt);
        airspaceSystem.update(dt, elapsedSec);
        const signalState = intersectionSignals.updateSignals(dt);
        updateTraffic(dt, playerState, signalState);
        if (updatePedestrians) updatePedestrians(dt, elapsedSec, signalState);

        envFrameCount += 1;
        cloudAccumDt += dt;
        const propStride = shadowUpdateStride === 0 || shadowUpdateStride > 2 ? 2 : 1;
        if (envFrameCount % propStride === 0) {
            syncCloudInstances(cloudAccumDt);
            cloudAccumDt = 0;
            syncSolidFlags(elapsedSec);
        }

        for (const flag of flagController.animatedFlags) {
            const p = flag.userData.phase;
            flag.rotation.y = Math.sin(elapsedSec * 4.2 + p) * 0.16;
        }

        const pulse = 1.0 + Math.sin(elapsedSec * 3.0) * 0.06;
        for (const b of teleportBeacons) {
            b.children[0].scale.setScalar(pulse);
            b.children[2].rotation.y += dt * 0.8;
        }

        if (sunLight.castShadow && renderer.shadowMap.enabled && shadowUpdateStride > 1) {
            shadowFrameCount = (shadowFrameCount + 1) % shadowUpdateStride;
            if (shadowFrameCount === 0) {
                renderer.shadowMap.needsUpdate = true;
            }
        }
    };

    return {
        setLightingPreset,
        setQualityLevel,
        setShadowCadence,
        requestShadowRefresh,
        updateEnvironment,
        getSignalState: intersectionSignals.getSnapshot,
        teleportBeacons
    };
}
