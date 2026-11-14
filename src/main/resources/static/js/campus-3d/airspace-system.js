// Dynamic high-altitude jetliner with smooth ribbon contrails and organic flocking birds
import * as THREE from 'three';

// Build streamlined aerodynamic jetliner with curved fuselage, swept wings, engines, and lights
function createJetAircraftModel() {
    const root = new THREE.Group();

    // Curved fuselage profile revolved around central axis with nose at +Z and tail at -Z
    const fuselageProfile = [
        new THREE.Vector2(0.0, -10.5),
        new THREE.Vector2(0.22, -10.0),
        new THREE.Vector2(0.58, -8.5),
        new THREE.Vector2(0.86, -6.5),
        new THREE.Vector2(0.98, -2.5),
        new THREE.Vector2(1.0, 1.8),
        new THREE.Vector2(0.96, 5.5),
        new THREE.Vector2(0.80, 7.8),
        new THREE.Vector2(0.48, 9.6),
        new THREE.Vector2(0.16, 10.3),
        new THREE.Vector2(0.0, 10.5)
    ];
    const fuselageGeom = new THREE.LatheGeometry(fuselageProfile, 16);
    fuselageGeom.rotateX(Math.PI * 0.5);
    fuselageGeom.computeVertexNormals();

    // Vietnam Airlines signature palette: Lotus Teal Blue, Golden Lotus, Crisp White, and Titanium
    const vnaBlueMat = new THREE.MeshStandardMaterial({
        color: 0x006584,
        roughness: 0.25,
        metalness: 0.28
    });
    const vnaGoldMat = new THREE.MeshStandardMaterial({
        color: 0xe5a93c,
        roughness: 0.30,
        metalness: 0.55
    });
    const aviationWhiteMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.22,
        metalness: 0.20
    });
    const darkEngineMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.40,
        metalness: 0.60
    });
    const rimSilverMat = new THREE.MeshStandardMaterial({
        color: 0xcbd5e1,
        roughness: 0.20,
        metalness: 0.75
    });

    // Procedural Vietnam Airlines livery canvas: white upper body, lotus blue belly, gold cheatline, and windows
    const liveryCanvas = document.createElement('canvas');
    liveryCanvas.width = 512;
    liveryCanvas.height = 256;
    const lCtx = liveryCanvas.getContext('2d');
    if (lCtx) {
        lCtx.fillStyle = '#f8fafc';
        lCtx.fillRect(0, 0, 512, 256);
        lCtx.fillStyle = '#006584';
        lCtx.fillRect(0, 0, 114, 256);
        lCtx.fillRect(398, 0, 114, 256);
        lCtx.fillStyle = '#e5a93c';
        lCtx.fillRect(114, 0, 6, 256);
        lCtx.fillRect(392, 0, 6, 256);
        lCtx.fillStyle = '#0f172a';
        for (let y = 84; y < 210; y += 9) {
            lCtx.fillRect(174, y, 7, 5);
            lCtx.fillRect(331, y, 7, 5);
        }
        lCtx.fillStyle = '#090d16';
        lCtx.fillRect(236, 230, 40, 16);
    }
    const fuselageTex = new THREE.CanvasTexture(liveryCanvas);
    fuselageTex.wrapS = THREE.RepeatWrapping;
    fuselageTex.wrapT = THREE.ClampToEdgeWrapping;
    fuselageTex.colorSpace = THREE.SRGBColorSpace;
    const fuselageMat = new THREE.MeshStandardMaterial({
        map: fuselageTex,
        roughness: 0.22,
        metalness: 0.22
    });
    const fuselageMesh = new THREE.Mesh(fuselageGeom, fuselageMat);
    fuselageMesh.castShadow = false;
    root.add(fuselageMesh);

    // Streamlined curved cockpit visor glass near the forward nose (+Z)
    const visorGeom = new THREE.CylinderGeometry(0.72, 0.90, 1.4, 14, 1, false, Math.PI * 0.72, Math.PI * 0.56);
    visorGeom.rotateZ(Math.PI * 0.5);
    visorGeom.translate(0, 0.48, 7.2);
    const visorMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.08,
        metalness: 0.85
    });
    const visorMesh = new THREE.Mesh(visorGeom, visorMat);
    root.add(visorMesh);

    // Aerodynamic swept wings with beveled edges angled back towards the tail (-Z)
    const wingShape = new THREE.Shape();
    wingShape.moveTo(-0.95, 1.8);
    wingShape.lineTo(-9.4, -3.3);
    wingShape.lineTo(-9.2, -4.4);
    wingShape.lineTo(-0.95, -1.6);
    wingShape.closePath();

    const wingExtrudeSettings = {
        depth: 0.16,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 1,
        bevelSize: 0.04,
        bevelThickness: 0.04
    };
    const leftWingGeom = new THREE.ExtrudeGeometry(wingShape, wingExtrudeSettings);
    leftWingGeom.rotateX(Math.PI * 0.5);
    leftWingGeom.computeVertexNormals();
    const leftWingMesh = new THREE.Mesh(leftWingGeom, aviationWhiteMat);
    leftWingMesh.position.set(0, -0.12, 0);
    root.add(leftWingMesh);

    // Symmetrical right swept wing
    const rightWingShape = new THREE.Shape();
    rightWingShape.moveTo(0.95, 1.8);
    rightWingShape.lineTo(9.4, -3.3);
    rightWingShape.lineTo(9.2, -4.4);
    rightWingShape.lineTo(0.95, -1.6);
    rightWingShape.closePath();

    const rightWingGeom = new THREE.ExtrudeGeometry(rightWingShape, wingExtrudeSettings);
    rightWingGeom.rotateX(Math.PI * 0.5);
    rightWingGeom.computeVertexNormals();
    const rightWingMesh = new THREE.Mesh(rightWingGeom, aviationWhiteMat);
    rightWingMesh.position.set(0, -0.12, 0);
    root.add(rightWingMesh);

    // Left and right wingtip winglets angled upward in Vietnam Airlines Lotus Blue with golden tip
    const wingletGeom = new THREE.BoxGeometry(0.12, 0.85, 1.1);
    wingletGeom.translate(0, 0.42, 0);
    const leftWinglet = new THREE.Mesh(wingletGeom, vnaBlueMat);
    leftWinglet.position.set(-9.35, -0.05, -3.8);
    leftWinglet.rotation.z = -0.18;
    root.add(leftWinglet);

    const leftWingletTip = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.16, 1.12), vnaGoldMat);
    leftWingletTip.position.set(0, 0.78, 0);
    leftWinglet.add(leftWingletTip);

    const rightWinglet = new THREE.Mesh(wingletGeom, vnaBlueMat);
    rightWinglet.position.set(9.35, -0.05, -3.8);
    rightWinglet.rotation.z = 0.18;
    root.add(rightWinglet);

    const rightWingletTip = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.16, 1.12), vnaGoldMat);
    rightWingletTip.position.set(0, 0.78, 0);
    rightWinglet.add(rightWingletTip);

    // Twin turbofan jet engines in Vietnam Airlines Lotus Blue with silver lip ring
    const engineNacelleGeom = new THREE.CylinderGeometry(0.46, 0.42, 2.6, 14);
    engineNacelleGeom.rotateX(Math.PI * 0.5);
    engineNacelleGeom.computeVertexNormals();

    const engineRimGeom = new THREE.TorusGeometry(0.44, 0.04, 8, 16);
    engineRimGeom.translate(0, 0, 1.3);

    const engineIntakeGeom = new THREE.CylinderGeometry(0.38, 0.12, 0.6, 12);
    engineIntakeGeom.rotateX(Math.PI * 0.5);

    const createTurbofan = (x) => {
        const engGroup = new THREE.Group();
        const nacelle = new THREE.Mesh(engineNacelleGeom, vnaBlueMat);
        const rim = new THREE.Mesh(engineRimGeom, rimSilverMat);
        const intake = new THREE.Mesh(engineIntakeGeom, darkEngineMat);
        intake.position.set(0, 0, 1.1);
        engGroup.add(nacelle);
        engGroup.add(rim);
        engGroup.add(intake);
        engGroup.position.set(x, -0.62, -0.8);
        return engGroup;
    };
    root.add(createTurbofan(-3.4));
    root.add(createTurbofan(3.4));

    // Vertical swept tail fin stabilizer seated cleanly on top rear fuselage with zero orphaned geometry
    const finGeom = new THREE.BufferGeometry();
    const finPositions = new Float32Array([
        -0.08, 0.82, -6.40,
        +0.08, 0.82, -6.40,
        -0.03, 4.15, -9.40,
        +0.03, 4.15, -9.40,
        -0.03, 3.90, -10.35,
        +0.03, 3.90, -10.35,
        -0.07, 0.35, -10.25,
        +0.07, 0.35, -10.25
    ]);
    const finIndices = [
        0, 2, 4,  0, 4, 6,
        1, 5, 3,  1, 7, 5,
        0, 3, 2,  0, 1, 3,
        4, 5, 7,  4, 7, 6,
        2, 3, 5,  2, 5, 4,
        0, 6, 7,  0, 7, 1
    ];
    finGeom.setAttribute('position', new THREE.BufferAttribute(finPositions, 3));
    finGeom.setIndex(finIndices);
    finGeom.computeVertexNormals();
    const finMesh = new THREE.Mesh(finGeom, vnaBlueMat);
    root.add(finMesh);

    // Vietnam Airlines Golden Lotus emblem attached to both sides of the tail fin
    const createGoldenLotus = (sideSign) => {
        const lotusGroup = new THREE.Group();
        const petalGeom = new THREE.ConeGeometry(0.22, 0.88, 6);
        petalGeom.scale(0.25, 1.0, 0.14);

        const centerPetal = new THREE.Mesh(petalGeom, vnaGoldMat);
        centerPetal.position.set(0, 0.08, 0);
        lotusGroup.add(centerPetal);

        const leftPetal = new THREE.Mesh(petalGeom, vnaGoldMat);
        leftPetal.position.set(0, 0.04, 0.22);
        leftPetal.rotation.x = 0.38;
        leftPetal.scale.set(0.22, 0.78, 0.12);
        lotusGroup.add(leftPetal);

        const rightPetal = new THREE.Mesh(petalGeom, vnaGoldMat);
        rightPetal.position.set(0, 0.04, -0.22);
        rightPetal.rotation.x = -0.38;
        rightPetal.scale.set(0.22, 0.78, 0.12);
        lotusGroup.add(rightPetal);

        lotusGroup.position.set(sideSign * 0.042, 2.65, -8.85);
        return lotusGroup;
    };
    root.add(createGoldenLotus(-1));
    root.add(createGoldenLotus(1));

    // Horizontal tail stabilizers at the rear fuselage
    const hTailShape = new THREE.Shape();
    hTailShape.moveTo(0, -8.2);
    hTailShape.lineTo(-3.4, -10.4);
    hTailShape.lineTo(-3.2, -11.0);
    hTailShape.lineTo(0, -9.8);
    hTailShape.closePath();
    const leftHTailGeom = new THREE.ExtrudeGeometry(hTailShape, { depth: 0.10, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02 });
    leftHTailGeom.rotateX(Math.PI * 0.5);
    leftHTailGeom.computeVertexNormals();
    const leftHTail = new THREE.Mesh(leftHTailGeom, aviationWhiteMat);
    leftHTail.position.set(0, 0.48, 0);
    root.add(leftHTail);

    const hTailRightShape = new THREE.Shape();
    hTailRightShape.moveTo(0, -8.2);
    hTailRightShape.lineTo(3.4, -10.4);
    hTailRightShape.lineTo(3.2, -11.0);
    hTailRightShape.lineTo(0, -9.8);
    hTailRightShape.closePath();
    const rightHTailGeom = new THREE.ExtrudeGeometry(hTailRightShape, { depth: 0.10, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02 });
    rightHTailGeom.rotateX(Math.PI * 0.5);
    rightHTailGeom.computeVertexNormals();
    const rightHTail = new THREE.Mesh(rightHTailGeom, aviationWhiteMat);
    rightHTail.position.set(0, 0.48, 0);
    root.add(rightHTail);

    // Navigation and anti-collision strobe beacon lights
    const navLightGeom = new THREE.SphereGeometry(0.12, 6, 6);
    const redLight = new THREE.Mesh(navLightGeom, new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    redLight.position.set(-9.4, 0.85, -3.8);
    root.add(redLight);

    const greenLight = new THREE.Mesh(navLightGeom, new THREE.MeshBasicMaterial({ color: 0x22c55e }));
    greenLight.position.set(9.4, 0.85, -3.8);
    root.add(greenLight);

    const strobeLight = new THREE.Mesh(navLightGeom, new THREE.MeshBasicMaterial({ color: 0xffffff }));
    strobeLight.position.set(0, 4.2, -9.8);
    root.add(strobeLight);

    return { root, strobeLight };
}

// Build dual-engine continuous ribbon mesh for smooth aerodynamic vapor contrails
function createContrailRibbonMesh(segmentCount = 42) {
    const totalVerts = segmentCount * 2 * 2;
    const positions = new Float32Array(totalVerts * 3);
    const alphas = new Float32Array(totalVerts);
    const uvs = new Float32Array(totalVerts * 2);

    const indices = [];
    for (let engine = 0; engine < 2; engine++) {
        const offset = engine * segmentCount * 2;
        for (let s = 0; s < segmentCount - 1; s++) {
            const v0 = offset + s * 2;
            const v1 = v0 + 1;
            const v2 = offset + (s + 1) * 2;
            const v3 = v2 + 1;
            indices.push(v0, v1, v2);
            indices.push(v2, v1, v3);
        }
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));
    geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geom.setIndex(indices);

    const mat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.NormalBlending,
        vertexShader: `
            attribute float aAlpha;
            varying float vAlpha;
            varying vec2 vUv;
            void main() {
                vAlpha = aAlpha;
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying float vAlpha;
            varying vec2 vUv;
            void main() {
                float d = abs(vUv.x - 0.5) * 2.0;
                float feather = 1.0 - smoothstep(0.0, 1.0, d);
                feather = pow(feather, 1.6);
                vec3 col = vec3(0.97, 0.98, 1.0);
                gl_FragColor = vec4(col, feather * vAlpha);
            }
        `
    });

    const mesh = new THREE.Mesh(geom, mat);
    mesh.frustumCulled = false;

    // History buffers recording engine nozzle world positions over time
    const createHistory = () => {
        const pts = [];
        for (let i = 0; i < segmentCount; i++) {
            pts.push({ x: 0, y: -200, z: 0, age: 999 });
        }
        return pts;
    };
    const leftHistory = createHistory();
    const rightHistory = createHistory();

    return { mesh, geom, leftHistory, rightHistory, segmentCount, positions, alphas, uvs };
}

// Create complete high-altitude jet airliner system cruising across campus airspace
function createJetAircraftSystem(scene, hardwareProfile = { tier: 'high' }) {
    const isLowTier = hardwareProfile.tier === 'low';
    const SEGMENT_COUNT = isLowTier ? 28 : 42;

    const { root: aircraft, strobeLight } = createJetAircraftModel();
    aircraft.visible = false;
    scene.add(aircraft);

    const contrail = createContrailRibbonMesh(SEGMENT_COUNT);
    scene.add(contrail.mesh);

    // Diverse low-altitude flight paths crossing directly above campus just above flocking birds
    const FLIGHT_PATHS = [
        // Path 1: Southwest to Northeast diagonal crossing the central courtyard
        { start: new THREE.Vector3(-190, 52, 140), end: new THREE.Vector3(190, 52, -140) },
        // Path 2: South to North directly above the main 77 Nguyen Hue gate and central building
        { start: new THREE.Vector3(-13, 56, 180), end: new THREE.Vector3(-13, 56, -180) },
        // Path 3: Southeast to Northwest diagonal across the campus sky
        { start: new THREE.Vector3(180, 54, 130), end: new THREE.Vector3(-180, 54, -130) },
        // Path 4: West to East lateral flyover over the main plaza and courtyard
        { start: new THREE.Vector3(-190, 50, 15), end: new THREE.Vector3(190, 50, 15) },
        // Path 5: Northeast to Southwest return diagonal
        { start: new THREE.Vector3(170, 53, -140), end: new THREE.Vector3(-170, 53, 140) }
    ];

    let pathIdx = 0;
    let flightProgress = 0;
    let flightSpeed = 22.0;
    let pathLength = 1.0;
    let isActive = false;
    let spawnTimer = 0.5;
    let sampleTimer = 0;

    const currentStart = new THREE.Vector3();
    const currentEnd = new THREE.Vector3();
    const currentDir = new THREE.Vector3();
    const curPos = new THREE.Vector3();
    const leftExhaustLocal = new THREE.Vector3(-3.4, -0.62, -2.1);
    const rightExhaustLocal = new THREE.Vector3(3.4, -0.62, -2.1);
    const leftWorld = new THREE.Vector3();
    const rightWorld = new THREE.Vector3();
    const normal = new THREE.Vector3();

    // Start a new scheduled high-altitude overflight
    const startOverflight = () => {
        const path = FLIGHT_PATHS[pathIdx % FLIGHT_PATHS.length];
        pathIdx++;
        currentStart.copy(path.start);
        currentEnd.copy(path.end);
        pathLength = currentStart.distanceTo(currentEnd);
        currentDir.subVectors(currentEnd, currentStart).normalize();
        flightSpeed = 20.0 + Math.random() * 6.0;
        flightProgress = 0;
        isActive = true;
        aircraft.visible = true;

        curPos.copy(currentStart);
        aircraft.position.copy(curPos);
        const lookTarget = curPos.clone().add(currentDir);
        aircraft.lookAt(lookTarget);

        // Reset contrail history buffers
        for (let i = 0; i < SEGMENT_COUNT; i++) {
            contrail.leftHistory[i].y = -200;
            contrail.leftHistory[i].age = 999;
            contrail.rightHistory[i].y = -200;
            contrail.rightHistory[i].age = 999;
        }
    };

    // Update aircraft flight physics, strobe blink, and smooth contrail expansion
    const update = (dt, elapsedSec) => {
        const safeDt = Math.min(dt, 0.05);

        if (!isActive) {
            spawnTimer -= safeDt;
            if (spawnTimer <= 0) {
                startOverflight();
            }
        } else {
            flightProgress += (flightSpeed * safeDt) / pathLength;
            if (flightProgress >= 1.0) {
                isActive = false;
                aircraft.visible = false;
                spawnTimer = 1.2 + Math.random() * 1.5;
            } else {
                curPos.lerpVectors(currentStart, currentEnd, flightProgress);
                aircraft.position.copy(curPos);
                aircraft.lookAt(curPos.clone().add(currentDir));

                // Anti-collision strobe light pulses every 1.25s
                strobeLight.visible = (elapsedSec % 1.25) < 0.12;

                // Sample contrail points behind engines
                sampleTimer += safeDt;
                if (sampleTimer >= 0.038) {
                    sampleTimer = 0;
                    aircraft.localToWorld(leftWorld.copy(leftExhaustLocal));
                    aircraft.localToWorld(rightWorld.copy(rightExhaustLocal));

                    for (let i = SEGMENT_COUNT - 1; i > 0; i--) {
                        const lPrev = contrail.leftHistory[i - 1];
                        const lCur = contrail.leftHistory[i];
                        lCur.x = lPrev.x;
                        lCur.y = lPrev.y;
                        lCur.z = lPrev.z;
                        lCur.age = lPrev.age + safeDt;

                        const rPrev = contrail.rightHistory[i - 1];
                        const rCur = contrail.rightHistory[i];
                        rCur.x = rPrev.x;
                        rCur.y = rPrev.y;
                        rCur.z = rPrev.z;
                        rCur.age = rPrev.age + safeDt;
                    }

                    contrail.leftHistory[0].x = leftWorld.x;
                    contrail.leftHistory[0].y = leftWorld.y;
                    contrail.leftHistory[0].z = leftWorld.z;
                    contrail.leftHistory[0].age = 0;

                    contrail.rightHistory[0].x = rightWorld.x;
                    contrail.rightHistory[0].y = rightWorld.y;
                    contrail.rightHistory[0].z = rightWorld.z;
                    contrail.rightHistory[0].age = 0;
                }
            }
        }

        // Recompute ribbon mesh vertex positions and fading alpha
        normal.set(-currentDir.z, 0, currentDir.x).normalize();
        const posArr = contrail.positions;
        const alphaArr = contrail.alphas;
        const uvArr = contrail.uvs;

        const fillEngineRibbon = (history, baseVertexOffset) => {
            for (let s = 0; s < SEGMENT_COUNT; s++) {
                const pt = history[s];
                const vLeftIdx = (baseVertexOffset + s * 2) * 3;
                const vRightIdx = (baseVertexOffset + s * 2 + 1) * 3;
                const aLeftIdx = baseVertexOffset + s * 2;
                const aRightIdx = aLeftIdx + 1;
                const uvLeftIdx = (baseVertexOffset + s * 2) * 2;
                const uvRightIdx = (baseVertexOffset + s * 2 + 1) * 2;

                if (pt.y < -100 || pt.age > 16.0) {
                    posArr[vLeftIdx] = 0; posArr[vLeftIdx + 1] = -200; posArr[vLeftIdx + 2] = 0;
                    posArr[vRightIdx] = 0; posArr[vRightIdx + 1] = -200; posArr[vRightIdx + 2] = 0;
                    alphaArr[aLeftIdx] = 0;
                    alphaArr[aRightIdx] = 0;
                    continue;
                }

                // Expand contrail width gracefully from 0.45m at nozzle to 3.4m downwind
                const segNorm = s / (SEGMENT_COUNT - 1);
                const halfW = 0.22 + segNorm * 1.55;

                posArr[vLeftIdx] = pt.x + normal.x * halfW;
                posArr[vLeftIdx + 1] = pt.y + 0.12;
                posArr[vLeftIdx + 2] = pt.z + normal.z * halfW;

                posArr[vRightIdx] = pt.x - normal.x * halfW;
                posArr[vRightIdx + 1] = pt.y - 0.12;
                posArr[vRightIdx + 2] = pt.z - normal.z * halfW;

                uvArr[uvLeftIdx] = 0.0; uvArr[uvLeftIdx + 1] = segNorm;
                uvArr[uvRightIdx] = 1.0; uvArr[uvRightIdx + 1] = segNorm;

                // Delayed condensation rising quickly, then dissipating gently to 0
                let alpha = 0.0;
                if (s < 2) alpha = (s / 2) * 0.70;
                else alpha = Math.max(0.0, 0.72 * (1.0 - Math.pow(segNorm, 1.25)));

                alphaArr[aLeftIdx] = alpha;
                alphaArr[aRightIdx] = alpha;
            }
        };

        fillEngineRibbon(contrail.leftHistory, 0);
        fillEngineRibbon(contrail.rightHistory, SEGMENT_COUNT * 2);

        contrail.geom.attributes.position.needsUpdate = true;
        contrail.geom.attributes.aAlpha.needsUpdate = true;
        contrail.geom.attributes.uv.needsUpdate = true;
    };

    return { update };
}

// Build organic bird model with curved dihedral wings and dual-segment flapping joints
function createBirdModel(featherColorHex = 0x1e293b) {
    const root = new THREE.Group();

    // Streamlined aerodynamic avian torso
    const torsoGeom = new THREE.ConeGeometry(0.12, 0.78, 8);
    torsoGeom.rotateX(-Math.PI * 0.5);
    torsoGeom.translate(0, 0, 0.08);
    torsoGeom.computeVertexNormals();

    const birdMat = new THREE.MeshStandardMaterial({
        color: featherColorHex,
        roughness: 0.42,
        metalness: 0.18,
        side: THREE.DoubleSide
    });
    const torsoMesh = new THREE.Mesh(torsoGeom, birdMat);
    torsoMesh.castShadow = false;
    root.add(torsoMesh);

    // Beak and head
    const headGeom = new THREE.SphereGeometry(0.085, 8, 6);
    headGeom.translate(0, 0.02, -0.36);
    headGeom.computeVertexNormals();
    const headMesh = new THREE.Mesh(headGeom, birdMat);
    root.add(headMesh);

    // Left inner wing
    const leftInnerShape = new THREE.Shape();
    leftInnerShape.moveTo(0, -0.14);
    leftInnerShape.lineTo(-0.42, -0.06);
    leftInnerShape.lineTo(-0.38, 0.20);
    leftInnerShape.lineTo(0, 0.16);
    leftInnerShape.closePath();

    const leftInnerGeom = new THREE.ShapeGeometry(leftInnerShape);
    leftInnerGeom.computeVertexNormals();
    const leftInnerMesh = new THREE.Mesh(leftInnerGeom, birdMat);

    const leftWingRoot = new THREE.Group();
    leftWingRoot.position.set(-0.08, 0.02, 0.0);
    leftWingRoot.add(leftInnerMesh);

    // Left outer wingtip attached to elbow joint
    const leftTipShape = new THREE.Shape();
    leftTipShape.moveTo(0, -0.06);
    leftTipShape.lineTo(-0.54, 0.14);
    leftTipShape.lineTo(0, 0.20);
    leftTipShape.closePath();

    const leftTipGeom = new THREE.ShapeGeometry(leftTipShape);
    leftTipGeom.computeVertexNormals();
    const leftTipMesh = new THREE.Mesh(leftTipGeom, birdMat);

    const leftTipRoot = new THREE.Group();
    leftTipRoot.position.set(-0.40, 0, 0);
    leftTipRoot.add(leftTipMesh);
    leftWingRoot.add(leftTipRoot);
    root.add(leftWingRoot);

    // Right inner wing
    const rightInnerShape = new THREE.Shape();
    rightInnerShape.moveTo(0, -0.14);
    rightInnerShape.lineTo(0.42, -0.06);
    rightInnerShape.lineTo(0.38, 0.20);
    rightInnerShape.lineTo(0, 0.16);
    rightInnerShape.closePath();

    const rightInnerGeom = new THREE.ShapeGeometry(rightInnerShape);
    rightInnerGeom.computeVertexNormals();
    const rightInnerMesh = new THREE.Mesh(rightInnerGeom, birdMat);

    const rightWingRoot = new THREE.Group();
    rightWingRoot.position.set(0.08, 0.02, 0.0);
    rightWingRoot.add(rightInnerMesh);

    // Right outer wingtip attached to elbow joint
    const rightTipShape = new THREE.Shape();
    rightTipShape.moveTo(0, -0.06);
    rightTipShape.lineTo(0.54, 0.14);
    rightTipShape.lineTo(0, 0.20);
    rightTipShape.closePath();

    const rightTipGeom = new THREE.ShapeGeometry(rightTipShape);
    rightTipGeom.computeVertexNormals();
    const rightTipMesh = new THREE.Mesh(rightTipGeom, birdMat);

    const rightTipRoot = new THREE.Group();
    rightTipRoot.position.set(0.40, 0, 0);
    rightTipRoot.add(rightTipMesh);
    rightWingRoot.add(rightTipRoot);
    root.add(rightWingRoot);

    return { root, leftWingRoot, leftTipRoot, rightWingRoot, rightTipRoot };
}

// Create flock of birds with natural boids trajectories, banking turns, and sine-wave flapping
function createFlockingBirdsSystem(scene, hardwareProfile = { tier: 'high' }) {
    const isLowTier = hardwareProfile.tier === 'low';
    const BIRD_COUNT = isLowTier ? 7 : 12;

    const birds = [];
    const birdColors = [0x1e293b, 0x334155, 0x0f172a, 0x475569];

    for (let i = 0; i < BIRD_COUNT; i++) {
        const col = birdColors[i % birdColors.length];
        const birdObj = createBirdModel(col);
        scene.add(birdObj.root);

        birds.push({
            model: birdObj,
            pos: new THREE.Vector3(
                (Math.random() - 0.5) * 40,
                32 + Math.random() * 10,
                (Math.random() - 0.5) * 40
            ),
            vel: new THREE.Vector3(0, 0, 0),
            yaw: 0,
            pitch: 0,
            roll: 0,
            flapPhase: Math.random() * Math.PI * 2,
            flapFreq: 4.2 + Math.random() * 0.8,
            flapAmp: 0.65,
            glideTimer: 2.0 + Math.random() * 3.0,
            isGliding: false,
            offset: new THREE.Vector3(
                (Math.random() - 0.5) * 14.0,
                (Math.random() - 0.5) * 5.0,
                (Math.random() - 0.5) * 16.0
            )
        });
    }

    const flockCenterTarget = new THREE.Vector3();
    const desiredVel = new THREE.Vector3();
    const forwardVec = new THREE.Vector3();

    // Advance flock pathing, collision avoidance, and wing flapping kinematics
    const update = (dt, elapsedSec) => {
        const safeDt = Math.min(dt, 0.05);

        // Smooth looping 3D trajectory weaving gracefully above campus buildings and trees
        const t = elapsedSec * 0.22;
        flockCenterTarget.set(
            72.0 * Math.sin(t) + 16.0 * Math.cos(t * 2.0),
            34.0 + 8.0 * Math.sin(t * 1.4),
            24.0 + 58.0 * Math.cos(t) + 14.0 * Math.sin(t * 2.2)
        );

        for (let i = 0; i < BIRD_COUNT; i++) {
            const b = birds[i];

            // Cohesion to individual slot in flock
            const targetPos = flockCenterTarget.clone().add(b.offset);
            desiredVel.subVectors(targetPos, b.pos);
            const distToTarget = desiredVel.length();
            desiredVel.normalize();

            const cruiseSpeed = 11.5 + Math.sin(elapsedSec + i) * 1.5;
            desiredVel.multiplyScalar(cruiseSpeed);

            // Separation from neighboring birds
            for (let j = 0; j < BIRD_COUNT; j++) {
                if (i === j) continue;
                const other = birds[j];
                const diff = b.pos.clone().sub(other.pos);
                const d = diff.length();
                if (d > 0.01 && d < 3.2) {
                    diff.normalize().multiplyScalar((3.2 - d) * 7.5);
                    desiredVel.add(diff);
                }
            }

            // Smooth acceleration towards target velocity
            b.vel.lerp(desiredVel, safeDt * 3.2);
            b.pos.addScaledVector(b.vel, safeDt);

            // Calculate forward direction, yaw, pitch, and banking roll
            const speed = b.vel.length();
            if (speed > 0.1) {
                forwardVec.copy(b.vel).normalize();
                const targetYaw = Math.atan2(forwardVec.x, forwardVec.z) + Math.PI;
                const targetPitch = -Math.asin(Math.max(-1, Math.min(1, forwardVec.y)));

                // Angle difference handling seamless circular wraparound
                let dyaw = targetYaw - b.yaw;
                while (dyaw > Math.PI) dyaw -= Math.PI * 2;
                while (dyaw < -Math.PI) dyaw += Math.PI * 2;

                b.yaw += dyaw * Math.min(1, safeDt * 5.0);
                b.pitch += (targetPitch - b.pitch) * Math.min(1, safeDt * 4.0);

                // Bank smoothly into turns proportional to yaw rate
                const targetRoll = -dyaw * 3.8;
                b.roll += (targetRoll - b.roll) * Math.min(1, safeDt * 4.5);
            }

            b.model.root.position.copy(b.pos);
            b.model.root.rotation.set(b.pitch, b.yaw, b.roll, 'YXZ');

            // Flapping vs gliding cycle state machine
            b.glideTimer -= safeDt;
            if (b.glideTimer <= 0) {
                b.isGliding = !b.isGliding;
                b.glideTimer = b.isGliding ? (1.8 + Math.random() * 2.2) : (2.8 + Math.random() * 3.5);
            }

            const targetAmp = b.isGliding ? 0.14 : 0.65;
            b.flapAmp += (targetAmp - b.flapAmp) * safeDt * 6.0;

            // Wing wave animation with phase delay between inner shoulder and outer tip
            const flapAngle = Math.sin(elapsedSec * b.flapFreq + b.flapPhase) * b.flapAmp;
            const tipAngle = Math.sin(elapsedSec * b.flapFreq + b.flapPhase - 0.42) * (b.flapAmp * 0.88);

            b.model.leftWingRoot.rotation.z = flapAngle;
            b.model.leftTipRoot.rotation.z = tipAngle;
            b.model.rightWingRoot.rotation.z = -flapAngle;
            b.model.rightTipRoot.rotation.z = -tipAngle;
        }
    };

    return { update };
}

// Bundle high-altitude aircraft with contrails and organic flocking birds into unified controller
export function createAirspaceSystem(scene, hardwareProfile = { tier: 'high' }) {
    const jetSystem = createJetAircraftSystem(scene, hardwareProfile);
    const birdsSystem = createFlockingBirdsSystem(scene, hardwareProfile);

    // Synchronize both aircraft and flocking birds each animation frame
    const update = (dt, elapsedSec) => {
        jetSystem.update(dt, elapsedSec);
        birdsSystem.update(dt, elapsedSec);
    };

    return { update };
}
