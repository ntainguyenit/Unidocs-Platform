// Realistic contoured HUSC student avatar with branded cap, polo uniform, printed lanyard, ID badge, and natural animation
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const HUSC_NAVY_HEX = '#1E3A8A';
const HUSC_NAVY = 0x1e3a8a;
const PANTS_NAVY_HEX = '#1E293B';

// Transform, normalize attributes, and merge rigid sub-geometries sharing one material inside a joint
function mergeAvatarParts(parts, keepUv = false) {
    const dummy = new THREE.Object3D();
    const prepared = parts.map(({ geom, pos = [0, 0, 0], rot = [0, 0, 0], scale = [1, 1, 1] }) => {
        const g = geom.index ? geom.toNonIndexed() : geom.clone();
        geom.dispose();
        if (!keepUv && g.attributes.uv) g.deleteAttribute('uv');
        dummy.position.set(pos[0], pos[1], pos[2]);
        dummy.rotation.set(rot[0], rot[1], rot[2]);
        dummy.scale.set(scale[0], scale[1], scale[2]);
        dummy.updateMatrix();
        g.applyMatrix4(dummy.matrix);
        return g;
    });
    const merged = mergeGeometries(prepared, false);
    prepared.forEach((p) => p.dispose());
    return merged;
}

// Draw official HUSC shield crest matching university gate, cap, uniform, and student ID branding
export function drawHuscShield(ctx, cx, cy, size) {
    const w = size * 0.86;
    const h = size;
    const topY = cy - h * 0.5;
    const midY = cy - h * 0.22;
    const botY = cy + h * 0.5;

    const traceShield = (inset = 0) => {
        const iw = w - inset * 2;
        const ih = h - inset * 2;
        const it = topY + inset;
        const im = midY + inset * 0.22;
        const ib = botY - inset;
        ctx.beginPath();
        ctx.moveTo(cx - iw * 0.35, it);
        ctx.lineTo(cx + iw * 0.35, it);
        ctx.lineTo(cx + iw * 0.50, im);
        ctx.bezierCurveTo(cx + iw * 0.45, cy + ih * 0.14, cx + iw * 0.24, cy + ih * 0.38, cx, ib);
        ctx.bezierCurveTo(cx - iw * 0.24, cy + ih * 0.38, cx - iw * 0.45, cy + ih * 0.14, cx - iw * 0.50, im);
        ctx.closePath();
    };

    ctx.save();
    traceShield(0);
    ctx.fillStyle = '#0f3c86';
    ctx.fill();
    ctx.lineWidth = Math.max(1.5, size * 0.036);
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.save();
    traceShield(size * 0.036);
    ctx.lineWidth = Math.max(1.0, size * 0.018);
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    ctx.clip();

    // Top banner bilingual typography & divider bar
    ctx.fillStyle = '#ffffff';
    if (size >= 90) {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `800 ${Math.round(size * 0.052)}px Inter, sans-serif`;
        ctx.fillText('TRƯỜNG ĐẠI HỌC KHOA HỌC HUẾ', cx, topY + h * 0.108);
        ctx.fillRect(cx - w * 0.30, topY + h * 0.158, w * 0.60, Math.max(1.2, size * 0.007));
        ctx.font = `800 ${Math.round(size * 0.056)}px Inter, sans-serif`;
        ctx.fillText('HUE UNIVERSITY OF SCIENCES', cx, topY + h * 0.214);
    }
    ctx.fillRect(cx - w * 0.48, midY + h * 0.012, w * 0.96, Math.max(1.4, size * 0.014));

    // Stylized geometric curved white S emblem with sweeping crescent tail
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.015, cy - h * 0.165);
    ctx.lineTo(cx - w * 0.18, cy - h * 0.165);
    ctx.quadraticCurveTo(cx - w * 0.31, cy - h * 0.165, cx - w * 0.31, cy - h * 0.045);
    ctx.lineTo(cx - w * 0.31, cy + h * 0.065);
    ctx.quadraticCurveTo(cx - w * 0.31, cy + h * 0.185, cx - w * 0.18, cy + h * 0.185);
    ctx.lineTo(cx + w * 0.05, cy + h * 0.185);
    ctx.bezierCurveTo(cx + w * 0.16, cy + h * 0.24, cx + w * 0.11, cy + h * 0.34, cx - w * 0.06, cy + h * 0.39);
    ctx.bezierCurveTo(cx + w * 0.14, cy + h * 0.37, cx + w * 0.24, cy + h * 0.24, cx + w * 0.21, cy + h * 0.055);
    ctx.lineTo(cx - w * 0.175, cy + h * 0.055);
    ctx.lineTo(cx - w * 0.175, cy - h * 0.045);
    ctx.lineTo(cx - w * 0.015, cy - h * 0.045);
    ctx.closePath();
    ctx.fill();

    // Signature three-tier red Thien Mu pagoda roof & spire centered in lower bridge
    ctx.fillStyle = '#dc2626';
    for (let i = 0; i < 3; i++) {
        const topHalf = w * (0.045 + i * 0.032);
        const botHalf = w * (0.068 + i * 0.036);
        const sy = cy + h * 0.072 + i * h * 0.028;
        const sh = Math.max(1.2, h * 0.017);
        ctx.beginPath();
        ctx.moveTo(cx - topHalf, sy);
        ctx.lineTo(cx + topHalf, sy);
        ctx.lineTo(cx + botHalf, sy + sh);
        ctx.lineTo(cx - botHalf, sy + sh);
        ctx.closePath();
        ctx.fill();
    }
    ctx.fillRect(cx - Math.max(0.9, w * 0.008), cy + h * 0.045, Math.max(1.8, w * 0.016), h * 0.132);

    // Three-ellipse orbital atom with bright red center nucleus
    const ax = cx + w * 0.168;
    const ay = cy - h * 0.095;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(0.9, size * 0.013);
    for (const rot of [0, 1.047, -1.047]) {
        ctx.save();
        ctx.translate(ax, ay);
        ctx.rotate(rot);
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 0.072, size * 0.024, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(ax, ay, Math.max(1.6, size * 0.019), 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    ctx.restore();
}

// Create polo shirt CanvasTexture wrapping back (x=256) and front (x=768) cleanly across side seams
function createPoloShirtTexture() {
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 512;
    const ctx = c.getContext('2d');

    // Crisp off-white breathable cotton pique base with subtle tailoring shading
    const baseGrad = ctx.createLinearGradient(0, 0, 0, 512);
    baseGrad.addColorStop(0, '#ffffff');
    baseGrad.addColorStop(0.75, '#f8fafc');
    baseGrad.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, 1024, 512);

    // Faint vertical side-seam shadows at x=0, x=512, x=1024 and fabric rib crease lines
    for (const sx of [0, 512, 1024]) {
        const sg = ctx.createLinearGradient(sx - 24, 0, sx + 24, 0);
        sg.addColorStop(0, 'rgba(148,163,184,0)');
        sg.addColorStop(0.5, 'rgba(148,163,184,0.16)');
        sg.addColorStop(1, 'rgba(148,163,184,0)');
        ctx.fillStyle = sg;
        ctx.fillRect(sx - 24, 0, 48, 512);
    }

    // Back branding (symmetrically centered around spinal u=0.25 / x=256 so sides stay clean)
    drawHuscShield(ctx, 154, 178, 46);
    ctx.fillStyle = HUSC_NAVY_HEX;
    ctx.fillRect(180, 155, 3, 46);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = '700 16px Inter, sans-serif';
    ctx.fillText('ĐẠI HỌC HUẾ', 189, 166);
    ctx.font = '800 17px Inter, sans-serif';
    ctx.fillText('TRƯỜNG ĐẠI HỌC KHOA HỌC', 189, 189);

    // Front center button placket (x=768) & wearer's left-chest HUSC crest (x=838)
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(753, 18, 30, 178);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.strokeRect(753, 18, 30, 178);
    for (const by of [92, 148]) {
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.arc(768, by, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.4;
        ctx.stroke();
    }
    drawHuscShield(ctx, 842, 188, 52);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
}

// Create dark navy student trouser CanvasTexture with vertical white double side stripes
function createTrouserTexture(outerFlank) {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext('2d');
    ctx.fillStyle = PANTS_NAVY_HEX;
    ctx.fillRect(0, 0, 512, 512);

    // Crisp double athletic white stripes running along outer leg flank (seam u=0/1 left, u=0.5 right)
    ctx.fillStyle = '#ffffff';
    const drawStripesAt = (cx) => {
        ctx.fillRect(cx - 16, 0, 7, 512);
        ctx.fillRect(cx - 3, 0, 7, 512);
        ctx.fillRect(cx + 10, 0, 7, 512);
    };
    if (outerFlank === 'left') {
        drawStripesAt(0);
        drawStripesAt(512);
    } else {
        drawStripesAt(256);
    }

    // Subtle fabric fold shading at top thigh & bottom ankle hem
    const hemGrad = ctx.createLinearGradient(0, 440, 0, 512);
    hemGrad.addColorStop(0, 'rgba(15,23,42,0)');
    hemGrad.addColorStop(1, 'rgba(15,23,42,0.35)');
    ctx.fillStyle = hemGrad;
    ctx.fillRect(0, 440, 512, 72);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
}

// Create printed white student lanyard strap texture matching official HUSC ribbon
function createLanyardTexture() {
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 128;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1024, 128);

    // Subtle satin weave edge border lines
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(0, 0, 1024, 6);
    ctx.fillRect(0, 122, 1024, 6);

    ctx.fillStyle = HUSC_NAVY_HEX;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    // Bilingual alternating repeat clearly legible along flat white lanyard strap
    ctx.font = '800 30px Inter, sans-serif';
    ctx.fillText('ĐẠI HỌC HUẾ', 24, 42);
    ctx.fillText('HUE UNIVERSITY', 540, 42);
    ctx.font = '900 34px Inter, sans-serif';
    ctx.fillText('TRƯỜNG ĐẠI HỌC KHOA HỌC', 24, 86);
    ctx.fillText('UNIVERSITY OF SCIENCES', 540, 86);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.repeat.set(3.4, 1);
    tex.anisotropy = 4;
    return tex;
}

// Build flat body-hugging ribbon geometry along lanyard path so strap text stays readable and flush
function createLanyardRibbonGeometry(curve, ribbonWidth = 0.022, segments = 36) {
    const halfW = ribbonWidth * 0.5;
    const positions = [];
    const uvs = [];
    const indices = [];

    const pos = new THREE.Vector3();
    const tan = new THREE.Vector3();
    const normal = new THREE.Vector3();
    const side = new THREE.Vector3();

    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        curve.getPointAt(t, pos);
        curve.getTangentAt(t, tan);
        normal.set(pos.x, 0, pos.z).normalize();
        side.crossVectors(tan, normal).normalize();

        const pLeft = pos.clone().addScaledVector(side, -halfW);
        const pRight = pos.clone().addScaledVector(side, halfW);
        positions.push(pLeft.x, pLeft.y, pLeft.z, pRight.x, pRight.y, pRight.z);
        uvs.push(t, 0, t, 1);
    }

    for (let i = 0; i < segments; i++) {
        const a = i * 2;
        const b = a + 1;
        const c = a + 2;
        const d = a + 3;
        indices.push(a, c, b, b, c, d);
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    return geom;
}

// Create horizontal plastic Student ID Card CanvasTexture matching HUSC student card layout
function createStudentIdCardTexture() {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 320;
    const ctx = c.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 512, 320);

    // Curved diagonal navy header ribbon matching reference card design
    ctx.strokeStyle = HUSC_NAVY_HEX;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(64, 0);
    ctx.quadraticCurveTo(148, 86, 212, 86);
    ctx.lineTo(512, 86);
    ctx.stroke();

    drawHuscShield(ctx, 214, 44, 52);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(246, 22, 2, 46);

    ctx.fillStyle = HUSC_NAVY_HEX;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = '600 18px Inter, sans-serif';
    ctx.fillText('ĐẠI HỌC HUẾ', 258, 32);
    ctx.font = '800 20px Inter, sans-serif';
    ctx.fillText('TRƯỜNG ĐẠI HỌC KHOA HỌC', 258, 56);

    // Photo frame & stylized portrait bust on card left
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(48, 114, 108, 138);
    ctx.strokeStyle = HUSC_NAVY_HEX;
    ctx.lineWidth = 3;
    ctx.strokeRect(48, 114, 108, 138);
    ctx.fillStyle = '#f2c5a6';
    ctx.beginPath();
    ctx.arc(102, 164, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(102, 244, 40, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(102, 158, 25, Math.PI, 0);
    ctx.fill();

    // Card title & student credentials on card right
    ctx.fillStyle = HUSC_NAVY_HEX;
    ctx.font = '800 32px Inter, sans-serif';
    ctx.fillText('THẺ SINH VIÊN', 184, 132);
    ctx.font = '700 18px Inter, sans-serif';
    ctx.fillText('Họ tên: SINH VIÊN HUSC', 184, 180);
    ctx.font = '600 16px Inter, sans-serif';
    ctx.fillText('Ngành: Công nghệ thông tin', 184, 210);
    ctx.fillText('Khóa học: ĐHKH Huế · K48', 184, 238);
    ctx.font = '700 17px Inter, sans-serif';
    ctx.fillText('MSV: 24T1020001', 42, 282);

    // Thin plastic card outer border
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, 508, 316);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
}

// Create friendly natural university student facial CanvasTexture wrapped on cranium
function createStudentFaceTexture() {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#f2c5a6';
    ctx.fillRect(0, 0, 512, 256);

    // Face center at u=0.75 (x=384) aligned cleanly with -Z forward head orientation
    const fx = 384;
    // Soft cheek warmth
    for (const sx of [fx - 38, fx + 38]) {
        const bg = ctx.createRadialGradient(sx, 142, 2, sx, 142, 18);
        bg.addColorStop(0, 'rgba(232, 130, 118, 0.25)');
        bg.addColorStop(1, 'rgba(232, 130, 118, 0)');
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.arc(sx, 142, 18, 0, Math.PI * 2);
        ctx.fill();
    }

    // Natural eyebrows & expressive dark eyes
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    for (const dir of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(fx + dir * 13, 108);
        ctx.quadraticCurveTo(fx + dir * 24, 103, fx + dir * 35, 109);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(fx + dir * 24, 123, 8.5, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1f2937';
        ctx.beginPath();
        ctx.arc(fx + dir * 24, 123, 4.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(fx + dir * 22.5, 121.2, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }

    // Subtle gentle smile & nose shadow
    ctx.strokeStyle = 'rgba(180, 112, 86, 0.55)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(fx, 140, 4, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    ctx.strokeStyle = '#b45d54';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(fx, 152, 14, 0.20 * Math.PI, 0.80 * Math.PI);
    ctx.stroke();

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
}

// Build arched curved visor brim geometry matching genuine baseball cap curvature
function createCurvedCapVisorGeometry() {
    const segU = 14;
    const segV = 8;
    const widthHalf = 0.125;
    const depthLen = 0.145;
    const thickness = 0.011;

    const vertices = [];
    const indices = [];

    // Generate top and bottom surface vertex rings cleanly
    for (const face of [1, -1]) {
        for (let iv = 0; iv <= segV; iv++) {
            const v = iv / segV;
            for (let iu = 0; iu <= segU; iu++) {
                const u = (iu / segU) * 2 - 1;
                const arcFactor = Math.sqrt(Math.max(0.0, 1.0 - 0.62 * u * u));
                const z = 0.015 - v * depthLen * arcFactor;
                const x = u * widthHalf * (0.94 + 0.08 * arcFactor);
                const camberY = -0.024 * u * u - 0.032 * v + (face > 0 ? thickness * 0.5 : -thickness * 0.5);
                vertices.push(x, camberY, z);
            }
        }
    }

    const ringCount = (segV + 1) * (segU + 1);
    // Top faces (counter-clockwise looking down +Y) and bottom faces
    for (let iv = 0; iv < segV; iv++) {
        for (let iu = 0; iu < segU; iu++) {
            const a = iv * (segU + 1) + iu;
            const b = a + 1;
            const c = a + (segU + 1);
            const d = c + 1;
            indices.push(a, b, d, a, d, c);

            const ba = ringCount + a;
            const bb = ringCount + b;
            const bc = ringCount + c;
            const bd = ringCount + d;
            indices.push(ba, bd, bb, ba, bc, bd);
        }
    }
    // Stitch front curved lip between top and bottom rims
    const topFront = segV * (segU + 1);
    const botFront = ringCount + topFront;
    for (let iu = 0; iu < segU; iu++) {
        indices.push(
            topFront + iu, topFront + iu + 1, botFront + iu + 1,
            topFront + iu, botFront + iu + 1, botFront + iu
        );
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    return geom;
}

// Build complete HUSC Uniform Cap (white 6-panel crown, HUSC front shield, dark navy visor, rear buckle strap)
function createHuscUniformCap(hairMat) {
    const capGroup = new THREE.Group();

    const whiteCapMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.72, metalness: 0.02 });
    const navyVisorMat = new THREE.MeshStandardMaterial({ color: HUSC_NAVY, roughness: 0.65, metalness: 0.04 });
    const buckleMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.3, metalness: 0.8 });

    // Front forehead cap crest CanvasTexture positioned slightly proud of crown front curve
    const crestCanvas = document.createElement('canvas');
    crestCanvas.width = 256;
    crestCanvas.height = 256;
    const cctx = crestCanvas.getContext('2d');
    cctx.clearRect(0, 0, 256, 256);
    drawHuscShield(cctx, 128, 128, 196);
    const crestTex = new THREE.CanvasTexture(crestCanvas);
    crestTex.colorSpace = THREE.SRGBColorSpace;
    crestTex.anisotropy = 4;

    // Batched white 6-panel crown, button, rear band & buckle strap preserving curved contours
    const crownGeom = new THREE.SphereGeometry(0.144, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.56);
    crownGeom.scale(1.02, 0.90, 1.12);
    const capWhiteGeom = mergeAvatarParts([
        { geom: crownGeom, pos: [0, 0.015, 0.004] },
        { geom: new THREE.CylinderGeometry(0.012, 0.013, 0.014, 10), pos: [0, 0.144, 0.004] },
        { geom: new THREE.CylinderGeometry(0.142, 0.144, 0.032, 16, 1, false, -Math.PI * 0.18, Math.PI * 0.36), pos: [0, 0.002, 0.016] },
        { geom: new THREE.BoxGeometry(0.11, 0.020, 0.016), pos: [0, 0.004, 0.157] }
    ], false);
    const capWhiteMesh = new THREE.Mesh(capWhiteGeom, whiteCapMat);
    capWhiteMesh.castShadow = true;
    capGroup.add(capWhiteMesh);

    const backHairPatch = new THREE.Mesh(new THREE.SphereGeometry(0.056, 10, 8), hairMat);
    backHairPatch.scale.set(1.15, 0.72, 0.45);
    backHairPatch.position.set(0, 0.022, 0.142);
    capGroup.add(backHairPatch);

    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.024, 0.020), buckleMat);
    buckle.position.set(0.034, 0.004, 0.160);
    capGroup.add(buckle);

    // Dark navy curved visor over forehead
    const visor = new THREE.Mesh(createCurvedCapVisorGeometry(), navyVisorMat);
    visor.position.set(0, 0.005, -0.105);
    visor.castShadow = true;
    capGroup.add(visor);

    // HUSC blue shield crest emblem hugging front spherical crown panel facing -Z
    const crestGeom = new THREE.SphereGeometry(0.1475, 12, 8, Math.PI * 1.38, Math.PI * 0.24, Math.PI * 0.21, Math.PI * 0.24);
    crestGeom.scale(1.02, 0.90, 1.12);
    const crestPatch = new THREE.Mesh(
        crestGeom,
        new THREE.MeshBasicMaterial({ map: crestTex, transparent: true, polygonOffset: true, polygonOffsetFactor: -2 })
    );
    crestPatch.position.set(0, 0.015, 0.004);
    capGroup.add(crestPatch);

    // Slight natural backward tilt for open facial visibility
    capGroup.rotation.x = 0.08;
    return capGroup;
}

// Build complete anatomically proportioned HUSC Student Character with articulated joints and branded accessories
export function createHuscStudentAvatar() {
    const root = new THREE.Group();

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xf2c5a6, roughness: 0.72, metalness: 0.02 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x1b222c, roughness: 0.86 });
    const poloMat = new THREE.MeshStandardMaterial({ map: createPoloShirtTexture(), roughness: 0.72, metalness: 0.02 });
    const sleeveWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.72, metalness: 0.02 });
    const collarNavyMat = new THREE.MeshStandardMaterial({ color: HUSC_NAVY, roughness: 0.68, metalness: 0.03 });
    const shoeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.45, metalness: 0.05 });
    const soleMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.65 });
    const lanyardMat = new THREE.MeshStandardMaterial({
        map: createLanyardTexture(),
        roughness: 0.55,
        side: THREE.DoubleSide
    });
    const idCardMat = new THREE.MeshStandardMaterial({ map: createStudentIdCardTexture(), roughness: 0.35, metalness: 0.08 });
    const clipSilverMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.85, roughness: 0.25 });

    // Subtle ground locator ring underneath student sneakers
    const footRing = new THREE.Mesh(
        new THREE.RingGeometry(0.38, 0.50, 24),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.52, side: THREE.DoubleSide })
    );
    footRing.rotation.x = -Math.PI * 0.5;
    footRing.position.y = 0.035;
    root.add(footRing);

    const bodyPivot = new THREE.Group();
    root.add(bodyPivot);

    // 1. Articulated Pelvis, Navy Uniform Trousers with White Stripes & Athletic White Sneakers
    const pelvisGeom = new THREE.SphereGeometry(0.155, 16, 10);
    pelvisGeom.scale(1.16, 0.58, 0.78);
    const pelvis = new THREE.Mesh(
        pelvisGeom,
        new THREE.MeshStandardMaterial({ color: PANTS_NAVY_HEX, roughness: 0.78 })
    );
    pelvis.position.set(0, 0.84, 0);
    pelvis.castShadow = true;
    bodyPivot.add(pelvis);

    const makeLeg = (offsetX, flankSide) => {
        const legPivot = new THREE.Group();
        legPivot.position.set(offsetX, 0.84, 0);

        const pantsTexMat = new THREE.MeshStandardMaterial({
            map: createTrouserTexture(flankSide),
            roughness: 0.78
        });

        // Contoured upper thigh trouser cylinder merged with knee joint sphere sharing striped pants texture
        const thighGeom = new THREE.CylinderGeometry(0.082, 0.068, 0.40, 14, 1, false, -Math.PI * 0.5, Math.PI * 2);
        const legUpperGeom = mergeAvatarParts([
            { geom: thighGeom, pos: [0, -0.20, 0] },
            { geom: new THREE.SphereGeometry(0.066, 10, 8), pos: [0, -0.40, 0] }
        ], true);
        const legUpper = new THREE.Mesh(legUpperGeom, pantsTexMat);
        legUpper.castShadow = true;
        legPivot.add(legUpper);

        // Lower shin & ankle pivot enabling realistic knee flexion
        const shinPivot = new THREE.Group();
        shinPivot.position.y = -0.40;
        const calfGeom = new THREE.CylinderGeometry(0.066, 0.056, 0.36, 14, 1, false, -Math.PI * 0.5, Math.PI * 2);
        const calf = new THREE.Mesh(calfGeom, pantsTexMat);
        calf.position.y = -0.18;
        calf.castShadow = true;
        shinPivot.add(calf);

        // Sporty sculpted white sneaker facing local -Z forward
        const shoeGroup = new THREE.Group();
        shoeGroup.position.set(0, -0.39, -0.025);

        const soleGeom = new THREE.CapsuleGeometry(0.056, 0.115, 4, 12);
        soleGeom.rotateX(Math.PI * 0.5);
        soleGeom.scale(1.06, 0.38, 1.0);
        const sole = new THREE.Mesh(soleGeom, soleMat);
        sole.position.y = -0.024;
        sole.castShadow = true;
        shoeGroup.add(sole);

        const upperGeom = new THREE.CapsuleGeometry(0.053, 0.10, 6, 12);
        upperGeom.rotateX(Math.PI * 0.5);
        upperGeom.scale(1.0, 0.78, 1.0);
        const upper = new THREE.Mesh(upperGeom, shoeWhiteMat);
        upper.position.set(0, 0.005, 0.005);
        upper.castShadow = true;
        shoeGroup.add(upper);

        const heelTab = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.042, 0.022), collarNavyMat);
        heelTab.position.set(0, 0.022, 0.095);
        shoeGroup.add(heelTab);

        shinPivot.add(shoeGroup);
        legPivot.add(shinPivot);
        return { legPivot, shinPivot };
    };

    const leftLegParts = makeLeg(-0.098, 'left');
    const rightLegParts = makeLeg(0.098, 'right');
    bodyPivot.add(leftLegParts.legPivot, rightLegParts.legPivot);

    // 2. Anatomically Tapered White Polo Torso + Folded Dark Navy Collar
    const torsoGroup = new THREE.Group();
    bodyPivot.add(torsoGroup);

    const torsoProfile = [
        new THREE.Vector2(0.136, 0.83),
        new THREE.Vector2(0.141, 0.93),
        new THREE.Vector2(0.146, 1.03),
        new THREE.Vector2(0.156, 1.13),
        new THREE.Vector2(0.168, 1.23),
        new THREE.Vector2(0.165, 1.31),
        new THREE.Vector2(0.146, 1.355),
        new THREE.Vector2(0.118, 1.395),
        new THREE.Vector2(0.088, 1.43)
    ];
    const torsoGeom = new THREE.LatheGeometry(torsoProfile, 22, -Math.PI * 0.5, Math.PI * 2);
    torsoGeom.scale(1.18, 1.0, 0.74);
    const torsoMesh = new THREE.Mesh(torsoGeom, poloMat);
    torsoMesh.castShadow = true;
    torsoMesh.receiveShadow = true;
    torsoGroup.add(torsoMesh);

    // Batched 3D Dark Navy Blue Polo Collar Ring & Open Front Collar Flaps (#1E3A8A)
    const collarParts = [
        {
            geom: new THREE.CylinderGeometry(0.078, 0.095, 0.052, 16, 1, false, Math.PI * 1.15, Math.PI * 1.70),
            pos: [0, 1.435, 0.005],
            scale: [1.06, 1.0, 1.02]
        }
    ];
    for (const side of [-1, 1]) {
        collarParts.push({
            geom: new THREE.BoxGeometry(0.056, 0.045, 0.016),
            pos: [side * 0.044, 1.425, -0.068],
            rot: [0.38, side * -0.45, side * -0.25]
        });
    }
    const collarMesh = new THREE.Mesh(mergeAvatarParts(collarParts, false), collarNavyMat);
    collarMesh.castShadow = true;
    torsoGroup.add(collarMesh);

    // 3. White HUSC Flat Lanyard Ribbon (tucked neatly under rear collar) + Clasp + Hanging Rectangular Student ID Card
    const lanyardCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.0, 1.430, 0.048),
        new THREE.Vector3(0.064, 1.425, 0.025),
        new THREE.Vector3(0.072, 1.402, -0.056),
        new THREE.Vector3(0.052, 1.345, -0.136),
        new THREE.Vector3(0.024, 1.245, -0.133),
        new THREE.Vector3(0.0, 1.158, -0.130),
        new THREE.Vector3(-0.024, 1.245, -0.133),
        new THREE.Vector3(-0.052, 1.345, -0.136),
        new THREE.Vector3(-0.072, 1.402, -0.056),
        new THREE.Vector3(-0.064, 1.425, 0.025)
    ], true);

    const lanyardGeom = createLanyardRibbonGeometry(lanyardCurve, 0.021, 36);
    const lanyardMesh = new THREE.Mesh(lanyardGeom, lanyardMat);
    lanyardMesh.castShadow = true;
    torsoGroup.add(lanyardMesh);

    const badgePivot = new THREE.Group();
    badgePivot.position.set(0, 1.155, -0.131);
    const clasp = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.022, 8), clipSilverMat);
    clasp.position.y = -0.011;
    badgePivot.add(clasp);

    // Rectangular ID badge facing forward -Z using single front card face + navy body (2 draw calls instead of 6)
    const idCardBody = new THREE.Mesh(new THREE.BoxGeometry(0.118, 0.076, 0.004), collarNavyMat);
    idCardBody.position.set(0, -0.056, -0.002);
    idCardBody.castShadow = true;
    const idCardFace = new THREE.Mesh(new THREE.PlaneGeometry(0.118, 0.076), idCardMat);
    idCardFace.position.set(0, -0.056, -0.0048);
    idCardFace.rotation.y = Math.PI;
    badgePivot.add(idCardBody, idCardFace);
    badgePivot.rotation.x = 0.08;
    torsoGroup.add(badgePivot);

    // 4. Tailored Sloping Shoulders, Polo Sleeves with Navy Cuffs, Seamless Arms & Shaped Hands
    const makeArm = (offsetX, leanSign) => {
        const armPivot = new THREE.Group();
        armPivot.position.set(offsetX, 1.326, 0);

        // Batched shoulder cap + short polo sleeve sharing breathable white pique material
        const shoulderSlopeGeom = new THREE.SphereGeometry(0.046, 16, 12);
        const upperSleeveGeom = mergeAvatarParts([
            { geom: shoulderSlopeGeom, pos: [0, -0.0105, 0], scale: [1.0, 1.0, 0.96] },
            { geom: new THREE.CylinderGeometry(0.046, 0.056, 0.155, 14), pos: [0, -0.088, 0] }
        ], false);
        const upperSleeve = new THREE.Mesh(upperSleeveGeom, sleeveWhiteMat);
        upperSleeve.castShadow = true;
        armPivot.add(upperSleeve);

        // Navy blue branded sleeve cuff trim matching HUSC polo design
        const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.060, 0.062, 0.028, 12), collarNavyMat);
        cuff.position.y = -0.165;
        cuff.castShadow = true;
        armPivot.add(cuff);

        // Seamless upper bicep segment overlapping gently into elbow joint
        const upperSkin = new THREE.Mesh(new THREE.CylinderGeometry(0.047, 0.042, 0.14, 12), skinMat);
        upperSkin.position.y = -0.22;
        upperSkin.castShadow = true;
        armPivot.add(upperSkin);

        // Articulated elbow, forearm & sculpted hand batched per pivot
        const forearmPivot = new THREE.Group();
        forearmPivot.position.y = -0.28;
        const forearmGeom = mergeAvatarParts([
            { geom: new THREE.SphereGeometry(0.043, 10, 8), pos: [0, 0, 0] },
            { geom: new THREE.CylinderGeometry(0.042, 0.032, 0.23, 12), pos: [0, -0.105, 0] },
            { geom: new THREE.SphereGeometry(0.036, 10, 8), pos: [0, -0.245, -0.008], scale: [0.75, 1.38, 1.02] }
        ], false);
        const forearmMesh = new THREE.Mesh(forearmGeom, skinMat);
        forearmMesh.castShadow = true;
        forearmPivot.add(forearmMesh);

        // Natural downward-outward athletic arm drape
        armPivot.rotation.z = leanSign * 0.13;
        armPivot.add(forearmPivot);
        return { armPivot, forearmPivot };
    };

    const leftArmParts = makeArm(-0.172, -1);
    const rightArmParts = makeArm(0.172, 1);
    bodyPivot.add(leftArmParts.armPivot, rightArmParts.armPivot);

    // 5. Natural Neck, Rounded Head, Hair & HUSC Uniform Cap
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.066, 0.12, 12), skinMat);
    neck.position.set(0, 1.47, 0.005);
    neck.castShadow = true;
    bodyPivot.add(neck);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.615, 0.002);

    // Contoured cranium with default phiStart=0 so facial texture u=0.75 faces -Z forward cleanly
    const faceMat = new THREE.MeshStandardMaterial({ map: createStudentFaceTexture(), roughness: 0.68, metalness: 0.02 });
    const headGeom = new THREE.SphereGeometry(0.132, 20, 14);
    headGeom.scale(0.95, 1.12, 1.02);
    const headMesh = new THREE.Mesh(headGeom, faceMat);
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    // Sculpted subtle ears & nose bridge batched into one facial detail mesh
    const facialGeom = mergeAvatarParts([
        { geom: new THREE.SphereGeometry(0.026, 8, 8), pos: [-0.125, -0.01, 0.012], scale: [0.45, 1.15, 0.85] },
        { geom: new THREE.SphereGeometry(0.026, 8, 8), pos: [0.125, -0.01, 0.012], scale: [0.45, 1.15, 0.85] },
        { geom: new THREE.ConeGeometry(0.014, 0.032, 6), pos: [0, -0.012, -0.136], rot: [-Math.PI * 0.42, 0, 0] }
    ], false);
    headGroup.add(new THREE.Mesh(facialGeom, skinMat));

    // Neat natural dark hair covering left/back/right plus front bangs batched into one hair mesh
    const hairGeom = mergeAvatarParts([
        {
            geom: new THREE.SphereGeometry(0.137, 16, 10, -Math.PI * 0.14, Math.PI * 1.28, Math.PI * 0.28, Math.PI * 0.48),
            scale: [0.96, 1.10, 1.04]
        },
        {
            geom: new THREE.SphereGeometry(0.118, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.28),
            pos: [0, 0.062, -0.048],
            rot: [0.30, 0, 0],
            scale: [0.95, 0.38, 0.88]
        }
    ], false);
    headGroup.add(new THREE.Mesh(hairGeom, hairMat));

    // White & Royal Navy HUSC Branded Uniform Cap perched atop head
    const cap = createHuscUniformCap(hairMat);
    cap.position.set(0, 0.048, -0.004);
    headGroup.add(cap);

    bodyPivot.add(headGroup);

    return {
        root,
        bodyPivot,
        torsoGroup,
        headGroup,
        badgePivot,
        leftLeg: leftLegParts.legPivot,
        rightLeg: rightLegParts.legPivot,
        leftShin: leftLegParts.shinPivot,
        rightShin: rightLegParts.shinPivot,
        leftArm: leftArmParts.armPivot,
        rightArm: rightArmParts.armPivot,
        leftForearm: leftArmParts.forearmPivot,
        rightForearm: rightArmParts.forearmPivot
    };
}
