// Procedural 3D architecture generator and Meshopt GLB compressor matching real HUSC photos and floorplan
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { NodeIO } from '@gltf-transform/core';
import { KHRONOS_EXTENSIONS, EXTMeshoptCompression } from '@gltf-transform/extensions';
import { dedup, prune, quantize, meshopt } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';

// Polyfill FileReader in Node.js so Three.js GLTFExporter binary export works cleanly
if (typeof globalThis.FileReader === 'undefined') {
    globalThis.FileReader = class NodeFileReader {
        readAsArrayBuffer(blob) {
            blob.arrayBuffer().then((buffer) => {
                this.result = buffer;
                if (typeof this.onloadend === 'function') this.onloadend({ target: this });
                if (typeof this.onload === 'function') this.onload({ target: this });
            });
        }
        readAsDataURL(blob) {
            blob.arrayBuffer().then((buffer) => {
                const mime = blob.type || 'application/octet-stream';
                const base64 = Buffer.from(buffer).toString('base64');
                this.result = `data:${mime};base64,${base64}`;
                if (typeof this.onloadend === 'function') this.onloadend({ target: this });
                if (typeof this.onload === 'function') this.onload({ target: this });
            });
        }
    };
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_GLB = path.resolve(__dirname, '../src/main/resources/static/models/husc-campus.glb');

// Shared PBR material palette calibrated to real HUSC photography and floorplan rendering
function createPalette() {
    return {
        ochreMain: new THREE.MeshStandardMaterial({ color: 0xe6bf64, roughness: 0.78, metalness: 0.04 }),
        creamWall: new THREE.MeshStandardMaterial({ color: 0xf4e38c, roughness: 0.80, metalness: 0.03 }),
        whiteTrim: new THREE.MeshStandardMaterial({ color: 0xf4f2ec, roughness: 0.62, metalness: 0.04 }),
        mullionWhite: new THREE.MeshStandardMaterial({ color: 0xf6f6f2, roughness: 0.42, metalness: 0.14 }),
        plinthStone: new THREE.MeshStandardMaterial({ color: 0x9b988e, roughness: 0.88, metalness: 0.02 }),
        brownGranite: new THREE.MeshStandardMaterial({ color: 0x4d342b, roughness: 0.72, metalness: 0.08 }),
        blackGranite: new THREE.MeshStandardMaterial({ color: 0x1a1d24, roughness: 0.24, metalness: 0.28 }),
        maroonRoof: new THREE.MeshStandardMaterial({ color: 0x762321, roughness: 0.64, metalness: 0.10 }),
        shelterBlueRoof: new THREE.MeshStandardMaterial({ color: 0x25638b, roughness: 0.56, metalness: 0.16 }),
        nhaARoofGreen: new THREE.MeshStandardMaterial({ color: 0x4ea385, roughness: 0.58, metalness: 0.16 }),
        terracottaTile: new THREE.MeshStandardMaterial({ color: 0xa8563f, roughness: 0.75, metalness: 0.04 }),
        maroonShutter: new THREE.MeshStandardMaterial({ color: 0x67241f, roughness: 0.56, metalness: 0.08 }),
        darkSlate: new THREE.MeshStandardMaterial({ color: 0x1e2128, roughness: 0.48, metalness: 0.22 }),
        revealDark: new THREE.MeshStandardMaterial({ color: 0x3b424d, roughness: 0.62, metalness: 0.14 }),
        gateBeigeBrick: new THREE.MeshStandardMaterial({ name: 'GateCeramicTile', color: 0xf1ece2, roughness: 0.54, metalness: 0.04 }),
        monumentGranite: new THREE.MeshStandardMaterial({ color: 0x6b3b24, roughness: 0.36, metalness: 0.16 }),
        glassWindow: new THREE.MeshStandardMaterial({ color: 0x1a334a, roughness: 0.15, metalness: 0.68 }),
        glassLobby: new THREE.MeshStandardMaterial({ color: 0x8fa3b8, roughness: 0.34, metalness: 0.24 }),
        steelSilver: new THREE.MeshStandardMaterial({ color: 0xd5dce4, roughness: 0.28, metalness: 0.84 }),
        goalWhite: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.42, metalness: 0.15 }),
        hoopBoard: new THREE.MeshStandardMaterial({ color: 0xeff6ff, roughness: 0.25, metalness: 0.15 }),
        hoopOrange: new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.40, metalness: 0.35 }),
        concreteLight: new THREE.MeshStandardMaterial({ color: 0xc4c8cc, roughness: 0.85, metalness: 0.02 }),
        facadeAccent: new THREE.MeshStandardMaterial({ color: 0x8f3a29, roughness: 0.70, metalness: 0.06 })
    };
}

// Create low-pitched East-West ridge corrugated gable roof matching aerial Building A photo
function createGableRoofGeometry(width, depth, ridgeHeight) {
    const hw = width * 0.5;
    const hd = depth * 0.5;
    const positions = [];
    const pushQuad = (a, b, c, d) => {
        positions.push(...a, ...b, ...c, ...a, ...c, ...d);
    };
    const pushTri = (a, b, c) => {
        positions.push(...a, ...b, ...c);
    };

    const fL = [-hw, 0, hd];
    const fR = [hw, 0, hd];
    const bL = [-hw, 0, -hd];
    const bR = [hw, 0, -hd];
    const rL = [-hw, ridgeHeight, 0];
    const rR = [hw, ridgeHeight, 0];

    pushQuad(fL, fR, rR, rL);
    pushQuad(bR, bL, rL, rR);
    pushTri(bL, fL, rL);
    pushTri(fR, bR, rR);

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.computeVertexNormals();
    return geom;
}

// Create tapered 4-sided hipped roof geometry centered at (0, 0, 0) in XZ with base at Y=0
function createHippedRoofGeometry(width, depth, height, overhang = 0.85) {
    const bw = (width + overhang * 2) * 0.5;
    const bd = (depth + overhang * 2) * 0.5;
    const rw = Math.max(0.4, (width > depth ? (width - depth * 0.62) : 0.6) * 0.5);
    const rd = Math.max(0.4, (depth > width ? (depth - width * 0.62) : 0.6) * 0.5);

    const bFL = [-bw, 0, bd];
    const bFR = [bw, 0, bd];
    const bBR = [bw, 0, -bd];
    const bBL = [-bw, 0, -bd];

    const tFL = [-rw, height, rd];
    const tFR = [rw, height, rd];
    const tBR = [rw, height, -rd];
    const tBL = [-rw, height, -rd];

    const positions = [];
    const pushQuad = (a, b, c, d) => {
        positions.push(...a, ...b, ...c, ...a, ...c, ...d);
    };
    pushQuad(bFL, bFR, tFR, tFL);
    pushQuad(bFR, bBR, tBR, tFR);
    pushQuad(bBR, bBL, tBL, tBR);
    pushQuad(bBL, bFL, tFL, tBL);
    pushQuad(tFL, tFR, tBR, tBL);
    pushQuad(bBL, bBR, bFR, bFL);

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.computeVertexNormals();
    return geom;
}

// Helper to create positioned box mesh
function addBox(parent, w, h, d, x, y, z, material) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
}

// Helper to create box mesh with world-aligned square tile UVs eliminating distorted textures
function addTiledBox(parent, w, h, d, x, y, z, material, tileSize = 0.20, origin = { x: 0, y: 0, z: 0 }) {
    const geom = new THREE.BoxGeometry(w, h, d);
    const pos = geom.attributes.position;
    const norm = geom.attributes.normal;
    const uv = geom.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
        const vx = x + pos.getX(i) - origin.x;
        const vy = y + pos.getY(i) - origin.y;
        const vz = z + pos.getZ(i) - origin.z;
        const nx = Math.abs(norm.getX(i));
        const ny = Math.abs(norm.getY(i));
        if (nx > 0.5) {
            uv.setXY(i, vz / tileSize, vy / tileSize);
        } else if (ny > 0.5) {
            uv.setXY(i, vx / tileSize, vz / tileSize);
        } else {
            uv.setXY(i, vx / tileSize, vy / tileSize);
        }
    }
    uv.needsUpdate = true;
    const mesh = new THREE.Mesh(geom, material);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
}

// Build iconic HUSC Building A (3 stories, 9 window bays, sage-green gable roof, white lobby grid, 4-col portico + red tile balcony)
function buildNhaA(mat) {
    const group = new THREE.Group();
    group.name = 'bldg_A';
    const W = 48.4;
    const D = 11.4;
    const H = 11.8;

    addBox(group, W + 0.5, 0.65, D + 0.5, 0, 0.325, 0, mat.plinthStone);
    addBox(group, W, H, D, 0, 0.65 + H * 0.5, 0, mat.ochreMain);

    const roofBaseY = 0.65 + H;
    addBox(group, W + 1.0, 0.42, D + 1.0, 0, roofBaseY + 0.21, 0, mat.whiteTrim);
    addBox(group, W + 0.6, 0.36, 0.28, 0, roofBaseY + 0.60, D * 0.5 + 0.25, mat.whiteTrim);
    addBox(group, W + 0.6, 0.36, 0.28, 0, roofBaseY + 0.60, -D * 0.5 - 0.25, mat.whiteTrim);

    const gableRoof = new THREE.Mesh(createGableRoofGeometry(W - 0.2, D - 0.2, 1.55), mat.nhaARoofGreen);
    gableRoof.position.set(0, roofBaseY + 0.42, 0);
    group.add(gableRoof);

    for (let rx = -W * 0.5 + 2.4; rx <= W * 0.5 - 2.4; rx += 4.8) {
        const rib = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, D * 0.96), mat.nhaARoofGreen);
        rib.position.set(rx, roofBaseY + 1.2, 0);
        group.add(rib);
    }
    for (const sx of [-18.5, 18.5]) {
        addBox(group, 0.1, 1.4, 0.1, sx, roofBaseY + 1.0, D * 0.5 + 0.2, mat.steelSilver);
        addBox(group, 0.38, 0.24, 0.22, sx, roofBaseY + 1.72, D * 0.5 + 0.2, mat.darkSlate);
    }

    const addLouverWindow = (wx, wy, fz, dir, winW, winH, isCenterDoor = false) => {
        const zGlass = fz + dir * 0.05;
        const zShutter = fz + dir * 0.09;
        addBox(group, winW, winH, 0.07, wx, wy, zGlass, isCenterDoor ? mat.maroonShutter : mat.glassWindow);
        addBox(group, winW + 0.28, 0.14, 0.16, wx, wy - winH * 0.5 - 0.06, zGlass, mat.whiteTrim);
        if (!isCenterDoor) {
            addBox(group, 0.38, winH - 0.06, 0.08, wx - winW * 0.36, wy, zShutter, mat.maroonShutter);
            addBox(group, 0.38, winH - 0.06, 0.08, wx + winW * 0.36, wy, zShutter, mat.maroonShutter);
            addBox(group, 0.08, winH - 0.06, 0.09, wx, wy, zShutter, mat.mullionWhite);
        }
    };

    const sideBayX = [-21.1, -16.7, -12.3, -7.9, 7.9, 12.3, 16.7, 21.1];
    const centerUnitX = [-3.45, 0, 3.45];
    const storyY = [2.35, 6.20, 9.95];

    for (const faceZ of [D * 0.5 + 0.04, -D * 0.5 - 0.04]) {
        const dir = Math.sign(faceZ);
        for (const bx of sideBayX) {
            addBox(group, 3.05, H - 0.65, 0.08, bx, 0.65 + H * 0.5, faceZ, mat.whiteTrim);
            for (const wy of storyY) {
                addLouverWindow(bx, wy, faceZ, dir, 2.35, 2.45, false);
            }
        }
        addBox(group, 10.6, dir > 0 ? 7.65 : (H - 0.65), 0.08, 0, dir > 0 ? 8.35 : (0.65 + H * 0.5), faceZ, mat.whiteTrim);
        for (let s = (dir > 0 ? 1 : 0); s < storyY.length; s++) {
            const wy = storyY[s];
            for (const ux of centerUnitX) {
                const isBalconyDoor = (dir > 0 && s === 1 && ux === 0);
                addLouverWindow(ux, wy, faceZ, dir, 2.50, isBalconyDoor ? 2.75 : 2.50, isBalconyDoor);
            }
        }
    }

    for (const sy of [4.38, 8.15]) {
        addBox(group, W + 0.24, 0.16, D + 0.26, 0, sy, 0, mat.whiteTrim);
    }

    // End masonry exterior stairs & gable windows matching floorplan
    for (const sideX of [-W * 0.5 - 0.04, W * 0.5 + 0.04]) {
        for (const wy of storyY) {
            for (const sz of [-2.4, 2.4]) {
                addBox(group, 0.08, 2.2, 2.1, sideX, wy, sz, mat.glassWindow);
            }
        }
    }

    const pZ = D * 0.5 + 2.2;
    addBox(group, 13.0, 0.52, 4.6, 0, 0.26, pZ, mat.plinthStone);
    addBox(group, 13.4, 0.26, 1.0, 0, 0.13, pZ + 2.65, mat.plinthStone);

    addBox(group, 9.6, 3.65, 0.12, 0, 2.45, D * 0.5 + 0.05, mat.glassLobby);
    for (const mx of [-4.6, -2.4, -1.25, 1.25, 2.4, 4.6]) {
        addBox(group, 0.14, 3.65, 0.18, mx, 2.45, D * 0.5 + 0.08, mat.mullionWhite);
    }
    for (const my of [0.68, 2.95, 4.22]) {
        addBox(group, 9.6, 0.14, 0.18, 0, my, D * 0.5 + 0.08, mat.mullionWhite);
    }
    addBox(group, 2.25, 2.25, 0.20, 0, 1.78, D * 0.5 + 0.10, mat.darkSlate);

    const colPositions = [-5.0, -1.75, 1.75, 5.0];
    const colGeom = new THREE.CylinderGeometry(0.27, 0.31, 3.72, 12);
    for (const cx of colPositions) {
        addBox(group, 0.86, 0.42, 0.86, cx, 0.72, pZ + 1.65, mat.whiteTrim);
        const colMesh = new THREE.Mesh(colGeom, mat.ochreMain);
        colMesh.position.set(cx, 2.78, pZ + 1.65);
        group.add(colMesh);
        addBox(group, 0.76, 0.22, 0.76, cx, 4.64, pZ + 1.65, mat.whiteTrim);
    }

    addBox(group, 12.6, 0.28, 4.5, 0, 4.86, pZ, mat.whiteTrim);
    addBox(group, 12.2, 0.24, 4.1, 0, 5.02, pZ - 0.1, mat.terracottaTile);
    addBox(group, 12.3, 0.86, 0.22, 0, 5.18, pZ + 2.16, mat.darkSlate);
    addBox(group, 12.5, 0.12, 0.26, 0, 5.65, pZ + 2.16, mat.mullionWhite);

    addBox(group, 12.3, 0.08, 0.08, 0, 5.95, pZ + 2.15, mat.mullionWhite);
    addBox(group, 0.08, 0.08, 4.3, -6.12, 5.95, pZ, mat.mullionWhite);
    addBox(group, 0.08, 0.08, 4.3, 6.12, 5.95, pZ, mat.mullionWhite);
    for (const rx of [-6.12, -3.1, 0, 3.1, 6.12]) {
        addBox(group, 0.08, 0.9, 0.08, rx, 5.52, pZ + 2.15, mat.mullionWhite);
    }

    group.position.set(-13.0, 0, 10.0);
    return group;
}

// Build multi-story academic hall supporting SketchUp-accurate exterior corridor balconies, fins, and stair cores
function buildAcademicHall(name, cfg, mat) {
    const {
        cx, cz, W, D, stories, angle = 0,
        wallMat = mat.creamWall,
        roofMat = mat.maroonRoof,
        hasGroundGranite = false,
        hasExteriorStair = false,
        hasFlatRoof = false,
        hasCorridor = false
    } = cfg;

    const group = new THREE.Group();
    group.name = name;
    const storyH = 3.25;
    const plinthH = 0.65;
    const wallH = stories * storyH + 0.5;
    const longX = W >= D;
    const span = longX ? W : D;
    const thick = longX ? D : W;

    // Base plinth & optional brown granite lower story
    addBox(group, W + 0.4, plinthH, D + 0.4, 0, plinthH * 0.5, 0, mat.plinthStone);
    if (hasGroundGranite) {
        addBox(group, W + 0.16, storyH, D + 0.16, 0, plinthH + storyH * 0.5, 0, mat.brownGranite);
    }
    addBox(group, W, wallH, D, 0, plinthH + wallH * 0.5, 0, wallMat);

    // Cornice slab + hipped or low parapet roof
    addBox(group, W + 0.85, 0.34, D + 0.85, 0, plinthH + wallH + 0.17, 0, mat.whiteTrim);
    if (hasFlatRoof) {
        addBox(group, W + 0.5, 0.45, D + 0.5, 0, plinthH + wallH + 0.52, 0, mat.concreteLight);
    } else {
        const roof = new THREE.Mesh(createHippedRoofGeometry(W, D, stories >= 4 ? 2.9 : 2.5, 0.85), roofMat);
        roof.position.set(0, plinthH + wallH + 0.34, 0);
        group.add(roof);
    }

    // Window bays + optional open corridor balcony parapet and regular structural vertical ribs matching SketchUp view
    const bayStep = 3.4;
    const count = Math.max(2, Math.floor((span - 3.0) / bayStep));
    const startOffset = -((count - 1) * bayStep) * 0.5;

    for (let s = 0; s < stories; s++) {
        const wy = plinthH + 1.85 + s * storyH;
        const floorY = plinthH + s * storyH;
        if (s > 0) {
            if (hasCorridor && longX) {
                // Protruding floor slab & parapet beam along courtyard front matching Building E & H
                addBox(group, W + 0.25, 0.22, D + 1.25, 0, floorY, 0.35, mat.whiteTrim);
                addBox(group, W + 0.20, 0.78, 0.14, 0, floorY + 0.45, D * 0.5 + 0.88, wallMat);
            } else if (hasCorridor && !longX) {
                // Protruding floor slab & parapet beam facing SW courtyard on Building K matching SketchUp model
                addBox(group, W + 1.25, 0.22, D + 0.25, -0.35, floorY, 0, mat.whiteTrim);
                addBox(group, 0.14, 0.78, D + 0.20, -W * 0.5 - 0.88, floorY + 0.45, 0, wallMat);
            } else {
                addBox(group, W + 0.28, 0.18, D + 0.28, 0, floorY, 0, mat.whiteTrim);
            }
        }
        for (let i = 0; i < count; i++) {
            const posAlong = startOffset + i * bayStep;
            for (const side of [-1, 1]) {
                if (longX) {
                    const fz = side * (thick * 0.5 + 0.04);
                    addBox(group, 1.95, 1.75, 0.08, posAlong, wy, fz, mat.glassWindow);
                    addBox(group, 2.25, 0.15, 0.14, posAlong, wy - 0.94, fz, mat.whiteTrim);
                } else {
                    const fx = side * (thick * 0.5 + 0.04);
                    addBox(group, 0.08, 1.75, 1.95, fx, wy, posAlong, mat.glassWindow);
                    addBox(group, 0.14, 0.15, 2.25, fx, wy - 0.94, posAlong, mat.whiteTrim);
                }
            }
        }
    }

    // Exterior corridor vertical piers & dark stairwell shafts matching SketchUp facades (E, H, K)
    if (hasCorridor && longX) {
        const pierCount = Math.max(4, Math.floor(W / 6.8));
        for (let p = 0; p <= pierCount; p++) {
            const px = -W * 0.5 + 0.4 + (p / pierCount) * (W - 0.8);
            addBox(group, 0.42, wallH, 0.42, px, plinthH + wallH * 0.5, D * 0.5 + 0.82, mat.whiteTrim);
        }
        for (const sx of [-W * 0.24, 0, W * 0.24]) {
            addBox(group, 2.1, wallH - 0.4, 0.24, sx, plinthH + wallH * 0.5, D * 0.5 + 0.72, mat.glassWindow);
        }
    } else if (hasCorridor && !longX) {
        const pierCount = Math.max(4, Math.floor(D / 6.5));
        for (let p = 0; p <= pierCount; p++) {
            const pz = -D * 0.5 + 0.4 + (p / pierCount) * (D - 0.8);
            addBox(group, 0.42, wallH, 0.42, -W * 0.5 - 0.82, plinthH + wallH * 0.5, pz, mat.whiteTrim);
        }
        addBox(group, 0.24, wallH - 0.4, 2.1, -W * 0.5 - 0.72, plinthH + wallH * 0.5, 0, mat.glassWindow);
    }

    // Center entrance canopy on primary long courtyard face
    if (W >= 20 || D >= 22) {
        if (longX) {
            addBox(group, 6.4, 0.35, 1.9, 0, plinthH + 3.4, D * 0.5 + 0.95, mat.whiteTrim);
            addBox(group, 4.2, 2.6, 0.15, 0, plinthH + 1.3, D * 0.5 + 0.08, mat.glassLobby);
        } else {
            addBox(group, 1.9, 0.35, 5.4, -W * 0.5 - 0.95, plinthH + 3.4, 0, mat.whiteTrim);
            addBox(group, 0.15, 2.6, 3.6, -W * 0.5 - 0.08, plinthH + 1.3, 0, mat.glassLobby);
        }
    }

    // Exterior stair projection (East A1-A2 & House G matching SketchUp & floorplan)
    if (hasExteriorStair) {
        addBox(group, 3.4, storyH * 1.3, 3.2, W * 0.5 + 1.5, plinthH + storyH * 0.65, D * 0.28, wallMat);
        addBox(group, 3.8, 0.25, 3.6, W * 0.5 + 1.5, plinthH + storyH * 1.32, D * 0.28, mat.whiteTrim);
    }

    group.position.set(cx, 0, cz);
    group.rotation.y = angle;
    return group;
}

// Build iconic House G facing West toward Right Garden with white vertical ribs, terracotta fins & side stairs
function buildNhaG(mat) {
    const group = buildAcademicHall('bldg_G', {
        cx: 56.5,
        cz: 40.5,
        W: 10.6,
        D: 30.0,
        stories: 3,
        angle: 0,
        wallMat: mat.whiteTrim
    }, mat);
    for (const fz of [-9.5, -3.2, 3.2, 9.5]) {
        addBox(group, 0.95, 10.4, 2.2, -5.4, 5.6, fz, mat.facadeAccent);
    }
    return group;
}

// Build iconic 77 Nguyen Hue Main Gate (ivory ceramic-tiled tower with stepped HUSC emblem alcove, granite piers, monument)
function buildMainGate(mat) {
    const group = new THREE.Group();
    group.name = 'prop_gate';

    const TILE = 0.20;
    const tOrigin = { x: -6.0, y: 3.40, z: 0 };

    // Left monument base planter curb & dark brown granite nameplate
    addBox(group, 12.6, 0.92, 1.85, -12.6, 0.46, 0, mat.plinthStone);
    addBox(group, 10.6, 2.75, 0.58, -12.4, 2.25, -0.16, mat.monumentGranite);
    addBox(group, 1.15, 3.7, 1.15, -18.2, 1.85, -0.1, mat.blackGranite);
    addTiledBox(group, 12.6, 0.62, 1.25, -12.4, 3.92, -0.1, mat.gateBeigeBrick, TILE, tOrigin);

    // Tall slender ivory ceramic-tile tower with dark reveal grooves, stepped alcove, and steel emblem hangers (ce1e9c8e + af7657e7)
    addBox(group, 1.56, 3.40, 2.15, -6.0, 1.70, 0, mat.blackGranite);
    addTiledBox(group, 1.40, 1.57, 3.20, -6.0, 4.185, 0, mat.gateBeigeBrick, TILE, tOrigin);
    addBox(group, 1.32, 0.06, 3.12, -6.0, 5.00, 0, mat.revealDark);
    addTiledBox(group, 1.40, 0.97, 3.20, -6.0, 5.515, 0, mat.gateBeigeBrick, TILE, tOrigin);

    // Flanking outer window piers split by mid-height architectural reveal groove
    for (const pz of [-1.20, 1.20]) {
        addTiledBox(group, 1.40, 1.37, 0.80, -6.0, 6.685, pz, mat.gateBeigeBrick, TILE, tOrigin);
        addBox(group, 1.32, 0.06, 0.74, -6.0, 7.40, pz, mat.revealDark);
        addTiledBox(group, 1.40, 1.17, 0.80, -6.0, 8.015, pz, mat.gateBeigeBrick, TILE, tOrigin);
    }

    // Recessed 2nd-tier inner window frame (jambs, sill, and lintel) framing open sky cutout
    for (const jz of [-0.70, 0.70]) {
        addTiledBox(group, 1.06, 2.60, 0.20, -6.0, 7.30, jz, mat.gateBeigeBrick, TILE, tOrigin);
    }
    addTiledBox(group, 1.06, 0.14, 1.20, -6.0, 6.07, 0, mat.gateBeigeBrick, TILE, tOrigin);
    addTiledBox(group, 1.06, 0.14, 1.20, -6.0, 8.53, 0, mat.gateBeigeBrick, TILE, tOrigin);

    // Flush tiled upper crown & sleek coping trim
    addTiledBox(group, 1.40, 0.80, 3.20, -6.0, 9.00, 0, mat.gateBeigeBrick, TILE, tOrigin);
    addBox(group, 1.44, 0.06, 3.24, -6.0, 9.43, 0, mat.revealDark);

    // Dual vertical metal hanger struts suspending HUSC shield emblem from alcove soffit
    const strutGeom = new THREE.CylinderGeometry(0.024, 0.024, 0.56, 8);
    for (const sz of [-0.16, 0.16]) {
        const strut = new THREE.Mesh(strutGeom, mat.steelSilver);
        strut.position.set(-6.0, 8.20, sz);
        group.add(strut);
    }

    // Right black granite piers, overhanging ceramic tile beam, and open-bar sliding stainless steel gate
    addBox(group, 1.25, 3.95, 1.55, 4.2, 1.975, 0, mat.blackGranite);
    addBox(group, 1.35, 3.95, 1.55, 9.6, 1.975, 0, mat.blackGranite);
    addTiledBox(group, 11.4, 0.68, 2.9, 8.4, 4.18, 0, mat.gateBeigeBrick, TILE, tOrigin);

    addBox(group, 4.2, 0.10, 0.10, 6.9, 0.25, 0, mat.steelSilver);
    addBox(group, 4.2, 0.10, 0.10, 6.9, 2.15, 0, mat.steelSilver);
    const picketGeom = new THREE.CylinderGeometry(0.035, 0.035, 1.9, 6);
    for (let px = 5.05; px <= 8.75; px += 0.34) {
        const picket = new THREE.Mesh(picketGeom, mat.steelSilver);
        picket.position.set(px, 1.2, 0);
        group.add(picket);
    }

    // Right Guardhouse clad in matching square ceramic tiles
    addTiledBox(group, 4.4, 3.2, 3.4, 12.6, 1.6, -0.75, mat.gateBeigeBrick, TILE, tOrigin);
    addBox(group, 4.9, 0.36, 3.85, 12.6, 3.35, -0.75, mat.whiteTrim);
    addBox(group, 2.1, 1.35, 0.10, 12.6, 1.85, 0.96, mat.glassWindow);

    group.position.set(-13.0, 0, 72.5);
    return group;
}

// Build Rear Campus Gate at 38 Dong Da matching Official Plan (61a14ecc)
function buildDongDaBackGate(mat) {
    const group = new THREE.Group();
    group.name = 'prop_gate_dongda';
    // Flanking pillars with open vehicle passage and guardhouse inside West wall
    addTiledBox(group, 1.15, 3.9, 1.15, -3.7, 1.95, 0, mat.gateBeigeBrick, 0.22);
    addBox(group, 1.3, 0.5, 1.3, -3.7, 4.1, 0, mat.blackGranite);
    addTiledBox(group, 1.15, 3.9, 1.15, 3.7, 1.95, 0, mat.gateBeigeBrick, 0.22);
    addBox(group, 1.3, 0.5, 1.3, 3.7, 4.1, 0, mat.blackGranite);
    addBox(group, 9.2, 0.58, 1.45, 0, 4.65, 0, mat.maroonRoof);
    addTiledBox(group, 3.2, 2.8, 2.6, -6.0, 1.4, 2.0, mat.gateBeigeBrick, 0.22);
    addBox(group, 3.6, 0.3, 3.0, -6.0, 2.95, 2.0, mat.whiteTrim);

    group.position.set(17.58, 0, -88.06);
    group.rotation.y = 0.4461;
    return group;
}

// Build Student Bike Shelter Sheds supporting flexible orientation and roof accent color
function buildBikeGarage(name, cx, cz, width, depth, mat, options = {}) {
    const { angle = 0, roofMat = mat.maroonRoof } = options;
    const group = new THREE.Group();
    group.name = name;
    addBox(group, width, 0.22, depth, 0, 0.11, 0, mat.concreteLight);

    const colGeom = new THREE.CylinderGeometry(0.10, 0.10, 2.95, 8);
    const bays = Math.max(4, Math.floor(width / 6.0));
    for (let i = 0; i <= bays; i++) {
        const px = -width * 0.5 + 0.8 + (i / bays) * (width - 1.6);
        for (const pz of [-depth * 0.38, depth * 0.38]) {
            const post = new THREE.Mesh(colGeom, mat.steelSilver);
            post.position.set(px, 1.56, pz);
            group.add(post);
        }
    }

    const roof = new THREE.Mesh(createHippedRoofGeometry(width, depth, 1.25, 0.55), roofMat);
    roof.position.set(0, 3.02, 0);
    group.add(roof);
    group.position.set(cx, 0, cz);
    group.rotation.y = angle;
    return group;
}

// Build Football Goals & Basketball Hoops matching orthogonal Football Field & Court
function buildSportsProps(mat) {
    const group = new THREE.Group();
    group.name = 'prop_sports_goals';

    const fieldGroup = new THREE.Group();
    fieldGroup.position.set(-75.5, 0, 36.5);
    for (const endZ of [-20.0, 20.0]) {
        const zDir = Math.sign(endZ);
        addBox(fieldGroup, 0.14, 2.2, 0.14, -2.4, 1.1, endZ, mat.goalWhite);
        addBox(fieldGroup, 0.14, 2.2, 0.14, 2.4, 1.1, endZ, mat.goalWhite);
        addBox(fieldGroup, 4.94, 0.14, 0.14, 0, 2.2, endZ, mat.goalWhite);
        addBox(fieldGroup, 0.1, 2.1, 1.2, -2.4, 1.05, endZ + zDir * 0.6, mat.goalWhite);
        addBox(fieldGroup, 0.1, 2.1, 1.2, 2.4, 1.05, endZ + zDir * 0.6, mat.goalWhite);
    }
    group.add(fieldGroup);

    // Basketball Hoops at Sân Bóng Rổ (-31.0, -7.5)
    for (const sideX of [-38.8, -23.2]) {
        const dir = sideX < -31.0 ? 1 : -1;
        addBox(group, 0.2, 3.3, 0.2, sideX, 1.65, -7.5, mat.steelSilver);
        addBox(group, 0.9, 0.16, 0.16, sideX + dir * 0.45, 3.25, -7.5, mat.steelSilver);
        addBox(group, 0.1, 1.1, 1.65, sideX + dir * 0.9, 3.1, -7.5, mat.hoopBoard);
        addBox(group, 0.45, 0.08, 0.45, sideX + dir * 1.15, 2.75, -7.5, mat.hoopOrange);
    }
    return group;
}

// Build 5-corner Campus Perimeter Walls synchronized with 77 Nguyen Hue & 38 Dong Da gates
function buildPerimeterWalls(mat) {
    const group = new THREE.Group();
    group.name = 'prop_perimeter_walls';

    const addWallSegment = (x1, z1, x2, z2) => {
        const dx = x2 - x1;
        const dz = z2 - z1;
        const len = Math.hypot(dx, dz);
        const angle = Math.atan2(-dz, dx);
        const cx = (x1 + x2) * 0.5;
        const cz = (z1 + z2) * 0.5;
        const wall = addBox(group, len, 1.55, 0.42, cx, 0.775, cz, mat.plinthStone);
        wall.rotation.y = angle;
        const cap = addBox(group, len + 0.1, 0.22, 0.56, cx, 1.66, cz, mat.darkSlate);
        cap.rotation.y = angle;
    };

    // South Nguyen Hue frontage split around Main Gate [-31.8 .. +1.8]
    addWallSegment(-104.0, 72.5, -31.8, 72.5);
    addWallSegment(1.8, 72.5, 84.0, 72.5);

    // West boundary along Ly Thuong Kiet
    addWallSegment(-104.0, 72.5, -108.0, -28.0);

    // North-West boundary along Dong Da split cleanly around Cong 38 Dong Da [(17.58, -88.06)]
    addWallSegment(-108.0, -28.0, 13.61, -86.16);
    addWallSegment(21.55, -89.96, 30.0, -94.0);

    // North-East diagonal boundary (behind Nha Khach Chuyen Gia) + East vertical boundary behind B, F, G
    addWallSegment(30.0, -94.0, 84.0, -32.0);
    addWallSegment(84.0, -32.0, 84.0, 72.5);

    return group;
}

async function main() {
    const scene = new THREE.Scene();
    scene.name = 'HUSC_Campus_Root';
    const mat = createPalette();

    // 1. South Showcase Block: Nha A + Connector + Hoi Truong A2
    scene.add(buildNhaA(mat));
    scene.add(buildAcademicHall('bldg_A_connector', {
        cx: 15.6, cz: 10.0, W: 8.8, D: 7.4, stories: 2, angle: 0, wallMat: mat.ochreMain
    }, mat));
    scene.add(buildAcademicHall('bldg_A1A2', {
        cx: 33.8, cz: 10.0, W: 27.2, D: 11.4, stories: 3, angle: 0, wallMat: mat.creamWall, hasExteriorStair: true
    }, mat));

    // 2. Orthogonal Central, West & East Courtyard Wings matching official plan 61a14ecc + SketchUp 4dbedfd4
    scene.add(buildAcademicHall('bldg_E', {
        cx: 7.5, cz: -28.0, W: 66.0, D: 12.2, stories: 4, angle: 0, wallMat: mat.creamWall, hasCorridor: true
    }, mat));
    scene.add(buildAcademicHall('bldg_M', {
        cx: 4.0, cz: -39.2, W: 28.0, D: 5.4, stories: 2, angle: 0, wallMat: mat.ochreMain
    }, mat));
    scene.add(buildAcademicHall('bldg_C', {
        cx: -46.5, cz: -6.0, W: 9.2, D: 30.0, stories: 3, angle: 0, wallMat: mat.creamWall
    }, mat));
    scene.add(buildAcademicHall('bldg_N', {
        cx: -46.5, cz: -33.0, W: 9.2, D: 20.0, stories: 3, angle: 0, wallMat: mat.creamWall
    }, mat));
    scene.add(buildAcademicHall('bldg_D', {
        cx: -74.0, cz: -25.5, W: 22.0, D: 11.5, stories: 4, angle: 0.06,
        wallMat: mat.creamWall, hasGroundGranite: true, hasFlatRoof: true
    }, mat));
    scene.add(buildAcademicHall('bldg_B', {
        cx: 56.5, cz: -14.5, W: 10.4, D: 29.0, stories: 3, angle: 0, wallMat: mat.creamWall
    }, mat));
    scene.add(buildAcademicHall('bldg_F', {
        cx: 56.5, cz: 10.0, W: 9.6, D: 16.5, stories: 3, angle: 0, wallMat: mat.creamWall
    }, mat));
    scene.add(buildNhaG(mat));

    // 3. Northern Sloped Ranges: Nha H (main diagonal + west elbow), 2-part bent Nha K, and Nha Khach Chuyen Gia
    scene.add(buildAcademicHall('bldg_H', {
        cx: -11.48, cz: -53.10, W: 46.0, D: 10.6, stories: 4, angle: 0.4461, wallMat: mat.creamWall, hasCorridor: true
    }, mat));
    scene.add(buildAcademicHall('bldg_H_elbow', {
        cx: -35.2, cz: -41.5, W: 11.0, D: 10.2, stories: 4, angle: 0.10, wallMat: mat.creamWall
    }, mat));
    scene.add(buildAcademicHall('bldg_K_lower', {
        cx: 56.5, cz: -36.5, W: 10.2, D: 12.4, stories: 4, angle: 0, wallMat: mat.creamWall, hasCorridor: true
    }, mat));
    scene.add(buildAcademicHall('bldg_K', {
        cx: 46.2, cz: -55.4, W: 9.8, D: 25.0, stories: 4, angle: 0.72, wallMat: mat.creamWall, hasCorridor: true
    }, mat));
    scene.add(buildAcademicHall('bldg_guesthouse', {
        cx: 47.73, cz: -68.01, W: 5.2, D: 22.0, stories: 2, angle: 0.7165,
        wallMat: mat.ochreMain, roofMat: mat.shelterBlueRoof
    }, mat));

    // 4. Gates, Nguyen Hue & 38 Dong Da Bike Shelters, Northwest Shed, Sport Equipment, and Perimeter Walls
    scene.add(buildMainGate(mat));
    scene.add(buildDongDaBackGate(mat));
    scene.add(buildBikeGarage('prop_garage_west', -64.0, 67.5, 44.0, 6.2, mat, { roofMat: mat.maroonRoof }));
    scene.add(buildBikeGarage('prop_garage_east', 34.0, 67.5, 56.0, 6.2, mat, { roofMat: mat.maroonRoof }));
    scene.add(buildBikeGarage('prop_parking_dongda_1', -29.21, -61.80, 36.0, 4.6, mat, { angle: 0.4461, roofMat: mat.shelterBlueRoof }));
    scene.add(buildBikeGarage('prop_parking_dongda_2', -59.01, -46.11, 14.0, 4.2, mat, { angle: 0.4461, roofMat: mat.shelterBlueRoof }));
    scene.add(buildBikeGarage('prop_parking_nhad', -74.6, -34.8, 21.0, 4.4, mat, { angle: 0.06, roofMat: mat.shelterBlueRoof }));
    scene.add(buildSportsProps(mat));
    scene.add(buildPerimeterWalls(mat));

    // Export procedural scene graph to binary glTF buffer
    const exporter = new GLTFExporter();
    const rawArrayBuffer = await exporter.parseAsync(scene, { binary: true });

    await MeshoptDecoder.ready;
    await MeshoptEncoder.ready;
    const io = new NodeIO()
        .registerExtensions([...KHRONOS_EXTENSIONS, EXTMeshoptCompression])
        .registerDependencies({
            'meshopt.decoder': MeshoptDecoder,
            'meshopt.encoder': MeshoptEncoder
        });

    const document = await io.readBinary(new Uint8Array(rawArrayBuffer));
    await document.transform(
        dedup(),
        prune({ keepAttributes: true }),
        quantize(),
        meshopt({ encoder: MeshoptEncoder, level: 'medium' })
    );

    const compressedBinary = await io.writeBinary(document);
    await fs.mkdir(path.dirname(OUTPUT_GLB), { recursive: true });
    await fs.writeFile(OUTPUT_GLB, compressedBinary);

    const rawKB = (rawArrayBuffer.byteLength / 1024).toFixed(1);
    const outKB = (compressedBinary.byteLength / 1024).toFixed(1);
    console.log(`Built HUSC 3D Campus GLB: raw ${rawKB} KB -> Meshopt ${outKB} KB (${OUTPUT_GLB})`);
}

main().catch((err) => {
    console.error('Failed to build HUSC campus GLB:', err);
    process.exit(1);
});
