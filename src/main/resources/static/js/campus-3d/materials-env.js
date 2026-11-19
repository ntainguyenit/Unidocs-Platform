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

// Lock static transforms and compute tight InstancedMesh bounding spheres for frustum culling
function freezeStaticHierarchy(root, excludeSet = null, instSpherePad = 0) {
    if (!root) return;
    root.updateMatrixWorld(true);
    root.traverse((obj) => {
        if (excludeSet && excludeSet.has(obj)) return;
        if (obj.isLight || obj.isSprite) return;
        if (obj.isInstancedMesh && obj.frustumCulled && typeof obj.computeBoundingSphere === 'function') {
            obj.computeBoundingSphere();
            if (instSpherePad > 0 && obj.boundingSphere) {
                obj.boundingSphere.radius += instSpherePad;
            }
        }
        obj.matrixAutoUpdate = false;
    });
}

// Merge repeated static meshes sharing identical material, shadow flags, and geometry attributes
function batchStaticGroupByMaterial(group, excludeSet = null) {
    if (!group) return;
    group.updateMatrixWorld(true);
    const invGroupMat = new THREE.Matrix4().copy(group.matrixWorld).invert();
    const relMat = new THREE.Matrix4();
    const geomRefCounts = new Map();
    const buckets = new Map();

    group.traverse((obj) => {
        if (!obj.isMesh || !obj.geometry) return;
        geomRefCounts.set(obj.geometry, (geomRefCounts.get(obj.geometry) || 0) + 1);
        if (obj.isInstancedMesh || obj.isSkinnedMesh || !obj.visible) return;
        if (Array.isArray(obj.material) || !obj.material) return;
        if (excludeSet && excludeSet.has(obj)) return;
        if (obj.geometry.morphAttributes && Object.keys(obj.geometry.morphAttributes).length > 0) return;

        const attrKey = Object.keys(obj.geometry.attributes).sort().join(',');
        const bucketKey = `${obj.material.uuid}|${obj.castShadow ? 1 : 0}|${obj.receiveShadow ? 1 : 0}|${attrKey}`;
        let bucket = buckets.get(bucketKey);
        if (!bucket) {
            bucket = {
                material: obj.material,
                castShadow: obj.castShadow,
                receiveShadow: obj.receiveShadow,
                meshes: []
            };
            buckets.set(bucketKey, bucket);
        }
        bucket.meshes.push(obj);
    });

    for (const bucket of buckets.values()) {
        if (bucket.meshes.length < 2) continue;
        const bakedParts = [];
        for (const m of bucket.meshes) {
            const g = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone();
            relMat.multiplyMatrices(invGroupMat, m.matrixWorld);
            g.applyMatrix4(relMat);
            bakedParts.push(g);
        }
        const merged = mergeGeometries(bakedParts, false);
        for (const p of bakedParts) p.dispose();
        if (!merged) continue;

        merged.computeBoundingBox();
        merged.computeBoundingSphere();
        const mergedMesh = new THREE.Mesh(merged, bucket.material);
        mergedMesh.castShadow = bucket.castShadow;
        mergedMesh.receiveShadow = bucket.receiveShadow;
        mergedMesh.frustumCulled = true;
        group.add(mergedMesh);

        for (const m of bucket.meshes) {
            const geom = m.geometry;
            if (m.parent) m.parent.remove(m);
            const nextCount = (geomRefCounts.get(geom) || 1) - 1;
            geomRefCounts.set(geom, nextCount);
            if (nextCount <= 0) {
                geom.dispose();
            }
        }
    }
}

// Create a tier-scaled Canvas2D surface preserving logical drawing coordinates via ctx.scale
function createScaledCanvas(logicalW, logicalH, tier = 'high', options = {}) {
    const highScale = options.highScale ?? 1.0;
    const medScale = options.mediumScale ?? 0.5;
    const lowScale = options.lowScale ?? 0.5;
    const scale = tier === 'low' ? lowScale : (tier === 'medium' ? medScale : highScale);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(64, Math.round(logicalW * scale));
    canvas.height = Math.max(64, Math.round(logicalH * scale));
    const ctx = canvas.getContext('2d');
    if (scale !== 1.0) {
        ctx.scale(scale, scale);
    }
    return { canvas, ctx, scale };
}

let cachedCeramicTileTextures = null;

// Create crisp white 2:1 horizontal rectangular ceramic tile color & bump maps matching real Gate Tower
function createCeramicTileTextures(maxAnisotropy = 4) {
    if (cachedCeramicTileTextures) return cachedCeramicTileTextures;
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

    cachedCeramicTileTextures = { colorTex, bumpTex };
    return cachedCeramicTileTextures;
}

// Upgrade named GLB materials (e.g. GateCeramicTile) with crisp procedural PBR detail maps
export function applyCampusMaterialEnhancements(campusModel, maxAnisotropy = 4) {
    let tileTextures = null;
    const upgraded = new Set();
    campusModel.traverse((obj) => {
        // Seamlessly connect Dong Da left-side perimeter wall from monument pillar to corner property
        if (obj.isMesh && obj.position && Math.abs(obj.position.x - 25.775) < 0.15 && Math.abs(obj.position.z - (-91.98)) < 0.15) {
            obj.position.x = 28.14;
            obj.position.z = -93.14;
            obj.scale.x *= 0.485;
        }

        // Rotate basketball court hoops 90 degrees around court center (-31.0, 0, -7.5) to align with rotated court
        if (obj.name === 'prop_sports_goals' && !obj.userData.basketballRotated) {
            obj.userData.basketballRotated = true;
            const courtCx = -31.0;
            const courtCz = -7.5;
            const rotAngle = -Math.PI * 0.5;
            const cosT = Math.cos(rotAngle);
            const sinT = Math.sin(rotAngle);
            for (const child of obj.children) {
                if (child.isMesh && Math.abs(child.position.x - courtCx) < 12.0 && Math.abs(child.position.z - courtCz) < 12.0) {
                    const rx = child.position.x - courtCx;
                    const rz = child.position.z - courtCz;
                    child.position.x = courtCx + (rx * cosT - rz * sinT);
                    child.position.z = courtCz + (rx * sinT + rz * cosT);
                    child.rotateY(rotAngle);
                    child.updateMatrix();
                }
            }
        }

        // Hide obsolete solid grey side slabs on soccer goals so procedural white net mesh covers them cleanly
        if (obj.isMesh && obj.parent && obj.parent.parent && obj.parent.parent.name === 'prop_sports_goals') {
            if (obj.position && Math.abs(obj.position.z) > 20.2) {
                obj.visible = false;
            }
        }

        // Hide obsolete yellow walls, ground floor brown base, and old windows of bldg_D so modern 4-sided architectural facade covers it completely
        if (obj.name === 'bldg_D') {
            obj.traverse((child) => {
                if (child.isMesh) {
                    child.visible = false;
                }
            });
        }

        // Hide obsolete solid connector walls and windows of bldg_A_connector so authentic architectural loggia and breezeway facade covers it completely
        if (obj.name === 'bldg_A_connector') {
            obj.traverse((child) => {
                if (child.isMesh) {
                    child.visible = false;
                }
            });
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

// Cache shared leaf cluster texture so campus trees and median shrubs use identical botanical leaves
let cachedLeafTexture = null;
function getSharedLeafClusterTexture(size = 512, maxAnisotropy = 4) {
    if (!cachedLeafTexture) {
        cachedLeafTexture = createLeafClusterTexture(size, maxAnisotropy);
    }
    return cachedLeafTexture;
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

// Build dense multi-tier botanical shrub card cluster geometry for median dividers
function createDenseShrubCardClusterGeometry(cardTier = 'high', baseCardSize = 0.88) {
    const cards = [];
    const dummy = new THREE.Object3D();
    const shrubCenter = new THREE.Vector3(0, 0.38, 0);

    let seed = 317;
    const rand = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
    };

    const isLow = cardTier === 'low';
    const isMed = cardTier === 'medium';

    // Tier counts for rich botanical foliage coverage without any artificial inner sphere
    const nCore = isLow ? 4 : (isMed ? 6 : 8);      // Volumetric criss-cross interior core cards
    const nSkirt = isLow ? 6 : (isMed ? 8 : 10);    // Low skirt perimeter cards spreading near grass
    const nBody = isLow ? 7 : (isMed ? 9 : 12);     // Middle plump sphere body cards
    const nShoulder = isLow ? 5 : (isMed ? 8 : 10); // Upper shoulder cards curving upward
    const nCrown = isLow ? 4 : (isMed ? 6 : 8);     // Top dome crown cards overlapping & sealing top

    // Helper to add a plane card with specified transform
    const addCard = (x, y, z, lookX, lookY, lookZ, roll, w, h) => {
        const card = new THREE.PlaneGeometry(w, h);
        dummy.position.set(x, y, z);
        dummy.lookAt(lookX, lookY, lookZ);
        dummy.rotateZ(roll);
        dummy.updateMatrix();
        card.applyMatrix4(dummy.matrix);
        cards.push(card);
    };

    // 1. Volumetric inner core cards: criss-cross through center at alternating orientations
    for (let i = 0; i < nCore; i++) {
        const theta = (i / nCore) * Math.PI + 0.12;
        const offset = (rand() - 0.5) * 0.08;
        const x = Math.cos(theta + Math.PI * 0.5) * offset;
        const z = Math.sin(theta + Math.PI * 0.5) * offset;
        const y = 0.38 + (rand() - 0.5) * 0.08;
        const w = baseCardSize * (0.94 + rand() * 0.16);
        const h = baseCardSize * (0.90 + rand() * 0.16);
        addCard(x, y, z, x + Math.cos(theta), y + 0.18 + (rand() - 0.5) * 0.20, z + Math.sin(theta), rand() * Math.PI * 2, w, h);
    }

    // 2. Skirt perimeter cards: lower tier spreading close to the lawn surface
    for (let i = 0; i < nSkirt; i++) {
        const theta = (i / nSkirt) * Math.PI * 2 + 0.18;
        const rad = 0.32 + rand() * 0.07;
        const x = Math.cos(theta) * rad * 1.08;
        const y = 0.24 + (rand() - 0.5) * 0.05;
        const z = Math.sin(theta) * rad * 0.96;
        const w = baseCardSize * (0.92 + rand() * 0.16);
        const h = baseCardSize * (0.88 + rand() * 0.16);
        addCard(x, y, z, x * 2.2, y + 0.28, z * 2.2, rand() * Math.PI * 2, w, h);
    }

    // 3. Middle body cards: dense bulging belly layer tilted slightly upward
    for (let i = 0; i < nBody; i++) {
        const theta = (i / nBody) * Math.PI * 2 + 0.42;
        const rad = 0.28 + rand() * 0.07;
        const x = Math.cos(theta) * rad * 1.06;
        const y = 0.44 + (rand() - 0.5) * 0.06;
        const z = Math.sin(theta) * rad * 0.96;
        const w = baseCardSize * (0.96 + rand() * 0.16);
        const h = baseCardSize * (0.92 + rand() * 0.16);
        addCard(x, y, z, x * 2.0, y + 0.50, z * 2.0, rand() * Math.PI * 2, w, h);
    }

    // 4. Upper shoulder cards: curving upward towards crown
    for (let i = 0; i < nShoulder; i++) {
        const theta = (i / nShoulder) * Math.PI * 2 + 0.68;
        const rad = 0.20 + rand() * 0.06;
        const x = Math.cos(theta) * rad * 1.04;
        const y = 0.58 + (rand() - 0.5) * 0.06;
        const z = Math.sin(theta) * rad * 0.96;
        const w = baseCardSize * (0.92 + rand() * 0.16);
        const h = baseCardSize * (0.88 + rand() * 0.16);
        addCard(x, y, z, x * 1.8, y + 0.85, z * 1.8, rand() * Math.PI * 2, w, h);
    }

    // 5. Crown dome cards: sealing the top with overlapping leaves visible from high/overview camera angles
    for (let i = 0; i < nCrown; i++) {
        const theta = (i / nCrown) * Math.PI * 2 + 0.92;
        const rad = 0.08 + rand() * 0.06;
        const x = Math.cos(theta) * rad;
        const y = 0.68 + (rand() - 0.5) * 0.05;
        const z = Math.sin(theta) * rad;
        const w = baseCardSize * (0.94 + rand() * 0.16);
        const h = baseCardSize * (0.90 + rand() * 0.16);
        addCard(x, y, z, x * 1.2, y + 1.2, z * 1.2, rand() * Math.PI * 2, w, h);
    }

    const merged = mergeGeometries(cards, false);
    cards.forEach((c) => c.dispose());

    // Radially outward normals for soft botanical ambient lighting
    const pos = merged.attributes.position;
    const norm = merged.attributes.normal;
    const v = new THREE.Vector3();
    for (let k = 0; k < pos.count; k++) {
        v.fromBufferAttribute(pos, k).sub(shrubCenter).normalize();
        norm.setXYZ(k, v.x, Math.max(0.18, v.y), v.z);
    }
    norm.needsUpdate = true;

    return merged;
}

// Create instanced GPU-animated foliage and trunks across campus lawns
function createCampusVegetation(scene, windUniform, hardwareProfile = { tier: 'high', maxAnisotropy: 4 }) {
    const canopyTrees = TREE_PLACEMENTS.filter((t) => t.kind === 'canopy');
    const conifers = TREE_PLACEMENTS.filter((t) => t.kind === 'conifer');
    const tier = hardwareProfile.tier || 'high';
    const maxAniso = hardwareProfile.maxAnisotropy || 4;

    const leafTex = getSharedLeafClusterTexture(tier === 'low' ? 256 : 512, maxAniso);
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

    freezeStaticHierarchy(trunkInst);
    freezeStaticHierarchy(leafInst, null, 0.5);
    freezeStaticHierarchy(coniferInst);
    freezeStaticHierarchy(planterMesh);
    freezeStaticHierarchy(basinRimMesh);
    freezeStaticHierarchy(basinWaterMesh);
    freezeStaticHierarchy(benchInst);

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
function createTerrazzoSidewalkTextures(maxAnisotropy = 4, tier = 'high') {
    const size = 512;
    const { canvas: c, ctx } = createScaledCanvas(size, size, tier, { mediumScale: 0.5, lowScale: 0.5 });

    const tileSize = 256;
    const grout = 4;

    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 0, size, size);

    const tileShades = ['#cbd5e1', '#c2ccd6', '#d1d8e0', '#c8d1da'];
    const speckCount = tier === 'low' ? 45 : (tier === 'medium' ? 65 : 95);

    for (let ty = 0; ty < 2; ty++) {
        for (let tx = 0; tx < 2; tx++) {
            const ox = tx * tileSize;
            const oy = ty * tileSize;
            const w = tileSize - grout;
            const h = tileSize - grout;

            const shadeIdx = (ty * 2 + tx) % tileShades.length;
            ctx.fillStyle = tileShades[shadeIdx];
            ctx.fillRect(ox + grout, oy + grout, w, h);

            // Stippled granite aggregate specks rendered with fast fillRect micro-chips
            for (let s = 0; s < speckCount; s++) {
                const sx = ox + grout + Math.random() * w;
                const sy = oy + grout + Math.random() * h;
                const sd = 2 + Math.random() * 2.5;
                ctx.fillStyle = Math.random() > 0.4 ? 'rgba(255, 255, 255, 0.55)' : 'rgba(30, 41, 59, 0.35)';
                ctx.fillRect(sx, sy, sd, sd);
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

    // Skip bump map generation on low tier to save VRAM and fragment shader cost
    if (tier === 'low') {
        return { colorTex, bumpTex: null };
    }

    const { canvas: bc, ctx: bctx } = createScaledCanvas(size, size, tier, { mediumScale: 0.5, lowScale: 0.5 });
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
function createCurbstoneTextures(maxAnisotropy = 4, tier = 'high') {
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

    if (tier === 'low') {
        return { colorTex, bumpTex: null };
    }

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

// Procedural rich dark organic loam soil texture with earthy clods, moisture variation, and edge moss
function createTreeSoilTextures(maxAnisotropy = 4, tier = 'high') {
    const size = 512;
    const { canvas, ctx } = createScaledCanvas(size, size, tier, { mediumScale: 0.5, lowScale: 0.5 });

    // Rich dark fertile urban garden loam base
    ctx.fillStyle = '#26190f';
    ctx.fillRect(0, 0, size, size);

    // Layer 1: Earth tone variations (moist loam patches, slightly lighter and darker dirt)
    const patchCount = tier === 'low' ? 18 : (tier === 'medium' ? 28 : 45);
    const tones = [
        'rgba(50, 32, 18, 0.45)',
        'rgba(24, 15, 9, 0.55)',
        'rgba(68, 45, 26, 0.35)',
        'rgba(38, 28, 20, 0.40)'
    ];
    for (let i = 0; i < patchCount; i++) {
        const cx = Math.random() * size;
        const cy = Math.random() * size;
        const rad = 25 + Math.random() * 80;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        const col = tones[Math.floor(Math.random() * tones.length)];
        grad.addColorStop(0, col);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
    }

    // Layer 2: Granular dirt clods and organic soil texture rendered with fast fillRect specks
    const clodCount = tier === 'low' ? 500 : (tier === 'medium' ? 900 : 2000);
    for (let i = 0; i < clodCount; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const d = 1.4 + Math.random() * 3.4;
        const p = Math.random();
        if (p < 0.42) {
            ctx.fillStyle = 'rgba(16, 10, 5, 0.65)';
        } else if (p < 0.76) {
            ctx.fillStyle = 'rgba(75, 52, 33, 0.45)';
        } else if (p < 0.92) {
            ctx.fillStyle = 'rgba(105, 80, 55, 0.35)';
        } else {
            ctx.fillStyle = 'rgba(130, 115, 100, 0.35)';
        }
        ctx.fillRect(x, y, d, d);
    }

    // Layer 3: Natural micro-moss and tender green accents along edges / corners
    const mossCount = tier === 'low' ? 120 : (tier === 'medium' ? 200 : 320);
    for (let i = 0; i < mossCount; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const distFromEdge = Math.min(x, size - x, y, size - y);
        if (distFromEdge < 95 || Math.random() < 0.15) {
            const d = 1.8 + Math.random() * 3.2;
            ctx.fillStyle = Math.random() < 0.5 ? 'rgba(50, 78, 32, 0.45)' : 'rgba(38, 62, 24, 0.5)';
            ctx.fillRect(x, y, d, d);
        }
    }

    const colorTex = new THREE.CanvasTexture(canvas);
    colorTex.colorSpace = THREE.SRGBColorSpace;
    colorTex.anisotropy = Math.min(4, maxAnisotropy);

    if (tier === 'low') {
        return { colorTex, bumpTex: null };
    }

    // Bump map for 3D soil relief using fast fillRect granules
    const { canvas: bumpCanvas, ctx: bctx } = createScaledCanvas(size, size, tier, { mediumScale: 0.5, lowScale: 0.5 });
    bctx.fillStyle = '#808080';
    bctx.fillRect(0, 0, size, size);
    const bumpClods = tier === 'medium' ? 500 : 1200;
    for (let i = 0; i < bumpClods; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const d = 1.6 + Math.random() * 3.2;
        bctx.fillStyle = Math.random() < 0.5 ? 'rgba(35, 35, 35, 0.5)' : 'rgba(220, 220, 220, 0.4)';
        bctx.fillRect(x, y, d, d);
    }

    const bumpTex = new THREE.CanvasTexture(bumpCanvas);
    bumpTex.anisotropy = Math.min(4, maxAnisotropy);

    return { colorTex, bumpTex };
}

// Procedural speckled granite / concrete curb border texture for sidewalk tree basins
function createTreePitCurbTexture(maxAnisotropy = 4) {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Base granite concrete shade
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, 0, size, size);

    // Stone grain and speckled mineral flecks
    for (let i = 0; i < 1600; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const r = 0.5 + Math.random() * 1.5;
        const shade = Math.random();
        if (shade < 0.42) {
            ctx.fillStyle = 'rgba(51, 65, 85, 0.35)';
        } else if (shade < 0.72) {
            ctx.fillStyle = 'rgba(241, 245, 249, 0.45)';
        } else {
            ctx.fillStyle = 'rgba(100, 116, 139, 0.30)';
        }
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = Math.min(4, maxAnisotropy);
    return tex;
}

// Create crisp schematic-matched gardens, paved plaza, asphalt streets, and sports pitches
function createGroundAndGardens(scene, hardwareProfile = { tier: 'high', maxAnisotropy: 4 }) {
    const groundStartIdx = scene.children.length;
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

    // Beveled curbstones (bó vỉa vát cong 1m/viên) with authentic 3D slant profile, upward normals, and expansion joints
    const curbGeoms = [];
    const buildCurbQuad = (p0Out, p1Out, p1In, p0In, u0 = 0, u1 = 1) => {
        const yGutter = -0.008;
        const yTop = 0.008;
        // Verify normal orientation: if normal points downward, swap vertex order to ensure upward-facing shading
        const ny = (p1Out[1] - p0Out[1]) * (p1In[0] - p0Out[0]) - (p1Out[0] - p0Out[0]) * (p1In[1] - p0Out[1]);
        const [a0Out, a1Out, a1In, a0In, au0, au1] = ny < 0
            ? [p1Out, p0Out, p0In, p1In, u1, u0]
            : [p0Out, p1Out, p1In, p0In, u0, u1];
        const positions = new Float32Array([
            a0Out[0], yGutter, a0Out[1],
            a1Out[0], yGutter, a1Out[1],
            a1In[0],  yTop,    a1In[1],

            a0Out[0], yGutter, a0Out[1],
            a1In[0],  yTop,    a1In[1],
            a0In[0],  yTop,    a0In[1]
        ]);
        const uvs = new Float32Array([
            au0, 0.0,
            au1, 0.0,
            au1, 1.0,

            au0, 0.0,
            au1, 1.0,
            au0, 1.0
        ]);
        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
        geom.computeVertexNormals();
        return geom;
    };

    const cornerFillets = {};
    const asphaltCornerGeoms = [];

    const buildCornerCurb = (id, r1, v1Top, s1, w1, r2, v2Top, s2, w2, R_top = 2.6, segs = 16) => {
        const P = lineIntersectPt(r1, v1Top, r2, v2Top);
        const u1x = Math.cos(r1.rotY) * s1, u1z = Math.sin(r1.rotY) * s1;
        const u2x = Math.cos(r2.rotY) * s2, u2z = Math.sin(r2.rotY) * s2;
        const cosA = Math.max(-0.999, Math.min(0.999, u1x * u2x + u1z * u2z));
        const sinHalfA = Math.sqrt((1 - cosA) / 2);
        const cosHalfA = Math.sqrt((1 + cosA) / 2);
        const tanHalfA = sinHalfA / cosHalfA;
        const dT = R_top / tanHalfA;

        const bx = u1x + u2x, bz = u1z + u2z;
        const bLen = Math.hypot(bx, bz) || 1;
        const wx = bx / bLen, wz = bz / bLen;
        const distC = R_top / sinHalfA;
        const C = { x: P.x + distC * wx, z: P.z + distC * wz };

        const T1_top = { x: P.x + dT * u1x, z: P.z + dT * u1z };
        const T2_top = { x: P.x + dT * u2x, z: P.z + dT * u2z };

        const r1x = T1_top.x - C.x, r1z = T1_top.z - C.z;
        const r2x = T2_top.x - C.x, r2z = T2_top.z - C.z;
        const phi1 = Math.atan2(r1z, r1x);
        const phi2 = Math.atan2(r2z, r2x);
        const dPhi = Math.atan2(Math.sin(phi2 - phi1), Math.cos(phi2 - phi1));
        const arcLen = R_top * Math.abs(dPhi);

        const topPts = [];
        const gutterPts = [];

        for (let i = 0; i <= segs; i++) {
            const t = i / segs;
            const phi = phi1 + t * dPhi;
            const cosP = Math.cos(phi), sinP = Math.sin(phi);
            const w = (1 - t) * w1 + t * w2;
            const R_gut = R_top + w;
            topPts.push([C.x + R_top * cosP, C.z + R_top * sinP]);
            gutterPts.push([C.x + R_gut * cosP, C.z + R_gut * sinP]);
        }

        const uStart = worldToUv(r1, T1_top.x, T1_top.z).u;
        for (let i = 0; i < segs; i++) {
            const u0 = uStart + (i / segs) * arcLen;
            const u1 = uStart + ((i + 1) / segs) * arcLen;
            curbGeoms.push(buildCurbQuad(
                gutterPts[i],
                gutterPts[i + 1],
                topPts[i + 1],
                topPts[i],
                u0,
                u1
            ));
        }

        // Seamless triangular asphalt patch under the curved curb corner (between road corner and curved gutter arc)
        const v1Gutter = v1Top < 0 ? (v1Top + w1) : (v1Top - w1);
        const v2Gutter = v2Top < 0 ? (v2Top + w2) : (v2Top - w2);
        const P_gut = lineIntersectPt(r1, v1Gutter, r2, v2Gutter);
        const asphaltPts = [[P_gut.x, P_gut.z], ...gutterPts];
        asphaltCornerGeoms.push(buildGroundPoly(asphaltPts, -0.020, 0.25));

        const u1OnR1 = worldToUv(r1, T1_top.x, T1_top.z).u;
        const u2OnR2 = worldToUv(r2, T2_top.x, T2_top.z).u;

        const info = { id, P, C, T1: T1_top, T2: T2_top, u1OnR1, u2OnR2, topPts, gutterPts, innerPts: topPts, outerPts: gutterPts, arcLen };
        cornerFillets[id] = info;
        return info;
    };

    // 8 Rounded corner curbstones at LTK x Nguyen Hue and LTK x Dong Da intersections
    const fNhNw = buildCornerCurb('nh_nw', roadDefs.nh, -nhHalfW, -1, roadDefs.nh.curb, roadDefs.ltk, -ltkHalfW, +1, roadDefs.ltk.curb, 2.6);
    const fNhNe = buildCornerCurb('nh_ne', roadDefs.nh, -nhHalfW, +1, roadDefs.nh.curb, roadDefs.ltk, +ltkHalfW, +1, roadDefs.ltk.curb, 2.6);
    const fNhSw = buildCornerCurb('nh_sw', roadDefs.nh, +nhHalfW, -1, roadDefs.nh.curb, roadDefs.ltk, -ltkHalfW, -1, roadDefs.ltk.curb, 2.6);
    const fNhSe = buildCornerCurb('nh_se', roadDefs.nh, +nhHalfW, +1, roadDefs.nh.curb, roadDefs.ltk, +ltkHalfW, -1, roadDefs.ltk.curb, 2.6);

    const fDdNw = buildCornerCurb('dd_nw', roadDefs.dd, -ddHalfW, -1, roadDefs.dd.curb, roadDefs.ltk, -ltkHalfW, +1, roadDefs.ltk.curb, 2.6);
    const fDdNe = buildCornerCurb('dd_ne', roadDefs.dd, -ddHalfW, +1, roadDefs.dd.curb, roadDefs.ltk, +ltkHalfW, +1, roadDefs.ltk.curb, 2.6);
    const fDdSw = buildCornerCurb('dd_sw', roadDefs.dd, +ddHalfW, -1, roadDefs.dd.curb, roadDefs.ltk, -ltkHalfW, -1, roadDefs.ltk.curb, 2.6);
    const fDdSe = buildCornerCurb('dd_se', roadDefs.dd, +ddHalfW, +1, roadDefs.dd.curb, roadDefs.ltk, +ltkHalfW, -1, roadDefs.ltk.curb, 2.6);

    const pushRoadSideCurb = (road, vTop, vGutter, uStart, uEnd) => {
        const p0Gutter = uvToWorld(road, uStart, vGutter);
        const p1Gutter = uvToWorld(road, uEnd, vGutter);
        const p0Top = uvToWorld(road, uStart, vTop);
        const p1Top = uvToWorld(road, uEnd, vTop);
        curbGeoms.push(buildCurbQuad(p0Gutter, p1Gutter, p1Top, p0Top, uStart, uEnd));
    };

    // Straight curbstones trimmed seamlessly to corner arc tangents
    const nhCurbIn = nhHalfW - roadDefs.nh.curb;
    pushRoadSideCurb(roadDefs.nh, -nhHalfW, -nhCurbIn, roadDefs.nh.uMin, fNhNw.u1OnR1);
    pushRoadSideCurb(roadDefs.nh, -nhHalfW, -nhCurbIn, fNhNe.u1OnR1, roadDefs.nh.uMax);
    pushRoadSideCurb(roadDefs.nh, +nhHalfW, +nhCurbIn, roadDefs.nh.uMin, fNhSw.u1OnR1);
    pushRoadSideCurb(roadDefs.nh, +nhHalfW, +nhCurbIn, fNhSe.u1OnR1, roadDefs.nh.uMax);

    const ltkCurbIn = ltkHalfW - roadDefs.ltk.curb;
    pushRoadSideCurb(roadDefs.ltk, -ltkHalfW, -ltkCurbIn, roadDefs.ltk.uMin, fNhSw.u2OnR2);
    pushRoadSideCurb(roadDefs.ltk, -ltkHalfW, -ltkCurbIn, fNhNw.u2OnR2, fDdSw.u2OnR2);
    pushRoadSideCurb(roadDefs.ltk, -ltkHalfW, -ltkCurbIn, fDdNw.u2OnR2, roadDefs.ltk.uMax);

    pushRoadSideCurb(roadDefs.ltk, +ltkHalfW, +ltkCurbIn, roadDefs.ltk.uMin, fNhSe.u2OnR2);
    pushRoadSideCurb(roadDefs.ltk, +ltkHalfW, +ltkCurbIn, fNhNe.u2OnR2, fDdSe.u2OnR2);
    pushRoadSideCurb(roadDefs.ltk, +ltkHalfW, +ltkCurbIn, fDdNe.u2OnR2, roadDefs.ltk.uMax);

    const ddCurbIn = ddHalfW - roadDefs.dd.curb;
    pushRoadSideCurb(roadDefs.dd, -ddHalfW, -ddCurbIn, roadDefs.dd.uMin, fDdNw.u1OnR1);
    pushRoadSideCurb(roadDefs.dd, -ddHalfW, -ddCurbIn, fDdNe.u1OnR1, roadDefs.dd.uMax);
    pushRoadSideCurb(roadDefs.dd, +ddHalfW, +ddCurbIn, roadDefs.dd.uMin, fDdSw.u1OnR1);
    pushRoadSideCurb(roadDefs.dd, +ddHalfW, +ddCurbIn, fDdSe.u1OnR1, roadDefs.dd.uMax);

    if (asphaltCornerGeoms.length > 0) {
        const asphaltPatchMesh = new THREE.Mesh(
            mergeGeometries(asphaltCornerGeoms, false),
            roadAsphaltMat
        );
        asphaltCornerGeoms.forEach((g) => g.dispose());
        asphaltPatchMesh.receiveShadow = true;
        scene.add(asphaltPatchMesh);
    }

    const { colorTex: curbColorTex, bumpTex: curbBumpTex } = createCurbstoneTextures(maxAniso, tier);
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
    // Note: Dong Da street has a physical planted median divider, so yellow dashed centerlines are omitted
    pushYellowCenterline(roadDefs.nh, -168.0, -119.0);
    pushYellowCenterline(roadDefs.nh, -88.4, -7.5);
    pushYellowCenterline(roadDefs.nh, 1.5, 168.0);
    pushYellowCenterline(roadDefs.ltk, -128.0, -85.55);
    pushYellowCenterline(roadDefs.ltk, -53.55, 31.0);
    pushYellowCenterline(roadDefs.ltk, 69.2, 128.0);

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

    const nhNeCampus = lineIntersectPt(roadDefs.nh, -13.0, roadDefs.ltk, +10.24);
    const ddSeCampus = lineIntersectPt(roadDefs.dd, +10.0, roadDefs.ltk, +10.24);
    const ddEndU = worldToUv(roadDefs.dd, 30.0, -94.0).u;

    // Exterior sidewalks flanking Nguyen Hue, Ly Thuong Kiet, and Dong Da gates strictly outside curbstones
    sidewalkGeoms.push(buildGroundPoly([
        uvToWorld(roadDefs.nh, fNhNe.u1OnR1, -nhHalfW),
        uvToWorld(roadDefs.nh, 94.0, -nhHalfW),
        uvToWorld(roadDefs.nh, 94.0, -13.1),
        uvToWorld(roadDefs.nh, fNhNe.u1OnR1, -13.1)
    ], 0.005, 1.25));

    // Continuous school sidewalk along LTK including rounded corner fillets at Gate 77 and Gate 38
    const ltkSchoolSidewalkPts = [
        ...fNhNe.innerPts,
        ...fDdSe.innerPts.slice().reverse(),
        [ddSeCampus.x, ddSeCampus.z],
        [nhNeCampus.x, nhNeCampus.z]
    ];
    sidewalkGeoms.push(buildGroundPoly(ltkSchoolSidewalkPts, 0.005, 1.25));

    sidewalkGeoms.push(buildGroundPoly([
        uvToWorld(roadDefs.dd, fDdSe.u1OnR1, +ddHalfW),
        uvToWorld(roadDefs.dd, ddEndU, +ddHalfW),
        uvToWorld(roadDefs.dd, ddEndU, +10.1),
        [ddSeCampus.x, ddSeCampus.z]
    ], 0.005, 1.25));

    // Outer sidewalk along West side of Ly Thuong Kiet split cleanly outside road carriageways
    const pushLtkOuterSegment = (uStart, uEnd, swWidth = 6.0) => {
        const swNearStart = uvToWorld(roadDefs.ltk, uStart, -ltkHalfW);
        const swNearEnd = uvToWorld(roadDefs.ltk, uEnd, -ltkHalfW);
        const swFarEnd = uvToWorld(roadDefs.ltk, uEnd, -ltkHalfW - swWidth);
        const swFarStart = uvToWorld(roadDefs.ltk, uStart, -ltkHalfW - swWidth);
        sidewalkGeoms.push(buildGroundPoly([
            [swNearStart[0], swNearStart[1]],
            [swNearEnd[0], swNearEnd[1]],
            [swFarEnd[0], swFarEnd[1]],
            [swFarStart[0], swFarStart[1]]
        ], 0.005, 1.25));
    };

    // Corner sidewalk tile filler for outer sidewalk intersections
    [fNhNw, fNhSw, fNhSe, fDdNw, fDdNe, fDdSw].forEach((c) => {
        sidewalkGeoms.push(buildGroundPoly([[c.C.x, c.C.z], ...c.innerPts], 0.005, 1.25));
    });

    // Segment 1: south of Nguyen Hue junction
    pushLtkOuterSegment(roadDefs.ltk.uMin, fNhSw.u2OnR2, 6.0);
    // Segment 2: between Nguyen Hue and Dong Da junctions flush with building facades
    pushLtkOuterSegment(fNhNw.u2OnR2, fDdSw.u2OnR2, 6.0);
    // Segment 3: north of Dong Da junction
    pushLtkOuterSegment(fDdNw.u2OnR2, roadDefs.ltk.uMax, 6.0);

    const { colorTex: sidewalkColorTex, bumpTex: sidewalkBumpTex } = createTerrazzoSidewalkTextures(maxAniso, tier);
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

    // Authentic square dirt tree basins (bồn cây hè phố) for shade trees along Ly Thuong Kiet and Nguyen Hue sidewalks
    const sidewalkTreeBasins = [
        // Ly Thuong Kiet sidewalk (3 trees along school side)
        { x: -108.6, z: -15.0, scale: 1.10, rotY: 0.0398 },
        { x: -107.4, z: 16.0, scale: 1.14, rotY: 0.0398 },
        { x: -106.1, z: 48.0, scale: 1.12, rotY: 0.0398 },
        // Nguyen Hue sidewalk (5 trees along school side flanking Gate 77)
        { x: -64.0, z: 75.5, scale: 1.14, rotY: 0.0 },
        { x: -45.0, z: 75.5, scale: 1.12, rotY: 0.0 },
        { x: 16.0, z: 75.5, scale: 1.14, rotY: 0.0 },
        { x: 38.0, z: 75.5, scale: 1.10, rotY: 0.0 },
        { x: 60.0, z: 75.5, scale: 1.12, rotY: 0.0 }
    ];
    const treePitCurbGeoms = [];
    const treePitSoilGeoms = [];
    const pitDummy = new THREE.Object3D();
    const pitWOuter = 1.32;
    const pitDOuter = 1.32;
    const pitCurbThick = 0.09;
    const pitCurbH = 0.045;
    const pitWInner = pitWOuter - 2 * pitCurbThick; // 1.14m
    const pitDInner = pitDOuter - 2 * pitCurbThick; // 1.14m
    const pitSoilH = 0.026;

    sidewalkTreeBasins.forEach((t) => {
        pitDummy.position.set(t.x, 0, t.z);
        pitDummy.rotation.set(0, t.rotY, 0);
        pitDummy.scale.set(1, 1, 1);
        pitDummy.updateMatrix();

        // 4 Mitered curb border pieces framing the square tree basin
        const curbN = new THREE.BoxGeometry(pitWOuter, pitCurbH, pitCurbThick);
        curbN.translate(0, pitCurbH * 0.5, (pitDOuter - pitCurbThick) * 0.5);
        curbN.applyMatrix4(pitDummy.matrix);
        treePitCurbGeoms.push(curbN);

        const curbS = new THREE.BoxGeometry(pitWOuter, pitCurbH, pitCurbThick);
        curbS.translate(0, pitCurbH * 0.5, -(pitDOuter - pitCurbThick) * 0.5);
        curbS.applyMatrix4(pitDummy.matrix);
        treePitCurbGeoms.push(curbS);

        const curbE = new THREE.BoxGeometry(pitCurbThick, pitCurbH, pitDInner);
        curbE.translate((pitWOuter - pitCurbThick) * 0.5, pitCurbH * 0.5, 0);
        curbE.applyMatrix4(pitDummy.matrix);
        treePitCurbGeoms.push(curbE);

        const curbW = new THREE.BoxGeometry(pitCurbThick, pitCurbH, pitDInner);
        curbW.translate(-(pitWOuter - pitCurbThick) * 0.5, pitCurbH * 0.5, 0);
        curbW.applyMatrix4(pitDummy.matrix);
        treePitCurbGeoms.push(curbW);

        // Recessed fertile square soil bed
        const soilBed = new THREE.BoxGeometry(pitWInner, pitSoilH, pitDInner);
        soilBed.translate(0, pitSoilH * 0.5, 0);
        soilBed.applyMatrix4(pitDummy.matrix);
        treePitSoilGeoms.push(soilBed);

        // Subtle root mound / collar gently blending the trunk base into the soil bed
        const trunkR1 = 0.40 * t.scale;
        const trunkR2 = 0.47 * t.scale;
        const mound = new THREE.CylinderGeometry(trunkR1, trunkR2, 0.016, 14);
        mound.translate(0, pitSoilH + 0.008, 0);
        mound.applyMatrix4(pitDummy.matrix);
        treePitSoilGeoms.push(mound);
    });

    const pitCurbTex = createTreePitCurbTexture(maxAniso);
    const treePitCurbMesh = new THREE.Mesh(
        mergeGeometries(treePitCurbGeoms, false),
        new THREE.MeshStandardMaterial({
            color: 0xffffff,
            map: pitCurbTex,
            roughness: 0.82,
            metalness: 0.04
        })
    );
    treePitCurbGeoms.forEach((g) => g.dispose());
    treePitCurbMesh.receiveShadow = true;
    treePitCurbMesh.castShadow = tier !== 'low';
    scene.add(treePitCurbMesh);

    const { colorTex: pitSoilColorTex, bumpTex: pitSoilBumpTex } = createTreeSoilTextures(maxAniso, tier);
    const treePitSoilMesh = new THREE.Mesh(
        mergeGeometries(treePitSoilGeoms, false),
        new THREE.MeshStandardMaterial({
            color: 0xffffff,
            map: pitSoilColorTex,
            bumpMap: pitSoilBumpTex,
            bumpScale: 0.024,
            roughness: 0.94,
            metalness: 0.01
        })
    );
    treePitSoilGeoms.forEach((g) => g.dispose());
    treePitSoilMesh.receiveShadow = true;
    scene.add(treePitSoilMesh);

    // 4. Orthogonal Soccer Pitch (San Bong Da) with FIFA turf markings
    const { canvas: pitchCanvas, ctx: fctx } = createScaledCanvas(512, 1024, tier, { mediumScale: 0.5, lowScale: 0.5 });
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
    fctx.font = '900 48px Inter, sans-serif';
    fctx.fillStyle = '#ffffff';
    fctx.textAlign = 'center';
    fctx.textBaseline = 'middle';
    fctx.shadowColor = 'rgba(0, 0, 0, 0.40)';
    fctx.shadowBlur = 6;
    fctx.fillText('SÂN BÓNG ĐÁ', 256, 700);
    fctx.shadowBlur = 0;
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

    // Procedural authentic bold white square grid net texture for soccer goals
    const createGoalNetTexture = () => {
        const { canvas: netCanvas, ctx: nctx } = createScaledCanvas(512, 512, tier, { mediumScale: 0.5, lowScale: 0.5 });
        nctx.clearRect(0, 0, 512, 512);

        // Bold, bright, opaque white braided nylon square net cords
        const step = 64;
        nctx.strokeStyle = '#ffffff';
        nctx.lineWidth = 11.0;
        nctx.lineCap = 'square';

        for (let x = 0; x <= 512; x += step) {
            nctx.beginPath();
            nctx.moveTo(x, 0);
            nctx.lineTo(x, 512);
            nctx.stroke();
        }
        for (let y = 0; y <= 512; y += step) {
            nctx.beginPath();
            nctx.moveTo(0, y);
            nctx.lineTo(512, y);
            nctx.stroke();
        }

        // Distinct rounded woven knots at grid intersections
        nctx.fillStyle = '#ffffff';
        for (let x = 0; x <= 512; x += step) {
            for (let y = 0; y <= 512; y += step) {
                nctx.beginPath();
                nctx.arc(x, y, 8.0, 0, Math.PI * 2);
                nctx.fill();
            }
        }

        const tex = new THREE.CanvasTexture(netCanvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = Math.min(8, maxAniso);
        return tex;
    };

    const goalNetTex = createGoalNetTexture();
    const goalNetMat = new THREE.MeshStandardMaterial({
        map: goalNetTex,
        transparent: true,
        alphaTest: 0.22,
        side: THREE.DoubleSide,
        roughness: 0.45,
        metalness: 0.05,
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 0.35
    });
    const goalDepthMat = new THREE.MeshDepthMaterial({
        depthPacking: THREE.RGBADepthPacking,
        map: goalNetTex,
        alphaTest: 0.22
    });

    const goalFrameMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.35,
        metalness: 0.15
    });

    // Construct complete 4-sided white square net enclosure + support tubular frame for both goals
    const goalNetGeoms = [];
    const goalFrameGeoms = [];

    const createTiledPlaneGeom = (w, h, tileX, tileY) => {
        const geom = new THREE.PlaneGeometry(w, h);
        const uvs = geom.attributes.uv;
        for (let i = 0; i < uvs.count; i++) {
            uvs.setXY(i, uvs.getX(i) * tileX, uvs.getY(i) * tileY);
        }
        uvs.needsUpdate = true;
        return geom;
    };

    const addGoalNetAndFrame = (goalCx, frontZ, dirZ) => {
        const W = 4.8;
        const H = 2.18;
        const D = 1.25;
        const Y0 = 0.035;
        const Y1 = Y0 + H;
        const Ym = Y0 + H * 0.5;
        const rearZ = frontZ + dirZ * D;
        const midZ = frontZ + dirZ * (D * 0.5);

        const tileW = W / 0.80; // 6.0 repeats (48 square cells)
        const tileH = H / 0.80; // 2.725 repeats (22 square cells)
        const tileD = D / 0.80; // 1.5625 repeats (12.5 square cells)

        // 1. Back net wall
        const backNet = createTiledPlaneGeom(W, H, tileW, tileH);
        backNet.translate(goalCx, Ym, rearZ);
        goalNetGeoms.push(backNet);

        // 2. Top net roof
        const topNet = createTiledPlaneGeom(W, D, tileW, tileD);
        topNet.rotateX(-Math.PI * 0.5);
        topNet.translate(goalCx, Y1, midZ);
        goalNetGeoms.push(topNet);

        // 3. Left side net wall
        const leftNet = createTiledPlaneGeom(D, H, tileD, tileH);
        leftNet.rotateY(Math.PI * 0.5);
        leftNet.translate(goalCx - W * 0.5, Ym, midZ);
        goalNetGeoms.push(leftNet);

        // 4. Right side net wall
        const rightNet = createTiledPlaneGeom(D, H, tileD, tileH);
        rightNet.rotateY(Math.PI * 0.5);
        rightNet.translate(goalCx + W * 0.5, Ym, midZ);
        goalNetGeoms.push(rightNet);

        // Tubular support frames
        const R = 0.032;

        // Back top horizontal bar
        const rTop = new THREE.CylinderGeometry(R, R, W, 8);
        rTop.rotateZ(Math.PI * 0.5);
        rTop.translate(goalCx, Y1, rearZ);
        goalFrameGeoms.push(rTop);

        // Back bottom ground bar
        const rBot = new THREE.CylinderGeometry(R, R, W, 8);
        rBot.rotateZ(Math.PI * 0.5);
        rBot.translate(goalCx, Y0 + R, rearZ);
        goalFrameGeoms.push(rBot);

        // Rear left & right vertical posts
        const rLeftV = new THREE.CylinderGeometry(R, R, H, 8);
        rLeftV.translate(goalCx - W * 0.5, Ym, rearZ);
        goalFrameGeoms.push(rLeftV);

        const rRightV = new THREE.CylinderGeometry(R, R, H, 8);
        rRightV.translate(goalCx + W * 0.5, Ym, rearZ);
        goalFrameGeoms.push(rRightV);

        // Top left & right depth bars
        const tLeftD = new THREE.CylinderGeometry(R, R, D, 8);
        tLeftD.rotateX(Math.PI * 0.5);
        tLeftD.translate(goalCx - W * 0.5, Y1, midZ);
        goalFrameGeoms.push(tLeftD);

        const tRightD = new THREE.CylinderGeometry(R, R, D, 8);
        tRightD.rotateX(Math.PI * 0.5);
        tRightD.translate(goalCx + W * 0.5, Y1, midZ);
        goalFrameGeoms.push(tRightD);

        // Bottom left & right ground depth bars
        const bLeftD = new THREE.CylinderGeometry(R, R, D, 8);
        bLeftD.rotateX(Math.PI * 0.5);
        bLeftD.translate(goalCx - W * 0.5, Y0 + R, midZ);
        goalFrameGeoms.push(bLeftD);

        const bRightD = new THREE.CylinderGeometry(R, R, D, 8);
        bRightD.rotateX(Math.PI * 0.5);
        bRightD.translate(goalCx + W * 0.5, Y0 + R, midZ);
        goalFrameGeoms.push(bRightD);
    };

    // North Goal (front at Z = 16.5, depth towards -Z)
    addGoalNetAndFrame(-75.5, 16.5, -1);
    // South Goal (front at Z = 56.5, depth towards +Z)
    addGoalNetAndFrame(-75.5, 56.5, 1);

    const mergedNetMesh = new THREE.Mesh(mergeGeometries(goalNetGeoms, false), goalNetMat);
    goalNetGeoms.forEach((g) => g.dispose());
    if (tier === 'high') {
        mergedNetMesh.customDepthMaterial = goalDepthMat;
        mergedNetMesh.castShadow = true;
    }
    mergedNetMesh.receiveShadow = true;
    scene.add(mergedNetMesh);

    const mergedFrameMesh = new THREE.Mesh(mergeGeometries(goalFrameGeoms, false), goalFrameMat);
    goalFrameGeoms.forEach((g) => g.dispose());
    mergedFrameMesh.castShadow = true;
    mergedFrameMesh.receiveShadow = true;
    scene.add(mergedFrameMesh);

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
    // Draw centerline stopping at center jump-ball circle
    bctx.beginPath(); bctx.moveTo(256, 24); bctx.lineTo(256, 144); bctx.stroke();
    bctx.beginPath(); bctx.moveTo(256, 240); bctx.lineTo(256, 360); bctx.stroke();
    bctx.beginPath(); bctx.arc(256, 192, 48, 0, Math.PI * 2); bctx.stroke();
    bctx.strokeRect(24, 118, 92, 148);
    bctx.strokeRect(396, 118, 92, 148);
    // Draw court label inside center jump-ball circle
    bctx.save();
    bctx.font = '800 28px Inter, sans-serif';
    bctx.fillStyle = '#ffffff';
    bctx.textAlign = 'center';
    bctx.textBaseline = 'middle';
    bctx.shadowColor = 'rgba(0, 0, 0, 0.40)';
    bctx.shadowBlur = 6;
    bctx.fillText('SÂN BÓNG RỔ', 256, 192);
    bctx.restore();
    const bballTex = new THREE.CanvasTexture(bballCanvas);
    bballTex.colorSpace = THREE.SRGBColorSpace;
    const bballCourt = new THREE.Mesh(
        new THREE.PlaneGeometry(18.0, 14.0),
        new THREE.MeshStandardMaterial({ map: bballTex, roughness: 0.85 })
    );
    bballCourt.rotation.set(-Math.PI * 0.5, 0, Math.PI * 0.5);
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
        const curbW = pathW + 10;

        // Path geometries ending flush at ring and junction boundaries with zero protrusion
        const drawMainPaths = () => {
            ctx.moveTo(ringCx, 0);
            ctx.lineTo(ringCx, ringCy - ringR);
            ctx.moveTo(ringCx, ringCy + ringR);
            ctx.lineTo(ringCx, lh);
            if (isRight) {
                ctx.moveTo(ringCx + ringR, ringCy);
                ctx.lineTo(lw, ringCy);
            }
        };

        const drawDiagonalPath = () => {
            if (!isRight) return;
            ctx.moveTo(ringCx, 140);
            ctx.lineTo(lw - 180, ringCy);
        };

        // Pass 1: Render continuous outer curbs across all pathways
        ctx.save();
        ctx.lineCap = 'butt';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = curbColor;
        ctx.lineWidth = curbW;

        ctx.beginPath();
        ctx.arc(ringCx, ringCy, ringR, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        drawMainPaths();
        ctx.stroke();

        if (isRight) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(ringCx, 0, lw - ringCx, ringCy);
            ctx.clip();
            ctx.beginPath();
            drawDiagonalPath();
            ctx.stroke();
            ctx.restore();
        }
        ctx.restore();

        // Pass 2: Render inner walkway pavement overlay to form unified seamless intersections
        ctx.save();
        ctx.lineCap = 'butt';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = pathColor;
        ctx.lineWidth = pathW;

        ctx.beginPath();
        ctx.arc(ringCx, ringCy, ringR, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        drawMainPaths();
        ctx.stroke();

        if (isRight) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(ringCx, 0, lw - ringCx, ringCy);
            ctx.clip();
            ctx.beginPath();
            drawDiagonalPath();
            ctx.stroke();
            ctx.restore();
        }
        ctx.restore();

        // Pass 3: Pristine inner circular lawn inside ring (eliminates any radial spoke bleed)
        ctx.save();
        const innerLawnR = ringR - curbW * 0.5;
        ctx.fillStyle = '#386f39';
        ctx.beginPath();
        ctx.arc(ringCx, ringCy, innerLawnR, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = curbColor;
        ctx.lineWidth = 6;
        ctx.stroke();
        ctx.restore();

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
        const curbW = pathW + 8;

        const drawSpokes = () => {
            ctx.moveTo(rCx, 0); ctx.lineTo(rCx, rCy - ringR);
            ctx.moveTo(rCx, rCy + ringR); ctx.lineTo(rCx, lh);
            ctx.moveTo(0, rCy); ctx.lineTo(rCx - ringR, rCy);
            ctx.moveTo(rCx + ringR, rCy); ctx.lineTo(lw, rCy);
        };

        // Pass 1: Render continuous outer curbs across all pathways
        ctx.save();
        ctx.lineCap = 'butt';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = curbColor;
        ctx.lineWidth = curbW;
        ctx.beginPath();
        ctx.arc(rCx, rCy, ringR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        drawSpokes();
        ctx.stroke();
        ctx.restore();

        // Pass 2: Render inner walkway pavement overlay to form unified seamless intersections
        ctx.save();
        ctx.lineCap = 'butt';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = pathColor;
        ctx.lineWidth = pathW;
        ctx.beginPath();
        ctx.arc(rCx, rCy, ringR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        drawSpokes();
        ctx.stroke();
        ctx.restore();

        // Pass 3: Pristine inner circular lawn inside ring (eliminates any radial spoke bleed)
        ctx.save();
        const innerLawnR = ringR - curbW * 0.5;
        ctx.fillStyle = '#3b733c';
        ctx.beginPath();
        ctx.arc(rCx, rCy, innerLawnR, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = curbColor;
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.restore();

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

    for (let i = groundStartIdx; i < scene.children.length; i++) {
        freezeStaticHierarchy(scene.children[i]);
    }
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
    ctx.fillText('TRƯỜNG THPT CHUYÊN KHOA HỌC HUẾ', w * 0.46, 440);

    ctx.font = '800 52px "Inter", "Segoe UI", sans-serif';
    ctx.fillStyle = '#f1f5f9';
    ctx.fillText('HUSC HIGH SCHOOL FOR GIFTED STUDENTS', w * 0.46, 545);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.82)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(80, 625);
    ctx.lineTo(w - 220, 625);
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.font = '700 34px "Inter", "Segoe UI", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Website: http://thpt-khhue.thuathienhue.edu.vn', 80, 715);

    ctx.textAlign = 'right';
    ctx.fillText('Điện thoại: 0234 3898936', w - 240, 715);

    ctx.strokeStyle = 'rgba(15, 60, 134, 0.40)';
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, w - 6, h - 6);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = Math.min(8, maxAnisotropy);
    return tex;
}

// Dynamic spotlight pool for Dong Da Left Wing Gate structure
const gateSpotlights = [];

// Dynamic downlight pool and luminaire materials for streetlamp poles along Dong Da median island
const streetlampDownlights = [];
let streetlampLumMat = null;
let streetlampBeamMat = null;

// Build authentic wide left-wing gate pier, slate foundation, beam, spotlights, and Chuyên Khoa học signboard matching Photo 1
function createDongDaLeftWingGateStructure(scene, maxAniso = 4, animatedFlags = null) {
    gateSpotlights.length = 0;
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
        emissive: new THREE.Color(0xfff1cc),
        emissiveMap: signTex,
        emissiveIntensity: 0,
        roughness: 0.22,
        metalness: 0.08
    });

    const darkMetalMat = new THREE.MeshStandardMaterial({
        color: 0x1f242d,
        roughness: 0.45,
        metalness: 0.75
    });

    const lampLensMat = new THREE.MeshBasicMaterial({
        color: 0xcbd5e1
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

    // 2. High School Signboard Panel (widened for high visibility, shifted slightly left for phone visibility)
    const signW = 4.70;
    const signH = 2.05;
    const signGeom = new THREE.PlaneGeometry(signW, signH);
    const signMesh = new THREE.Mesh(signGeom, signMat);
    signMesh.position.set(-0.10, baseH + signH * 0.5, baseD * 0.5 + 0.015);
    group.add(signMesh);

    // Solid backing panel for signboard
    const backPanelGeom = new THREE.BoxGeometry(signW, signH, 0.16);
    const backPanelMesh = new THREE.Mesh(backPanelGeom, new THREE.MeshStandardMaterial({ color: 0x2e3440, roughness: 0.7 }));
    backPanelMesh.position.set(-0.10, baseH + signH * 0.5, baseD * 0.5 - 0.08);
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

        // Emissive signboard + additive cone/glow illuminate gate with zero PointLight shader recompiles
        const coneMesh = new THREE.Mesh(coneGeom, coneMat);
        coneMesh.visible = false;

        spotGroup.add(brackMesh, lampMesh, lensMesh, coneMesh);
        group.add(spotGroup);

        const glowMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), glowMat);
        glowMesh.position.set(spotX, baseH + signH - 0.45, baseD * 0.5 + 0.022);
        glowMesh.visible = false;
        group.add(glowMesh);

        gateSpotlights.push({ signMat, lampLensMat, coneMat, glowMat, coneMesh, glowMesh });
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
    group.position.set(23.45, 0, -90.93);

    scene.add(group);
    const gateDynamicSet = new Set(animatedFlags || []);
    for (const sp of gateSpotlights) {
        gateDynamicSet.add(sp.coneMesh);
        gateDynamicSet.add(sp.glowMesh);
    }
    batchStaticGroupByMaterial(group, gateDynamicSet);
    freezeStaticHierarchy(group, animatedFlags ? new Set(animatedFlags) : null);
}

// Create authentic 4-sided modern architectural building for Nha D (Photo 1) covering all 4 faces
function createNhaDModernBuilding(scene, maxAniso = 4, tier = 'high') {
    const group = new THREE.Group();

    // 1. Texture generator for West (with logo & text) and East (clean) short facades (11.5m wide x 15.0m high)
    const createNhaDShortTexture = (hasSignboard = true) => {
        const sizeW = 1024;
        const sizeH = 1344;
        const { canvas, ctx } = createScaledCanvas(sizeW, sizeH, tier, { mediumScale: 0.5, lowScale: 0.375 });

        // Base off-white exterior architectural finish on flanking columns
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, sizeW, sizeH);

        // Subtle formwork seams on left and right columns
        ctx.strokeStyle = 'rgba(203, 213, 225, 0.40)';
        ctx.lineWidth = 1.5;
        for (let y = 100; y < sizeH; y += 120) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(160, y);
            ctx.moveTo(sizeW - 160, y);
            ctx.lineTo(sizeW, y);
            ctx.stroke();
        }

        // Central recessed bay clad in dark bronze-brown horizontal ceramic tiles
        const bayX = 160;
        const bayW = 704;
        ctx.fillStyle = '#261b17';
        ctx.fillRect(bayX, 0, bayW, sizeH);

        // Fine horizontal tile joint lines
        const tileH = 16;
        for (let y = 0; y < sizeH; y += tileH) {
            ctx.strokeStyle = 'rgba(15, 10, 8, 0.55)';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(bayX, y);
            ctx.lineTo(bayX + bayW, y);
            ctx.stroke();

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
            ctx.lineWidth = 1.0;
            ctx.beginPath();
            ctx.moveTo(bayX, y + 1.8);
            ctx.lineTo(bayX + bayW, y + 1.8);
            ctx.stroke();
        }

        // Top Header Black Band (vùng đen)
        const headerY0 = 20;
        const headerH = 165;
        ctx.fillStyle = '#080c14';
        ctx.fillRect(bayX, headerY0, bayW, headerH);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(bayX, headerY0, bayW, headerH);

        if (hasSignboard) {
            const headerCenterY = headerY0 + headerH * 0.5; // 102.5

            // Draw official HUSC shield emblem on the left inside the black band
            const logoX = bayX + 72;
            drawHuscShield(ctx, logoX, headerCenterY, 100);

            // Signboard text "TRƯỜNG ĐẠI HỌC KHOA HỌC" cleanly inside the black band
            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
            ctx.shadowBlur = 6;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 2;

            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.font = '800 36px "Inter", "Segoe UI", sans-serif';
            ctx.fillText('TRƯỜNG ĐẠI HỌC KHOA HỌC', bayX + 138, headerCenterY);
            ctx.restore();
        }

        // 4 Upper floors: wide 4-pane dark reflective ribbon windows + white concrete spandrel beams
        const winX = bayX + 26;
        const winW = bayW - 52;
        const winH = 175;
        const floorY = [210, 445, 680, 915];

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

        const colorTex = new THREE.CanvasTexture(canvas);
        colorTex.colorSpace = THREE.SRGBColorSpace;
        colorTex.anisotropy = Math.min(8, maxAniso);
        return colorTex;
    };

    // 2. Bump texture generator for short facades (11.5m)
    const createNhaDShortBumpTexture = () => {
        if (tier === 'low') return null;
        const sizeW = 1024;
        const sizeH = 1344;
        const { canvas: bumpCanvas, ctx: bctx } = createScaledCanvas(sizeW, sizeH, tier, { highScale: 0.5, mediumScale: 0.375 });
        bctx.fillStyle = '#808080';
        bctx.fillRect(0, 0, sizeW, sizeH);

        const bayX = 160;
        const bayW = 704;
        const winX = bayX + 26;
        const winW = bayW - 52;
        const winH = 175;
        const floorY = [210, 445, 680, 915];
        const lobbyY = 1145;
        const lobbyH = sizeH - lobbyY;

        // Recessed dark tile zone
        bctx.fillStyle = '#6a6a6a';
        bctx.fillRect(bayX, 0, bayW, sizeH);
        bctx.fillStyle = '#303030';
        for (let y = 0; y < sizeH; y += 16) {
            bctx.fillRect(bayX, y, bayW, 2);
        }

        // Windows bump
        bctx.fillStyle = '#202020';
        for (let f = 0; f < 4; f++) {
            bctx.fillRect(winX - 6, floorY[f] - 4, winW + 12, winH + 8);
        }
        bctx.fillRect(winX - 6, lobbyY - 4, winW + 12, lobbyH - 8);

        const bumpTex = new THREE.CanvasTexture(bumpCanvas);
        bumpTex.anisotropy = Math.min(8, maxAniso);
        return bumpTex;
    };

    // 3. Texture generator for North & South long facades (22.0m wide x 15.0m high)
    const createNhaDLongTexture = () => {
        const sizeW = 2048;
        const sizeH = 1344;
        const { canvas, ctx } = createScaledCanvas(sizeW, sizeH, tier, { mediumScale: 0.5, lowScale: 0.375 });

        // Base off-white exterior architectural finish
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, sizeW, sizeH);

        // Formwork seams on flanking columns
        ctx.strokeStyle = 'rgba(203, 213, 225, 0.40)';
        ctx.lineWidth = 1.5;
        for (let y = 100; y < sizeH; y += 120) {
            ctx.beginPath();
            ctx.moveTo(0, y); ctx.lineTo(160, y);
            ctx.moveTo(sizeW - 160, y); ctx.lineTo(sizeW, y);
            ctx.stroke();
        }

        const bayX = 160;
        const bayW = sizeW - 320; // 1728px

        // Central recessed field clad in dark ceramic tiles
        ctx.fillStyle = '#261b17';
        ctx.fillRect(bayX, 0, bayW, sizeH);

        // Fine horizontal tile joint lines
        const tileH = 16;
        for (let y = 0; y < sizeH; y += tileH) {
            ctx.strokeStyle = 'rgba(15, 10, 8, 0.55)';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(bayX, y);
            ctx.lineTo(bayX + bayW, y);
            ctx.stroke();

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
            ctx.lineWidth = 1.0;
            ctx.beginPath();
            ctx.moveTo(bayX, y + 1.8);
            ctx.lineTo(bayX + bayW, y + 1.8);
            ctx.stroke();
        }

        // Top Header Black Band (vùng đen) across the long facade
        const headerY0 = 20;
        const headerH = 165;
        ctx.fillStyle = '#080c14';
        ctx.fillRect(bayX, headerY0, bayW, headerH);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(bayX, headerY0, bayW, headerH);

        // 4 Upper floors: 2 wide window bays separated by central architectural white pier
        const pierW = 128;
        const sectionW = (bayW - pierW - 52) * 0.5; // (1728 - 128 - 52) / 2 = 774px
        const sec1X = bayX + 26;
        const pierX = sec1X + sectionW;
        const sec2X = pierX + pierW;
        const winH = 175;
        const floorY = [210, 445, 680, 915];

        // Vertical central white architectural pier
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(pierX, 185, pierW, sizeH - 185);
        ctx.strokeStyle = 'rgba(203, 213, 225, 0.40)';
        ctx.lineWidth = 1.5;
        for (let y = 100; y < sizeH; y += 120) {
            ctx.beginPath();
            ctx.moveTo(pierX, y);
            ctx.lineTo(pierX + pierW, y);
            ctx.stroke();
        }

        for (let f = 0; f < 4; f++) {
            const fy = floorY[f];

            // Horizontal white concrete spandrel beam separating floors
            ctx.fillStyle = '#e2e8f0';
            ctx.fillRect(bayX, fy - 26, bayW, 26);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
            ctx.fillRect(bayX, fy - 4, bayW, 4);

            // Windows in both sections
            for (const sx of [sec1X, sec2X]) {
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(sx - 6, fy - 4, sectionW + 12, winH + 8);

                const paneW = (sectionW - 18) / 4;
                for (let p = 0; p < 4; p++) {
                    const px = sx + p * (paneW + 6);
                    const glassGrad = ctx.createLinearGradient(px, fy, px, fy + winH);
                    glassGrad.addColorStop(0, '#1e293b');
                    glassGrad.addColorStop(0.35, '#0f172a');
                    glassGrad.addColorStop(1, '#090d16');
                    ctx.fillStyle = glassGrad;
                    ctx.fillRect(px, fy, paneW, winH);

                    ctx.fillStyle = 'rgba(186, 230, 253, 0.14)';
                    ctx.beginPath();
                    ctx.moveTo(px, fy + 40);
                    ctx.lineTo(px + paneW * 0.7, fy);
                    ctx.lineTo(px + paneW, fy);
                    ctx.lineTo(px + paneW * 0.3, fy + winH);
                    ctx.lineTo(px, fy + winH);
                    ctx.closePath();
                    ctx.fill();

                    ctx.strokeStyle = '#334155';
                    ctx.lineWidth = 3.5;
                    ctx.beginPath();
                    ctx.moveTo(px, fy + 44);
                    ctx.lineTo(px + paneW, fy + 44);
                    ctx.stroke();

                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
                    ctx.lineWidth = 1.2;
                    ctx.strokeRect(px + 2, fy + 2, paneW - 4, winH - 4);
                }
            }
        }

        // Ground floor
        const lobbyY = 1145;
        const lobbyH = sizeH - lobbyY;
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(bayX, lobbyY - 26, bayW, 26);

        for (const sx of [sec1X, sec2X]) {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(sx - 6, lobbyY - 4, sectionW + 12, lobbyH - 8);
            const lobbyGrad = ctx.createLinearGradient(sx, lobbyY, sx, lobbyY + lobbyH);
            lobbyGrad.addColorStop(0, 'rgba(30, 41, 59, 0.95)');
            lobbyGrad.addColorStop(0.55, 'rgba(51, 65, 85, 0.88)');
            lobbyGrad.addColorStop(1, 'rgba(15, 23, 42, 0.98)');
            ctx.fillStyle = lobbyGrad;
            ctx.fillRect(sx, lobbyY, sectionW, lobbyH - 14);
        }

        // Base planter shrubbery curb
        ctx.fillStyle = '#334155';
        ctx.fillRect(bayX - 20, sizeH - 18, bayW + 40, 18);
        for (let i = 0; i < 180; i++) {
            const gx = bayX - 16 + Math.random() * (bayW + 32);
            const gy = sizeH - 12 + Math.random() * 12;
            const gr = 4 + Math.random() * 6;
            ctx.fillStyle = Math.random() > 0.4 ? '#166534' : '#15803d';
            ctx.beginPath();
            ctx.arc(gx, gy, gr, 0, Math.PI * 2);
            ctx.fill();
        }

        const colorTex = new THREE.CanvasTexture(canvas);
        colorTex.colorSpace = THREE.SRGBColorSpace;
        colorTex.anisotropy = Math.min(8, maxAniso);
        return colorTex;
    };

    // 4. Bump texture generator for long facades (22.0m)
    const createNhaDLongBumpTexture = () => {
        if (tier === 'low') return null;
        const sizeW = 2048;
        const sizeH = 1344;
        const { canvas: bumpCanvas, ctx: bctx } = createScaledCanvas(sizeW, sizeH, tier, { highScale: 0.5, mediumScale: 0.375 });
        bctx.fillStyle = '#808080';
        bctx.fillRect(0, 0, sizeW, sizeH);

        const bayX = 160;
        const bayW = sizeW - 320;
        const pierW = 128;
        const sectionW = (bayW - pierW - 52) * 0.5;
        const sec1X = bayX + 26;
        const pierX = sec1X + sectionW;
        const sec2X = pierX + pierW;
        const winH = 175;
        const floorY = [210, 445, 680, 915];
        const lobbyY = 1145;
        const lobbyH = sizeH - lobbyY;

        bctx.fillStyle = '#6a6a6a';
        bctx.fillRect(bayX, 0, bayW, sizeH);
        bctx.fillStyle = '#303030';
        for (let y = 0; y < sizeH; y += 16) {
            bctx.fillRect(bayX, y, bayW, 2);
        }

        bctx.fillStyle = '#858585';
        bctx.fillRect(pierX, 185, pierW, sizeH - 185);

        bctx.fillStyle = '#202020';
        for (let f = 0; f < 4; f++) {
            for (const sx of [sec1X, sec2X]) {
                bctx.fillRect(sx - 6, floorY[f] - 4, sectionW + 12, winH + 8);
            }
        }
        for (const sx of [sec1X, sec2X]) {
            bctx.fillRect(sx - 6, lobbyY - 4, sectionW + 12, lobbyH - 8);
        }

        const bumpTex = new THREE.CanvasTexture(bumpCanvas);
        bumpTex.anisotropy = Math.min(8, maxAniso);
        return bumpTex;
    };

    // Shared materials & textures
    const shortBump = createNhaDShortBumpTexture();
    const longColor = createNhaDLongTexture();
    const longBump = createNhaDLongBumpTexture();

    const shortMatWest = new THREE.MeshStandardMaterial({
        map: createNhaDShortTexture(true),
        bumpMap: shortBump,
        bumpScale: 0.018,
        roughness: 0.42,
        metalness: 0.10
    });
    const shortMatEast = new THREE.MeshStandardMaterial({
        map: createNhaDShortTexture(false),
        bumpMap: shortBump,
        bumpScale: 0.018,
        roughness: 0.42,
        metalness: 0.10
    });
    const longMat = new THREE.MeshStandardMaterial({
        map: longColor,
        bumpMap: longBump,
        bumpScale: 0.018,
        roughness: 0.42,
        metalness: 0.10
    });

    const bldgW = 22.0;
    const bldgD = 11.5;
    const bldgH = 15.0;
    const halfW = bldgW * 0.5; // 11.0
    const halfD = bldgD * 0.5; // 5.75
    const halfH = bldgH * 0.5; // 7.5

    // 1. West Face (facing Ly Thuong Kiet) - WITH HUSC logo & "TRƯỜNG ĐẠI HỌC KHOA HỌC"
    const westMesh = new THREE.Mesh(new THREE.PlaneGeometry(bldgD, bldgH), shortMatWest);
    westMesh.position.set(-halfW, halfH, 0);
    westMesh.rotation.y = -Math.PI * 0.5;
    westMesh.receiveShadow = true;
    group.add(westMesh);

    // 2. East Face (facing campus courtyard) - clean modern facade without text
    const eastMesh = new THREE.Mesh(new THREE.PlaneGeometry(bldgD, bldgH), shortMatEast);
    eastMesh.position.set(halfW, halfH, 0);
    eastMesh.rotation.y = Math.PI * 0.5;
    eastMesh.receiveShadow = true;
    group.add(eastMesh);

    // 3. North Face (facing Dong Da & parking) - clean modern wide facade without text
    const northMesh = new THREE.Mesh(new THREE.PlaneGeometry(bldgW, bldgH), longMat);
    northMesh.position.set(0, halfH, -halfD);
    northMesh.rotation.y = Math.PI;
    northMesh.receiveShadow = true;
    group.add(northMesh);

    // 4. South Face (facing soccer field) - clean modern wide facade without text
    const southMesh = new THREE.Mesh(new THREE.PlaneGeometry(bldgW, bldgH), longMat);
    southMesh.position.set(0, halfH, halfD);
    southMesh.rotation.y = 0;
    southMesh.receiveShadow = true;
    group.add(southMesh);

    // 5. 4 Off-white vertical corner columns terminated cleanly beneath parapet coping to avoid overlap
    const cornerMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.42, metalness: 0.05 });
    const cornerColH = bldgH - 0.18;
    const cornerGeom = new THREE.BoxGeometry(0.24, cornerColH, 0.24);
    for (const cx of [-halfW, halfW]) {
        for (const cz of [-halfD, halfD]) {
            const col = new THREE.Mesh(cornerGeom, cornerMat);
            col.position.set(cx, cornerColH * 0.5, cz);
            col.castShadow = true;
            col.receiveShadow = true;
            group.add(col);
        }
    }

    // 6. Roof parapet coping rim running continuously along perimeter without corner overlap
    const copingMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.35, metalness: 0.08 });
    const nCoping = new THREE.Mesh(new THREE.BoxGeometry(bldgW + 0.24, 0.36, 0.24), copingMat);
    nCoping.position.set(0, bldgH, -halfD);
    const sCoping = new THREE.Mesh(new THREE.BoxGeometry(bldgW + 0.24, 0.36, 0.24), copingMat);
    sCoping.position.set(0, bldgH, halfD);
    const wCoping = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.36, bldgD - 0.24), copingMat);
    wCoping.position.set(-halfW, bldgH, 0);
    const eCoping = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.36, bldgD - 0.24), copingMat);
    eCoping.position.set(halfW, bldgH, 0);
    group.add(nCoping, sCoping, wCoping, eCoping);

    // Flat roof surface slab tucked cleanly inside parapet walls with vertical clearance above inner core
    const roofSlab = new THREE.Mesh(
        new THREE.PlaneGeometry(bldgW - 0.18, bldgD - 0.18),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.85, metalness: 0.05 })
    );
    roofSlab.rotation.x = -Math.PI * 0.5;
    roofSlab.position.set(0, bldgH - 0.05, 0);
    roofSlab.receiveShadow = true;
    group.add(roofSlab);

    // 7. Interior solid light blocker recessed below roofSlab to eliminate roof Z-fighting
    const innerBoxH = bldgH - 0.40;
    const innerBoxGeom = new THREE.BoxGeometry(bldgW - 0.16, innerBoxH, bldgD - 0.16);
    const innerBoxMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.90 });
    const innerBox = new THREE.Mesh(innerBoxGeom, innerBoxMat);
    innerBox.position.set(0, innerBoxH * 0.5, 0);
    innerBox.castShadow = true;
    innerBox.receiveShadow = true;
    group.add(innerBox);

    // 8. West entrance 3D Cantilevered Glass & Steel Canopy (Photo 1)
    const canopyW = 6.6;
    const canopyD = 1.6;
    const canopyH = 0.08;
    const canopyY = 3.65;
    const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.35, metalness: 0.80 });

    const canopyFrameGeom = new THREE.BoxGeometry(canopyD, canopyH, canopyW);
    const canopyFrameMesh = new THREE.Mesh(canopyFrameGeom, darkMetalMat);
    canopyFrameMesh.position.set(-halfW - canopyD * 0.5, canopyY, 0);
    canopyFrameMesh.castShadow = true;
    canopyFrameMesh.receiveShadow = true;
    group.add(canopyFrameMesh);

    const canopyGlassMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        transparent: true,
        opacity: 0.72,
        roughness: 0.12,
        metalness: 0.15
    });
    const glassMesh = new THREE.Mesh(new THREE.BoxGeometry(canopyD - 0.2, 0.024, canopyW - 0.2), canopyGlassMat);
    glassMesh.position.set(-halfW - canopyD * 0.5, canopyY + 0.035, 0);
    group.add(glassMesh);

    // 4 Diagonal stainless steel tension tie rods supporting the West canopy
    const tieZ = [-2.6, -0.88, 0.88, 2.6];
    const rodLength = Math.hypot(canopyD - 0.1, 1.25);
    const rodAngle = Math.atan2(canopyD - 0.1, 1.25);
    const rodGeom = new THREE.CylinderGeometry(0.018, 0.018, rodLength, 8);
    rodGeom.rotateZ(-rodAngle);
    const steelMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.25, metalness: 0.90 });

    for (let i = 0; i < 4; i++) {
        const rod = new THREE.Mesh(rodGeom, steelMat);
        rod.position.set(-halfW - (canopyD - 0.1) * 0.5, canopyY + 0.625, tieZ[i]);
        group.add(rod);

        const clevis = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.08), darkMetalMat);
        clevis.position.set(-halfW - 0.06, canopyY + 1.25, tieZ[i]);
        group.add(clevis);
    }

    // West ground entrance terrace steps
    const stepGeom = new THREE.BoxGeometry(1.8, 0.22, 7.2);
    const stepMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.78, metalness: 0.05 });
    const stepMesh = new THREE.Mesh(stepGeom, stepMat);
    stepMesh.position.set(-halfW - 0.9, 0.11, 0);
    stepMesh.receiveShadow = true;
    group.add(stepMesh);

    // 9. North entrance canopy & steps (facing parking / Dong Da)
    const northCanopyFrame = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.08, 1.4), darkMetalMat);
    northCanopyFrame.position.set(0, canopyY, -halfD - 0.7);
    northCanopyFrame.castShadow = true;
    northCanopyFrame.receiveShadow = true;
    group.add(northCanopyFrame);

    const northStepMesh = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.22, 1.6), stepMat);
    northStepMesh.position.set(0, 0.11, -halfD - 0.8);
    northStepMesh.receiveShadow = true;
    group.add(northStepMesh);

    // Position entire Nha D modern building assembly onto building location
    const bldgYaw = 0.06;
    group.position.set(-74.0, 0, -25.5);
    group.rotation.y = bldgYaw;
    scene.add(group);
    batchStaticGroupByMaterial(group);
    freezeStaticHierarchy(group);
}

// Authentic 2-story connecting building between Nha A and Nha A1-A2 featuring breezeway archway and open 2nd-floor loggia (Photo 2)
function createNhaAConnectorBuilding(scene, maxAniso = 4, tier = 'high') {
    const group = new THREE.Group();

    // 1. Canvas Texture: "Chào Mừng Ngày Nhà Giáo Việt Nam 20-11" (Left Facade Backdrop)
    const createTeacherDayBackdropTexture = () => {
        const sizeW = 1024;
        const sizeH = 832;
        const { canvas, ctx } = createScaledCanvas(sizeW, sizeH, tier, { mediumScale: 0.5, lowScale: 0.375 });

        // Crisp white base with soft watercolor washes (sky blue / cyan tones)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, sizeW, sizeH);

        const bgGrad = ctx.createRadialGradient(sizeW * 0.25, sizeH * 0.45, 40, sizeW * 0.3, sizeH * 0.5, sizeW * 0.65);
        bgGrad.addColorStop(0, '#e0f2fe');
        bgGrad.addColorStop(0.45, '#f0f9ff');
        bgGrad.addColorStop(1, '#ffffff');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, sizeW, sizeH);

        ctx.fillStyle = 'rgba(186, 230, 253, 0.45)';
        ctx.beginPath();
        ctx.ellipse(sizeW * 0.22, sizeH * 0.65, 240, 160, -Math.PI * 0.15, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(224, 242, 254, 0.55)';
        ctx.beginPath();
        ctx.ellipse(sizeW * 0.78, sizeH * 0.75, 210, 140, Math.PI * 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Top Header: HUSC Shield Logo + University Name
        drawHuscShield(ctx, 130, 85, 90);

        ctx.save();
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#1e3a8a';
        ctx.font = '800 32px "Inter", sans-serif';
        ctx.fillText('ĐẠI HỌC HUẾ', 195, 70);
        ctx.font = '900 38px "Inter", sans-serif';
        ctx.fillText('TRƯỜNG ĐẠI HỌC KHOA HỌC', 195, 110);
        ctx.restore();

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(70, 145);
        ctx.lineTo(sizeW - 70, 145);
        ctx.stroke();

        ctx.save();
        ctx.font = 'italic 700 62px "Georgia", "Times New Roman", serif';
        ctx.fillStyle = '#1d4ed8';
        ctx.textAlign = 'left';
        ctx.fillText('Chào Mừng', 85, 240);

        ctx.font = '900 78px "Georgia", "Times New Roman", serif';
        ctx.fillStyle = '#0f172a';
        ctx.fillText('Ngày Nhà Giáo', 85, 340);

        ctx.font = 'italic 700 68px "Georgia", serif';
        ctx.fillStyle = '#0284c7';
        ctx.fillText('Việt Nam', 85, 440);

        const num20Grad = ctx.createLinearGradient(420, 320, 580, 460);
        num20Grad.addColorStop(0, '#06b6d4');
        num20Grad.addColorStop(1, '#0284c7');
        ctx.fillStyle = num20Grad;
        ctx.font = '900 155px "Inter", "Segoe UI", sans-serif';
        ctx.fillText('20', 430, 440);

        const num11Grad = ctx.createLinearGradient(630, 320, 780, 460);
        num11Grad.addColorStop(0, '#a855f7');
        num11Grad.addColorStop(1, '#ec4899');
        ctx.fillStyle = num11Grad;
        ctx.fillText('11', 655, 440);
        ctx.restore();

        ctx.save();
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(sizeW * 0.35, sizeH * 0.72);
        ctx.quadraticCurveTo(sizeW * 0.45, sizeH * 0.67, sizeW * 0.55, sizeH * 0.73);
        ctx.moveTo(sizeW * 0.55, sizeH * 0.73);
        ctx.quadraticCurveTo(sizeW * 0.65, sizeH * 0.67, sizeW * 0.75, sizeH * 0.72);
        ctx.stroke();

        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(sizeW * 0.52, sizeH * 0.63);
        ctx.lineTo(sizeW * 0.60, sizeH * 0.50);
        ctx.stroke();

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(sizeW * 0.44, sizeH * 0.64);
        ctx.bezierCurveTo(sizeW * 0.42, sizeH * 0.61, sizeW * 0.39, sizeH * 0.62, sizeW * 0.41, sizeH * 0.66);
        ctx.bezierCurveTo(sizeW * 0.43, sizeH * 0.69, sizeW * 0.44, sizeH * 0.70, sizeW * 0.44, sizeH * 0.71);
        ctx.stroke();
        ctx.restore();

        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 4;
        ctx.strokeRect(6, 6, sizeW - 12, sizeH - 12);

        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = maxAniso;
        return tex;
    };

    // 2. Canvas Texture: "IT GAME JAM with AI" (Right Facade Backdrop)
    const createGameJamBackdropTexture = () => {
        const sizeW = 1024;
        const sizeH = 832;
        const { canvas, ctx } = createScaledCanvas(sizeW, sizeH, tier, { mediumScale: 0.5, lowScale: 0.375 });

        const grad = ctx.createLinearGradient(0, 0, 0, sizeH);
        grad.addColorStop(0, '#b91c1c');
        grad.addColorStop(0.28, '#c2410c');
        grad.addColorStop(0.65, '#ea580c');
        grad.addColorStop(0.88, '#f59e0b');
        grad.addColorStop(1, '#fef08a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, sizeW, sizeH);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.beginPath();
        ctx.arc(sizeW * 0.18, sizeH * 0.35, 45, 0, Math.PI * 2);
        ctx.arc(sizeW * 0.24, sizeH * 0.33, 60, 0, Math.PI * 2);
        ctx.arc(sizeW * 0.30, sizeH * 0.36, 42, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(sizeW * 0.82, sizeH * 0.28, 48, 0, Math.PI * 2);
        ctx.arc(sizeW * 0.88, sizeH * 0.26, 62, 0, Math.PI * 2);
        ctx.arc(sizeW * 0.94, sizeH * 0.30, 44, 0, Math.PI * 2);
        ctx.fill();

        drawHuscShield(ctx, 110, 65, 75);

        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.font = '800 24px "Inter", sans-serif';
        ctx.fillText('CUỘC THI LẬP TRÌNH GAME KHOA CÔNG NGHỆ THÔNG TIN', sizeW * 0.54, 52);
        ctx.fillStyle = '#fef08a';
        ctx.font = '800 26px "Inter", sans-serif';
        ctx.fillText('CHÀO MỪNG NGÀY NHÀ GIÁO VIỆT NAM 20/11', sizeW * 0.54, 88);
        ctx.restore();

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(30, 10, 10, 0.85)';
        ctx.shadowBlur = 14;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 6;
        ctx.font = '900 92px "Inter", "Impact", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('IT GAME JAM', sizeW * 0.46, 235);
        ctx.restore();

        ctx.save();
        ctx.textAlign = 'left';
        ctx.font = 'italic 800 54px "Segoe Script", cursive, sans-serif';
        ctx.fillStyle = '#fef08a';
        ctx.shadowColor = 'rgba(254, 240, 138, 0.9)';
        ctx.shadowBlur = 18;
        ctx.fillText('with AI', sizeW * 0.69, 295);

        ctx.fillStyle = '#ffffff';
        const drawSparkle = (sx, sy, r) => {
            ctx.beginPath();
            ctx.arc(sx, sy, r, 0, Math.PI * 2);
            ctx.fill();
        };
        drawSparkle(sizeW * 0.68, 275, 4);
        drawSparkle(sizeW * 0.86, 290, 5);
        drawSparkle(sizeW * 0.82, 335, 3);
        ctx.restore();

        const pillW = 540;
        const pillH = 58;
        const pillX = (sizeW - pillW) * 0.5;
        const pillY = 350;
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.beginPath();
        ctx.roundRect(pillX, pillY, pillW, pillH, 29);
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#0284c7';
        ctx.stroke();

        ctx.fillStyle = '#0284c7';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '900 26px "Inter", sans-serif';
        ctx.fillText('🔍 [ < VIBE CODE YOUR GAME > 🎮 ]', sizeW * 0.5, pillY + pillH * 0.5);
        ctx.restore();

        const trophyY = 540;
        ctx.save();
        ctx.fillStyle = '#0284c7';
        ctx.font = '900 72px "Inter", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('<', sizeW * 0.38, trophyY);
        ctx.fillText('>', sizeW * 0.62, trophyY);

        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.moveTo(sizeW * 0.44, trophyY - 50);
        ctx.lineTo(sizeW * 0.56, trophyY - 50);
        ctx.lineTo(sizeW * 0.53, trophyY);
        ctx.quadraticCurveTo(sizeW * 0.5, trophyY + 25, sizeW * 0.47, trophyY);
        ctx.closePath();
        ctx.fill();
        ctx.fillRect(sizeW * 0.485, trophyY + 15, sizeW * 0.03, 30);
        ctx.fillRect(sizeW * 0.44, trophyY + 45, sizeW * 0.12, 16);

        ctx.fillStyle = '#fef08a';
        for (let i = -2; i <= 2; i++) {
            if (i === 0) continue;
            ctx.beginPath();
            ctx.arc(sizeW * 0.5 + i * 115, trophyY + Math.abs(i) * 8, 14, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.font = '700 24px "Inter", sans-serif';
        ctx.fillText('Huế, ngày 20 tháng 11 năm 2024', sizeW * 0.5, 790);
        ctx.restore();

        ctx.strokeStyle = '#fed7aa';
        ctx.lineWidth = 4;
        ctx.strokeRect(6, 6, sizeW - 12, sizeH - 12);

        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = maxAniso;
        return tex;
    };

    // 3. Canvas Texture: "TỌA ĐÀM" Horizontal Banner (Above Breezeway Portal)
    const createToaDamBannerTexture = () => {
        const sizeW = 896;
        const sizeH = 168;
        const { canvas, ctx } = createScaledCanvas(sizeW, sizeH, tier, { mediumScale: 0.5, lowScale: 0.375 });

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, sizeW, sizeH);

        ctx.fillStyle = '#1e3a8a';
        ctx.textAlign = 'center';
        ctx.font = '800 22px "Inter", sans-serif';
        ctx.fillText('ĐẠI HỌC HUẾ · TRƯỜNG ĐẠI HỌC KHOA HỌC · KHOA CÔNG NGHỆ THÔNG TIN', sizeW * 0.5, 34);

        ctx.save();
        ctx.fillStyle = 'rgba(2, 132, 199, 0.10)';
        ctx.beginPath();
        ctx.ellipse(sizeW * 0.5, 92, 160, 36, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#0284c7';
        ctx.stroke();

        ctx.font = '900 52px "Inter", sans-serif';
        ctx.fillStyle = '#0284c7';
        ctx.textBaseline = 'middle';
        ctx.fillText('TỌA ĐÀM', sizeW * 0.5, 92);
        ctx.restore();

        ctx.fillStyle = '#0284c7';
        ctx.fillRect(0, sizeH - 12, sizeW, 6);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(sizeW * 0.25, sizeH - 6, sizeW * 0.5, 6);

        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.strokeRect(2, 2, sizeW - 4, sizeH - 4);

        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = maxAniso;
        return tex;
    };

    // 4. Canvas Texture: "KHOA CÔNG NGHỆ THÔNG TIN" Overhead Illuminated Portal Signboard
    const createPassageItSignTexture = () => {
        const sizeW = 768;
        const sizeH = 160;
        const { canvas, ctx } = createScaledCanvas(sizeW, sizeH, tier, { mediumScale: 0.5, lowScale: 0.375 });

        const grad = ctx.createLinearGradient(0, 0, 0, sizeH);
        grad.addColorStop(0, '#0369a1');
        grad.addColorStop(0.5, '#0284c7');
        grad.addColorStop(1, '#075985');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, sizeW, sizeH);

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 4;
        ctx.strokeRect(6, 6, sizeW - 12, sizeH - 12);

        drawHuscShield(ctx, 80, 80, 95);

        ctx.save();
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.font = '900 42px "Inter", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.fillText('KHOA CÔNG NGHỆ THÔNG TIN', 155, 68);

        ctx.font = '800 20px "Inter", sans-serif';
        ctx.fillStyle = '#bae6fd';
        ctx.fillText('FACULTY OF INFORMATION TECHNOLOGY', 155, 108);
        ctx.restore();

        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = maxAniso;
        return tex;
    };

    // 5. Canvas Texture: 2nd Floor Loggia Interior Back Wall (French Doors & HUSC Logo)
    const createLoggiaBackWallTexture = () => {
        const sizeW = 1024;
        const sizeH = 512;
        const { canvas, ctx } = createScaledCanvas(sizeW, sizeH, tier, { mediumScale: 0.5, lowScale: 0.375 });

        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, sizeW, sizeH);

        const doorY = 70;
        const doorH = sizeH - doorY;
        const doorW = 220;
        const doorXs = [60, 320, 580];

        doorXs.forEach((dx) => {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(dx - 8, doorY - 8, doorW + 16, doorH + 8);
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 2;
            ctx.strokeRect(dx - 8, doorY - 8, doorW + 16, doorH + 8);

            const leafW = (doorW - 12) * 0.5;
            for (let leaf = 0; leaf < 2; leaf++) {
                const lx = dx + leaf * (leafW + 12);
                const paneW = (leafW - 16) * 0.5;
                const paneH = (doorH - 40) / 4;
                for (let r = 0; r < 4; r++) {
                    for (let c = 0; c < 2; c++) {
                        const px = lx + 4 + c * (paneW + 6);
                        const py = doorY + 6 + r * (paneH + 6);

                        const gGrad = ctx.createLinearGradient(px, py, px, py + paneH);
                        gGrad.addColorStop(0, '#38bdf8');
                        gGrad.addColorStop(0.3, '#0284c7');
                        gGrad.addColorStop(1, '#0f172a');
                        ctx.fillStyle = gGrad;
                        ctx.fillRect(px, py, paneW, paneH);

                        ctx.strokeStyle = '#ffffff';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(px, py, paneW, paneH);
                    }
                }
            }
        });

        const logoX = 900;
        const logoY = 220;
        drawHuscShield(ctx, logoX, logoY, 130);

        ctx.save();
        ctx.textAlign = 'center';
        ctx.font = '900 36px "Inter", sans-serif';
        ctx.fillStyle = '#0284c7';
        ctx.fillText('HUSC', logoX, logoY + 95);
        ctx.restore();

        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = maxAniso;
        return tex;
    };

    // Shared architectural materials
    const yellowWallMat = new THREE.MeshStandardMaterial({ color: 0xe5a93c, roughness: 0.72, metalness: 0.05 });
    const basePlinthMat = new THREE.MeshStandardMaterial({ color: 0x8b95a2, roughness: 0.85, metalness: 0.10 });
    const whiteTrimMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.45, metalness: 0.05 });
    const roofTileMat = new THREE.MeshStandardMaterial({ color: 0x992419, roughness: 0.65, metalness: 0.08 });
    const redCarpetMat = new THREE.MeshStandardMaterial({ color: 0xd32f2f, roughness: 0.82, metalness: 0.02 });
    const passageFloorMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.88, metalness: 0.05 });

    // --- Ground Floor (Tầng 1) Structure ---
    // Ground concrete skirting plinths
    const plinthLeft = new THREE.Mesh(new THREE.BoxGeometry(3.85, 0.35, 0.30), basePlinthMat);
    plinthLeft.position.set(-3.35, 0.175, 4.58);
    plinthLeft.receiveShadow = true;
    group.add(plinthLeft);

    const plinthRight = new THREE.Mesh(new THREE.BoxGeometry(3.85, 0.35, 0.30), basePlinthMat);
    plinthRight.position.set(3.35, 0.175, 4.58);
    plinthRight.receiveShadow = true;
    group.add(plinthRight);

    // Left and Right yellow facade walls
    const wallLeft = new THREE.Mesh(new THREE.BoxGeometry(3.80, 3.65, 0.25), yellowWallMat);
    wallLeft.position.set(-3.35, 2.175, 4.55);
    wallLeft.castShadow = true;
    wallLeft.receiveShadow = true;
    group.add(wallLeft);

    const wallRight = new THREE.Mesh(new THREE.BoxGeometry(3.80, 3.65, 0.25), yellowWallMat);
    wallRight.position.set(3.35, 2.175, 4.55);
    wallRight.castShadow = true;
    wallRight.receiveShadow = true;
    group.add(wallRight);

    // Archway lintel wall above portal (y = 3.40 to 4.0)
    const archLintel = new THREE.Mesh(new THREE.BoxGeometry(2.90, 0.60, 0.25), yellowWallMat);
    archLintel.position.set(0, 3.70, 4.55);
    archLintel.castShadow = true;
    archLintel.receiveShadow = true;
    group.add(archLintel);

    // White portal architrave mouldings around the central breezeway opening
    const portalTrimJambL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 3.40, 0.10), whiteTrimMat);
    portalTrimJambL.position.set(-1.45, 1.70, 4.65);
    group.add(portalTrimJambL);

    const portalTrimJambR = new THREE.Mesh(new THREE.BoxGeometry(0.16, 3.40, 0.10), whiteTrimMat);
    portalTrimJambR.position.set(1.45, 1.70, 4.65);
    group.add(portalTrimJambR);

    const portalTrimHead = new THREE.Mesh(new THREE.BoxGeometry(3.06, 0.16, 0.10), whiteTrimMat);
    portalTrimHead.position.set(0, 3.40, 4.65);
    group.add(portalTrimHead);

    // Breezeway passage interior (completely open between front z = +4.55 and rear z = -4.55)
    const passageFloor = new THREE.Mesh(new THREE.BoxGeometry(2.90, 0.04, 9.10), passageFloorMat);
    passageFloor.position.set(0, 0.02, 0);
    passageFloor.receiveShadow = true;
    group.add(passageFloor);

    const passageWallL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.40, 9.10), whiteTrimMat);
    passageWallL.position.set(-1.45, 1.70, 0);
    group.add(passageWallL);

    const passageWallR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.40, 9.10), whiteTrimMat);
    passageWallR.position.set(1.45, 1.70, 0);
    group.add(passageWallR);

    const passageCeiling = new THREE.Mesh(new THREE.BoxGeometry(2.90, 0.10, 9.10), whiteTrimMat);
    passageCeiling.position.set(0, 3.45, 0);
    group.add(passageCeiling);

    // Ceremonial Red Carpet Runner spanning through portal threshold
    const redCarpet = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.015, 4.2), redCarpetMat);
    redCarpet.position.set(0, 0.025, 5.5);
    redCarpet.receiveShadow = true;
    group.add(redCarpet);

    // Overhead illuminated blue sign: "KHOA CÔNG NGHỆ THÔNG TIN" inside portal opening
    const passageSignTex = createPassageItSignTexture();
    const passageSignMat = new THREE.MeshStandardMaterial({
        map: passageSignTex,
        roughness: 0.35,
        metalness: 0.10,
        emissive: new THREE.Color(0x38bdf8),
        emissiveIntensity: 0.85
    });
    const passageSignMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.40, 0.44), passageSignMat);
    passageSignMesh.position.set(0, 3.05, 3.90);
    group.add(passageSignMesh);

    // Left Event Backdrop: "Chào Mừng Ngày Nhà Giáo Việt Nam 20-11"
    const teacherDayTex = createTeacherDayBackdropTexture();
    const teacherDayMat = new THREE.MeshStandardMaterial({ map: teacherDayTex, roughness: 0.55, metalness: 0.02 });
    const teacherDayMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.25, 2.65), teacherDayMat);
    teacherDayMesh.position.set(-3.35, 2.05, 4.69);
    teacherDayMesh.castShadow = true;
    group.add(teacherDayMesh);

    // Right Event Backdrop: "IT GAME JAM with AI"
    const gameJamTex = createGameJamBackdropTexture();
    const gameJamMat = new THREE.MeshStandardMaterial({ map: gameJamTex, roughness: 0.55, metalness: 0.02 });
    const gameJamMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.25, 2.65), gameJamMat);
    gameJamMesh.position.set(3.35, 2.05, 4.69);
    gameJamMesh.castShadow = true;
    group.add(gameJamMesh);

    // Flanking Congratulatory Flower Stands (Kệ hoa chúc mừng)
    const woodLegMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.85 });
    const ribbonSilkMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.60 });
    const flowerBlossomMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.70 });
    const createFlowerStand = (fx, fz) => {
        const standGroup = new THREE.Group();
        standGroup.position.set(fx, 0, fz);

        // Tripod wooden easel legs
        const legGeom = new THREE.CylinderGeometry(0.025, 0.025, 1.8, 6);
        for (let i = 0; i < 3; i++) {
            const leg = new THREE.Mesh(legGeom, woodLegMat);
            const ang = (i * Math.PI * 2) / 3;
            leg.position.set(Math.sin(ang) * 0.22, 0.9, Math.cos(ang) * 0.22);
            leg.rotation.z = Math.sin(ang) * 0.12;
            leg.rotation.x = Math.cos(ang) * 0.12;
            standGroup.add(leg);
        }

        // Tiered celebratory pink silk ribbon drapery
        const drapeMesh = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.75, 10, 1, true), ribbonSilkMat);
        drapeMesh.position.set(0, 1.05, 0);
        standGroup.add(drapeMesh);

        // Vibrant floral bouquet dome
        const bloomDome = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 8), flowerBlossomMat);
        bloomDome.position.set(0, 1.62, 0);
        standGroup.add(bloomDome);

        group.add(standGroup);
    };
    createFlowerStand(-4.95, 4.95);
    createFlowerStand(-1.75, 4.95);

    // Mid-floor dividing beam & corbel mouldings (y = 3.90 to 4.30)
    const midBeam = new THREE.Mesh(new THREE.BoxGeometry(10.60, 0.35, 0.30), whiteTrimMat);
    midBeam.position.set(0, 4.10, 4.68);
    midBeam.castShadow = true;
    midBeam.receiveShadow = true;
    group.add(midBeam);

    // Horizontal "TỌA ĐÀM" banner mounted on the mid-floor beam
    const toaDamTex = createToaDamBannerTexture();
    const toaDamMat = new THREE.MeshStandardMaterial({ map: toaDamTex, roughness: 0.50, metalness: 0.05 });
    const toaDamMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.85, 0.52), toaDamMat);
    toaDamMesh.position.set(0, 4.18, 4.84);
    group.add(toaDamMesh);

    // --- Second Floor (Tầng 2) Open Loggia ---
    // Floor slab of loggia (depth 4.55m from back z = 0 to front z = 4.55)
    const loggiaFloor = new THREE.Mesh(new THREE.BoxGeometry(10.40, 0.20, 4.55), basePlinthMat);
    loggiaFloor.position.set(0, 4.15, 2.28);
    loggiaFloor.receiveShadow = true;
    group.add(loggiaFloor);

    // Ceiling slab of loggia
    const loggiaCeiling = new THREE.Mesh(new THREE.BoxGeometry(10.40, 0.20, 4.55), whiteTrimMat);
    loggiaCeiling.position.set(0, 7.75, 2.28);
    group.add(loggiaCeiling);

    // Left and Right interior white loggia sidewalls
    const loggiaSideL = new THREE.Mesh(new THREE.BoxGeometry(0.15, 3.40, 4.55), whiteTrimMat);
    loggiaSideL.position.set(-5.20, 5.95, 2.28);
    group.add(loggiaSideL);

    const loggiaSideR = new THREE.Mesh(new THREE.BoxGeometry(0.15, 3.40, 4.55), whiteTrimMat);
    loggiaSideR.position.set(5.20, 5.95, 2.28);
    group.add(loggiaSideR);

    // Interior back wall with French doors & HUSC logo (Photo 2)
    const loggiaBackTex = createLoggiaBackWallTexture();
    const loggiaBackMat = new THREE.MeshStandardMaterial({ map: loggiaBackTex, roughness: 0.50, metalness: 0.05 });
    const loggiaBackMesh = new THREE.Mesh(new THREE.PlaneGeometry(10.40, 3.40), loggiaBackMat);
    loggiaBackMesh.position.set(0, 5.95, 0.02);
    group.add(loggiaBackMesh);

    // Front Masonry Balustrade / Lan can ban công (y = 4.15 to 5.10, height 0.95m)
    const balustradeMesh = new THREE.Mesh(new THREE.BoxGeometry(10.50, 0.95, 0.22), whiteTrimMat);
    balustradeMesh.position.set(0, 4.625, 4.50);
    balustradeMesh.castShadow = true;
    balustradeMesh.receiveShadow = true;
    group.add(balustradeMesh);

    const balustradeRail = new THREE.Mesh(new THREE.BoxGeometry(10.60, 0.08, 0.28), whiteTrimMat);
    balustradeRail.position.set(0, 5.10, 4.50);
    group.add(balustradeRail);

    // 4 Classical White Columns (hàng 4 cột trụ trắng tạo 3 nhịp mở rộng)
    const colXs = [-4.90, -1.60, 1.60, 4.90];
    const colGeom = new THREE.CylinderGeometry(0.16, 0.17, 2.65, 12);
    const colCapitalGeom = new THREE.BoxGeometry(0.40, 0.12, 0.40);
    for (const cx of colXs) {
        const colMesh = new THREE.Mesh(colGeom, whiteTrimMat);
        colMesh.position.set(cx, 6.425, 4.50);
        colMesh.castShadow = true;
        group.add(colMesh);

        // Classical capital and base
        const capital = new THREE.Mesh(colCapitalGeom, whiteTrimMat);
        capital.position.set(cx, 7.69, 4.50);
        group.add(capital);

        const base = new THREE.Mesh(colCapitalGeom, whiteTrimMat);
        base.position.set(cx, 5.16, 4.50);
        group.add(base);
    }

    // Potted Ornamental Foliage on Balcony
    const potMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.85 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.65 });
    const createBalconyPlant = (px, pz) => {
        const plantGroup = new THREE.Group();
        plantGroup.position.set(px, 5.14, pz);

        const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.12, 0.35, 10), potMat);
        pot.position.set(0, 0.175, 0);
        plantGroup.add(pot);

        const foliage = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), leafMat);
        foliage.position.set(0, 0.45, 0);
        plantGroup.add(foliage);

        group.add(plantGroup);
    };
    createBalconyPlant(-4.20, 4.40);
    createBalconyPlant(-3.60, 4.40);

    // --- Upper Entablature, Cornice & Roof ---
    // Upper concrete beam running above the 4 columns
    const topBeam = new THREE.Mesh(new THREE.BoxGeometry(10.70, 0.40, 0.35), whiteTrimMat);
    topBeam.position.set(0, 7.95, 4.55);
    topBeam.castShadow = true;
    group.add(topBeam);

    // Weathered parapet ledge
    const parapet = new THREE.Mesh(new THREE.BoxGeometry(10.60, 0.35, 0.25), whiteTrimMat);
    parapet.position.set(0, 8.325, 4.50);
    group.add(parapet);

    // Terracotta hipped roof connecting seamlessly with Nha A and Nha A1-A2
    const roofGeom = new THREE.ConeGeometry(7.4, 1.45, 4);
    roofGeom.rotateY(Math.PI * 0.25);
    roofGeom.scale(1.42, 1.0, 0.98);
    const roofMesh = new THREE.Mesh(roofGeom, roofTileMat);
    roofMesh.position.set(0, 9.15, 0);
    roofMesh.castShadow = true;
    roofMesh.receiveShadow = true;
    group.add(roofMesh);

    // --- Rear Facade (Facing Inner Courtyard - Nha E/H side) ---
    // Yellow plaster walls flanking the rear breezeway portal
    const rearWallL = new THREE.Mesh(new THREE.BoxGeometry(3.80, 7.80, 0.25), yellowWallMat);
    rearWallL.position.set(-3.35, 3.90, -4.55);
    rearWallL.castShadow = true;
    group.add(rearWallL);

    const rearWallR = new THREE.Mesh(new THREE.BoxGeometry(3.80, 7.80, 0.25), yellowWallMat);
    rearWallR.position.set(3.35, 3.90, -4.55);
    rearWallR.castShadow = true;
    group.add(rearWallR);

    const rearArchLintel = new THREE.Mesh(new THREE.BoxGeometry(2.90, 4.40, 0.25), yellowWallMat);
    rearArchLintel.position.set(0, 5.60, -4.55);
    group.add(rearArchLintel);

    const rearPortalTrimL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 3.40, 0.10), whiteTrimMat);
    rearPortalTrimL.position.set(-1.45, 1.70, -4.65);
    group.add(rearPortalTrimL);

    const rearPortalTrimR = new THREE.Mesh(new THREE.BoxGeometry(0.16, 3.40, 0.10), whiteTrimMat);
    rearPortalTrimR.position.set(1.45, 1.70, -4.65);
    group.add(rearPortalTrimR);

    const rearPortalTrimHead = new THREE.Mesh(new THREE.BoxGeometry(3.06, 0.16, 0.10), whiteTrimMat);
    rearPortalTrimHead.position.set(0, 3.40, -4.65);
    group.add(rearPortalTrimHead);

    // Position entire Nha A connector building assembly onto exact campus coordinates
    group.position.set(15.6, 0, 10.0);
    scene.add(group);
    batchStaticGroupByMaterial(group);
    freezeStaticHierarchy(group);
}


// Add signature signage, Main Gate inscription, Dong Da Gate sign, Nha A marquee, garage roofs, and billowing flags
function createCampusSignageAndFlags(scene, hardwareProfile = { tier: 'high', maxAnisotropy: 4 }) {
    const signStartIdx = scene.children.length;
    const animatedFlags = [];
    const maxAniso = hardwareProfile.maxAnisotropy || 4;
    const isLowTier = hardwareProfile.tier === 'low';

    const addBillboard = (tex, w, h, x, y, z, rotY = 0, rotX = 0, isTwoWay = false) => {
        const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.FrontSide });
        const geom = new THREE.PlaneGeometry(w, h);
        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(x, y, z);
        mesh.rotation.order = 'YXZ';
        mesh.rotation.y = rotY;
        mesh.rotation.x = rotX;
        scene.add(mesh);

        if (isTwoWay) {
            const backMesh = new THREE.Mesh(geom, mat);
            backMesh.position.set(x, y, z);
            backMesh.rotation.order = 'YXZ';
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

    // Authentic 4-sided Building D modern facade and entrance canopies matching Photo 1
    createNhaDModernBuilding(scene, maxAniso, hardwareProfile.tier || 'high');

    // Authentic Nha A - Nha A1/A2 connecting building with breezeway and 2nd-floor open loggia (Photo 2)
    createNhaAConnectorBuilding(scene, maxAniso, hardwareProfile.tier || 'high');

    const myThuatTex = createSignTexture(['PHÒNG HỌC MỸ THUẬT'], {
        w: 640, h: 112, bg: '#1f2937', border: '#facc15', color: '#fde047', fontSizes: [42], maxAnisotropy: maxAniso
    });
    addBillboard(myThuatTex, 7.6, 0.85, 4.0, 7.6, -36.3, 0);

    // 5. Garage roof decals: NHÀ ĐỂ XE GIÁO VIÊN (Red roofs) & NHÀ ĐỂ XE SINH VIÊN (Blue roof)
    const garageGiaoVienTex = createSignTexture(['NHÀ ĐỂ XE GIÁO VIÊN'], {
        w: 1024, h: 160, bg: 'transparent', color: '#ffffff', fontSizes: [68], maxAnisotropy: maxAniso
    });
    const garageSinhVienTex = createSignTexture(['NHÀ ĐỂ XE SINH VIÊN'], {
        w: 1024, h: 160, bg: 'transparent', color: '#ffffff', fontSizes: [68], maxAnisotropy: maxAniso
    });
    addBillboard(garageGiaoVienTex, 16.0, 2.5, -64.0, 4.7, 67.5, 0, -Math.PI * 0.48);
    addBillboard(garageGiaoVienTex, 16.0, 2.5, 34.0, 4.7, 67.5, 0, -Math.PI * 0.48);
    addBillboard(garageSinhVienTex, 14.5, 2.26, -28.93, 4.75, -61.21, 0.4461, -Math.PI * 0.48);

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
        if (loc.id === 'cong-chinh' || loc.id === 'san-bong-ro') continue;
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

    const dynamicSignageSet = new Set(animatedFlags);
    dynamicSignageSet.add(solidFlagInst);
    for (let i = signStartIdx; i < scene.children.length; i++) {
        freezeStaticHierarchy(scene.children[i], dynamicSignageSet);
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
    const tier = hardwareProfile.tier || 'high';
    const maxAniso = hardwareProfile.maxAnisotropy || 4;
    const ensembleGroup = new THREE.Group();

    // 1. GOLDLAND PLAZA COMPLEX (Photos 1, 3, 4)
    // Procedural PBR texture for Goldland Plaza: white structural colonnade + rich golden honeycomb lattice
    const { canvas: glCanvas, ctx: glCtx } = createScaledCanvas(1024, 512, tier, { mediumScale: 0.5, lowScale: 0.375 });

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

    // 3D White Colonnade exterior pillars batched into 1 InstancedMesh
    const colGeom = new THREE.BoxGeometry(0.85, glH, 0.85);
    const glColInst = new THREE.InstancedMesh(colGeom, whiteTrimMat, numBays + 1);
    glColInst.castShadow = true;
    const glTmp = new THREE.Object3D();
    for (let c = 0; c <= numBays; c++) {
        const cz = -glW * 0.5 + c * (glW / numBays);
        glTmp.position.set(glD * 0.5 + 0.42, glH * 0.5, cz);
        glTmp.rotation.set(0, 0, 0);
        glTmp.scale.setScalar(1);
        glTmp.updateMatrix();
        glColInst.setMatrixAt(c, glTmp.matrix);
    }
    glColInst.instanceMatrix.needsUpdate = true;
    glGroup.add(glColInst);

    // Ground floor cantilevered canopy projecting towards street
    const glCanopyGeom = new THREE.BoxGeometry(3.5, 0.26, glW + 1.2);
    const glCanopyMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.35, metalness: 0.65 });
    const glCanopyMesh = new THREE.Mesh(glCanopyGeom, glCanopyMat);
    glCanopyMesh.position.set(glD * 0.5 + 1.75, 4.2, 0);
    glGroup.add(glCanopyMesh);

    // 6 Outdoor cafe umbrellas (Highlands Coffee) batched into 3 InstancedMeshes instead of 36 meshes
    const umbrellaMat = new THREE.MeshStandardMaterial({ color: 0x582f1e, roughness: 0.72 });
    const darkPoleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.4, roughness: 0.5 });
    const umbrellaCanopyGeom = new THREE.ConeGeometry(1.65, 0.48, 8);
    const tableGeom = new THREE.CylinderGeometry(0.48, 0.48, 0.045, 12);

    // Merge umbrella center pole and 3 surrounding stools into 1 local cluster geometry per table
    const darkClusterParts = [];
    const polePart = new THREE.CylinderGeometry(0.038, 0.038, 2.5, 8);
    polePart.translate(0, 1.25, 0);
    darkClusterParts.push(polePart);
    for (let s = 0; s < 3; s++) {
        const sang = (s / 3) * Math.PI * 2;
        const stoolPart = new THREE.CylinderGeometry(0.18, 0.18, 0.42, 8);
        stoolPart.translate(Math.cos(sang) * 0.65, 0.21, Math.sin(sang) * 0.65);
        darkClusterParts.push(stoolPart);
    }
    const darkClusterGeom = mergeGeometries(darkClusterParts, false);
    darkClusterParts.forEach((p) => p.dispose());

    const umbrellaSpots = [
        [glD * 0.5 + 3.2, -12.0], [glD * 0.5 + 3.2, -4.0], [glD * 0.5 + 3.2, 4.0], [glD * 0.5 + 3.2, 12.0],
        [glD * 0.5 + 6.4, -8.0], [glD * 0.5 + 6.4, 8.0]
    ];

    const uDarkInst = new THREE.InstancedMesh(darkClusterGeom, darkPoleMat, umbrellaSpots.length);
    const uCanopyInst = new THREE.InstancedMesh(umbrellaCanopyGeom, umbrellaMat, umbrellaSpots.length);
    const uTableInst = new THREE.InstancedMesh(tableGeom, tableMat, umbrellaSpots.length);
    uCanopyInst.castShadow = true;

    umbrellaSpots.forEach(([ux, uz], idx) => {
        glTmp.rotation.set(0, 0, 0);
        glTmp.scale.setScalar(1);

        glTmp.position.set(ux, 0, uz);
        glTmp.updateMatrix();
        uDarkInst.setMatrixAt(idx, glTmp.matrix);

        glTmp.position.set(ux, 2.35, uz);
        glTmp.updateMatrix();
        uCanopyInst.setMatrixAt(idx, glTmp.matrix);

        glTmp.position.set(ux, 0.72, uz);
        glTmp.updateMatrix();
        uTableInst.setMatrixAt(idx, glTmp.matrix);
    });
    uDarkInst.instanceMatrix.needsUpdate = true;
    uCanopyInst.instanceMatrix.needsUpdate = true;
    uTableInst.instanceMatrix.needsUpdate = true;
    glGroup.add(uDarkInst, uCanopyInst, uTableInst);

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
    const { canvas: cgCanvas, ctx: cgCtx } = createScaledCanvas(1024, 512, tier, { mediumScale: 0.5, lowScale: 0.375 });

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
    ledCtx.font = '800 24px "Inter", "Segoe UI", sans-serif';
    ledCtx.shadowColor = '#eab308';
    ledCtx.shadowBlur = 10;
    ledCtx.fillText('WELCOME TO HUE FESTIVAL', 256, 138);

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
    const { canvas: vpCanvas, ctx: vpCtx } = createScaledCanvas(512, 1024, tier, { mediumScale: 0.5, lowScale: 0.5 });

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

    const shrubLeafTex = getSharedLeafClusterTexture(tier === 'low' ? 256 : 512, maxAniso);
    const shrubCardTier = tier === 'low' ? 'low' : (tier === 'medium' ? 'medium' : 'high');
    const shrubLeafGeom = createDenseShrubCardClusterGeometry(shrubCardTier, 0.88);

    // Identical leaf material to campus trees with alphaTest cutout but without wind vertex displacement
    const shrubLeafMat = new THREE.MeshStandardMaterial({
        map: shrubLeafTex,
        alphaTest: 0.42,
        side: THREE.DoubleSide,
        roughness: 0.68,
        metalness: 0.02
    });

    const shrubStemMat = new THREE.MeshStandardMaterial({
        color: 0x5d4129,
        roughness: 0.92,
        metalness: 0.02
    });
    const shrubStemGeom = new THREE.CylinderGeometry(0.06, 0.10, 0.24, 6);
    shrubStemGeom.translate(0, 0.12, 0);

    // Build authentic raised median island spanning the entire length of Dong Da (from u = -82.0 to u = 176.0)
    // Segment 1: from intersection crosswalk (u = -82.0) to Gate 38 opening (u = 38.0), length = 120.0m
    // Segment 2: from Gate 38 opening (u = 52.0) to road terminus (u = 176.0), length = 124.0m
    const medianSegments = [
        { uStart: -82.0, uEnd: 38.0 },
        { uStart: 52.0, uEnd: 176.0 }
    ];

    // Collect world matrices for all median shrubs across both segments to render in 2 InstancedMeshes
    const shrubMatrices = [];
    const medParentObj = new THREE.Object3D();
    const medChildObj = new THREE.Object3D();

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

        segGroup.position.set(cx, 0, cz);
        segGroup.rotation.y = ddRotY;
        medianIslandGroup.add(segGroup);

        medParentObj.position.set(cx, 0, cz);
        medParentObj.rotation.set(0, ddRotY, 0);
        medParentObj.scale.setScalar(1);
        medParentObj.updateMatrix();

        // Record instanced matrices for sculpted botanical shrubs spaced every 7.5m along median island
        for (let sx = -segLen * 0.46; sx <= segLen * 0.46; sx += 7.5) {
            const sIdx = Math.floor((sx + 200) * 1.7);
            const rotY = (sIdx * 1.37) % (Math.PI * 2);
            const scaleY = 0.95 + ((sIdx * 31) % 15) * 0.01;
            const scaleXZ = 0.96 + ((sIdx * 47) % 12) * 0.01;
            medChildObj.position.set(sx, medH, 0);
            medChildObj.rotation.set(0, rotY, 0);
            medChildObj.scale.set(scaleXZ, scaleY, scaleXZ);
            medChildObj.updateMatrix();
            shrubMatrices.push(new THREE.Matrix4().multiplyMatrices(medParentObj.matrix, medChildObj.matrix));
        }
    });

    if (shrubMatrices.length > 0) {
        const shrubStemInst = new THREE.InstancedMesh(shrubStemGeom, shrubStemMat, shrubMatrices.length);
        const shrubLeafInst = new THREE.InstancedMesh(shrubLeafGeom, shrubLeafMat, shrubMatrices.length);
        shrubStemInst.castShadow = true;
        shrubStemInst.receiveShadow = true;
        // Skip alpha-discard shadow pass on 1,536 low median leaf cards; stem shadow grounds shrubs cleanly
        shrubLeafInst.castShadow = false;
        shrubLeafInst.receiveShadow = true;
        shrubMatrices.forEach((mat, idx) => {
            shrubStemInst.setMatrixAt(idx, mat);
            shrubLeafInst.setMatrixAt(idx, mat);
        });
        shrubStemInst.instanceMatrix.needsUpdate = true;
        shrubLeafInst.instanceMatrix.needsUpdate = true;
        medianIslandGroup.add(shrubStemInst, shrubLeafInst);
    }

    // Streetlamp poles with double luminaire arms and festive banners batched into 4 InstancedMeshes
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.75, roughness: 0.35 });
    const lumMat = new THREE.MeshBasicMaterial({ color: 0xfef9c3 });
    const poleH = 9.5;

    // Merge vertical pole and both outreach arms into 1 reusable geometry
    const poleBodyPart = new THREE.CylinderGeometry(0.08, 0.16, poleH, 8);
    poleBodyPart.translate(0, poleH * 0.5, 0);
    const armPart1 = new THREE.CylinderGeometry(0.035, 0.035, 2.2, 8);
    armPart1.rotateZ(Math.PI * 0.35);
    armPart1.rotateY(Math.PI * 0.5);
    armPart1.translate(0, poleH - 0.3, -1.0);
    const armPart2 = new THREE.CylinderGeometry(0.035, 0.035, 2.2, 8);
    armPart2.rotateZ(Math.PI * 0.35);
    armPart2.rotateY(-Math.PI * 0.5);
    armPart2.translate(0, poleH - 0.3, 1.0);
    const poleAssemblyGeom = mergeGeometries([poleBodyPart, armPart1, armPart2], false);
    poleBodyPart.dispose();
    armPart1.dispose();
    armPart2.dispose();

    // Merge twin luminaire boxes into 1 reusable geometry
    const lumPart1 = new THREE.BoxGeometry(0.65, 0.12, 0.28);
    lumPart1.translate(0, poleH - 0.55, -1.95);
    const lumPart2 = new THREE.BoxGeometry(0.65, 0.12, 0.28);
    lumPart2.translate(0, poleH - 0.55, 1.95);
    const lumPairGeom = mergeGeometries([lumPart1, lumPart2], false);
    lumPart1.dispose();
    lumPart2.dispose();

    // Merge twin downward volumetric white light cones for night streetlamp illumination
    streetlampDownlights.length = 0;
    const beamPart1 = new THREE.CylinderGeometry(0.30, 2.40, 8.925, 24, 1, true);
    beamPart1.translate(0, 4.4875, -1.95);
    const beamPart2 = new THREE.CylinderGeometry(0.30, 2.40, 8.925, 24, 1, true);
    beamPart2.translate(0, 4.4875, 1.95);
    const streetlampBeamPairGeom = mergeGeometries([beamPart1, beamPart2], false);
    beamPart1.dispose();
    beamPart2.dispose();

    streetlampBeamMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.24,
        side: THREE.DoubleSide,
        depthWrite: false
    });
    streetlampLumMat = lumMat;

    // Dual-sided Red Festive Propaganda Banners for all median lamp posts (Photos 1, 2)
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
    const cx = 128, cy = 95, rOut = 38, rIn = 17;
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
    banCtx.fillStyle = '#fef08a';
    banCtx.font = '900 28px "Inter", "Segoe UI", sans-serif';
    banCtx.fillText('CHÚC MỪNG', 128, 195);
    banCtx.fillText('NĂM MỚI', 128, 245);
    banCtx.font = '700 24px "Inter", "Segoe UI", sans-serif';
    banCtx.fillText('MỪNG ĐẢNG', 128, 360);
    banCtx.fillText('MỪNG XUÂN', 128, 410);

    const banTex = new THREE.CanvasTexture(banCanvas);
    banTex.colorSpace = THREE.SRGBColorSpace;
    banTex.anisotropy = Math.min(8, maxAniso);
    const bannerMat = new THREE.MeshStandardMaterial({
        map: banTex,
        roughness: 0.45,
        metalness: 0.1
    });

    // Merge all 4 non-flipped festive banner faces per pole into 1 geometry
    const banW = 1.15;
    const banH = 2.6;
    const bannerParts = [];
    for (const zPos of [-0.68, 0.68]) {
        const f1 = new THREE.PlaneGeometry(banW, banH);
        f1.rotateY(-Math.PI * 0.5);
        f1.translate(-0.005, 5.0, zPos);
        bannerParts.push(f1);

        const f2 = new THREE.PlaneGeometry(banW, banH);
        f2.rotateY(Math.PI * 0.5);
        f2.translate(0.005, 5.0, zPos);
        bannerParts.push(f2);
    }
    const bannerPairGeom = mergeGeometries(bannerParts, false);
    bannerParts.forEach((p) => p.dispose());

    const lampPositionsU = [-70.0, -22.0, 26.0, 80.0, 135.0, 170.0];
    const lampPoleInst = new THREE.InstancedMesh(poleAssemblyGeom, poleMat, lampPositionsU.length);
    const lampLumInst = new THREE.InstancedMesh(lumPairGeom, lumMat, lampPositionsU.length);
    const lampBannerInst = new THREE.InstancedMesh(bannerPairGeom, bannerMat, lampPositionsU.length);
    const lampBeamInst = new THREE.InstancedMesh(streetlampBeamPairGeom, streetlampBeamMat, lampPositionsU.length);
    lampBeamInst.visible = false;
    streetlampDownlights.push(lampBeamInst);

    lampPositionsU.forEach((uPos, idx) => {
        const lx = ddDef.cx + uPos * ddUx;
        const lz = ddDef.cz + uPos * ddUz;
        medParentObj.position.set(lx, 0, lz);
        medParentObj.rotation.set(0, ddRotY, 0);
        medParentObj.scale.setScalar(1);
        medParentObj.updateMatrix();
        lampPoleInst.setMatrixAt(idx, medParentObj.matrix);
        lampLumInst.setMatrixAt(idx, medParentObj.matrix);
        lampBannerInst.setMatrixAt(idx, medParentObj.matrix);
        lampBeamInst.setMatrixAt(idx, medParentObj.matrix);
    });
    lampPoleInst.instanceMatrix.needsUpdate = true;
    lampLumInst.instanceMatrix.needsUpdate = true;
    lampBannerInst.instanceMatrix.needsUpdate = true;
    lampBeamInst.instanceMatrix.needsUpdate = true;
    medianIslandGroup.add(lampPoleInst, lampLumInst, lampBannerInst, lampBeamInst);

    ensembleGroup.add(medianIslandGroup);

    // 6. Techcombank Hue Branch building at 24 Ly Thuong Kiet street corner (Photos 1, 2, 3)
    const tcbGroup = new THREE.Group();
    const tcbLen = 15.0;
    const tcbDepth = 16.0;
    const tcbPodiumH = 14.5;
    const tcbTowerH = 19.5;
    const tcbRadius = 3.8;

    // Procedural PBR texture for Techcombank podium and tower facade
    const { canvas: tcbCanvas, ctx: tcbCtx } = createScaledCanvas(1024, 1024, tier, { mediumScale: 0.5, lowScale: 0.375 });

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

    // Slender support columns for circular pergola batched into 1 InstancedMesh
    const ringColGeom = new THREE.CylinderGeometry(0.10, 0.10, 3.0, 8);
    const ringColInst = new THREE.InstancedMesh(ringColGeom, whiteTrimMat, 8);
    const tcbColTmp = new THREE.Object3D();
    for (let rc = 0; rc < 8; rc++) {
        const rAng = (rc / 8) * Math.PI * 2;
        tcbColTmp.position.set(
            tcbCornerX + Math.cos(rAng) * (ringRadius - 0.4),
            tcbPodiumH + 1.5,
            tcbCornerZ + Math.sin(rAng) * (ringRadius - 0.4)
        );
        tcbColTmp.rotation.set(0, 0, 0);
        tcbColTmp.scale.setScalar(1);
        tcbColTmp.updateMatrix();
        ringColInst.setMatrixAt(rc, tcbColTmp.matrix);
    }
    ringColInst.instanceMatrix.needsUpdate = true;
    tcbGroup.add(ringColInst);

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
    const { canvas: tcbSignCanvas, ctx: tcbSignCtx } = createScaledCanvas(1024, 256, tier, { mediumScale: 0.5, lowScale: 0.5 });

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
    tcbGroup.position.set(-139.18, 0, -0.61);
    tcbGroup.rotation.y = 1.6106;
    ensembleGroup.add(tcbGroup);

    // 8. DongA Bank Hue Branch building at 26 Ly Thuong Kiet street (Photos 1, 3)
    const daGroup = new THREE.Group();
    const daLen = 18.0;
    const daDepth = 18.0;
    const daH = 26.0;

    // Procedural PBR texture for DongA Bank teal / sea-green facade
    const { canvas: daCanvas, ctx: daCtx } = createScaledCanvas(512, 1024, tier, { mediumScale: 0.5, lowScale: 0.5 });

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
    const { canvas: daSignCanvas, ctx: daSignCtx } = createScaledCanvas(768, 192, tier, { mediumScale: 0.5, lowScale: 0.5 });

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
    daGroup.position.set(-139.42, 0, 18.41);
    daGroup.rotation.y = 1.6106;
    ensembleGroup.add(daGroup);

    // 9. Contemporary Commercial Office Tower at 28 Ly Thuong Kiet street (Photos 1, 3)
    const ofGroup = new THREE.Group();
    const ofLen = 24.0;
    const ofDepth = 18.0;
    const ofH = 29.0;

    // Procedural PBR texture for clean white modern commercial office building
    const { canvas: ofCanvas, ctx: ofCtx } = createScaledCanvas(1024, 1024, tier, { mediumScale: 0.5, lowScale: 0.375 });

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
    ofGroup.position.set(-138.57, 0, 39.90);
    ofGroup.rotation.y = 1.6106;
    ensembleGroup.add(ofGroup);

    // 10. Corner Commercial Building at 30-32 Ly Thuong Kiet street (Photos 1, 3)
    const cbGroup = new THREE.Group();
    const cbLen = 18.0;
    const cbDepth = 18.0;
    const cbH = 22.0;

    const { canvas: cbCanvas, ctx: cbCtx } = createScaledCanvas(1024, 1024, tier, { mediumScale: 0.5, lowScale: 0.375 });

    // Warm contemporary commercial facade with bronze/sandstone tones
    cbCtx.fillStyle = '#f8fafc';
    cbCtx.fillRect(0, 0, 1024, 1024);

    // Ground floor commercial / showroom entrance (y: 820 to 1024)
    cbCtx.fillStyle = '#1e293b';
    cbCtx.fillRect(0, 820, 1024, 204);

    // Warm bronze architectural accents on ground floor
    cbCtx.fillStyle = '#92400e';
    cbCtx.fillRect(0, 820, 1024, 16);

    // Storefront glass display windows
    for (let sb = 0; sb < 5; sb++) {
        const sbx = sb * (1024 / 5);
        cbCtx.fillStyle = '#0f172a';
        cbCtx.fillRect(sbx + 12, 846, 1024 / 5 - 24, 168);
        cbCtx.fillStyle = '#0284c7';
        cbCtx.fillRect(sbx + 16, 850, 1024 / 5 - 32, 160);

        cbCtx.strokeStyle = 'rgba(251, 191, 36, 0.7)';
        cbCtx.lineWidth = 2;
        cbCtx.strokeRect(sbx + 16, 850, 1024 / 5 - 32, 160);
    }

    // Floors 2-5 modern ribbon windows
    const numCbFloors = 5;
    const cbFloorH = 820 / numCbFloors;
    for (let cf = 0; cf < numCbFloors; cf++) {
        const cfy = cf * cbFloorH;

        // Architectural sill trim
        cbCtx.fillStyle = '#e2e8f0';
        cbCtx.fillRect(0, cfy + cbFloorH - 10, 1024, 10);

        for (let w = 0; w < 5; w++) {
            const wx = w * (1024 / 5);
            cbCtx.fillStyle = '#1e293b';
            cbCtx.fillRect(wx + 16, cfy + 18, 1024 / 5 - 32, cbFloorH - 36);

            cbCtx.fillStyle = '#1e3a5f';
            cbCtx.fillRect(wx + 20, cfy + 22, 1024 / 5 - 40, cbFloorH - 44);

            cbCtx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
            cbCtx.lineWidth = 1.5;
            cbCtx.strokeRect(wx + 20, cfy + 22, 1024 / 5 - 40, cbFloorH - 44);
        }
    }

    const cbTex = new THREE.CanvasTexture(cbCanvas);
    cbTex.colorSpace = THREE.SRGBColorSpace;
    cbTex.anisotropy = Math.min(8, maxAniso);

    const cbMat = new THREE.MeshStandardMaterial({
        map: cbTex,
        roughness: 0.36,
        metalness: 0.18
    });

    const cbBodyMesh = new THREE.Mesh(new THREE.BoxGeometry(cbLen, cbH, cbDepth), cbMat);
    cbBodyMesh.position.set(0, cbH * 0.5, 0);
    cbBodyMesh.castShadow = true;
    cbBodyMesh.receiveShadow = true;
    cbGroup.add(cbBodyMesh);

    // Decorative rooftop parapet trim
    const cbParapetMesh = new THREE.Mesh(new THREE.BoxGeometry(cbLen + 0.4, 1.2, cbDepth + 0.4), whiteTrimMat);
    cbParapetMesh.position.set(0, cbH + 0.6, 0);
    cbGroup.add(cbParapetMesh);

    // Position Corner Commercial Building adjacent to Office Tower along Ly Thuong Kiet
    cbGroup.position.set(-137.73, 0, 60.88);
    cbGroup.rotation.y = 1.6106;
    ensembleGroup.add(cbGroup);

    // 11. West sidewalk along Ly Thuong Kiet, mature shade trees with wooden braces, and streetscape props (Photos 1, 3)
    const ltkWestSidewalkGroup = new THREE.Group();

    // Wooden tree brace stakes batched into 1 merged cluster InstancedMesh (36 meshes -> 1 draw call)
    const stakeLen = 1.90;
    const woodBraceMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.82, metalness: 0.05 });

    const treeCoords = [
        [-128.5, -14.0],
        [-127.9, 0.0],
        [-127.4, 14.0],
        [-126.8, 28.0],
        [-126.2, 42.0],
        [-125.8, 54.0]
    ];
    const upVector = new THREE.Vector3(0, 1, 0);
    const rBot = 0.82;
    const rTop = 0.38;
    const yBot = 0.02;
    const yTop = 1.70;

    // Build single merged 4-stake + 2-collar wooden brace geometry
    const braceParts = [];
    const braceTmpObj = new THREE.Object3D();
    for (let s = 0; s < 4; s++) {
        const sang = (s / 4) * Math.PI * 2;
        const dirX = Math.cos(sang);
        const dirZ = Math.sin(sang);

        const botPt = new THREE.Vector3(dirX * rBot, yBot, dirZ * rBot);
        const topPt = new THREE.Vector3(dirX * rTop, yTop, dirZ * rTop);
        const midPt = new THREE.Vector3().addVectors(botPt, topPt).multiplyScalar(0.5);
        const axisDir = new THREE.Vector3().subVectors(topPt, botPt).normalize();

        const stakePart = new THREE.CylinderGeometry(0.038, 0.045, stakeLen, 8);
        braceTmpObj.position.copy(midPt);
        braceTmpObj.quaternion.setFromUnitVectors(upVector, axisDir);
        braceTmpObj.scale.setScalar(1);
        braceTmpObj.updateMatrix();
        stakePart.applyMatrix4(braceTmpObj.matrix);
        braceParts.push(stakePart);
    }
    const collarPart1 = new THREE.BoxGeometry(0.05, 0.08, 0.82);
    collarPart1.translate(0, 1.65, 0);
    braceParts.push(collarPart1);

    const collarPart2 = new THREE.BoxGeometry(0.05, 0.08, 0.82);
    collarPart2.rotateY(Math.PI * 0.5);
    collarPart2.translate(0, 1.65, 0);
    braceParts.push(collarPart2);

    const mergedBraceGeom = mergeGeometries(braceParts, false);
    braceParts.forEach((p) => p.dispose());

    const woodBraceInst = new THREE.InstancedMesh(mergedBraceGeom, woodBraceMat, treeCoords.length);
    woodBraceInst.castShadow = true;
    treeCoords.forEach(([tx, tz], idx) => {
        braceTmpObj.position.set(tx, 0, tz);
        braceTmpObj.rotation.set(0, 0, 0);
        braceTmpObj.scale.setScalar(1);
        braceTmpObj.updateMatrix();
        woodBraceInst.setMatrixAt(idx, braceTmpObj.matrix);
    });
    woodBraceInst.instanceMatrix.needsUpdate = true;
    ltkWestSidewalkGroup.add(woodBraceInst);

    // Authentic Vietnamese polished granito stone benches (ghe da cong vien / ghe da hoa cuong) on sidewalk
    const createGranitoTexture = (aniso = 4) => {
        const { canvas, ctx } = createScaledCanvas(512, 512, tier, { mediumScale: 0.5, lowScale: 0.5 });

        // Base polished terrazzo tone (bright pale gray-stone)
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(0, 0, 512, 512);

        // Subtle cloudy stone grain
        const cloudCount = tier === 'low' ? 6 : 12;
        for (let c = 0; c < cloudCount; c++) {
            const cx = Math.random() * 512;
            const cy = Math.random() * 512;
            const cr = 45 + Math.random() * 75;
            const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr);
            grad.addColorStop(0, 'rgba(226, 232, 240, 0.65)');
            grad.addColorStop(1, 'rgba(241, 245, 249, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(cx - cr, cy - cr, cr * 2, cr * 2);
        }

        // High-density granite mineral chips rendered via fast angular fillRect chips
        const chipCount = tier === 'low' ? 500 : (tier === 'medium' ? 900 : 1600);
        for (let i = 0; i < chipCount; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const d = 1.6 + Math.random() * 3.8;
            const rnd = Math.random();
            if (rnd < 0.35) {
                ctx.fillStyle = '#475569';
            } else if (rnd < 0.65) {
                ctx.fillStyle = '#94a3b8';
            } else if (rnd < 0.85) {
                ctx.fillStyle = '#ffffff';
            } else {
                ctx.fillStyle = '#1e293b';
            }
            ctx.fillRect(x, y, d, d);
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(1.5, 1.5);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = Math.min(8, aniso);
        return tex;
    };

    const benchStoneTex = createGranitoTexture(maxAniso);
    const benchStoneMat = new THREE.MeshStandardMaterial({
        map: benchStoneTex,
        roughness: 0.44,
        metalness: 0.06
    });

    const createVietnameseStoneBenchGeometry = () => {
        const parts = [];

        // 1. Seat slab (Mat ghe da mai hoa cuong)
        const seatW = 1.30;
        const seatD = 0.44;
        const seatH = 0.05;
        const seatGeom = new THREE.BoxGeometry(seatD, seatH, seatW);
        seatGeom.translate(0, 0.425, 0);
        parts.push(seatGeom);

        // Front rounded nose trim for seat
        const noseGeom = new THREE.CylinderGeometry(0.025, 0.025, seatW, 12, 1, false, -Math.PI * 0.5, Math.PI);
        noseGeom.rotateX(Math.PI * 0.5);
        noseGeom.translate(seatD * 0.5, 0.425, 0);
        parts.push(noseGeom);

        // 2. Backrest slab (Tua lung ghe da)
        const backW = 1.30;
        const backH = 0.32;
        const backThick = 0.045;
        const backGeom = new THREE.BoxGeometry(backThick, backH, backW);
        backGeom.rotateZ(0.08);
        backGeom.translate(-0.19, 0.59, 0);
        parts.push(backGeom);

        // Top rounded lip for backrest
        const topBackGeom = new THREE.CylinderGeometry(backThick * 0.5, backThick * 0.5, backW, 12);
        topBackGeom.rotateX(Math.PI * 0.5);
        topBackGeom.translate(-0.19 - Math.sin(0.08) * (backH * 0.5), 0.59 + Math.cos(0.08) * (backH * 0.5), 0);
        parts.push(topBackGeom);

        // 3. Two sculpted stone support legs (Chan ghe da mai)
        const legZOffsets = [-0.44, 0.44];
        legZOffsets.forEach((lz) => {
            // Ground foot pad on sidewalk
            const footGeom = new THREE.BoxGeometry(0.40, 0.07, 0.09);
            footGeom.translate(0, 0.035, lz);
            parts.push(footGeom);

            // Vertical central leg post
            const postGeom = new THREE.BoxGeometry(0.22, 0.33, 0.09);
            postGeom.translate(-0.02, 0.235, lz);
            parts.push(postGeom);

            // Rear support brace for backrest
            const braceGeom = new THREE.BoxGeometry(0.08, 0.26, 0.09);
            braceGeom.rotateZ(0.08);
            braceGeom.translate(-0.18, 0.52, lz);
            parts.push(braceGeom);

            // Armrest top bar
            const armOffsetZ = lz > 0 ? lz + 0.16 : lz - 0.16;
            const armBarGeom = new THREE.BoxGeometry(0.28, 0.04, 0.06);
            armBarGeom.translate(0, 0.54, armOffsetZ);
            parts.push(armBarGeom);

            // Armrest front vertical support post
            const armPostGeom = new THREE.BoxGeometry(0.05, 0.14, 0.06);
            armPostGeom.translate(0.11, 0.47, armOffsetZ);
            parts.push(armPostGeom);
        });

        const mergedBench = mergeGeometries(parts, false);
        parts.forEach((p) => p.dispose());
        return mergedBench;
    };

    const stoneBenchGeom = createVietnameseStoneBenchGeometry();
    const benchRotY = 0.0398; // Oriented facing street outwards across sidewalk

    // Replacing former colored rectangular boxes with authentic Vietnamese stone benches batched into 1 InstancedMesh
    const benchCoords = [
        // Spot 1: Sidewalk in front of Techcombank building (replaces 3 colored blocks)
        [-130.56, -10.2],
        [-130.49, -8.5],
        [-130.42, -6.8],
        // Spot 2: Shaded sidewalk near tree between buildings (replaces 3 colored blocks)
        [-129.86, 7.3],
        [-129.79, 9.0],
        [-129.72, 10.7],
        // Spot 3: Sidewalk in front of DongA Bank / commercial tower (replaces 2 colored blocks)
        [-129.36, 19.8],
        [-129.29, 21.6],
        // Additional matching stone benches along Ly Thuong Kiet sidewalk under shade trees
        [-128.76, 35.0],
        [-128.24, 48.0]
    ];

    const sidewalkBenchInst = new THREE.InstancedMesh(stoneBenchGeom, benchStoneMat, benchCoords.length);
    sidewalkBenchInst.castShadow = true;
    sidewalkBenchInst.receiveShadow = true;
    benchCoords.forEach(([bx, bz], idx) => {
        braceTmpObj.position.set(bx, 0, bz);
        braceTmpObj.rotation.set(0, benchRotY, 0);
        braceTmpObj.scale.setScalar(1);
        braceTmpObj.updateMatrix();
        sidewalkBenchInst.setMatrixAt(idx, braceTmpObj.matrix);
    });
    sidewalkBenchInst.instanceMatrix.needsUpdate = true;
    ltkWestSidewalkGroup.add(sidewalkBenchInst);

    ensembleGroup.add(ltkWestSidewalkGroup);

    scene.add(ensembleGroup);
    batchStaticGroupByMaterial(ensembleGroup);
    freezeStaticHierarchy(ensembleGroup);
}

// Create sky dome shader, street lamp posts, and environmental backdrop
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
    freezeStaticHierarchy(skyDome);

    // Authentic detailed urban ensemble opposite Ly Thuong Kiet x Dong Da intersection (Photos 1-5)
    createLyThuongKietOppositeUrbanEnsemble(scene, hardwareProfile);

    // Street Lamp Posts flanking Main Plaza and Central Inner Courtyard Avenue
    const dummy = new THREE.Object3D();
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
    freezeStaticHierarchy(postInst);
    freezeStaticHierarchy(headInst);
    freezeStaticHierarchy(haloInst);

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
    freezeStaticHierarchy(starPoints);

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

    return { skyUniforms, lampHeadMat, lampHaloMat, haloInst, setNightSkyActive, updateNightSky };
}


// Initialize lighting, sky, gardens, signage, animated foliage, and adaptive hardware quality presets
export function setupCampusEnvironment(scene, renderer, hardwareProfile = { tier: 'high', maxAnisotropy: 4, isSoftware: false }) {
    const initialTier = hardwareProfile.tier || 'high';
    const isSoftware = Boolean(hardwareProfile.isSoftware);

    // Cap initial pixel ratio to prevent GPU fillrate overload on Retina desktop and 3x mobile displays
    const initDpr = Math.min(window.devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(
        initialTier === 'low'
            ? (isSoftware ? 0.9 : 1.0)
            : (initialTier === 'medium' ? Math.min(initDpr, 1.25) : initDpr)
    );
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
        lampHeadMat,
        lampHaloMat,
        haloInst,
        setNightSkyActive,
        updateNightSky
    } = createAtmosphereAndProps(scene, hardwareProfile);

    // Throttle shadow pass cadence by default (30Hz high, 20Hz medium, 10Hz low) to halve shadow GPU cost
    let shadowUpdateStride = initialTier === 'low' ? 6 : (initialTier === 'medium' ? 3 : 2);
    let shadowFrameCount = 0;
    let currentShadowSize = initShadowSize;
    renderer.shadowMap.autoUpdate = false;
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
    freezeStaticHierarchy(flagController.solidFlagInst, null, 1.0);

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
            lampHeadMat.color.setHex(0xfef9c3);
            lampHaloMat.opacity = 0;
            haloInst.visible = false;
            renderer.toneMappingExposure = 1.06;
            setNightSkyActive(false);
            if (updateTraffic && updateTraffic.setNightMode) updateTraffic.setNightMode(false);
        }

        // Under-beam gate illumination uses uniform-only emissive and additive meshes with zero shader recompiles
        for (const sp of gateSpotlights) {
            if (mode === 'night') {
                sp.signMat.emissiveIntensity = 0.74;
                sp.lampLensMat.color.setHex(0xffffff);
                sp.coneMat.opacity = 0.34;
                sp.glowMat.opacity = 0.95;
                sp.coneMesh.visible = true;
                sp.glowMesh.visible = true;
            } else if (mode === 'sunset') {
                sp.signMat.emissiveIntensity = 0.34;
                sp.lampLensMat.color.setHex(0xfff5cc);
                sp.coneMat.opacity = 0.20;
                sp.glowMat.opacity = 0.55;
                sp.coneMesh.visible = true;
                sp.glowMesh.visible = true;
            } else {
                sp.signMat.emissiveIntensity = 0;
                sp.lampLensMat.color.setHex(0xcbd5e1);
                sp.coneMat.opacity = 0;
                sp.glowMat.opacity = 0;
                sp.coneMesh.visible = false;
                sp.glowMesh.visible = false;
            }
        }

        // Streetlamp downlights on Dong Da median island active at night/sunset, off during daytime
        const isNight = mode === 'night';
        const isSunset = mode === 'sunset';
        const downlightActive = isNight || isSunset;
        for (const dl of streetlampDownlights) {
            dl.visible = downlightActive;
        }
        if (streetlampLumMat) {
            streetlampLumMat.color.setHex(isNight ? 0xffffff : (isSunset ? 0xfef08a : 0xfef9c3));
        }
        if (streetlampBeamMat) {
            streetlampBeamMat.opacity = isNight ? 0.24 : (isSunset ? 0.14 : 0);
        }

        renderer.shadowMap.needsUpdate = true;
    };

    // Adjust renderer pixel ratio, shadow size, and shadow update cadence cleanly
    const setQualityLevel = (level, allowShadowTypeChange = true) => {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        let nextShadowSize = 2048;
        let targetShadowType = THREE.PCFSoftShadowMap;
        if (level === 'low') {
            renderer.setPixelRatio(isSoftware ? 0.9 : 1.0);
            nextShadowSize = 1024;
            shadowUpdateStride = 6;
            targetShadowType = THREE.BasicShadowMap;
        } else if (level === 'medium') {
            renderer.setPixelRatio(Math.min(dpr, 1.25));
            nextShadowSize = 1024;
            shadowUpdateStride = 3;
            targetShadowType = THREE.PCFShadowMap;
        } else {
            renderer.setPixelRatio(dpr);
            nextShadowSize = 2048;
            shadowUpdateStride = 2;
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
        if (updatePedestrians && updatePedestrians.setShadowTier) updatePedestrians.setShadowTier(level);
    };

    // Allow adaptive FPS governor to throttle or freeze static shadow maps with zero shader recompiles
    const setShadowCadence = (stride, freezeStatic = false) => {
        if (freezeStatic) {
            vegController.setShadowTier('low');
            intersectionSignals.setShadowTier('low');
            if (updateTraffic.setShadowTier) updateTraffic.setShadowTier('off');
            if (updatePedestrians && updatePedestrians.setShadowTier) updatePedestrians.setShadowTier('low');
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

    let envFrameCount = 0;
    let lastShadowPx = NaN;
    let lastShadowPz = NaN;

    // Advance wind uniform, flag ripple, smart traffic signals, vehicle flow, and beacon pulse
    const updateEnvironment = (elapsedSec, dt, playerState = null) => {
        windUniform.value = elapsedSec;
        updateNightSky(elapsedSec, dt);
        rooftopFireworks.update(dt);
        airspaceSystem.update(dt, elapsedSec);
        const signalState = intersectionSignals.updateSignals(dt);
        updateTraffic(dt, playerState, signalState);
        if (updatePedestrians) updatePedestrians(dt, elapsedSec, signalState);

        envFrameCount += 1;
        const propStride = shadowUpdateStride === 0 || shadowUpdateStride > 2 ? 2 : 1;
        if (envFrameCount % propStride === 0) {
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
            // Double shadow stride when stationary in high-altitude overview mode to skip redundant passes
            let effectiveStride = shadowUpdateStride;
            if (playerState) {
                const playerMoved = Number.isNaN(lastShadowPx)
                    || Math.abs(playerState.x - lastShadowPx) > 0.005
                    || Math.abs(playerState.z - lastShadowPz) > 0.005;
                lastShadowPx = playerState.x;
                lastShadowPz = playerState.z;
                if (!playerMoved && playerState.cameraMode === 'fly' && !playerState.introPlaying) {
                    effectiveStride = shadowUpdateStride * 2;
                }
            }
            shadowFrameCount += 1;
            if (shadowFrameCount >= effectiveStride) {
                shadowFrameCount = 0;
                renderer.shadowMap.needsUpdate = true;
            }
        }
    };

    // Release cached procedural textures and shadow map buffers cleanly on page unload
    const dispose = () => {
        if (sunLight.shadow.map) {
            sunLight.shadow.map.dispose();
            sunLight.shadow.map = null;
        }
        cachedCeramicTileTextures = null;
        cachedLeafTexture = null;
        gateSpotlights.length = 0;
        streetlampDownlights.length = 0;
    };

    return {
        setLightingPreset,
        setQualityLevel,
        setShadowCadence,
        requestShadowRefresh,
        updateEnvironment,
        dispose,
        getSignalState: intersectionSignals.getSnapshot,
        teleportBeacons
    };
}
