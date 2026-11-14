// Realistic slender festive dual-station rooftop fireworks with sharp line streaks and vibrant bursts
import * as THREE from 'three';

// Create realistic slender line-segment fireworks with rocket ascent, burst rays, and rich palettes
export function createRooftopFireworks(scene, hardwareProfile = { tier: 'high' }) {
    const isLowTier = hardwareProfile.tier === 'low';
    const MAX_STREAKS = isLowTier ? 450 : 900;
    const VERTEX_COUNT = MAX_STREAKS * 2;

    const positions = new Float32Array(VERTEX_COUNT * 3);
    const colors = new Float32Array(VERTEX_COUNT * 3);
    const alphas = new Float32Array(VERTEX_COUNT);
    const intensities = new Float32Array(VERTEX_COUNT);

    // Particle pool holding slender ray streaks, ascending rockets, and trailing sparks
    const streaks = [];
    for (let i = 0; i < MAX_STREAKS; i++) {
        streaks.push({
            active: false,
            type: 'dead',
            padId: 0,
            x: 0, y: -200, z: 0,
            tx: 0, ty: -200, tz: 0,
            vx: 0, vy: 0, vz: 0,
            r: 1, g: 1, b: 1,
            cr: 1, cg: 1, cb: 1,
            life: 0, maxLife: 1,
            trailTime: 0.12,
            sparkleSpeed: 30,
            seed: i * 0.23,
            palette: null
        });
        const vHead = (i * 2) * 3;
        const vTail = (i * 2 + 1) * 3;
        positions[vHead] = 0; positions[vHead + 1] = -200; positions[vHead + 2] = 0;
        positions[vTail] = 0; positions[vTail + 1] = -200; positions[vTail + 2] = 0;
        alphas[i * 2] = 0;
        alphas[i * 2 + 1] = 0;
        intensities[i * 2] = 0;
        intensities[i * 2 + 1] = 0;
    }

    // Two independent launch stations at the ends of the main building rooftop sign
    const LAUNCH_PADS = [
        { id: 0, name: 'left-T', x: -23.8, y: 14.8, z: 15.9, timer: 0.4, driftX: -0.55 },
        { id: 1, name: 'right-C', x: -2.2, y: 14.8, z: 15.9, timer: 1.5, driftX: 0.55 }
    ];

    // Rich saturated color schemes for festival fireworks
    const PALETTES = [
        // Imperial Gold & Champagne
        {
            name: 'gold',
            core: { r: 1.0, g: 0.98, b: 0.82 },
            main: { r: 1.0, g: 0.84, b: 0.05 },
            tail: { r: 1.0, g: 0.58, b: 0.02 }
        },
        // Ruby Red & Crimson Flame
        {
            name: 'ruby',
            core: { r: 1.0, g: 0.88, b: 0.92 },
            main: { r: 1.0, g: 0.08, b: 0.26 },
            tail: { r: 0.86, g: 0.02, b: 0.18 }
        },
        // Emerald Jade Glow
        {
            name: 'emerald',
            core: { r: 0.88, g: 1.0, b: 0.92 },
            main: { r: 0.0, g: 0.94, b: 0.48 },
            tail: { r: 0.0, g: 0.65, b: 0.38 }
        },
        // Electric Turquoise & Cyan Azure
        {
            name: 'turquoise',
            core: { r: 0.88, g: 0.98, b: 1.0 },
            main: { r: 0.0, g: 0.92, b: 1.0 },
            tail: { r: 0.02, g: 0.52, b: 0.95 }
        },
        // Neon Pink & Vivid Magenta
        {
            name: 'pink',
            core: { r: 1.0, g: 0.88, b: 0.96 },
            main: { r: 1.0, g: 0.02, b: 0.55 },
            tail: { r: 0.78, g: 0.0, b: 0.82 }
        },
        // Royal Amethyst & Purple Spark
        {
            name: 'violet',
            core: { r: 0.95, g: 0.88, b: 1.0 },
            main: { r: 0.72, g: 0.24, b: 1.0 },
            tail: { r: 0.48, g: 0.08, b: 0.92 }
        },
        // Rainbow Fiesta with multi-color radiating rays
        {
            name: 'rainbow',
            core: { r: 1.0, g: 1.0, b: 1.0 },
            main: { r: 1.0, g: 0.85, b: 0.2 },
            tail: { r: 1.0, g: 0.3, b: 0.1 },
            isRainbow: true
        }
    ];

    // Rainbow sub-palette colors for individual radiating ray assignment
    const RAINBOW_COLORS = [
        { core: { r: 1.0, g: 0.98, b: 0.85 }, main: { r: 1.0, g: 0.84, b: 0.05 }, tail: { r: 1.0, g: 0.55, b: 0.0 } },
        { core: { r: 1.0, g: 0.88, b: 0.92 }, main: { r: 1.0, g: 0.08, b: 0.26 }, tail: { r: 0.85, g: 0.02, b: 0.15 } },
        { core: { r: 0.88, g: 1.0, b: 0.92 }, main: { r: 0.0, g: 0.94, b: 0.48 }, tail: { r: 0.0, g: 0.65, b: 0.38 } },
        { core: { r: 0.88, g: 0.98, b: 1.0 }, main: { r: 0.0, g: 0.92, b: 1.0 }, tail: { r: 0.02, g: 0.52, b: 0.95 } },
        { core: { r: 1.0, g: 0.88, b: 0.96 }, main: { r: 1.0, g: 0.02, b: 0.55 }, tail: { r: 0.78, g: 0.0, b: 0.82 } },
        { core: { r: 0.95, g: 0.88, b: 1.0 }, main: { r: 0.72, g: 0.24, b: 1.0 }, tail: { r: 0.48, g: 0.08, b: 0.92 } }
    ];

    // Allocate first available inactive or oldest expiring streak
    const obtainStreak = () => {
        for (let i = 0; i < MAX_STREAKS; i++) {
            if (!streaks[i].active) return streaks[i];
        }
        let oldest = streaks[0];
        let maxProg = 0;
        for (let i = 0; i < MAX_STREAKS; i++) {
            const s = streaks[i];
            const prog = s.life / Math.max(0.01, s.maxLife);
            if (prog > maxProg) {
                maxProg = prog;
                oldest = s;
            }
        }
        return oldest;
    };

    // Detonate aerial shell into a 3D spherical starburst of slender radiant rays
    const triggerDetonation = (bx, by, bz, palette) => {
        const starCount = isLowTier ? 80 : 150;
        const flashCount = isLowTier ? 12 : 24;

        // Instantaneous high-intensity center burst flash needle rays
        for (let f = 0; f < flashCount; f++) {
            const st = obtainStreak();
            st.active = true;
            st.type = 'flash';
            st.x = bx; st.y = by; st.z = bz;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2.0 * Math.random() - 1.0);
            const flashLen = 1.8 + Math.random() * 2.2;
            const dx = Math.sin(phi) * Math.cos(theta);
            const dy = Math.cos(phi);
            const dz = Math.sin(phi) * Math.sin(theta);
            st.tx = bx - dx * flashLen;
            st.ty = by - dy * flashLen;
            st.tz = bz - dz * flashLen;
            st.vx = dx * 18.0;
            st.vy = dy * 18.0;
            st.vz = dz * 18.0;
            st.cr = 1.0; st.cg = 1.0; st.cb = 1.0;
            st.r = palette.main.r; st.g = palette.main.g; st.b = palette.main.b;
            st.life = 0;
            st.maxLife = 0.08 + Math.random() * 0.04;
            st.trailTime = 0.08;
            st.sparkleSpeed = 50;
        }

        // Spherical distribution using golden spiral for uniform ray spacing
        const baseSpeed = 10.5 + Math.random() * 4.5;
        for (let i = 0; i < starCount; i++) {
            const st = obtainStreak();
            st.active = true;
            st.type = 'star';
            st.x = bx; st.y = by; st.z = bz;
            st.tx = bx; st.ty = by; st.tz = bz;

            // Golden spiral coordinates over 3D unit sphere
            const phi = Math.acos(1.0 - 2.0 * (i + 0.5) / starCount);
            const theta = Math.PI * (1.0 + Math.sqrt(5.0)) * i;
            const speed = baseSpeed * (0.84 + Math.random() * 0.32);

            st.vx = Math.sin(phi) * Math.cos(theta) * speed;
            st.vy = Math.cos(phi) * speed * 0.95 + 1.2;
            st.vz = Math.sin(phi) * Math.sin(theta) * speed;

            // Color assignment based on chosen palette
            let colorSet;
            if (palette.isRainbow) {
                colorSet = RAINBOW_COLORS[i % RAINBOW_COLORS.length];
            } else {
                colorSet = palette;
            }

            st.cr = colorSet.core.r; st.cg = colorSet.core.g; st.cb = colorSet.core.b;
            st.r = colorSet.main.r; st.g = colorSet.main.g; st.b = colorSet.main.b;

            st.life = 0;
            st.maxLife = 1.45 + Math.random() * 0.65;
            st.trailTime = 0.12 + Math.random() * 0.04;
            st.sparkleSpeed = 32.0 + Math.random() * 18.0;
        }
    };

    // Launch single high-speed rocket from designated rooftop end station
    const launchRocket = (pad) => {
        const rk = obtainStreak();
        rk.active = true;
        rk.type = 'rocket';
        rk.padId = pad.id;
        rk.x = pad.x + (Math.random() - 0.5) * 0.5;
        rk.y = pad.y;
        rk.z = pad.z + (Math.random() - 0.5) * 0.3;
        rk.tx = rk.x;
        rk.ty = rk.y - 0.5;
        rk.tz = rk.z;
        rk.vx = pad.driftX + (Math.random() - 0.5) * 0.6;
        rk.vy = 26.5 + Math.random() * 4.0;
        rk.vz = (Math.random() - 0.5) * 0.6;
        rk.cr = 1.0; rk.cg = 0.98; rk.cb = 0.88;
        rk.r = 1.0; rk.g = 0.72; rk.b = 0.18;
        rk.life = 0;
        rk.maxLife = 0.95 + Math.random() * 0.18;
        rk.trailTime = 0.075;
        rk.sparkleSpeed = 45;
        rk.palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
    };

    // Buffer geometry holding pair vertices per slender line streak
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geom.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));
    geom.setAttribute('aIntensity', new THREE.BufferAttribute(intensities, 1));

    // Shader rendering luminous needle-sharp streaks with incandescent core and fading tail
    const mat = new THREE.ShaderMaterial({
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: `
            attribute float aAlpha;
            attribute float aIntensity;
            varying vec3 vColor;
            varying float vAlpha;
            varying float vIntensity;
            void main() {
                vColor = color;
                vAlpha = aAlpha;
                vIntensity = aIntensity;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            varying float vAlpha;
            varying float vIntensity;
            void main() {
                if (vAlpha <= 0.003) discard;
                vec3 rgb = vColor * vIntensity;
                gl_FragColor = vec4(rgb, vAlpha);
            }
        `
    });

    const lineSegments = new THREE.LineSegments(geom, mat);
    lineSegments.frustumCulled = false;
    scene.add(lineSegments);

    // Update rocket ascents, slender star ray aerodynamics, and pad launch timers
    const update = (dt) => {
        const safeDt = Math.min(dt, 0.05);

        // Advance launch timers on the two independent end stations
        for (let i = 0; i < 2; i++) {
            const pad = LAUNCH_PADS[i];
            pad.timer -= safeDt;
            if (pad.timer <= 0) {
                pad.timer = 1.8 + Math.random() * 1.4;
                launchRocket(pad);
            }
        }

        const GRAVITY = 6.8;
        const ROCKET_GRAVITY = 7.5;
        const DRAG = 0.962;

        for (let i = 0; i < MAX_STREAKS; i++) {
            const s = streaks[i];
            const vHead = (i * 2) * 3;
            const vTail = (i * 2 + 1) * 3;
            const aHead = i * 2;
            const aTail = i * 2 + 1;

            if (!s.active) {
                positions[vHead] = 0; positions[vHead + 1] = -200; positions[vHead + 2] = 0;
                positions[vTail] = 0; positions[vTail + 1] = -200; positions[vTail + 2] = 0;
                alphas[aHead] = 0;
                alphas[aTail] = 0;
                intensities[aHead] = 0;
                intensities[aTail] = 0;
                continue;
            }

            s.life += safeDt;

            if (s.type === 'rocket') {
                s.vy -= ROCKET_GRAVITY * safeDt;
                s.x += s.vx * safeDt;
                s.y += s.vy * safeDt;
                s.z += s.vz * safeDt;

                // Slender upward trailing line segment behind rocket head
                s.tx = s.x - s.vx * s.trailTime;
                s.ty = s.y - s.vy * s.trailTime;
                s.tz = s.z - s.vz * s.trailTime;

                // Spawn slender trailing spark falling behind ascending rocket
                if (Math.random() < 0.72) {
                    const tr = obtainStreak();
                    tr.active = true;
                    tr.type = 'trail';
                    tr.x = s.x + (Math.random() - 0.5) * 0.18;
                    tr.y = s.y - 0.35;
                    tr.z = s.z + (Math.random() - 0.5) * 0.18;
                    tr.vx = s.vx * 0.18 + (Math.random() - 0.5) * 0.6;
                    tr.vy = -1.8 - Math.random() * 2.2;
                    tr.vz = s.vz * 0.18 + (Math.random() - 0.5) * 0.6;
                    tr.tx = tr.x - tr.vx * 0.05;
                    tr.ty = tr.y - tr.vy * 0.05;
                    tr.tz = tr.z - tr.vz * 0.05;
                    tr.cr = 1.0; tr.cg = 0.94; tr.cb = 0.72;
                    tr.r = 1.0; tr.g = 0.62; tr.b = 0.12;
                    tr.life = 0;
                    tr.maxLife = 0.22 + Math.random() * 0.16;
                    tr.trailTime = 0.05;
                    tr.sparkleSpeed = 40;
                }

                if (s.life >= s.maxLife || s.vy <= 1.5) {
                    s.active = false;
                    triggerDetonation(s.x, s.y, s.z, s.palette);
                }

                alphas[aHead] = 1.0;
                alphas[aTail] = 0.02;
                intensities[aHead] = 1.8;
                intensities[aTail] = 0.7;

            } else if (s.type === 'trail') {
                s.vy -= 4.2 * safeDt;
                s.x += s.vx * safeDt;
                s.y += s.vy * safeDt;
                s.z += s.vz * safeDt;

                s.tx = s.x - s.vx * s.trailTime;
                s.ty = s.y - s.vy * s.trailTime;
                s.tz = s.z - s.vz * s.trailTime;

                if (s.life >= s.maxLife) {
                    s.active = false;
                    alphas[aHead] = 0;
                    alphas[aTail] = 0;
                } else {
                    const fade = 1.0 - s.life / s.maxLife;
                    alphas[aHead] = fade * 0.9;
                    alphas[aTail] = 0.0;
                    intensities[aHead] = 1.2 * fade;
                    intensities[aTail] = 0.4 * fade;
                }

            } else if (s.type === 'flash') {
                if (s.life >= s.maxLife) {
                    s.active = false;
                    alphas[aHead] = 0;
                    alphas[aTail] = 0;
                } else {
                    const prog = s.life / s.maxLife;
                    const flashFade = 1.0 - prog;
                    alphas[aHead] = flashFade;
                    alphas[aTail] = 0.0;
                    intensities[aHead] = 2.4 * flashFade;
                    intensities[aTail] = 0.6 * flashFade;
                }

            } else if (s.type === 'star') {
                s.vx *= DRAG;
                s.vz *= DRAG;
                s.vy -= GRAVITY * safeDt;

                s.x += s.vx * safeDt;
                s.y += s.vy * safeDt;
                s.z += s.vz * safeDt;

                // Tapered streak tail lagging behind trajectory vector
                const speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy + s.vz * s.vz);
                const dynTrailTime = Math.min(s.trailTime, 0.04 + speed * 0.007);
                s.tx = s.x - s.vx * dynTrailTime;
                s.ty = s.y - s.vy * dynTrailTime;
                s.tz = s.z - s.vz * dynTrailTime;

                if (s.life >= s.maxLife) {
                    s.active = false;
                    alphas[aHead] = 0;
                    alphas[aTail] = 0;
                } else {
                    const prog = s.life / s.maxLife;
                    let alpha = prog < 0.08 ? (prog / 0.08) : Math.pow(1.0 - (prog - 0.08) / 0.92, 1.35);

                    // High-frequency glitter twinkle during final descent
                    if (prog > 0.45) {
                        const twinkle = 0.65 + 0.35 * Math.sin(s.life * s.sparkleSpeed + s.seed);
                        alpha *= twinkle;
                    }

                    alphas[aHead] = Math.max(0, Math.min(1, alpha));
                    alphas[aTail] = 0.01;
                    intensities[aHead] = 1.6;
                    intensities[aTail] = 0.85;
                }
            }

            // Head vertex attributes
            positions[vHead] = s.x;
            positions[vHead + 1] = s.y;
            positions[vHead + 2] = s.z;
            colors[vHead] = s.cr;
            colors[vHead + 1] = s.cg;
            colors[vHead + 2] = s.cb;

            // Tail vertex attributes
            positions[vTail] = s.tx;
            positions[vTail + 1] = s.ty;
            positions[vTail + 2] = s.tz;
            colors[vTail] = s.r;
            colors[vTail + 1] = s.g;
            colors[vTail + 2] = s.b;
        }

        geom.attributes.position.needsUpdate = true;
        geom.attributes.color.needsUpdate = true;
        geom.attributes.aAlpha.needsUpdate = true;
        geom.attributes.aIntensity.needsUpdate = true;
    };

    return { update };
}
