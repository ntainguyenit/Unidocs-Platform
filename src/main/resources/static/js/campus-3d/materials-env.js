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
        // Retract Dong Da left-side perimeter wall so it starts cleanly outside left gate pillar
        if (obj.isMesh && obj.position && Math.abs(obj.position.x - 25.775) < 0.15 && Math.abs(obj.position.z - (-91.98)) < 0.15) {
            obj.position.x = 27.001;
            obj.position.z = -92.566;
            obj.scale.x *= 0.426;
        }

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

// Create authentic Vietnamese fan-pattern Terrazzo sidewalk tile texture (Gạch Terrazzo rẻ quạt 400x400)
function createTerrazzoSidewalkTextures(maxAnisotropy = 4) {
    const size = 512;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d');

    const tileSize = 256;
    const grout = 4;

    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 0, size, size);

    const tileShades = ['#cbd5e1', '#c2ccd6', '#d1d8e0', '#c8d1da'];

    for (let ty = 0; ty < 2; ty++) {
        for (let tx = 0; tx < 2; tx++) {
            const ox = tx * tileSize;
            const oy = ty * tileSize;
            const w = tileSize - grout;
            const h = tileSize - grout;

            const shadeIdx = (ty * 2 + tx) % tileShades.length;
            ctx.fillStyle = tileShades[shadeIdx];
            ctx.fillRect(ox + grout, oy + grout, w, h);

            // Stippled granite aggregate specks
            for (let s = 0; s < 95; s++) {
                const sx = ox + grout + Math.random() * w;
                const sy = oy + grout + Math.random() * h;
                const sr = 1 + Math.random() * 2;
                ctx.fillStyle = Math.random() > 0.4 ? 'rgba(255, 255, 255, 0.55)' : 'rgba(30, 41, 59, 0.35)';
                ctx.beginPath();
                ctx.arc(sx, sy, sr, 0, Math.PI * 2);
                ctx.fill();
            }

            // Concentric Fan / Scallop Arcs (Rẻ quạt) from 4 corners of each tile
            const corners = [
                { x: ox + grout, y: oy + grout, start: 0, end: Math.PI * 0.5 },
                { x: ox + tileSize, y: oy + grout, start: Math.PI * 0.5, end: Math.PI },
                { x: ox + tileSize, y: oy + tileSize, start: Math.PI, end: Math.PI * 1.5 },
                { x: ox + grout, y: oy + tileSize, start: Math.PI * 1.5, end: Math.PI * 2 }
            ];

            const radii = [42, 84, 126, 168, 210];
            corners.forEach((cr) => {
                radii.forEach((r) => {
                    ctx.save();
                    ctx.beginPath();
                    ctx.rect(ox + grout, oy + grout, w, h);
                    ctx.clip();

                    ctx.strokeStyle = 'rgba(71, 85, 105, 0.42)';
                    ctx.lineWidth = 3.0;
                    ctx.beginPath();
                    ctx.arc(cr.x, cr.y, r, cr.start, cr.end);
                    ctx.stroke();

                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
                    ctx.lineWidth = 1.4;
                    ctx.beginPath();
                    ctx.arc(cr.x, cr.y, r + 1.8, cr.start, cr.end);
                    ctx.stroke();

                    ctx.restore();
                });
            });
        }
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
    bctx.fillStyle = '#808080';
    bctx.fillRect(0, 0, size, size);

    bctx.fillStyle = '#202020';
    for (let i = 0; i <= 2; i++) {
        bctx.fillRect(i * tileSize - 2, 0, 4, size);
        bctx.fillRect(0, i * tileSize - 2, size, 4);
    }

    bctx.strokeStyle = '#404040';
    bctx.lineWidth = 3.0;
    for (let ty = 0; ty < 2; ty++) {
        for (let tx = 0; tx < 2; tx++) {
            const ox = tx * tileSize;
            const oy = ty * tileSize;
            const corners = [
                { x: ox, y: oy, start: 0, end: Math.PI * 0.5 },
                { x: ox + tileSize, y: oy, start: Math.PI * 0.5, end: Math.PI },
                { x: ox + tileSize, y: oy + tileSize, start: Math.PI, end: Math.PI * 1.5 },
                { x: ox, y: oy + tileSize, start: Math.PI * 1.5, end: Math.PI * 2 }
            ];
            corners.forEach((cr) => {
                [42, 84, 126, 168, 210].forEach((r) => {
                    bctx.beginPath();
                    bctx.arc(cr.x, cr.y, r, cr.start, cr.end);
                    bctx.stroke();
                });
            });
        }
    }

    const bumpTex = new THREE.CanvasTexture(bc);
    bumpTex.wrapS = THREE.RepeatWrapping;
    bumpTex.wrapT = THREE.RepeatWrapping;
    bumpTex.anisotropy = Math.min(8, maxAnisotropy);

    return { colorTex, bumpTex };
}

// Create authentic Vietnamese beveled granite/concrete curbstone texture (Bó vỉa vát cong 1m/viên)
function createCurbstoneTextures(maxAnisotropy = 4) {
    const w = 256;
    const h = 128;
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#78828e');
    grad.addColorStop(0.12, '#8d97a3');
    grad.addColorStop(0.44, '#b4bcc6');
    grad.addColorStop(0.48, '#e2e8f0');
    grad.addColorStop(0.54, '#adb6c0');
    grad.addColorStop(1.0, '#bcc4cd');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 150; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.45)' : 'rgba(30, 41, 59, 0.25)';
        ctx.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random() * 2);
    }

    ctx.fillStyle = '#2d3748';
    ctx.fillRect(0, 0, 4, h);
    ctx.fillRect(w - 4, 0, 4, h);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.50)';
    ctx.fillRect(4, 0, 2, h);

    const colorTex = new THREE.CanvasTexture(c);
    colorTex.colorSpace = THREE.SRGBColorSpace;
    colorTex.wrapS = THREE.RepeatWrapping;
    colorTex.wrapT = THREE.ClampToEdgeWrapping;
    colorTex.anisotropy = Math.min(8, maxAnisotropy);

    const bc = document.createElement('canvas');
    bc.width = w;
    bc.height = h;
    const bctx = bc.getContext('2d');

    const bgrad = bctx.createLinearGradient(0, 0, 0, h);
    bgrad.addColorStop(0, '#303030');
    bgrad.addColorStop(0.45, '#c0c0c0');
    bgrad.addColorStop(0.48, '#ffffff');
    bgrad.addColorStop(0.55, '#d0d0d0');
    bgrad.addColorStop(1.0, '#d0d0d0');
    bctx.fillStyle = bgrad;
    bctx.fillRect(0, 0, w, h);

    bctx.fillStyle = '#050505';
    bctx.fillRect(0, 0, 4, h);
    bctx.fillRect(w - 4, 0, 4, h);

    const bumpTex = new THREE.CanvasTexture(bc);
    bumpTex.wrapS = THREE.RepeatWrapping;
    bumpTex.wrapT = THREE.ClampToEdgeWrapping;
    bumpTex.anisotropy = Math.min(8, maxAnisotropy);

    return { colorTex, bumpTex };
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

    // Build flat upward-facing ground polygon geometry strictly in XZ plane with planar UVs
    const buildGroundPoly = (pts, yLevel, uvScale = 1.25) => {
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

        // Planar world XZ UVs for seamless procedural paving
        const pos = out.attributes.position;
        const uvs = new Float32Array(pos.count * 2);
        for (let i = 0; i < pos.count; i++) {
            uvs[i * 2] = pos.getX(i) * uvScale;
            uvs[i * 2 + 1] = pos.getZ(i) * uvScale;
        }
        out.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
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

    // Beveled curbstones (bó vỉa vát cong 1m/viên) with authentic 3D slant profile and expansion joints matching Photo 4
    const curbGeoms = [];
    const buildCurbQuad = (p0Out, p1Out, p1In, p0In, u0 = 0, u1 = 1) => {
        const yGutter = -0.008;
        const yTop = 0.008;
        const positions = new Float32Array([
            p0Out[0], yGutter, p0Out[1],
            p1Out[0], yGutter, p1Out[1],
            p1In[0],  yTop,    p1In[1],

            p0Out[0], yGutter, p0Out[1],
            p1In[0],  yTop,    p1In[1],
            p0In[0],  yTop,    p0In[1]
        ]);
        const uvs = new Float32Array([
            u0, 0.0,
            u1, 0.0,
            u1, 1.0,

            u0, 0.0,
            u1, 1.0,
            u0, 1.0
        ]);
        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
        geom.computeVertexNormals();
        return geom;
    };

    const pushMiteredCurb = (pStartOuter, pStartInner, pEndOuter, pEndInner) => {
        const len = Math.hypot(pEndOuter[0] - pStartOuter[0], pEndOuter[1] - pStartOuter[1]);
        curbGeoms.push(buildCurbQuad(pStartOuter, pEndOuter, pEndInner, pStartInner, 0, len));
    };
    const pushRoadSideCurb = (road, vOuter, vInner, uStart, uEnd, startHit = null, endHit = null) => {
        const p0Out = startHit ? [startHit.outer.x, startHit.outer.z] : uvToWorld(road, uStart, vOuter);
        const p0In = startHit ? [startHit.inner.x, startHit.inner.z] : uvToWorld(road, uStart, vInner);
        const p1Out = endHit ? [endHit.outer.x, endHit.outer.z] : uvToWorld(road, uEnd, vOuter);
        const p1In = endHit ? [endHit.inner.x, endHit.inner.z] : uvToWorld(road, uEnd, vInner);
        const u0 = startHit ? (startHit.outer.u1 || uStart) : uStart;
        const u1 = endHit ? (endHit.outer.u1 || uEnd) : uEnd;
        curbGeoms.push(buildCurbQuad(p0Out, p1Out, p1In, p0In, u0, u1));
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

    const { colorTex: curbColorTex, bumpTex: curbBumpTex } = createCurbstoneTextures(maxAniso);
    const curbMesh = new THREE.Mesh(
        mergeGeometries(curbGeoms, false),
        new THREE.MeshStandardMaterial({
            color: 0xffffff,
            map: curbColorTex,
            bumpMap: curbBumpTex,
            bumpScale: 0.022,
            roughness: 0.78,
            metalness: 0.04,
            polygonOffset: true,
            polygonOffsetFactor: -1
        })
    );
    curbGeoms.forEach((g) => g.dispose());
    curbMesh.receiveShadow = true;
    curbMesh.matrixAutoUpdate = false;
    curbMesh.updateMatrix();
    scene.add(curbMesh);

    // Batched crisp yellow centerline markings and white stop lines/crosswalks/parking dashed lines
    const yellowMarkingQuads = [];
    const whiteMarkingQuads = [];

    const pushMarkingRect = (targetArray, road, uCenter, vCenter, lenAlongU, widthAlongV) => {
        const [wx, wz] = uvToWorld(road, uCenter, vCenter);
        targetArray.push({ x: wx, y: -0.005, z: wz, w: lenAlongU, h: widthAlongV, rz: -road.rotY });
    };

    const pushYellowCenterline = (road, uFrom, uTo) => {
        const dashLen = 3.0;
        const step = 6.4;
        for (let u = uFrom + dashLen * 0.5; u + dashLen * 0.5 <= uTo + 0.001; u += step) {
            pushMarkingRect(yellowMarkingQuads, road, u, 0, dashLen, 0.38);
        }
    };

    const pushWhiteEdgeDashes = (road, uFrom, uTo, vOffset) => {
        const dashLen = 2.0;
        const step = 4.2;
        for (let u = uFrom + dashLen * 0.5; u + dashLen * 0.5 <= uTo + 0.001; u += step) {
            pushMarkingRect(whiteMarkingQuads, road, u, vOffset, dashLen, 0.22);
        }
    };

    const pushZebraCrosswalk = (road, uCenter, barLen, maxHalfSpan, numBars = 8) => {
        const span = maxHalfSpan * 2.0;
        const barWidth = 0.62;
        const pitch = span / numBars;
        for (let i = 0; i < numBars; i++) {
            const v = -maxHalfSpan + pitch * (i + 0.5);
            pushMarkingRect(whiteMarkingQuads, road, uCenter, v, barLen, barWidth);
        }
    };

    const pushStopLine = (road, uStop, vSign, asphaltHalfW) => {
        const innerV = 0.36;
        const outerV = asphaltHalfW - 0.30;
        const centerV = vSign * ((innerV + outerV) * 0.5);
        pushMarkingRect(whiteMarkingQuads, road, uStop, centerV, 0.45, outerV - innerV);
    };

    // Dashed yellow centerlines dividing opposing traffic strictly stopping 2.0m before junctions (Photo 2 & 3)
    pushYellowCenterline(roadDefs.nh, -168.0, -119.0);
    pushYellowCenterline(roadDefs.nh, -88.4, -7.5);
    pushYellowCenterline(roadDefs.nh, 1.5, 168.0);
    pushYellowCenterline(roadDefs.ltk, -128.0, -85.55);
    pushYellowCenterline(roadDefs.ltk, -53.55, 31.0);
    pushYellowCenterline(roadDefs.ltk, 69.2, 128.0);
    pushYellowCenterline(roadDefs.dd, -176.0, -120.7);
    pushYellowCenterline(roadDefs.dd, -81.9, 176.0);

    // White parking/outer lane dashed lines along Ly Thuong Kiet matching Photo 2, 3, 4
    pushWhiteEdgeDashes(roadDefs.ltk, -128.0, -85.55, -5.8);
    pushWhiteEdgeDashes(roadDefs.ltk, -128.0, -85.55, +5.8);
    pushWhiteEdgeDashes(roadDefs.ltk, -53.55, 31.0, -5.8);
    pushWhiteEdgeDashes(roadDefs.ltk, -53.55, 31.0, +5.8);
    pushWhiteEdgeDashes(roadDefs.ltk, 69.2, 128.0, -5.8);
    pushWhiteEdgeDashes(roadDefs.ltk, 69.2, 128.0, +5.8);

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

    const yellowMarkingsMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        roughness: 0.65,
        metalness: 0.0,
        emissive: 0xb45309,
        emissiveIntensity: 0.16,
        polygonOffset: true,
        polygonOffsetFactor: -2
    });
    const whiteMarkingsMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.68,
        metalness: 0.0,
        emissive: 0x334155,
        emissiveIntensity: 0.10,
        polygonOffset: true,
        polygonOffsetFactor: -2
    });
    createMergedGroundQuads(scene, yellowMarkingQuads, yellowMarkingsMat, true);
    createMergedGroundQuads(scene, whiteMarkingQuads, whiteMarkingsMat, true);

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

    // Flush campus-perimeter sidewalks strictly outside outer road curbstones
    const sidewalkGeoms = [];

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
    ], 0.005, 1.25));
    sidewalkGeoms.push(buildGroundPoly([
        [nhNePt.x, nhNePt.z],
        [ddSePt.x, ddSePt.z],
        [ddSeCampus.x, ddSeCampus.z],
        [nhNeCampus.x, nhNeCampus.z]
    ], 0.005, 1.25));
    sidewalkGeoms.push(buildGroundPoly([
        [ddSePt.x, ddSePt.z],
        uvToWorld(roadDefs.dd, ddEndU, +ddHalfW),
        uvToWorld(roadDefs.dd, ddEndU, +10.1),
        [ddSeCampus.x, ddSeCampus.z]
    ], 0.005, 1.25));

    // Outer sidewalk along West side of Ly Thuong Kiet split cleanly outside road carriageways
    const pushLtkOuterSegment = (uStart, uEnd) => {
        const swNearStart = uvToWorld(roadDefs.ltk, uStart, -ltkHalfW);
        const swNearEnd = uvToWorld(roadDefs.ltk, uEnd, -ltkHalfW);
        const swFarEnd = uvToWorld(roadDefs.ltk, uEnd, -ltkHalfW - 4.5);
        const swFarStart = uvToWorld(roadDefs.ltk, uStart, -ltkHalfW - 4.5);
        sidewalkGeoms.push(buildGroundPoly([
            [swNearStart[0], swNearStart[1]],
            [swNearEnd[0], swNearEnd[1]],
            [swFarEnd[0], swFarEnd[1]],
            [swFarStart[0], swFarStart[1]]
        ], 0.005, 1.25));
    };

    // Segment 1: south of Nguyen Hue junction
    pushLtkOuterSegment(roadDefs.ltk.uMin, ltkSwNh.outer.u1);
    // Segment 2: between Nguyen Hue and Dong Da junctions
    pushLtkOuterSegment(ltkNwNh.outer.u1, ltkSwDd.outer.u1);
    // Segment 3: north of Dong Da junction
    pushLtkOuterSegment(ltkNwDd.outer.u1, roadDefs.ltk.uMax);

    const { colorTex: sidewalkColorTex, bumpTex: sidewalkBumpTex } = createTerrazzoSidewalkTextures(maxAniso);
    const sidewalkMesh = new THREE.Mesh(
        mergeGeometries(sidewalkGeoms, false),
        new THREE.MeshStandardMaterial({
            color: 0xffffff,
            map: sidewalkColorTex,
            bumpMap: sidewalkBumpTex,
            bumpScale: 0.016,
            roughness: 0.82,
            metalness: 0.02
        })
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
function createDongDaLeftWingGateStructure(scene, maxAniso = 4, animatedFlags = null) {
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
        color: 0xffffff
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

    // 3. Ceramic Tiled Flanking Pillars supporting overhead beam from below
    const pilW = 0.60;
    const pilH = baseH + signH;
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

    // 4. Overhead Tiled Beam resting cleanly on top of pillars with eave overhang
    const totalW = baseW + pilW * 2 + 0.04;
    const beamH = 0.50;
    const beamD = 0.76;
    const beamGeom = new THREE.BoxGeometry(totalW, beamH, beamD);
    const beamMesh = new THREE.Mesh(beamGeom, tileMat);
    beamMesh.position.set(0, baseH + signH + beamH * 0.5, 0.06);
    beamMesh.castShadow = true;
    beamMesh.receiveShadow = true;
    group.add(beamMesh);

    // 5. Under-beam Spotlights shining bright warm light day and night
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = 128;
    glowCanvas.height = 128;
    const gCtx = glowCanvas.getContext('2d');
    const radGrad = gCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
    radGrad.addColorStop(0, 'rgba(255, 246, 218, 0.60)');
    radGrad.addColorStop(0.45, 'rgba(255, 235, 185, 0.20)');
    radGrad.addColorStop(1, 'rgba(255, 235, 185, 0)');
    gCtx.fillStyle = radGrad;
    gCtx.fillRect(0, 0, 128, 128);
    const glowTex = new THREE.CanvasTexture(glowCanvas);
    const glowMat = new THREE.MeshBasicMaterial({
        map: glowTex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const coneGeom = new THREE.ConeGeometry(0.48, 1.30, 16, 1, true);
    coneGeom.translate(0, -0.65, 0);
    coneGeom.rotateX(0.42);
    const coneMat = new THREE.MeshBasicMaterial({
        color: 0xfff6d4,
        transparent: true,
        opacity: 0.30,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
    });

    for (const spotX of [-0.85, 1.25]) {
        const spotGroup = new THREE.Group();
        spotGroup.position.set(spotX, baseH + signH, 0.38);

        const brackGeom = new THREE.BoxGeometry(0.06, 0.06, 0.12);
        const brackMesh = new THREE.Mesh(brackGeom, darkMetalMat);
        brackMesh.position.set(0, -0.03, -0.02);

        const lampGeom = new THREE.BoxGeometry(0.24, 0.10, 0.16);
        const lampMesh = new THREE.Mesh(lampGeom, darkMetalMat);
        lampMesh.rotation.x = 0.65;
        lampMesh.position.set(0, -0.08, 0.02);

        const lensGeom = new THREE.PlaneGeometry(0.20, 0.10);
        const lensMesh = new THREE.Mesh(lensGeom, lampLensMat);
        lensMesh.rotation.x = -Math.PI * 0.5 + 0.65;
        lensMesh.position.set(0, -0.13, 0.01);

        const spotLight = new THREE.PointLight(0xfff3d0, 4.2, 7.5, 1.2);
        spotLight.position.set(0, -0.12, 0);

        const coneMesh = new THREE.Mesh(coneGeom, coneMat);

        spotGroup.add(brackMesh, lampMesh, lensMesh, spotLight, coneMesh);
        group.add(spotGroup);

        const glowMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), glowMat);
        glowMesh.position.set(spotX, baseH + signH - 0.45, baseD * 0.5 + 0.022);
        group.add(glowMesh);
    }

    // 6. Top Decorative Railing and 4 dynamic colored flags on 4 poles above overhead beam
    const railY0 = baseH + signH + beamH;
    const barGeom = new THREE.CylinderGeometry(0.014, 0.014, totalW - 0.1, 6);
    barGeom.rotateZ(Math.PI * 0.5);
    for (let r = 0; r < 3; r++) {
        const barMesh = new THREE.Mesh(barGeom, darkMetalMat);
        barMesh.position.set(0, railY0 + 0.10 + r * 0.12, 0.06);
        group.add(barMesh);
    }

    const flagPoleX = [-2.1, -0.7, 0.7, 2.1];
    const poleH = 0.92;
    const poleGeom = new THREE.CylinderGeometry(0.020, 0.022, poleH, 8);
    const ballGeom = new THREE.SphereGeometry(0.042, 8, 8);
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.25, metalness: 0.85 });
    const flagColors = [0xdc2626, 0xf59e0b, 0x2563eb, 0x16a34a];
    const flagW = 0.72;
    const flagH = 0.46;
    const clothGeom = new THREE.PlaneGeometry(flagW, flagH, 6, 2);
    clothGeom.translate(flagW * 0.5, 0, 0);

    for (let i = 0; i < 4; i++) {
        const px = flagPoleX[i];
        const poleMesh = new THREE.Mesh(poleGeom, darkMetalMat);
        poleMesh.position.set(px, railY0 + poleH * 0.5, 0.06);
        group.add(poleMesh);

        const ballMesh = new THREE.Mesh(ballGeom, goldMat);
        ballMesh.position.set(px, railY0 + poleH + 0.03, 0.06);
        group.add(ballMesh);

        const flagMat = new THREE.MeshStandardMaterial({
            color: flagColors[i],
            side: THREE.DoubleSide,
            roughness: 0.65,
            metalness: 0.05
        });
        const flagMesh = new THREE.Mesh(clothGeom.clone(), flagMat);
        flagMesh.position.set(px, railY0 + poleH - 0.26, 0.06);
        flagMesh.userData.phase = i * 1.5;
        flagMesh.userData.isGateFlag = true;
        group.add(flagMesh);

        if (animatedFlags) {
            animatedFlags.push(flagMesh);
        }
    }

    // Position group seamlessly on authentic left wing of Gate 38 Dong Da
    const gateAngle = 0.4461;
    group.rotation.y = gateAngle + Math.PI;
    group.position.set(23.35, 0, -90.88);

    scene.add(group);
}

// Create authentic Nha D West Facade, entrance canopy, and perimeter fence viewed from Ly Thuong Kiet (Photo 1)
function createNhaDWestFacade(scene, maxAniso = 4) {
    const group = new THREE.Group();

    // 1. Generate high-resolution Nha D West Facade PBR color & bump textures matching Photo 1
    const sizeW = 1024;
    const sizeH = 1344;
    const canvas = document.createElement('canvas');
    canvas.width = sizeW;
    canvas.height = sizeH;
    const ctx = canvas.getContext('2d');

    // Base off-white exterior architectural finish on flanking columns
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, sizeW, sizeH);

    // Subtle formwork seams on left and right columns
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.40)';
    ctx.lineWidth = 1.5;
    for (let y = 100; y < sizeH; y += 120) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(190, y);
        ctx.moveTo(834, y);
        ctx.lineTo(sizeW, y);
        ctx.stroke();
    }

    // Central recessed bay clad in dark bronze-brown horizontal ceramic tiles
    const bayX = 190;
    const bayW = 644;
    ctx.fillStyle = '#453027';
    ctx.fillRect(bayX, 0, bayW, sizeH);

    // Fine horizontal tile joint lines
    const tileH = 16;
    for (let y = 0; y < sizeH; y += tileH) {
        ctx.strokeStyle = 'rgba(25, 17, 13, 0.55)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(bayX, y);
        ctx.lineTo(bayX + bayW, y);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(bayX, y + 1.8);
        ctx.lineTo(bayX + bayW, y + 1.8);
        ctx.stroke();
    }

    // Top Header Signboard on dark bronze tiles: Official HUSC shield emblem + university names matching Photo 1
    const signY0 = 26;
    const signH = 145;

    // Draw official HUSC shield emblem on the left
    drawHuscShield(ctx, bayX + 82, signY0 + signH * 0.5, 114);

    // Signboard text lines
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.70)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 2;

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    ctx.font = '700 38px "Inter", "Segoe UI", sans-serif';
    ctx.fillText('ĐẠI HỌC HUẾ', bayX + 162, signY0 + 44);

    ctx.font = '800 46px "Inter", "Segoe UI", sans-serif';
    ctx.fillText('TRƯỜNG ĐẠI HỌC KHOA HỌC', bayX + 162, signY0 + 98);
    ctx.restore();

    // 4 Upper floors: wide 4-pane dark reflective ribbon windows + white concrete spandrel beams
    const winX = bayX + 30;
    const winW = bayW - 60;
    const winH = 175;
    const floorY = [205, 440, 675, 910];

    for (let f = 0; f < 4; f++) {
        const fy = floorY[f];

        // Horizontal white concrete spandrel beam separating floors
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(bayX, fy - 26, bayW, 26);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
        ctx.fillRect(bayX, fy - 4, bayW, 4);

        // Dark bronze window frame outer border
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(winX - 6, fy - 4, winW + 12, winH + 8);

        // 4 casement window panes per floor
        const paneW = (winW - 18) / 4;
        for (let p = 0; p < 4; p++) {
            const px = winX + p * (paneW + 6);

            // Dark tinted glass gradient with sky reflection
            const glassGrad = ctx.createLinearGradient(px, fy, px, fy + winH);
            glassGrad.addColorStop(0, '#1e293b');
            glassGrad.addColorStop(0.35, '#0f172a');
            glassGrad.addColorStop(1, '#090d16');
            ctx.fillStyle = glassGrad;
            ctx.fillRect(px, fy, paneW, winH);

            // Diagonal sky reflection streak
            ctx.fillStyle = 'rgba(186, 230, 253, 0.14)';
            ctx.beginPath();
            ctx.moveTo(px, fy + 40);
            ctx.lineTo(px + paneW * 0.7, fy);
            ctx.lineTo(px + paneW, fy);
            ctx.lineTo(px + paneW * 0.3, fy + winH);
            ctx.lineTo(px, fy + winH);
            ctx.closePath();
            ctx.fill();

            // Upper transom sash divider
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(px, fy + 44);
            ctx.lineTo(px + paneW, fy + 44);
            ctx.stroke();

            // Inner glass rim highlight
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
            ctx.lineWidth = 1.2;
            ctx.strokeRect(px + 2, fy + 2, paneW - 4, winH - 4);
        }
    }

    // Ground Floor entrance lobby: glass curtain wall, double entrance doors, and handles
    const lobbyY = 1145;
    const lobbyH = sizeH - lobbyY;

    // White horizontal spandrel beam above ground floor
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(bayX, lobbyY - 26, bayW, 26);

    // Dark charcoal lobby outer structural frame
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(winX - 6, lobbyY - 4, winW + 12, lobbyH - 8);

    // Warm interior lobby ambient glow through glass
    const lobbyGrad = ctx.createLinearGradient(winX, lobbyY, winX, lobbyY + lobbyH);
    lobbyGrad.addColorStop(0, 'rgba(30, 41, 59, 0.95)');
    lobbyGrad.addColorStop(0.55, 'rgba(51, 65, 85, 0.88)');
    lobbyGrad.addColorStop(1, 'rgba(15, 23, 42, 0.98)');
    ctx.fillStyle = lobbyGrad;
    ctx.fillRect(winX, lobbyY, winW, lobbyH - 14);

    // Center double glass doors
    const doorW = 120;
    const doorX = winX + (winW - doorW) * 0.5;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.fillRect(doorX, lobbyY + 8, doorW, lobbyH - 22);

    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.strokeRect(doorX, lobbyY + 8, doorW * 0.5, lobbyH - 22);
    ctx.strokeRect(doorX + doorW * 0.5, lobbyY + 8, doorW * 0.5, lobbyH - 22);

    // Stainless steel vertical door handles
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(doorX + doorW * 0.5 - 10, lobbyY + 68, 4, 46);
    ctx.fillRect(doorX + doorW * 0.5 + 6, lobbyY + 68, 4, 46);

    // Base planter curb with lush green shrubbery along building foundation
    ctx.fillStyle = '#334155';
    ctx.fillRect(bayX - 20, sizeH - 18, bayW + 40, 18);
    for (let i = 0; i < 90; i++) {
        const gx = bayX - 16 + Math.random() * (bayW + 32);
        const gy = sizeH - 12 + Math.random() * 12;
        const gr = 4 + Math.random() * 6;
        ctx.fillStyle = Math.random() > 0.4 ? '#166534' : '#15803d';
        ctx.beginPath();
        ctx.arc(gx, gy, gr, 0, Math.PI * 2);
        ctx.fill();
    }

    const facadeColorTex = new THREE.CanvasTexture(canvas);
    facadeColorTex.colorSpace = THREE.SRGBColorSpace;
    facadeColorTex.anisotropy = Math.min(8, maxAniso);

    // Facade bump texture for crisp brick grout and window frame relief
    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = sizeW;
    bumpCanvas.height = sizeH;
    const bctx = bumpCanvas.getContext('2d');
    bctx.fillStyle = '#808080';
    bctx.fillRect(0, 0, sizeW, sizeH);

    // Recessed dark tile zone
    bctx.fillStyle = '#6a6a6a';
    bctx.fillRect(bayX, 0, bayW, sizeH);
    bctx.fillStyle = '#303030';
    for (let y = 0; y < sizeH; y += tileH) {
        bctx.fillRect(bayX, y, bayW, 2);
    }

    // Windows bump
    bctx.fillStyle = '#202020';
    for (let f = 0; f < 4; f++) {
        bctx.fillRect(winX - 6, floorY[f] - 4, winW + 12, winH + 8);
    }
    bctx.fillRect(winX - 6, lobbyY - 4, winW + 12, lobbyH - 8);

    const facadeBumpTex = new THREE.CanvasTexture(bumpCanvas);
    facadeBumpTex.anisotropy = Math.min(8, maxAniso);

    // Main Facade Mesh mounted on West face of Nha D
    const facadeW = 11.6;
    const facadeH = 15.2;
    const facadeGeom = new THREE.PlaneGeometry(facadeW, facadeH);
    const facadeMat = new THREE.MeshStandardMaterial({
        map: facadeColorTex,
        bumpMap: facadeBumpTex,
        bumpScale: 0.018,
        roughness: 0.42,
        metalness: 0.10
    });
    const facadeMesh = new THREE.Mesh(facadeGeom, facadeMat);
    facadeMesh.position.set(0, facadeH * 0.5, 0);
    facadeMesh.receiveShadow = true;
    group.add(facadeMesh);

    // 2. 3D Cantilevered Glass & Steel Entrance Canopy (Mái sảnh kính) matching Photo 1
    const canopyW = 6.6;
    const canopyD = 1.6;
    const canopyH = 0.08;
    const canopyY = 3.65;
    const canopyZ = canopyD * 0.5;

    // Canopy dark metal frame
    const canopyFrameGeom = new THREE.BoxGeometry(canopyW, canopyH, canopyD);
    const darkMetalMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.35,
        metalness: 0.80
    });
    const canopyFrameMesh = new THREE.Mesh(canopyFrameGeom, darkMetalMat);
    canopyFrameMesh.position.set(0, canopyY, canopyZ);
    group.add(canopyFrameMesh);

    // Translucent laminated glass panel
    const glassGeom = new THREE.BoxGeometry(canopyW - 0.2, 0.024, canopyD - 0.2);
    const canopyGlassMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        transparent: true,
        opacity: 0.72,
        roughness: 0.12,
        metalness: 0.15
    });
    const glassMesh = new THREE.Mesh(glassGeom, canopyGlassMat);
    glassMesh.position.set(0, canopyY + 0.035, canopyZ);
    group.add(glassMesh);

    // 4 Diagonal stainless steel tension tie rods supporting the canopy from wall anchors above
    const tieX = [-2.6, -0.88, 0.88, 2.6];
    const rodLength = Math.hypot(canopyD - 0.1, 1.25);
    const rodAngle = Math.atan2(canopyD - 0.1, 1.25);
    const rodGeom = new THREE.CylinderGeometry(0.018, 0.018, rodLength, 8);
    rodGeom.rotateX(rodAngle);
    const steelMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.25, metalness: 0.90 });

    for (let i = 0; i < 4; i++) {
        const rod = new THREE.Mesh(rodGeom, steelMat);
        rod.position.set(tieX[i], canopyY + 0.625, (canopyD - 0.1) * 0.5);
        group.add(rod);

        // Wall anchor clevis mount
        const clevisGeom = new THREE.BoxGeometry(0.08, 0.14, 0.12);
        const clevis = new THREE.Mesh(clevisGeom, darkMetalMat);
        clevis.position.set(tieX[i], canopyY + 1.25, 0.06);
        group.add(clevis);
    }

    // Ground entrance terrace steps
    const stepGeom = new THREE.BoxGeometry(7.2, 0.22, 1.8);
    const stepMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.78, metalness: 0.05 });
    const stepMesh = new THREE.Mesh(stepGeom, stepMat);
    stepMesh.position.set(0, 0.11, 0.9);
    stepMesh.receiveShadow = true;
    group.add(stepMesh);

    // Position entire Nha D West Facade assembly onto building West wall
    const bldgYaw = 0.06;
    const halfLen = 11.15;
    const facadePosX = -74.0 - halfLen * Math.cos(bldgYaw);
    const facadePosZ = -25.5 - halfLen * Math.sin(bldgYaw);

    group.position.set(facadePosX, 0, facadePosZ);
    group.rotation.y = -Math.PI * 0.5 + bldgYaw;
    scene.add(group);

    // 3. Perimeter boundary fence with corrugated galvanized metal panels & concrete pillars (Photo 1)
    const fenceGroup = new THREE.Group();
    const fenceZCenter = -25.5;
    const fenceX = -105.8;
    const fenceSpanZ = 16.0;

    // Concrete base curb
    const fenceBaseGeom = new THREE.BoxGeometry(0.40, 0.45, fenceSpanZ);
    const concreteMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.88, metalness: 0.02 });
    const fenceBaseMesh = new THREE.Mesh(fenceBaseGeom, concreteMat);
    fenceBaseMesh.position.set(0, 0.225, 0);
    fenceGroup.add(fenceBaseMesh);

    // Square concrete support pillars with beveled caps
    const pillarGeom = new THREE.BoxGeometry(0.55, 2.65, 0.55);
    const pillarCapGeom = new THREE.ConeGeometry(0.42, 0.22, 4);
    pillarCapGeom.rotateY(Math.PI * 0.25);
    const pillarZ = [-8.0, 0, 8.0];

    for (let p of pillarZ) {
        const pillar = new THREE.Mesh(pillarGeom, concreteMat);
        pillar.position.set(0, 1.325, p);
        pillar.castShadow = true;
        pillar.receiveShadow = true;
        fenceGroup.add(pillar);

        const cap = new THREE.Mesh(pillarCapGeom, concreteMat);
        cap.position.set(0, 2.65 + 0.11, p);
        fenceGroup.add(cap);
    }

    // Corrugated galvanized metal sheet panel (Tôn lượn sóng)
    const cSize = 256;
    const cCanvas = document.createElement('canvas');
    cCanvas.width = cSize;
    cCanvas.height = cSize;
    const cctx = cCanvas.getContext('2d');
    cctx.fillStyle = '#94a3b8';
    cctx.fillRect(0, 0, cSize, cSize);

    // Vertical corrugated sin wave shading
    const wavePitch = 16;
    for (let x = 0; x < cSize; x += wavePitch) {
        const waveGrad = cctx.createLinearGradient(x, 0, x + wavePitch, 0);
        waveGrad.addColorStop(0, '#64748b');
        waveGrad.addColorStop(0.45, '#cbd5e1');
        waveGrad.addColorStop(0.55, '#f1f5f9');
        waveGrad.addColorStop(1.0, '#475569');
        cctx.fillStyle = waveGrad;
        cctx.fillRect(x, 0, wavePitch, cSize);
    }

    const corrugatedTex = new THREE.CanvasTexture(cCanvas);
    corrugatedTex.colorSpace = THREE.SRGBColorSpace;
    corrugatedTex.wrapS = THREE.RepeatWrapping;
    corrugatedTex.wrapT = THREE.RepeatWrapping;
    corrugatedTex.repeat.set(12, 1);
    corrugatedTex.anisotropy = Math.min(8, maxAniso);

    const corrugateMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: corrugatedTex,
        roughness: 0.38,
        metalness: 0.75
    });

    const fencePanel1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.95, 7.35), corrugateMat);
    fencePanel1.position.set(0, 0.45 + 0.975, -3.95);
    fencePanel1.castShadow = true;
    fenceGroup.add(fencePanel1);

    const fencePanel2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.95, 7.35), corrugateMat);
    fencePanel2.position.set(0, 0.45 + 0.975, 3.95);
    fencePanel2.castShadow = true;
    fenceGroup.add(fencePanel2);

    // Lush landscaping bushes peeking behind the fence matching Photo 1
    const bushGeom = new THREE.SphereGeometry(0.85, 6, 6);
    const bushMat = new THREE.MeshStandardMaterial({ color: 0x1e3a1e, roughness: 0.88 });
    for (let b = 0; b < 8; b++) {
        const bush = new THREE.Mesh(bushGeom, bushMat);
        const bz = -6.5 + b * 1.8;
        bush.position.set(0.65, 0.85, bz);
        bush.scale.set(0.9, 1.2, 1.1);
        fenceGroup.add(bush);
    }

    fenceGroup.position.set(fenceX, 0, fenceZCenter);
    scene.add(fenceGroup);
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
    createDongDaLeftWingGateStructure(scene, maxAniso, animatedFlags);

    // Authentic Building D West facade, canopy, and fence viewed from Ly Thuong Kiet (Photo 1)
    createNhaDWestFacade(scene, maxAniso);

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

// Create authentic urban ensemble opposite Ly Thuong Kiet x Dong Da intersection matching Photos 1-5
function createLyThuongKietOppositeUrbanEnsemble(scene, hardwareProfile = { tier: 'high', maxAnisotropy: 4 }) {
    const maxAniso = hardwareProfile.maxAnisotropy || 4;
    const ensembleGroup = new THREE.Group();

    // 1. GOLDLAND PLAZA COMPLEX (Photos 1, 3, 4)
    // Procedural PBR texture for Goldland Plaza: white structural colonnade + rich golden honeycomb lattice
    const glCanvas = document.createElement('canvas');
    glCanvas.width = 1024;
    glCanvas.height = 512;
    const glCtx = glCanvas.getContext('2d');

    // Base background and golden lattice bays
    glCtx.fillStyle = '#1e1b18';
    glCtx.fillRect(0, 0, 1024, 512);

    const numBays = 7;
    const bayWidth = 1024 / numBays;
    const colWidth = 24;

    for (let b = 0; b < numBays; b++) {
        const bx = b * bayWidth;

        // Rich golden honeycomb / diamond sunscreen lattice
        glCtx.fillStyle = '#b45309';
        glCtx.fillRect(bx + colWidth, 40, bayWidth - colWidth * 2, 360);

        // Golden geometric lattice diamonds
        glCtx.strokeStyle = '#facc15';
        glCtx.lineWidth = 2.0;
        const gridStep = 18;
        for (let gy = 40; gy < 400; gy += gridStep) {
            glCtx.beginPath();
            glCtx.moveTo(bx + colWidth, gy);
            glCtx.lineTo(bx + bayWidth - colWidth, gy + (bayWidth - colWidth * 2) * 0.5);
            glCtx.moveTo(bx + colWidth, gy + (bayWidth - colWidth * 2) * 0.5);
            glCtx.lineTo(bx + bayWidth - colWidth, gy);
            glCtx.stroke();
        }

        // Golden highlight sheen
        const goldGrad = glCtx.createLinearGradient(bx, 40, bx, 400);
        goldGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
        goldGrad.addColorStop(0.5, 'rgba(234, 179, 8, 0.20)');
        goldGrad.addColorStop(1, 'rgba(180, 83, 9, 0.55)');
        glCtx.fillStyle = goldGrad;
        glCtx.fillRect(bx + colWidth, 40, bayWidth - colWidth * 2, 360);

        // Ground floor recessed glass arcade with warm cafe glow
        const cafeGrad = glCtx.createLinearGradient(bx, 400, bx, 512);
        cafeGrad.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
        cafeGrad.addColorStop(0.4, 'rgba(254, 243, 199, 0.40)');
        cafeGrad.addColorStop(1, 'rgba(15, 23, 42, 0.98)');
        glCtx.fillStyle = cafeGrad;
        glCtx.fillRect(bx + 6, 400, bayWidth - 12, 112);

        // White vertical structural columns
        glCtx.fillStyle = '#f8fafc';
        glCtx.fillRect(bx, 0, colWidth, 512);
        glCtx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        glCtx.fillRect(bx + colWidth - 4, 0, 4, 512);
    }

    // Top white parapet header beam
    glCtx.fillStyle = '#f8fafc';
    glCtx.fillRect(0, 0, 1024, 40);
    glCtx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    glCtx.fillRect(0, 36, 1024, 4);

    // Ground floor horizontal canopy beam
    glCtx.fillStyle = '#d97706';
    glCtx.fillRect(0, 396, 1024, 12);

    const goldlandTex = new THREE.CanvasTexture(glCanvas);
    goldlandTex.colorSpace = THREE.SRGBColorSpace;
    goldlandTex.anisotropy = Math.min(8, maxAniso);

    const goldlandMat = new THREE.MeshStandardMaterial({
        map: goldlandTex,
        roughness: 0.38,
        metalness: 0.55
    });

    const whiteTrimMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.50,
        metalness: 0.05
    });

    // Goldland Plaza main building block
    const glW = 38.0;
    const glD = 28.0;
    const glH = 21.0;
    const glGroup = new THREE.Group();

    const glBodyMesh = new THREE.Mesh(new THREE.BoxGeometry(glD, glH, glW), goldlandMat);
    glBodyMesh.position.set(0, glH * 0.5, 0);
    glBodyMesh.castShadow = true;
    glBodyMesh.receiveShadow = true;
    glGroup.add(glBodyMesh);

    // 3D White Colonnade exterior pillars along front facade
    const colGeom = new THREE.BoxGeometry(0.85, glH, 0.85);
    for (let c = 0; c <= numBays; c++) {
        const cz = -glW * 0.5 + c * (glW / numBays);
        const colMesh = new THREE.Mesh(colGeom, whiteTrimMat);
        colMesh.position.set(glD * 0.5 + 0.42, glH * 0.5, cz);
        colMesh.castShadow = true;
        glGroup.add(colMesh);
    }

    // Ground floor cantilevered canopy projecting towards street
    const glCanopyGeom = new THREE.BoxGeometry(3.5, 0.26, glW + 1.2);
    const glCanopyMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.35, metalness: 0.65 });
    const glCanopyMesh = new THREE.Mesh(glCanopyGeom, glCanopyMat);
    glCanopyMesh.position.set(glD * 0.5 + 1.75, 4.2, 0);
    glGroup.add(glCanopyMesh);

    // 6 Outdoor cafe umbrellas (Highlands Coffee) in rich dark espresso brown (Photos 1 & 3)
    const umbrellaMat = new THREE.MeshStandardMaterial({ color: 0x582f1e, roughness: 0.72 });
    const darkPoleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.4, roughness: 0.5 });
    const umbrellaCanopyGeom = new THREE.ConeGeometry(1.65, 0.48, 8);
    const umbrellaPoleGeom = new THREE.CylinderGeometry(0.038, 0.038, 2.5, 8);
    const tableGeom = new THREE.CylinderGeometry(0.48, 0.48, 0.045, 12);
    const stoolGeom = new THREE.CylinderGeometry(0.18, 0.18, 0.42, 8);

    const umbrellaSpots = [
        [glD * 0.5 + 3.2, -12.0], [glD * 0.5 + 3.2, -4.0], [glD * 0.5 + 3.2, 4.0], [glD * 0.5 + 3.2, 12.0],
        [glD * 0.5 + 6.4, -8.0], [glD * 0.5 + 6.4, 8.0]
    ];

    for (const [ux, uz] of umbrellaSpots) {
        const uGroup = new THREE.Group();
        const pole = new THREE.Mesh(umbrellaPoleGeom, darkPoleMat);
        pole.position.set(0, 1.25, 0);
        uGroup.add(pole);

        const canopy = new THREE.Mesh(umbrellaCanopyGeom, umbrellaMat);
        canopy.position.set(0, 2.35, 0);
        canopy.castShadow = true;
        uGroup.add(canopy);

        const table = new THREE.Mesh(tableGeom, tableMat);
        table.position.set(0, 0.72, 0);
        uGroup.add(table);

        for (let s = 0; s < 3; s++) {
            const sang = (s / 3) * Math.PI * 2;
            const stool = new THREE.Mesh(stoolGeom, darkPoleMat);
            stool.position.set(Math.cos(sang) * 0.65, 0.21, Math.sin(sang) * 0.65);
            uGroup.add(stool);
        }
        uGroup.position.set(ux, 0, uz);
        glGroup.add(uGroup);
    }

    // GOLDLAND PLAZA polished granite entrance monument sign (Photo 1)
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 128;
    const signCtx = signCanvas.getContext('2d');
    signCtx.fillStyle = '#18181b';
    signCtx.fillRect(0, 0, 512, 128);

    signCtx.strokeStyle = '#c28b42';
    signCtx.lineWidth = 4;
    signCtx.strokeRect(8, 8, 496, 112);

    signCtx.font = '900 48px "Cinzel", "Times New Roman", serif';
    signCtx.textAlign = 'center';
    signCtx.textBaseline = 'middle';
    signCtx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    signCtx.shadowBlur = 6;
    const goldGradText = signCtx.createLinearGradient(0, 30, 0, 95);
    goldGradText.addColorStop(0, '#fef08a');
    goldGradText.addColorStop(0.5, '#facc15');
    goldGradText.addColorStop(1, '#ca8a04');
    signCtx.fillStyle = goldGradText;
    signCtx.fillText('GOLDLAND PLAZA', 256, 64);

    const signTex = new THREE.CanvasTexture(signCanvas);
    signTex.colorSpace = THREE.SRGBColorSpace;
    signTex.anisotropy = Math.min(8, maxAniso);

    const monumentMat = new THREE.MeshStandardMaterial({
        color: 0x18181b,
        roughness: 0.25,
        metalness: 0.2
    });
    const monumentSignMat = new THREE.MeshStandardMaterial({
        map: signTex,
        roughness: 0.35,
        metalness: 0.4
    });

    const monumentBase = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.5, 5.2), monumentMat);
    monumentBase.position.set(glD * 0.5 + 7.2, 0.75, 14.5);
    glGroup.add(monumentBase);

    const monumentFace1 = new THREE.Mesh(new THREE.PlaneGeometry(5.0, 1.3), monumentSignMat);
    monumentFace1.position.set(glD * 0.5 + 7.72, 0.75, 14.5);
    monumentFace1.rotation.y = Math.PI * 0.5;
    glGroup.add(monumentFace1);

    const monumentFace2 = new THREE.Mesh(new THREE.PlaneGeometry(5.0, 1.3), monumentSignMat);
    monumentFace2.position.set(glD * 0.5 + 6.68, 0.75, 14.5);
    monumentFace2.rotation.y = -Math.PI * 0.5;
    glGroup.add(monumentFace2);

    // Rooftop penthouse structure
    const glRoofMesh = new THREE.Mesh(new THREE.BoxGeometry(16.0, 3.6, 20.0), whiteTrimMat);
    glRoofMesh.position.set(-2.0, glH + 1.8, 0);
    glGroup.add(glRoofMesh);

    // Telecommunication Lattice Antenna Mast with aviation beacon light (Photo 1)
    const towerH = 19.0;
    const towerMastGeom = new THREE.CylinderGeometry(0.25, 0.95, towerH, 3);
    const towerMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.85, roughness: 0.25 });
    const towerMesh = new THREE.Mesh(towerMastGeom, towerMat);
    towerMesh.position.set(-2.0, glH + 3.6 + towerH * 0.5, -4.0);
    glGroup.add(towerMesh);

    // Aviation red warning beacon light at antenna mast apex
    const beaconSphereGeom = new THREE.SphereGeometry(0.24, 8, 8);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const beaconMesh = new THREE.Mesh(beaconSphereGeom, beaconMat);
    beaconMesh.position.set(-2.0, glH + 3.6 + towerH + 0.15, -4.0);
    glGroup.add(beaconMesh);

    // Position Goldland Plaza at the North-West corner of the intersection
    glGroup.position.set(-154.0, 0, -62.0);
    ensembleGroup.add(glGroup);

    // 2. CORNER GABLED COMMERCIAL BUILDING WITH GIANT CURVED LED SCREEN (Photos 3, 4, 5)
    const cgGroup = new THREE.Group();

    // Procedural texture for Corner Gabled Building (soft pastel sage-green + white mouldings)
    const cgCanvas = document.createElement('canvas');
    cgCanvas.width = 1024;
    cgCanvas.height = 512;
    const cgCtx = cgCanvas.getContext('2d');

    // Pastel mint / sage-green wall render
    cgCtx.fillStyle = '#bbf7d0';
    cgCtx.fillRect(0, 0, 1024, 512);

    // White classical pilasters and mouldings
    cgCtx.fillStyle = '#f8fafc';
    for (let c = 0; c <= 8; c++) {
        cgCtx.fillRect(c * 128, 0, 18, 512);
    }
    // Horizontal frieze beams
    cgCtx.fillRect(0, 0, 1024, 32);
    cgCtx.fillRect(0, 180, 1024, 24);
    cgCtx.fillRect(0, 360, 1024, 24);

    // Neoclassical upper windows with white architraves and dark glass panes
    for (let w = 0; w < 8; w++) {
        const wx = w * 128 + 28;
        cgCtx.fillStyle = '#0f172a';
        cgCtx.fillRect(wx, 50, 72, 110);
        cgCtx.fillRect(wx, 220, 72, 120);

        cgCtx.strokeStyle = '#ffffff';
        cgCtx.lineWidth = 3;
        cgCtx.strokeRect(wx, 50, 72, 110);
        cgCtx.strokeRect(wx, 220, 72, 120);
    }

    // Ground floor commercial glass storefronts
    for (let g = 0; g < 8; g++) {
        const gx = g * 128 + 24;
        cgCtx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        cgCtx.fillRect(gx, 390, 80, 122);
        cgCtx.strokeStyle = '#e2e8f0';
        cgCtx.lineWidth = 3;
        cgCtx.strokeRect(gx, 390, 80, 122);
    }

    const cgTex = new THREE.CanvasTexture(cgCanvas);
    cgTex.colorSpace = THREE.SRGBColorSpace;
    cgTex.anisotropy = Math.min(8, maxAniso);

    const cgMat = new THREE.MeshStandardMaterial({
        map: cgTex,
        roughness: 0.65,
        metalness: 0.08
    });

    // 3-story front corner building body
    const cgbW = 16.0;
    const cgbD = 14.0;
    const cgbH = 12.5;
    const cgbMesh = new THREE.Mesh(new THREE.BoxGeometry(cgbW, cgbH, cgbD), cgMat);
    cgbMesh.position.set(0, cgbH * 0.5, 0);
    cgbMesh.castShadow = true;
    cgbMesh.receiveShadow = true;
    cgGroup.add(cgbMesh);

    // Signature Triangular Gable Pediment facing the intersection (Photos 3, 4, 5)
    const pedimentShape = new THREE.Shape();
    pedimentShape.moveTo(-cgbW * 0.5 - 0.2, 0);
    pedimentShape.lineTo(cgbW * 0.5 + 0.2, 0);
    pedimentShape.lineTo(0, 4.2);
    pedimentShape.closePath();

    const pedimentGeom = new THREE.ExtrudeGeometry(pedimentShape, { depth: 0.6, bevelEnabled: false });
    pedimentGeom.translate(0, cgbH, cgbD * 0.5 - 0.3);
    const pedimentMesh = new THREE.Mesh(pedimentGeom, whiteTrimMat);
    cgGroup.add(pedimentMesh);

    // Circular arched window & blue brand plaque in the center of the gable pediment
    const atticHoleGeom = new THREE.CylinderGeometry(0.75, 0.75, 0.7, 16);
    atticHoleGeom.rotateX(Math.PI * 0.5);
    const atticGlassMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2, metalness: 0.5 });
    const atticMesh = new THREE.Mesh(atticHoleGeom, atticGlassMat);
    atticMesh.position.set(0, cgbH + 1.6, cgbD * 0.5 + 0.05);
    cgGroup.add(atticMesh);

    // GIANT CURVED LED ADVERTISING SCREEN (Photos 3, 4, 5)
    const ledCanvas = document.createElement('canvas');
    ledCanvas.width = 512;
    ledCanvas.height = 256;
    const ledCtx = ledCanvas.getContext('2d');

    // Vibrant digital billboard gradient
    const ledGrad = ledCtx.createLinearGradient(0, 0, 512, 256);
    ledGrad.addColorStop(0, '#090d16');
    ledGrad.addColorStop(0.3, '#1e1b4b');
    ledGrad.addColorStop(0.7, '#0369a1');
    ledGrad.addColorStop(1, '#0f172a');
    ledCtx.fillStyle = ledGrad;
    ledCtx.fillRect(0, 0, 512, 256);

    // Digital dot matrix scanlines
    ledCtx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    for (let y = 0; y < 256; y += 4) {
        ledCtx.fillRect(0, y, 512, 1.5);
    }

    // Glowing vibrant billboard graphics
    ledCtx.fillStyle = '#38bdf8';
    ledCtx.font = '900 36px "Inter", "Segoe UI", sans-serif';
    ledCtx.textAlign = 'center';
    ledCtx.shadowColor = '#0284c7';
    ledCtx.shadowBlur = 12;
    ledCtx.fillText('HUẾ · THÀNH PHỐ DI SẢN', 256, 82);

    ledCtx.fillStyle = '#fde047';
    ledCtx.font = '800 28px "Inter", "Segoe UI", sans-serif';
    ledCtx.shadowColor = '#eab308';
    ledCtx.shadowBlur = 10;
    ledCtx.fillText('FESTIVAL HUẾ 2024', 256, 138);

    ledCtx.fillStyle = '#f8fafc';
    ledCtx.font = '700 20px "Inter", "Segoe UI", sans-serif';
    ledCtx.shadowBlur = 4;
    ledCtx.fillText('CHÀO ĐÓN DU KHÁCH THẬP PHƯƠNG', 256, 192);

    const ledTex = new THREE.CanvasTexture(ledCanvas);
    ledTex.colorSpace = THREE.SRGBColorSpace;
    ledTex.anisotropy = Math.min(8, maxAniso);

    const ledMat = new THREE.MeshStandardMaterial({
        map: ledTex,
        emissiveMap: ledTex,
        emissive: 0xffffff,
        emissiveIntensity: 0.88,
        roughness: 0.25,
        metalness: 0.1
    });

    // Ground floor semi-circular porte-cochere canopy and 2nd floor curved balcony matching Photo 4
    const canopyR = 4.2;
    const canopyH = 0.25;
    const canopyGeom = new THREE.CylinderGeometry(canopyR, canopyR, canopyH, 24, 1, false, -Math.PI * 0.5, Math.PI);
    const canopyMesh = new THREE.Mesh(canopyGeom, whiteTrimMat);
    canopyMesh.position.set(0, 3.8, cgbD * 0.5);
    cgGroup.add(canopyMesh);

    // 3 White cylindrical columns supporting the canopy
    const canopyColGeom = new THREE.CylinderGeometry(0.20, 0.20, 3.8, 12);
    const colAngles = [-Math.PI * 0.28, 0, Math.PI * 0.28];
    for (let c = 0; c < 3; c++) {
        const cang = colAngles[c];
        const col = new THREE.Mesh(canopyColGeom, whiteTrimMat);
        col.position.set(
            Math.sin(cang) * (canopyR - 0.45),
            1.9,
            cgbD * 0.5 + Math.cos(cang) * (canopyR - 0.45)
        );
        cgGroup.add(col);
    }

    // Curved black metal railing on 2nd-floor balcony
    const railGeom = new THREE.CylinderGeometry(canopyR - 0.1, canopyR - 0.1, 0.85, 24, 1, true, -Math.PI * 0.5, Math.PI);
    const railMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.3, side: THREE.DoubleSide });
    const railMesh = new THREE.Mesh(railGeom, railMat);
    railMesh.position.set(0, 4.35, cgbD * 0.5);
    cgGroup.add(railMesh);

    const ledMesh = new THREE.Mesh(new THREE.BoxGeometry(9.6, 3.8, 0.22), ledMat);
    ledMesh.position.set(0, 6.8, cgbD * 0.5 + 0.16);
    cgGroup.add(ledMesh);

    // Stepped hotel / residential building terraces extending to the rear (Photos 4, 5)
    const stepHotelMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.65 });
    const step1Mesh = new THREE.Mesh(new THREE.BoxGeometry(18.0, 16.5, 14.0), stepHotelMat);
    step1Mesh.position.set(0, 8.25, -12.0);
    cgGroup.add(step1Mesh);

    const step2Mesh = new THREE.Mesh(new THREE.BoxGeometry(15.0, 21.0, 12.0), stepHotelMat);
    step2Mesh.position.set(0, 10.5, -23.0);
    cgGroup.add(step2Mesh);

    // Cantilevered white balcony lines on stepped hotel
    const balconyGeom = new THREE.BoxGeometry(18.4, 0.45, 1.4);
    for (let f = 1; f <= 4; f++) {
        const bm = new THREE.Mesh(balconyGeom, whiteTrimMat);
        bm.position.set(0, f * 3.8, -5.5);
        cgGroup.add(bm);
    }

    // Position Corner Gabled Building set back at the center of the Ly Thuong Kiet x Dong Da intersection corner
    cgGroup.position.set(-98.0, 0, -68.0);
    cgGroup.rotation.y = -0.5424;
    ensembleGroup.add(cgGroup);

    // 3. VIETTEL OFFICE BUILDING (Photos 3, 4)
    const vtGroup = new THREE.Group();
    const vtW = 16.0;
    const vtD = 15.0;
    const vtH = 28.0;

    // Procedural Viettel facade texture: 9 stories of cyan-blue reflective glass ribbon windows
    const vtCanvas = document.createElement('canvas');
    vtCanvas.width = 512;
    vtCanvas.height = 512;
    const vtCtx = vtCanvas.getContext('2d');

    vtCtx.fillStyle = '#f8fafc';
    vtCtx.fillRect(0, 0, 512, 512);

    const vtFloors = 9;
    const vtFloorH = 512 / vtFloors;
    for (let f = 0; f < vtFloors; f++) {
        const fy = f * vtFloorH;
        // Blue reflective curtain wall glass
        const vGlassGrad = vtCtx.createLinearGradient(0, fy + 8, 0, fy + vtFloorH - 6);
        vGlassGrad.addColorStop(0, '#0284c7');
        vGlassGrad.addColorStop(0.4, '#0369a1');
        vGlassGrad.addColorStop(1, '#0c4a6e');
        vtCtx.fillStyle = vGlassGrad;
        vtCtx.fillRect(8, fy + 8, 496, vtFloorH - 14);

        // Mullions
        vtCtx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        vtCtx.lineWidth = 1.5;
        for (let m = 28; m < 512; m += 40) {
            vtCtx.beginPath();
            vtCtx.moveTo(m, fy + 8);
            vtCtx.lineTo(m, fy + vtFloorH - 6);
            vtCtx.stroke();
        }
    }

    const vtTex = new THREE.CanvasTexture(vtCanvas);
    vtTex.colorSpace = THREE.SRGBColorSpace;
    vtTex.anisotropy = Math.min(8, maxAniso);

    const vtMat = new THREE.MeshStandardMaterial({
        map: vtTex,
        roughness: 0.22,
        metalness: 0.65
    });

    const vtBodyMesh = new THREE.Mesh(new THREE.BoxGeometry(vtW, vtH, vtD), vtMat);
    vtBodyMesh.position.set(0, vtH * 0.5, 0);
    vtBodyMesh.castShadow = true;
    vtGroup.add(vtBodyMesh);

    // Official red "viettel" logo sign on rooftop white header parapet (Photos 3, 4)
    const vLogoCanvas = document.createElement('canvas');
    vLogoCanvas.width = 512;
    vLogoCanvas.height = 128;
    const vLogoCtx = vLogoCanvas.getContext('2d');
    vLogoCtx.fillStyle = '#ffffff';
    vLogoCtx.fillRect(0, 0, 512, 128);

    vLogoCtx.fillStyle = '#dc2626';
    vLogoCtx.font = '900 68px "Inter", "Arial Black", sans-serif';
    vLogoCtx.textAlign = 'center';
    vLogoCtx.textBaseline = 'middle';
    vLogoCtx.fillText('viettel', 256, 64);

    const vLogoTex = new THREE.CanvasTexture(vLogoCanvas);
    vLogoTex.colorSpace = THREE.SRGBColorSpace;
    vLogoTex.anisotropy = Math.min(8, maxAniso);

    const vLogoMat = new THREE.MeshStandardMaterial({ map: vLogoTex, roughness: 0.4 });
    const vLogoMesh = new THREE.Mesh(new THREE.BoxGeometry(12.0, 2.2, 0.45), vLogoMat);
    vLogoMesh.position.set(0, vtH + 1.1, vtD * 0.5 + 0.25);
    vtGroup.add(vLogoMesh);

    // Position Viettel Building set back behind the sidewalk along Ly Thuong Kiet
    vtGroup.position.set(-96.0, 0, -104.0);
    vtGroup.rotation.y = -0.04;
    ensembleGroup.add(vtGroup);

    // 4. MELIA VINPEARL HUE SKYSCRAPER 33 TẦNG (Photos 1, 2)
    const vpGroup = new THREE.Group();

    // Vincom Plaza 5-storey retail podium at base (Photo 2)
    const vpPodiumW = 42.0;
    const vpPodiumD = 36.0;
    const vpPodiumH = 18.0;

    // Procedural light limestone texture with entrance portal for Vincom Plaza podium
    const vpPodiumCanvas = document.createElement('canvas');
    vpPodiumCanvas.width = 512;
    vpPodiumCanvas.height = 256;
    const vpPctx = vpPodiumCanvas.getContext('2d');
    vpPctx.fillStyle = '#f1f5f9';
    vpPctx.fillRect(0, 0, 512, 256);

    // Warm limestone stone joint lines
    vpPctx.strokeStyle = '#cbd5e1';
    vpPctx.lineWidth = 2;
    for (let py = 32; py < 256; py += 32) {
        vpPctx.beginPath();
        vpPctx.moveTo(0, py);
        vpPctx.lineTo(512, py);
        vpPctx.stroke();
    }
    // Vertical facade fins
    for (let px = 24; px < 512; px += 32) {
        vpPctx.beginPath();
        vpPctx.moveTo(px, 0);
        vpPctx.lineTo(px, 256);
        vpPctx.stroke();
    }
    // Ground level grand glass entrance
    vpPctx.fillStyle = '#0369a1';
    vpPctx.fillRect(160, 160, 192, 96);
    // Gold lettering "VINCOM PLAZA"
    vpPctx.fillStyle = '#d97706';
    vpPctx.font = 'bold 22px sans-serif';
    vpPctx.textAlign = 'center';
    vpPctx.fillText('VINCOM PLAZA', 256, 145);

    const vpPodiumTex = new THREE.CanvasTexture(vpPodiumCanvas);
    vpPodiumTex.colorSpace = THREE.SRGBColorSpace;
    vpPodiumTex.anisotropy = Math.min(8, maxAniso);
    const vpPodiumMat = new THREE.MeshStandardMaterial({
        map: vpPodiumTex,
        roughness: 0.65,
        metalness: 0.15
    });

    const vpPodiumMesh = new THREE.Mesh(new THREE.BoxGeometry(vpPodiumW, vpPodiumH, vpPodiumD), vpPodiumMat);
    vpPodiumMesh.position.set(0, vpPodiumH * 0.5, 0);
    vpPodiumMesh.castShadow = true;
    vpPodiumMesh.receiveShadow = true;
    vpGroup.add(vpPodiumMesh);

    // Main 33-storey skyscraper tower with glossy vibrant blue glass curtain wall (Photo 2)
    const vpTowerW = 26.0;
    const vpTowerD = 22.0;
    const vpTowerH = 96.0;

    // Procedural glossy blue glass curtain wall texture
    const vpCanvas = document.createElement('canvas');
    vpCanvas.width = 512;
    vpCanvas.height = 1024;
    const vpCtx = vpCanvas.getContext('2d');

    vpCtx.fillStyle = '#0284c7';
    vpCtx.fillRect(0, 0, 512, 1024);

    // 33 distinct horizontal floors with vibrant blue gradient and silver mullions
    const vpFloors = 33;
    const vpFloorH = 1024 / vpFloors;
    for (let f = 0; f < vpFloors; f++) {
        const fy = f * vpFloorH;
        const vGlassGrad = vpCtx.createLinearGradient(0, fy, 0, fy + vpFloorH);
        vGlassGrad.addColorStop(0.0, '#38bdf8');
        vGlassGrad.addColorStop(0.3, '#0ea5e9');
        vGlassGrad.addColorStop(0.7, '#0284c7');
        vGlassGrad.addColorStop(1.0, '#0369a1');
        vpCtx.fillStyle = vGlassGrad;
        vpCtx.fillRect(3, fy + 2, 506, vpFloorH - 4);

        // Horizontal spandrel glass divider
        vpCtx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        vpCtx.fillRect(0, fy, 512, 2.5);

        // Vertical silver reflective mullions
        vpCtx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
        vpCtx.lineWidth = 1.8;
        for (let m = 16; m < 512; m += 24) {
            vpCtx.beginPath();
            vpCtx.moveTo(m, fy + 2);
            vpCtx.lineTo(m, fy + vpFloorH - 2);
            vpCtx.stroke();
        }
    }

    const vpTex = new THREE.CanvasTexture(vpCanvas);
    vpTex.colorSpace = THREE.SRGBColorSpace;
    vpTex.anisotropy = Math.min(8, maxAniso);

    const vpMat = new THREE.MeshStandardMaterial({
        map: vpTex,
        roughness: 0.08,
        metalness: 0.90
    });

    const vpTowerMesh = new THREE.Mesh(new THREE.BoxGeometry(vpTowerW, vpTowerH, vpTowerD), vpMat);
    vpTowerMesh.position.set(0, vpPodiumH + vpTowerH * 0.5, 0);
    vpTowerMesh.castShadow = true;
    vpTowerMesh.receiveShadow = true;
    vpGroup.add(vpTowerMesh);

    // Iconic chevron triangular notch crown on top 4 floors (Photo 2)
    const crownShape = new THREE.Shape();
    crownShape.moveTo(-vpTowerW * 0.5, 0);
    crownShape.lineTo(vpTowerW * 0.5, 0);
    crownShape.lineTo(vpTowerW * 0.5, 12.0);
    crownShape.lineTo(0, 4.0);
    crownShape.lineTo(-vpTowerW * 0.5, 12.0);
    crownShape.closePath();

    const crownGeom = new THREE.ExtrudeGeometry(crownShape, { depth: vpTowerD, bevelEnabled: false });
    crownGeom.translate(0, vpPodiumH + vpTowerH, -vpTowerD * 0.5);
    const crownMat = new THREE.MeshStandardMaterial({
        color: 0x075985,
        roughness: 0.08,
        metalness: 0.92
    });
    const crownMesh = new THREE.Mesh(crownGeom, crownMat);
    vpGroup.add(crownMesh);

    // Illuminated golden "MELIA VINPEARL" logo sign on crown parapet
    const vpLogoCanvas = document.createElement('canvas');
    vpLogoCanvas.width = 512;
    vpLogoCanvas.height = 128;
    const vpLctx = vpLogoCanvas.getContext('2d');
    vpLctx.fillStyle = '#0369a1';
    vpLctx.fillRect(0, 0, 512, 128);
    vpLctx.fillStyle = '#fef08a';
    vpLctx.font = 'bold 44px sans-serif';
    vpLctx.textAlign = 'center';
    vpLctx.textBaseline = 'middle';
    vpLctx.fillText('MELIÁ VINPEARL', 256, 64);
    const vpLogoTex = new THREE.CanvasTexture(vpLogoCanvas);
    vpLogoTex.colorSpace = THREE.SRGBColorSpace;
    const vpLogoMat = new THREE.MeshStandardMaterial({
        map: vpLogoTex,
        roughness: 0.25,
        metalness: 0.5,
        emissive: 0x0284c7,
        emissiveIntensity: 0.25
    });
    const vpLogoMesh = new THREE.Mesh(new THREE.PlaneGeometry(18.0, 4.5), vpLogoMat);
    vpLogoMesh.position.set(0, vpPodiumH + vpTowerH + 9.0, vpTowerD * 0.5 + 0.1);
    vpGroup.add(vpLogoMesh);

    // Red flashing aviation warning beacon on the pinnacle
    const vpBeaconMesh = new THREE.Mesh(beaconSphereGeom, beaconMat);
    vpBeaconMesh.position.set(0, vpPodiumH + vpTowerH + 13.0, 0);
    vpGroup.add(vpBeaconMesh);

    // Position Melia Vinpearl Hue at the center axis of the terminus of Dong Da street
    vpGroup.position.set(149.7, 0, -162.3);
    vpGroup.rotation.y = 2.6955;
    ensembleGroup.add(vpGroup);

    // 5. Raised median island on Dong Da street and double streetlamp poles with red festive banners (Photos 4, 5)
    // Precise orientation along Dong Da centerline (rotY = -0.4461)
    // The road forward vector is (cos(-0.4461), sin(-0.4461)) = (0.9021, -0.4315)
    // Geometry length along local X, with rotation.y = 0.4461 aligns exactly with the road centerline!
    const medianIslandGroup = new THREE.Group();
    const ddDef = { cx: -27.08, cz: -77.78, rotY: -0.4461 };
    const ddUx = Math.cos(ddDef.rotY);
    const ddUz = Math.sin(ddDef.rotY);
    const ddRotY = -ddDef.rotY;

    const medW = 1.35;
    const medH = 0.28;
    const medCurbMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.85 });
    const medLawnMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.90 });
    const shrubMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.82 });
    const shrubGeom = new THREE.SphereGeometry(0.48, 8, 6);

    // Build authentic raised median island spanning the entire length of Dong Da (from u = -82.0 to u = 176.0)
    // Segment 1: from intersection crosswalk (u = -82.0) to Gate 38 opening (u = 38.0), length = 120.0m
    // Segment 2: from Gate 38 opening (u = 52.0) to road terminus (u = 176.0), length = 124.0m
    const medianSegments = [
        { uStart: -82.0, uEnd: 38.0 },
        { uStart: 52.0, uEnd: 176.0 }
    ];

    medianSegments.forEach((seg) => {
        const segLen = seg.uEnd - seg.uStart;
        const uMid = (seg.uStart + seg.uEnd) * 0.5;
        const cx = ddDef.cx + uMid * ddUx;
        const cz = ddDef.cz + uMid * ddUz;

        const segGroup = new THREE.Group();

        // Main raised concrete curb block
        const curbGeom = new THREE.BoxGeometry(segLen, medH, medW);
        const curbMesh = new THREE.Mesh(curbGeom, medCurbMat);
        curbMesh.position.set(0, medH * 0.5, 0);
        segGroup.add(curbMesh);

        // Rounded bullnose cylinder caps at both ends
        const capGeom = new THREE.CylinderGeometry(medW * 0.5, medW * 0.5, medH, 12);
        const capWest = new THREE.Mesh(capGeom, medCurbMat);
        capWest.position.set(-segLen * 0.5, medH * 0.5, 0);
        segGroup.add(capWest);

        const capEast = new THREE.Mesh(capGeom, medCurbMat);
        capEast.position.set(segLen * 0.5, medH * 0.5, 0);
        segGroup.add(capEast);

        // Top green lawn surface
        const lawnGeom = new THREE.PlaneGeometry(segLen - 0.2, medW - 0.24);
        const lawnMesh = new THREE.Mesh(lawnGeom, medLawnMat);
        lawnMesh.rotation.x = -Math.PI * 0.5;
        lawnMesh.position.set(0, medH + 0.008, 0);
        segGroup.add(lawnMesh);

        // Sculpted round ornamental shrubs spaced every 7.5m along median island
        for (let sx = -segLen * 0.46; sx <= segLen * 0.46; sx += 7.5) {
            const shrub = new THREE.Mesh(shrubGeom, shrubMat);
            shrub.position.set(sx, medH + 0.42, 0);
            shrub.scale.set(1.1, 1.25, 0.95);
            segGroup.add(shrub);
        }

        segGroup.position.set(cx, 0, cz);
        segGroup.rotation.y = ddRotY;
        medianIslandGroup.add(segGroup);
    });

    // Streetlamp poles with double luminaire arms and festive banners along median island
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.75, roughness: 0.35 });
    const lumMat = new THREE.MeshBasicMaterial({ color: 0xfef9c3 });
    const poleH = 9.5;
    const poleGeom = new THREE.CylinderGeometry(0.08, 0.16, poleH, 8);
    const armGeom = new THREE.CylinderGeometry(0.035, 0.035, 2.2, 8);
    armGeom.rotateZ(Math.PI * 0.35);
    const lumGeom = new THREE.BoxGeometry(0.65, 0.12, 0.28);

    // Dual-sided Red Festive Propaganda Banners (Photos 4, 5)
    const banCanvas = document.createElement('canvas');
    banCanvas.width = 256;
    banCanvas.height = 512;
    const banCtx = banCanvas.getContext('2d');
    banCtx.fillStyle = '#dc2626';
    banCtx.fillRect(0, 0, 256, 512);
    banCtx.strokeStyle = '#facc15';
    banCtx.lineWidth = 6;
    banCtx.strokeRect(10, 10, 236, 492);

    // Golden 5-pointed star emblem
    banCtx.fillStyle = '#facc15';
    banCtx.beginPath();
    const cx = 128, cy = 90, rOut = 36, rIn = 16;
    for (let p = 0; p < 10; p++) {
        const pang = (p / 10) * Math.PI * 2 - Math.PI * 0.5;
        const pr = p % 2 === 0 ? rOut : rIn;
        const px = cx + Math.cos(pang) * pr;
        const py = cy + Math.sin(pang) * pr;
        if (p === 0) banCtx.moveTo(px, py); else banCtx.lineTo(px, py);
    }
    banCtx.closePath();
    banCtx.fill();

    banCtx.textAlign = 'center';
    banCtx.textBaseline = 'middle';
    banCtx.font = '900 28px "Inter", "Segoe UI", sans-serif';
    banCtx.fillText('CHÚC MỪNG', 128, 175);
    banCtx.fillText('NĂM MỚI', 128, 220);
    banCtx.font = '900 48px "Inter", "Segoe UI", sans-serif';
    banCtx.fillText('2024', 128, 290);
    banCtx.font = '700 22px "Inter", "Segoe UI", sans-serif';
    banCtx.fillText('MỪNG ĐẢNG', 128, 385);
    banCtx.fillText('MỪNG XUÂN', 128, 425);

    const banTex = new THREE.CanvasTexture(banCanvas);
    banTex.colorSpace = THREE.SRGBColorSpace;
    banTex.anisotropy = Math.min(8, maxAniso);
    const bannerMat = new THREE.MeshStandardMaterial({
        map: banTex,
        roughness: 0.45,
        metalness: 0.1,
        side: THREE.DoubleSide
    });

    const lampPositionsU = [-70.0, -22.0, 26.0, 80.0, 135.0];
    lampPositionsU.forEach((uPos, lIdx) => {
        const lx = ddDef.cx + uPos * ddUx;
        const lz = ddDef.cz + uPos * ddUz;

        const lGroup = new THREE.Group();
        const poleMesh = new THREE.Mesh(poleGeom, poleMat);
        poleMesh.position.set(0, poleH * 0.5, 0);
        lGroup.add(poleMesh);

        // Double outreach arms reaching across both lanes
        const arm1 = new THREE.Mesh(armGeom, poleMat);
        arm1.position.set(0, poleH - 0.3, -1.0);
        arm1.rotation.y = Math.PI * 0.5;
        lGroup.add(arm1);

        const arm2 = new THREE.Mesh(armGeom, poleMat);
        arm2.position.set(0, poleH - 0.3, 1.0);
        arm2.rotation.y = -Math.PI * 0.5;
        lGroup.add(arm2);

        const lum1 = new THREE.Mesh(lumGeom, lumMat);
        lum1.position.set(0, poleH - 0.55, -1.95);
        lGroup.add(lum1);

        const lum2 = new THREE.Mesh(lumGeom, lumMat);
        lum2.position.set(0, poleH - 0.55, 1.95);
        lGroup.add(lum2);

        // Near the intersection (lIdx === 0), attach the festive banners (Photos 4, 5)
        if (lIdx === 0) {
            const banW = 1.15;
            const banH = 2.6;
            const b1 = new THREE.Mesh(new THREE.PlaneGeometry(banW, banH), bannerMat);
            b1.position.set(0, 5.0, -0.68);
            b1.rotation.y = Math.PI * 0.5;
            lGroup.add(b1);

            const b2 = new THREE.Mesh(new THREE.PlaneGeometry(banW, banH), bannerMat);
            b2.position.set(0, 5.0, 0.68);
            b2.rotation.y = -Math.PI * 0.5;
            lGroup.add(b2);
        }

        lGroup.position.set(lx, 0, lz);
        lGroup.rotation.y = ddRotY;
        medianIslandGroup.add(lGroup);
    });

    ensembleGroup.add(medianIslandGroup);

    // 6. DÃY NHÀ PHỐ KINH DOANH & HÀNG CÂY XANH ĐƯỜNG ĐỐNG ĐA (Photo 5)
    const shGroup = new THREE.Group();
    const shCanvas = document.createElement('canvas');
    shCanvas.width = 1024;
    shCanvas.height = 256;
    const shCtx = shCanvas.getContext('2d');

    const shColors = ['#fef08a', '#e0e7ff', '#ffedd5', '#f1f5f9'];
    const shSigns = ['BÁNH MÌ HUẾ', 'CÀ PHÊ SÁNG', 'TIỆM ĂN NHANH', 'ĐẶC SẢN CỐ ĐÔ'];
    const signBg = ['#dc2626', '#78350f', '#ea580c', '#0284c7'];

    for (let i = 0; i < 4; i++) {
        const sx = i * 256;
        shCtx.fillStyle = shColors[i];
        shCtx.fillRect(sx, 0, 256, 256);

        // Upper windows
        shCtx.fillStyle = '#0f172a';
        shCtx.fillRect(sx + 30, 25, 65, 80);
        shCtx.fillRect(sx + 155, 25, 65, 80);

        // Store sign
        shCtx.fillStyle = signBg[i];
        shCtx.fillRect(sx + 16, 125, 224, 46);
        shCtx.strokeStyle = '#facc15';
        shCtx.lineWidth = 2;
        shCtx.strokeRect(sx + 16, 125, 224, 46);

        shCtx.fillStyle = '#ffffff';
        shCtx.font = '900 24px "Inter", "Segoe UI", sans-serif';
        shCtx.textAlign = 'center';
        shCtx.textBaseline = 'middle';
        shCtx.fillText(shSigns[i], sx + 128, 148);

        // Ground floor entrance
        shCtx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        shCtx.fillRect(sx + 20, 180, 216, 76);
    }

    const shTex = new THREE.CanvasTexture(shCanvas);
    shTex.colorSpace = THREE.SRGBColorSpace;
    shTex.anisotropy = Math.min(8, maxAniso);

    const shMat = new THREE.MeshStandardMaterial({ map: shTex, roughness: 0.72 });
    const shRowMesh = new THREE.Mesh(new THREE.BoxGeometry(42.0, 10.5, 12.0), shMat);
    shRowMesh.position.set(0, 5.25, 0);
    shGroup.add(shRowMesh);

    // Fabric awnings (mái hiên di động)
    const awningGeom = new THREE.BoxGeometry(9.6, 0.15, 2.2);
    awningGeom.rotateX(0.2);
    const awningColors = [0xdc2626, 0x15803d, 0xd97706, 0x0284c7];
    for (let i = 0; i < 4; i++) {
        const awMat = new THREE.MeshStandardMaterial({ color: awningColors[i], roughness: 0.65 });
        const awMesh = new THREE.Mesh(awningGeom, awMat);
        awMesh.position.set(-15.0 + i * 10.2, 3.8, 6.8);
        shGroup.add(awMesh);
    }

    // Position shophouses along the right side of Dong Da street
    shGroup.position.set(-42.0, 0, -84.0);
    shGroup.rotation.y = -0.4461;
    ensembleGroup.add(shGroup);

    // 7. Techcombank Hue Branch building at 24 Ly Thuong Kiet street corner (Photos 1, 2, 3)
    const tcbGroup = new THREE.Group();
    const tcbLen = 15.0;
    const tcbDepth = 16.0;
    const tcbPodiumH = 14.5;
    const tcbTowerH = 19.5;
    const tcbRadius = 3.8;

    // Procedural PBR texture for Techcombank podium and tower facade
    const tcbCanvas = document.createElement('canvas');
    tcbCanvas.width = 1024;
    tcbCanvas.height = 1024;
    const tcbCtx = tcbCanvas.getContext('2d');

    // Clean modern off-white building paneling
    tcbCtx.fillStyle = '#f8fafc';
    tcbCtx.fillRect(0, 0, 1024, 1024);

    // Subtle horizontal panel joint grooves
    tcbCtx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
    tcbCtx.lineWidth = 2;
    for (let py = 0; py < 1024; py += 64) {
        tcbCtx.beginPath();
        tcbCtx.moveTo(0, py);
        tcbCtx.lineTo(1024, py);
        tcbCtx.stroke();
    }

    // Ground floor storefront glass curtain wall (y: 780 to 1024)
    tcbCtx.fillStyle = '#1e293b';
    tcbCtx.fillRect(0, 780, 1024, 244);

    // Blue-tinted glass panes with warm interior glow and reflections
    const numStorefrontBays = 8;
    const bayW = 1024 / numStorefrontBays;
    for (let sb = 0; sb < numStorefrontBays; sb++) {
        const sx = sb * bayW;
        tcbCtx.fillStyle = '#0f172a';
        tcbCtx.fillRect(sx + 6, 795, bayW - 12, 220);

        const glassGrad = tcbCtx.createLinearGradient(sx + 6, 795, sx + bayW - 6, 1015);
        glassGrad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
        glassGrad.addColorStop(0.5, 'rgba(15, 23, 42, 0.85)');
        glassGrad.addColorStop(1, 'rgba(254, 240, 138, 0.35)');
        tcbCtx.fillStyle = glassGrad;
        tcbCtx.fillRect(sx + 10, 800, bayW - 20, 210);

        tcbCtx.strokeStyle = 'rgba(248, 250, 252, 0.6)';
        tcbCtx.lineWidth = 2;
        tcbCtx.strokeRect(sx + 10, 800, bayW - 20, 210);
    }

    // Festive promotional wall graphic decal on the corner facade bay (Photo 2)
    tcbCtx.fillStyle = '#dc2626';
    tcbCtx.fillRect(bayW * 0.1, 805, bayW * 2.2, 190);
    tcbCtx.fillStyle = '#ffffff';
    tcbCtx.font = '900 24px "Inter", sans-serif';
    tcbCtx.fillText('TECHCOMBANK', bayW * 0.2, 840);
    tcbCtx.font = '700 15px "Inter", sans-serif';
    tcbCtx.fillText('CHỌN TÀI KHOẢN', bayW * 0.2, 875);
    tcbCtx.fillText('TRỌN ĐỜI MIỄN PHÍ', bayW * 0.2, 905);
    tcbCtx.fillStyle = '#fef08a';
    tcbCtx.font = '700 14px "Inter", sans-serif';
    tcbCtx.fillText('GIÁ TRỊ VƯỢT TRỘI', bayW * 0.2, 935);

    // Decorative ribbon cross on gift box graphic
    tcbCtx.fillStyle = '#facc15';
    tcbCtx.fillRect(bayW * 1.6, 805, 18, 190);
    tcbCtx.fillRect(bayW * 0.1, 890, bayW * 2.2, 18);

    // Floors 2-4 podium light slate-blue paneling (y: 460 to 780)
    tcbCtx.fillStyle = '#e2e8f0';
    tcbCtx.fillRect(0, 460, 1024, 320);

    // Parapet horizontal white band with red Techcombank signage above floor 4 (y: 470 to 530)
    tcbCtx.fillStyle = '#ffffff';
    tcbCtx.fillRect(0, 470, 1024, 65);
    tcbCtx.strokeStyle = '#cbd5e1';
    tcbCtx.lineWidth = 3;
    tcbCtx.strokeRect(0, 470, 1024, 65);

    tcbCtx.fillStyle = '#dc2626';
    tcbCtx.font = '900 36px "Inter", sans-serif';
    tcbCtx.fillText('TECHCOMBANK', 140, 516);

    // Red Techcombank diamond logo on parapet
    tcbCtx.beginPath();
    tcbCtx.moveTo(90, 485);
    tcbCtx.lineTo(115, 502);
    tcbCtx.lineTo(90, 520);
    tcbCtx.lineTo(65, 502);
    tcbCtx.closePath();
    tcbCtx.fill();
    tcbCtx.fillStyle = '#ffffff';
    tcbCtx.fillRect(83, 496, 14, 13);

    // Floors 2, 3, 4 horizontal ribbon windows
    for (let f = 0; f < 3; f++) {
        const fy = 550 + f * 75;
        for (let w = 0; w < 6; w++) {
            const wx = w * (1024 / 6);
            tcbCtx.fillStyle = '#1e293b';
            tcbCtx.fillRect(wx + 15, fy, 1024 / 6 - 30, 48);
            tcbCtx.fillStyle = '#38bdf8';
            tcbCtx.fillRect(wx + 18, fy + 3, 1024 / 6 - 36, 42);
        }
    }

    // Upper tower floors 5-10 ribbon windows (y: 40 to 450)
    for (let tf = 0; tf < 6; tf++) {
        const ty = 50 + tf * 68;
        for (let tw = 0; tw < 6; tw++) {
            const twx = tw * (1024 / 6);
            tcbCtx.fillStyle = '#1e293b';
            tcbCtx.fillRect(twx + 18, ty, 1024 / 6 - 36, 40);
            tcbCtx.fillStyle = '#0284c7';
            tcbCtx.fillRect(twx + 21, ty + 3, 1024 / 6 - 42, 34);
        }
    }

    const tcbTex = new THREE.CanvasTexture(tcbCanvas);
    tcbTex.colorSpace = THREE.SRGBColorSpace;
    tcbTex.anisotropy = Math.min(8, maxAniso);

    const tcbMat = new THREE.MeshStandardMaterial({
        map: tcbTex,
        roughness: 0.35,
        metalness: 0.15
    });

    // 1. Techcombank 4-story podium base
    const tcbPodiumMesh = new THREE.Mesh(new THREE.BoxGeometry(tcbLen, tcbPodiumH, tcbDepth), tcbMat);
    tcbPodiumMesh.position.set(0, tcbPodiumH * 0.5, 0);
    tcbPodiumMesh.castShadow = true;
    tcbPodiumMesh.receiveShadow = true;
    tcbGroup.add(tcbPodiumMesh);

    // 2. Corner curved cylindrical bay on podium (facing the intersection) (Photos 1, 2)
    const tcbCornerX = tcbLen * 0.5 - tcbRadius;
    const tcbCornerZ = tcbDepth * 0.5 - tcbRadius;
    const tcbCornerPodiumGeom = new THREE.CylinderGeometry(tcbRadius, tcbRadius, tcbPodiumH, 24, 1, false, 0, Math.PI * 0.5);
    const tcbCornerPodiumMesh = new THREE.Mesh(tcbCornerPodiumGeom, tcbMat);
    tcbCornerPodiumMesh.position.set(tcbCornerX, tcbPodiumH * 0.5, tcbCornerZ);
    tcbCornerPodiumMesh.castShadow = true;
    tcbGroup.add(tcbCornerPodiumMesh);

    // 3. Signature 5th-floor circular cantilever ring pergola terrace (Photos 1, 2)
    const ringRadius = 4.8;
    const ringH = 0.55;
    const ringGeom = new THREE.CylinderGeometry(ringRadius, ringRadius, ringH, 32, 1, true);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4, metalness: 0.2, side: THREE.DoubleSide });
    const ringMesh = new THREE.Mesh(ringGeom, ringMat);
    ringMesh.position.set(tcbCornerX, tcbPodiumH + 3.0, tcbCornerZ);
    tcbGroup.add(ringMesh);

    // Circular pergola outer canopy lip
    const lipGeom = new THREE.TorusGeometry(ringRadius, 0.25, 8, 32);
    const lipMesh = new THREE.Mesh(lipGeom, whiteTrimMat);
    lipMesh.rotation.x = Math.PI * 0.5;
    lipMesh.position.set(tcbCornerX, tcbPodiumH + 3.25, tcbCornerZ);
    tcbGroup.add(lipMesh);

    // Slender support columns for circular pergola
    const ringColGeom = new THREE.CylinderGeometry(0.10, 0.10, 3.0, 8);
    for (let rc = 0; rc < 8; rc++) {
        const rAng = (rc / 8) * Math.PI * 2;
        const rCol = new THREE.Mesh(ringColGeom, whiteTrimMat);
        rCol.position.set(
            tcbCornerX + Math.cos(rAng) * (ringRadius - 0.4),
            tcbPodiumH + 1.5,
            tcbCornerZ + Math.sin(rAng) * (ringRadius - 0.4)
        );
        tcbGroup.add(rCol);
    }

    // 4. Upper tower main rectangular block (floors 5-10)
    const tcbTowerLen = 11.5;
    const tcbTowerDepth = 12.0;
    const tcbTowerMesh = new THREE.Mesh(new THREE.BoxGeometry(tcbTowerLen, tcbTowerH, tcbTowerDepth), tcbMat);
    tcbTowerMesh.position.set(-1.2, tcbPodiumH + tcbTowerH * 0.5, -1.0);
    tcbTowerMesh.castShadow = true;
    tcbGroup.add(tcbTowerMesh);

    // 5. Distinctive cylindrical curved tower bay rising up to rooftop (Photos 1, 2)
    const tcbTowerCylinderGeom = new THREE.CylinderGeometry(tcbRadius, tcbRadius, tcbTowerH + 1.5, 32);
    const tcbTowerCylinderMesh = new THREE.Mesh(tcbTowerCylinderGeom, tcbMat);
    tcbTowerCylinderMesh.position.set(tcbCornerX, tcbPodiumH + (tcbTowerH + 1.5) * 0.5, tcbCornerZ);
    tcbTowerCylinderMesh.castShadow = true;
    tcbGroup.add(tcbTowerCylinderMesh);

    // 6. Giant rooftop illuminated billboard frame with TECHCOMBANK sign and logo (Photos 1, 2)
    const tcbSignCanvas = document.createElement('canvas');
    tcbSignCanvas.width = 1024;
    tcbSignCanvas.height = 256;
    const tcbSignCtx = tcbSignCanvas.getContext('2d');

    // Bold red Techcombank letters
    tcbSignCtx.fillStyle = '#dc2626';
    tcbSignCtx.font = '900 110px "Inter", "Arial Black", sans-serif';
    tcbSignCtx.fillText('TECHCOMBANK', 40, 165);

    // Red Techcombank double-rhombus diamond logo
    tcbSignCtx.beginPath();
    tcbSignCtx.moveTo(930, 60);
    tcbSignCtx.lineTo(995, 128);
    tcbSignCtx.lineTo(930, 196);
    tcbSignCtx.lineTo(865, 128);
    tcbSignCtx.closePath();
    tcbSignCtx.fill();

    // White square cutout in center of diamond
    tcbSignCtx.fillStyle = '#ffffff';
    tcbSignCtx.fillRect(908, 106, 44, 44);

    const tcbSignTex = new THREE.CanvasTexture(tcbSignCanvas);
    tcbSignTex.colorSpace = THREE.SRGBColorSpace;
    tcbSignTex.anisotropy = Math.min(8, maxAniso);

    const tcbSignMat = new THREE.MeshStandardMaterial({
        map: tcbSignTex,
        emissiveMap: tcbSignTex,
        emissive: 0xffffff,
        emissiveIntensity: 0.92,
        roughness: 0.25,
        transparent: true
    });

    // Signboard facing Ly Thuong Kiet (along local +Z)
    const tcbRoofSignMesh = new THREE.Mesh(new THREE.PlaneGeometry(12.5, 3.2), tcbSignMat);
    tcbRoofSignMesh.position.set(0, tcbPodiumH + tcbTowerH + 2.0, tcbDepth * 0.5 - 2.0);
    tcbRoofSignMesh.rotation.y = 0;
    tcbGroup.add(tcbRoofSignMesh);

    // Signboard facing Dong Da (along local +X)
    const tcbRoofSignMeshNorth = new THREE.Mesh(new THREE.PlaneGeometry(12.5, 3.2), tcbSignMat);
    tcbRoofSignMeshNorth.position.set(tcbLen * 0.5 - 2.0, tcbPodiumH + tcbTowerH + 2.0, 0);
    tcbRoofSignMeshNorth.rotation.y = Math.PI * 0.5;
    tcbGroup.add(tcbRoofSignMeshNorth);

    // Structural steel support truss behind signs
    const tcbTrussGeom = new THREE.BoxGeometry(12.8, 3.0, 0.4);
    const tcbTrussMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.35 });
    const tcbTrussMesh = new THREE.Mesh(tcbTrussGeom, tcbTrussMat);
    tcbTrussMesh.position.set(0, tcbPodiumH + tcbTowerH + 2.0, tcbDepth * 0.5 - 2.2);
    tcbGroup.add(tcbTrussMesh);

    // Position Techcombank Building at South-West corner of Ly Thuong Kiet x Dong Da intersection
    tcbGroup.position.set(-142.0, 0, -1.5);
    tcbGroup.rotation.y = 1.5308;
    ensembleGroup.add(tcbGroup);

    // 8. DongA Bank Hue Branch building at 26 Ly Thuong Kiet street (Photos 1, 3)
    const daGroup = new THREE.Group();
    const daLen = 18.0;
    const daDepth = 18.0;
    const daH = 26.0;

    // Procedural PBR texture for DongA Bank teal / sea-green facade
    const daCanvas = document.createElement('canvas');
    daCanvas.width = 512;
    daCanvas.height = 1024;
    const daCtx = daCanvas.getContext('2d');

    // Rich teal / sea-green facade paint
    daCtx.fillStyle = '#235855';
    daCtx.fillRect(0, 0, 512, 1024);

    // Polished dark brown granite base for ground floor banking hall (y: 820 to 1024)
    daCtx.fillStyle = '#1c1917';
    daCtx.fillRect(0, 820, 512, 204);

    // Grand entrance glass doors and golden door frames
    daCtx.fillStyle = '#0f172a';
    daCtx.fillRect(160, 840, 192, 184);
    daCtx.strokeStyle = '#f59e0b';
    daCtx.lineWidth = 4;
    daCtx.strokeRect(165, 845, 182, 175);

    // Central reflective curtain wall window bay (x: 170 to 342, y: 120 to 820)
    daCtx.fillStyle = '#0c2229';
    daCtx.fillRect(170, 120, 172, 700);

    // Window mullions and floor divisions
    daCtx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    daCtx.lineWidth = 3;
    for (let df = 1; df < 7; df++) {
        const dfy = 120 + df * (700 / 7);
        daCtx.beginPath();
        daCtx.moveTo(170, dfy);
        daCtx.lineTo(342, dfy);
        daCtx.stroke();
    }

    // Side office windows on wings
    for (let wf = 1; wf <= 6; wf++) {
        const wfy = 140 + (wf - 1) * 110;
        daCtx.fillStyle = '#04161a';
        daCtx.fillRect(40, wfy, 85, 60);
        daCtx.fillStyle = '#0284c7';
        daCtx.fillRect(44, wfy + 4, 77, 52);

        daCtx.fillStyle = '#04161a';
        daCtx.fillRect(387, wfy, 85, 60);
        daCtx.fillStyle = '#0284c7';
        daCtx.fillRect(391, wfy + 4, 77, 52);
    }

    const daTex = new THREE.CanvasTexture(daCanvas);
    daTex.colorSpace = THREE.SRGBColorSpace;
    daTex.anisotropy = Math.min(8, maxAniso);

    const daMat = new THREE.MeshStandardMaterial({
        map: daTex,
        roughness: 0.38,
        metalness: 0.2
    });

    const daBodyMesh = new THREE.Mesh(new THREE.BoxGeometry(daLen, daH, daDepth), daMat);
    daBodyMesh.position.set(0, daH * 0.5, 0);
    daBodyMesh.castShadow = true;
    daBodyMesh.receiveShadow = true;
    daGroup.add(daBodyMesh);

    // Two prominent white vertical architectural pilasters framing the central glass bay (Photo 3)
    const daPilasterGeom = new THREE.BoxGeometry(0.75, daH - 2.5, 0.65);
    const daP1 = new THREE.Mesh(daPilasterGeom, whiteTrimMat);
    daP1.position.set(-3.8, (daH - 2.5) * 0.5 + 1.25, daDepth * 0.5 + 0.3);
    daGroup.add(daP1);

    const daP2 = new THREE.Mesh(daPilasterGeom, whiteTrimMat);
    daP2.position.set(3.8, (daH - 2.5) * 0.5 + 1.25, daDepth * 0.5 + 0.3);
    daGroup.add(daP2);

    // Rooftop Signage: NGÂN HÀNG ĐÔNG Á + circular orange & blue sun logo (Photo 3)
    const daSignCanvas = document.createElement('canvas');
    daSignCanvas.width = 768;
    daSignCanvas.height = 192;
    const daSignCtx = daSignCanvas.getContext('2d');

    // Bold blue text
    daSignCtx.fillStyle = '#0284c7';
    daSignCtx.font = '900 60px "Inter", "Arial Black", sans-serif';
    daSignCtx.fillText('NGÂN HÀNG ĐÔNG Á', 170, 115);

    // Circular orange & blue DongA Bank sun logo
    daSignCtx.beginPath();
    daSignCtx.arc(95, 96, 55, 0, Math.PI * 2);
    daSignCtx.fillStyle = '#0284c7';
    daSignCtx.fill();

    daSignCtx.beginPath();
    daSignCtx.arc(95, 96, 40, 0, Math.PI * 2);
    daSignCtx.fillStyle = '#f97316';
    daSignCtx.fill();

    daSignCtx.beginPath();
    daSignCtx.arc(95, 96, 22, 0, Math.PI * 2);
    daSignCtx.fillStyle = '#ffffff';
    daSignCtx.fill();

    const daSignTex = new THREE.CanvasTexture(daSignCanvas);
    daSignTex.colorSpace = THREE.SRGBColorSpace;
    daSignTex.anisotropy = Math.min(8, maxAniso);

    const daSignMat = new THREE.MeshStandardMaterial({
        map: daSignTex,
        emissiveMap: daSignTex,
        emissive: 0xffffff,
        emissiveIntensity: 0.85,
        roughness: 0.3,
        transparent: true
    });

    const daSignMesh = new THREE.Mesh(new THREE.PlaneGeometry(14.0, 3.5), daSignMat);
    daSignMesh.position.set(0, daH + 2.0, daDepth * 0.5 + 0.1);
    daGroup.add(daSignMesh);

    // Two rooftop flagpoles (Photo 3)
    const poleGeomSmall = new THREE.CylinderGeometry(0.04, 0.04, 5.5, 6);
    const flagMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.85, roughness: 0.25 });
    const fp1 = new THREE.Mesh(poleGeomSmall, flagMat);
    fp1.position.set(-5.0, daH + 2.75, daDepth * 0.5 - 1.5);
    daGroup.add(fp1);

    const fp2 = new THREE.Mesh(poleGeomSmall, flagMat);
    fp2.position.set(5.0, daH + 2.75, daDepth * 0.5 - 1.5);
    daGroup.add(fp2);

    // Position DongA Bank building adjacent to Techcombank on Ly Thuong Kiet
    daGroup.position.set(-141.0, 0, 14.0);
    daGroup.rotation.y = 1.5308;
    ensembleGroup.add(daGroup);

    // 9. Contemporary Commercial Office Tower at 28 Ly Thuong Kiet street (Photos 1, 3)
    const ofGroup = new THREE.Group();
    const ofLen = 24.0;
    const ofDepth = 18.0;
    const ofH = 29.0;

    // Procedural PBR texture for clean white modern commercial office building
    const ofCanvas = document.createElement('canvas');
    ofCanvas.width = 1024;
    ofCanvas.height = 1024;
    const ofCtx = ofCanvas.getContext('2d');

    // Crisp white facade with grey architectural accents
    ofCtx.fillStyle = '#f1f5f9';
    ofCtx.fillRect(0, 0, 1024, 1024);

    // Ground floor commercial lobby entrance (y: 840 to 1024)
    ofCtx.fillStyle = '#334155';
    ofCtx.fillRect(0, 840, 1024, 184);

    // Ground floor glass bays
    for (let gb = 0; gb < 7; gb++) {
        const gbx = gb * (1024 / 7);
        ofCtx.fillStyle = '#0f172a';
        ofCtx.fillRect(gbx + 10, 855, 1024 / 7 - 20, 155);
        ofCtx.fillStyle = '#38bdf8';
        ofCtx.fillRect(gbx + 14, 859, 1024 / 7 - 28, 147);
    }

    // Floors 2-9 repeating regular rhythm of contemporary tinted office windows (Photo 3)
    const numOfficeFloors = 8;
    const floorH = 840 / numOfficeFloors;
    for (let f = 0; f < numOfficeFloors; f++) {
        const fy = f * floorH;

        // Horizontal white sill moulding
        ofCtx.fillStyle = '#ffffff';
        ofCtx.fillRect(0, fy + floorH - 12, 1024, 12);

        for (let b = 0; b < 7; b++) {
            const bx = b * (1024 / 7);
            ofCtx.fillStyle = '#1e293b';
            ofCtx.fillRect(bx + 18, fy + 14, 1024 / 7 - 36, floorH - 32);

            ofCtx.fillStyle = '#1e3a5f';
            ofCtx.fillRect(bx + 22, fy + 18, 1024 / 7 - 44, floorH - 40);

            ofCtx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ofCtx.lineWidth = 1.5;
            ofCtx.strokeRect(bx + 22, fy + 18, 1024 / 7 - 44, floorH - 40);
        }
    }

    const ofTex = new THREE.CanvasTexture(ofCanvas);
    ofTex.colorSpace = THREE.SRGBColorSpace;
    ofTex.anisotropy = Math.min(8, maxAniso);

    const ofMat = new THREE.MeshStandardMaterial({
        map: ofTex,
        roughness: 0.32,
        metalness: 0.15
    });

    const ofBodyMesh = new THREE.Mesh(new THREE.BoxGeometry(ofLen, ofH, ofDepth), ofMat);
    ofBodyMesh.position.set(0, ofH * 0.5, 0);
    ofBodyMesh.castShadow = true;
    ofBodyMesh.receiveShadow = true;
    ofGroup.add(ofBodyMesh);

    // Rooftop elevator mechanical penthouse structure
    const ofPenthouseMesh = new THREE.Mesh(new THREE.BoxGeometry(10.0, 3.6, 10.0), whiteTrimMat);
    ofPenthouseMesh.position.set(0, ofH + 1.8, 0);
    ofGroup.add(ofPenthouseMesh);

    // Position Office Tower adjacent to DongA Bank on Ly Thuong Kiet
    ofGroup.position.set(-141.0, 0, 38.0);
    ofGroup.rotation.y = 1.5308;
    ensembleGroup.add(ofGroup);

    // 10. West sidewalk along Ly Thuong Kiet, mature shade trees with wooden braces, and streetscape props (Photos 1, 3)
    const ltkWestSidewalkGroup = new THREE.Group();

    // Smooth terrazzo sidewalk pavement extending from Dong Da intersection down towards Nguyen Hue
    const swLen = 78.0;
    const swW = 7.5;
    const ltkSidewalkPaveGeom = new THREE.PlaneGeometry(swW, swLen);
    const ltkSidewalkPaveMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.78 });
    const ltkSidewalkPaveMesh = new THREE.Mesh(ltkSidewalkPaveGeom, ltkSidewalkPaveMat);
    ltkSidewalkPaveMesh.rotation.x = -Math.PI * 0.5;
    ltkSidewalkPaveMesh.position.set(-128.25, 0.012, 19.0);
    ltkSidewalkPaveMesh.receiveShadow = true;
    ltkWestSidewalkGroup.add(ltkSidewalkPaveMesh);

    // Beveled dark granite curb along road edge
    const curbBarGeom = new THREE.BoxGeometry(0.35, 0.24, swLen);
    const curbBarMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.85 });
    const curbBarMesh = new THREE.Mesh(curbBarGeom, curbBarMat);
    curbBarMesh.position.set(-124.6, 0.12, 19.0);
    ltkWestSidewalkGroup.add(curbBarMesh);

    // Wooden tree brace stakes for urban storm protection around the 6 synchronized trees (Photos 1, 3)
    const stakeGeom = new THREE.CylinderGeometry(0.035, 0.035, 2.4, 6);
    const collarGeom = new THREE.BoxGeometry(0.04, 0.08, 0.85);
    const woodBraceMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.85 });

    const treeZPositions = [-14.0, 0.0, 14.0, 28.0, 42.0, 54.0];
    treeZPositions.forEach((tz) => {
        const trGroup = new THREE.Group();

        // 4 Wooden support stakes angled around the trunk
        for (let s = 0; s < 4; s++) {
            const sang = (s / 4) * Math.PI * 2;
            const stake = new THREE.Mesh(stakeGeom, woodBraceMat);
            stake.position.set(Math.cos(sang) * 0.45, 1.15, Math.sin(sang) * 0.45);
            stake.rotation.z = Math.cos(sang) * -0.18;
            stake.rotation.x = Math.sin(sang) * 0.18;
            trGroup.add(stake);
        }

        // Horizontal wooden cross-collar securing the stakes around the trunk
        const c1 = new THREE.Mesh(collarGeom, woodBraceMat);
        c1.position.set(0, 1.4, 0);
        trGroup.add(c1);

        const c2 = new THREE.Mesh(collarGeom, woodBraceMat);
        c2.rotation.y = Math.PI * 0.5;
        c2.position.set(0, 1.4, 0);
        trGroup.add(c2);

        trGroup.position.set(-127.0, 0, tz);
        ltkWestSidewalkGroup.add(trGroup);
    });

    // Parked motorbikes on sidewalk in front of Techcombank and DongA Bank (Photos 1, 3)
    const bikeGeom = new THREE.BoxGeometry(0.55, 0.85, 1.6);
    const bikeColors = [0xdc2626, 0x1e293b, 0x0284c7, 0xf8fafc, 0x475569];
    const bikeSpotsZ = [-10.0, -8.5, -7.0, 7.5, 9.0, 10.5, 20.0, 21.5];
    bikeSpotsZ.forEach((bz, bidx) => {
        const bMat = new THREE.MeshStandardMaterial({ color: bikeColors[bidx % bikeColors.length], roughness: 0.45, metalness: 0.35 });
        const bike = new THREE.Mesh(bikeGeom, bMat);
        bike.position.set(-129.2, 0.43, bz);
        bike.rotation.y = Math.PI * 0.5 + 0.15;
        ltkWestSidewalkGroup.add(bike);
    });

    // Parked white sedan car along sidewalk edge (Photo 3)
    const carGeom = new THREE.BoxGeometry(1.9, 1.45, 4.4);
    const carMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3, metalness: 0.7 });
    const carMesh = new THREE.Mesh(carGeom, carMat);
    carMesh.position.set(-122.8, 0.73, 4.0);
    carMesh.rotation.y = -1.6106;
    carMesh.castShadow = true;
    ltkWestSidewalkGroup.add(carMesh);

    ensembleGroup.add(ltkWestSidewalkGroup);

    scene.add(ensembleGroup);
}

// Create sky dome shader, instanced drifting clouds, street lamp posts, and neutral city backdrop
function createAtmosphereAndProps(scene, hardwareProfile = { tier: 'high', maxAnisotropy: 4 }) {
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
        [-146, 12, 22, 18, 20], [-140, 55, 22, 12, 20],
        [-80, 118, 26, 14, 18], [-15, 120, 28, 16, 16], [52, 118, 26, 15, 22],
        [108, 48, 24, 18, 18], [98, -22, 22, 16, 20], [72, -88, 26, 15, 18],
        [-25, -116, 28, 18, 16]
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

    // Authentic detailed urban ensemble opposite Ly Thuong Kiet x Dong Da intersection (Photos 1-5)
    createLyThuongKietOppositeUrbanEnsemble(scene, hardwareProfile);

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
    } = createAtmosphereAndProps(scene, hardwareProfile);

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
            if (flag.userData.isGateFlag) {
                flag.rotation.y = Math.sin(elapsedSec * 4.4 + p) * 0.26;
                flag.rotation.z = Math.sin(elapsedSec * 3.4 + p) * 0.05;
            } else {
                flag.rotation.y = Math.sin(elapsedSec * 4.2 + p) * 0.16;
            }
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
