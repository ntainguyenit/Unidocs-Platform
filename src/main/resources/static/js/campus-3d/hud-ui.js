// Game HUD controller, live mini-map radar, quest tracking, native dialogs, virtual joystick, snapshot capture, and Web Audio SFX
import {
    CAMPUS_START_POSE,
    CAMPUS_LOCATIONS,
    CAMPUS_TRIVIA,
    TELEPORT_PADS
} from './world-data.js';

const STORAGE_KEY = 'unidocs_husc_campus_3d_v1';
const VALID_LIGHTING = new Set(['noon', 'night']);
const QUALITY_STEPS = ['low', 'medium', 'high'];
const QUALITY_LABELS = { low: 'Thấp', medium: 'Vừa', high: 'Cao' };

// Load persisted player discovery progress safely from localStorage
function loadSavedState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (_) {
        return null;
    }
}

// Save updated player discovery progress cleanly
function persistState(state) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            checkedIn: Array.from(state.checkedIn),
            quizSolved: Array.from(state.quizSolved),
            detailsFound: Array.from(state.detailsFound),
            photos: state.photos.slice(0, 12),
            lighting: state.lighting,
            quality: state.quality,
            qualityManual: Boolean(state.qualityManual),
            soundEnabled: state.soundEnabled
        }));
    } catch (_) {
        // Ignore quota errors if localStorage is full
    }
}

// Synthesize crisp lightweight Web Audio chimes without external audio files
function createSfxEngine(state) {
    let ctx = null;
    const ensureCtx = () => {
        if (!state.soundEnabled) return null;
        if (!ctx && (window.AudioContext || window.webkitAudioContext)) {
            const Ctor = window.AudioContext || window.webkitAudioContext;
            ctx = new Ctor();
        }
        if (ctx && ctx.state === 'suspended') {
            ctx.resume().catch(() => {});
        }
        return ctx;
    };

    const playTone = (freq, duration, type = 'sine', delay = 0, gainVal = 0.08) => {
        const audio = ensureCtx();
        if (!audio) return;
        const t = audio.currentTime + delay;
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.exponentialRampToValueAtTime(gainVal, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
        osc.connect(gain);
        gain.connect(audio.destination);
        osc.start(t);
        osc.stop(t + duration);
    };

    return {
        checkin: () => {
            playTone(523.25, 0.16, 'triangle', 0, 0.08);
            playTone(659.25, 0.18, 'triangle', 0.09, 0.08);
            playTone(783.99, 0.28, 'triangle', 0.18, 0.09);
        },
        teleport: () => {
            playTone(330, 0.15, 'sine', 0, 0.07);
            playTone(660, 0.25, 'sine', 0.07, 0.08);
        },
        shutter: () => {
            playTone(1100, 0.05, 'square', 0, 0.04);
            playTone(780, 0.06, 'triangle', 0.05, 0.05);
        },
        correct: () => {
            playTone(587.33, 0.15, 'triangle', 0, 0.08);
            playTone(880.0, 0.28, 'triangle', 0.1, 0.09);
        }
    };
}

// Install pointer-rect light-dismiss fallback on Safari where dialog[closedby="any"] is unsupported
function installDialogSafeguards() {
    for (const dlg of document.querySelectorAll('dialog')) {
        dlg.addEventListener('close', () => {
            dlg.returnValue = '';
        });
    }
    if (!('closedBy' in HTMLDialogElement.prototype)) {
        const isOutside = (e, dialog) => {
            const r = dialog.getBoundingClientRect();
            return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
        };
        for (const dlg of document.querySelectorAll('dialog[closedby="any"]')) {
            let pressedOutside = false;
            dlg.addEventListener('pointerdown', (e) => {
                pressedOutside = isOutside(e, dlg);
            });
            dlg.addEventListener('pointerup', (e) => {
                if (pressedOutside && isOutside(e, dlg)) {
                    dlg.close();
                }
            });
        }
    }
}

// Initialize full game HUD, quests, interactive map, snapshot souvenir capture, and mobile controls
export function setupCampusHud({
    playerController,
    envController,
    hardwareProfile = { tier: 'high' },
    onCaptureFrame,
    onManualQualityChange,
    onResetQualityToAuto
}) {
    installDialogSafeguards();
    const saved = loadSavedState();
    let initialDefaultQuality = QUALITY_STEPS.includes(hardwareProfile?.defaultTier)
        ? hardwareProfile.defaultTier
        : (QUALITY_STEPS.includes(hardwareProfile?.tier) ? hardwareProfile.tier : 'high');
    const initialLighting = VALID_LIGHTING.has(saved?.lighting) ? saved.lighting : 'noon';
    const hasManualQuality = Boolean(saved?.qualityManual && QUALITY_STEPS.includes(saved?.quality));

    const state = {
        checkedIn: new Set(saved?.checkedIn || ['cong-chinh']),
        quizSolved: new Set(saved?.quizSolved || []),
        detailsFound: new Set(saved?.detailsFound || []),
        photos: Array.isArray(saved?.photos) ? saved.photos : [],
        lighting: initialLighting,
        quality: hasManualQuality ? saved.quality : (QUALITY_STEPS.includes(hardwareProfile?.tier) ? hardwareProfile.tier : initialDefaultQuality),
        qualityManual: hasManualQuality,
        soundEnabled: saved?.soundEnabled !== false,
        nearestLocation: CAMPUS_LOCATIONS[0],
        activePrompt: null,
        lastTeleportAt: 0
    };

    const sfx = createSfxEngine(state);

    // Apply saved lighting & adaptive hardware graphics presets cleanly
    envController.setLightingPreset(state.lighting);
    envController.setQualityLevel(state.quality, true);

    // Cached DOM elements
    const hudLayer = document.getElementById('hudLayer');
    const introBanner = document.getElementById('introBanner');
    const skipIntroBtn = document.getElementById('skipIntroBtn');
    const minimapCanvas = document.getElementById('minimapCanvas');
    const minimapCtx = minimapCanvas.getContext('2d');
    const currentZoneLabel = document.getElementById('currentZoneLabel');
    const weatherClockLabel = document.getElementById('weatherClockLabel');
    const checkinCountBadge = document.getElementById('checkinCountBadge');
    const questCheckinText = document.getElementById('questCheckinText');
    const questQuizText = document.getElementById('questQuizText');
    const questPhotoText = document.getElementById('questPhotoText');
    const contextPromptBtn = document.getElementById('contextPromptBtn');
    const toastBanner = document.getElementById('hudToast');
    const fpsBadge = document.getElementById('fpsBadge');
    const camToggleBtn = document.getElementById('camToggleBtn');
    const camToggleLabel = document.getElementById('camToggleLabel');

    // Dialog references
    const mapDialog = document.getElementById('mapDialog');
    const galleryDialog = document.getElementById('galleryDialog');
    const quizDialog = document.getElementById('quizDialog');
    const menuDialog = document.getElementById('menuDialog');

    let toastTimer = null;
    const showToast = (msg, kind = 'info') => {
        if (!toastBanner) return;
        toastBanner.textContent = msg;
        toastBanner.dataset.kind = kind;
        toastBanner.classList.add('is-visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toastBanner.classList.remove('is-visible');
        }, 2800);
    };

    // Update live Hue local clock and weather text
    const refreshClockLabel = () => {
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        let icon = '☀️ Nắng đẹp 29°C';
        if (state.lighting === 'night') {
            icon = '🌙 Buổi tối dịu mát 23°C';
        }
        weatherClockLabel.textContent = `${hh}:${mm} · ${icon}`;
    };
    refreshClockLabel();
    setInterval(refreshClockLabel, 15000);

    // Render Quest progress and Top-Right counter synchronously
    const refreshProgressUI = () => {
        const totalLoc = CAMPUS_LOCATIONS.length;
        const cCount = state.checkedIn.size;
        const qCount = state.quizSolved.size;
        const pCount = Math.min(1, state.photos.length);

        if (checkinCountBadge) {
            checkinCountBadge.textContent = `${cCount}/${totalLoc}`;
        }
        questCheckinText.textContent = `Check-in địa điểm (${cCount}/${totalLoc})`;
        questCheckinText.parentElement.classList.toggle('is-done', cCount >= totalLoc);

        questQuizText.textContent = `Trả lời câu hỏi HUSC (${qCount}/${CAMPUS_TRIVIA.length})`;
        questQuizText.parentElement.classList.toggle('is-done', qCount >= CAMPUS_TRIVIA.length);

        questPhotoText.textContent = `Chụp ảnh lưu niệm (${pCount}/1)`;
        questPhotoText.parentElement.classList.toggle('is-done', pCount >= 1);

        persistState(state);
    };
    refreshProgressUI();

    let introEndedAtMs = 0;

    // Update Intro Overlay visibility during flycam sweep vs interactive gameplay
    const syncIntroVisibility = (isIntroPlaying) => {
        hudLayer.classList.remove('hud-prewarm');
        hudLayer.classList.toggle('hud-hidden', isIntroPlaying);
        introBanner.hidden = !isIntroPlaying;
        if (!isIntroPlaying) {
            introEndedAtMs = performance.now();
        }
    };

    skipIntroBtn.addEventListener('click', () => {
        playerController.skipIntroFlycam();
    });

    // Mobile Quest panel collapse toggle + auto-collapse on narrow phones so screen center stays open
    const questToggleBtn = document.getElementById('questToggleBtn');
    const questCard = document.getElementById('questCard');
    if (questToggleBtn && questCard) {
        const syncQuestToggleState = (collapsed) => {
            questCard.classList.toggle('is-collapsed', collapsed);
            questToggleBtn.setAttribute('aria-expanded', String(!collapsed));
            questToggleBtn.textContent = collapsed ? 'Mở rộng' : 'Thu gọn';
        };
        if (window.innerWidth <= 720) {
            syncQuestToggleState(true);
        }
        questToggleBtn.addEventListener('click', () => {
            syncQuestToggleState(!questCard.classList.contains('is-collapsed'));
        });
    }

    // Build and refresh Interactive 2D Overview Map + Teleport Buttons inside #mapDialog
    const bigMapCanvas = document.getElementById('bigMapCanvas');
    const bigMapCtx = bigMapCanvas.getContext('2d');
    const mapLocationsList = document.getElementById('mapLocationsList');

    const drawSchematicOnCanvas = (ctx, size, pX, pZ, pYaw, isMini) => {
        ctx.clearRect(0, 0, size, size);
        ctx.fillStyle = '#dce6f1';
        ctx.fillRect(0, 0, size, size);

        // World bounds cover roughly [-132..+98] in X and [-108..+105] in Z matching 5-corner Plan 61a14ecc
        const toCanvas = (wx, wz) => {
            if (isMini) {
                const zoom = 1.65;
                return [
                    size * 0.5 + (wx - pX) * zoom,
                    size * 0.5 + (wz - pZ) * zoom
                ];
            }
            const sx = size / 232;
            const sy = size / 216;
            return [(wx + 132) * sx, (wz + 108) * sy];
        };
        const scaleLen = isMini ? 1.65 : (size / 232);

        // Surrounding streets silhouette (Nguyen Hue, Ly Thuong Kiet, Dong Da)
        ctx.fillStyle = '#475569';
        const [nhx, nhy] = toCanvas(-125, 77);
        ctx.fillRect(nhx, nhy, 265 * scaleLen, 17 * scaleLen);

        ctx.save();
        const [ltx, lty] = toCanvas(-116.5, 16.0);
        ctx.translate(ltx, lty);
        ctx.rotate(-1.6106);
        ctx.fillRect(-130.0 * scaleLen, -8 * scaleLen, 260 * scaleLen, 16 * scaleLen);
        ctx.restore();

        ctx.save();
        const [ddx, ddy] = toCanvas(-27.08, -77.78);
        ctx.translate(ddx, ddy);
        ctx.rotate(-0.4461);
        ctx.fillRect(-180.0 * scaleLen, -7.5 * scaleLen, 360 * scaleLen, 15 * scaleLen);
        ctx.restore();

        // 5-corner Campus yard polygon fill
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        const polyPts = [[-104, 72.5], [84, 72.5], [84, -32], [30, -94], [-108, -28]];
        polyPts.forEach(([px, pz], idx) => {
            const [cx, cy] = toCanvas(px, pz);
            if (idx === 0) ctx.moveTo(cx, cy);
            else ctx.lineTo(cx, cy);
        });
        ctx.closePath();
        ctx.fill();

        // Northwest Asphalt Parking Apron surrounding Khoa Hoa Hoc (Nha D)
        ctx.fillStyle = '#7b8490';
        ctx.beginPath();
        [[-99.5, 11.5], [-54.5, 11.5], [-54.5, -41.5], [-103.5, -24.5]].forEach(([px, pz], idx) => {
            const [cx, cy] = toCanvas(px, pz);
            if (idx === 0) ctx.moveTo(cx, cy);
            else ctx.lineTo(cx, cy);
        });
        ctx.closePath();
        ctx.fill();

        // Orthogonal Green Football Pitch & Front / Inner / Back Courtyard Gardens
        ctx.fillStyle = '#2e7d32';
        for (const [gx, gz, gw, gd] of [
            [-75.5, 36.5, 30.0, 43.0],
            [-38.5, 41.5, 26.0, 31.5],
            [22.25, 41.5, 45.0, 31.5],
            [-7.25, -8.0, 23.0, 16.5],
            [28.0, -8.0, 34.5, 16.5],
            [33.5, -47.0, 22.0, 19.0],
            [4.0, -45.8, 18.0, 5.2]
        ]) {
            const [cx, cy] = toCanvas(gx, gz);
            ctx.fillRect(cx - (gw * scaleLen) / 2, cy - (gd * scaleLen) / 2, gw * scaleLen, gd * scaleLen);
        }

        // Slanted bike-park green medians between Nha H and 38 Dong Da sheds
        for (const [gx, gz, gw, gd] of [
            [-32.70, -54.92, 12.0, 2.2],
            [-31.41, -52.22, 12.0, 2.2],
            [-18.90, -61.52, 11.0, 2.2],
            [-17.61, -58.82, 11.0, 2.2]
        ]) {
            const [cx, cy] = toCanvas(gx, gz);
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(-0.4461);
            ctx.fillRect(-(gw * scaleLen) / 2, -(gd * scaleLen) / 2, gw * scaleLen, gd * scaleLen);
            ctx.restore();
        }

        // Basketball Court swatch
        ctx.fillStyle = '#64748b';
        const [bbx, bby] = toCanvas(-31.0, -7.5);
        ctx.fillRect(bbx - 9 * scaleLen, bby - 7 * scaleLen, 18 * scaleLen, 14 * scaleLen);

        // Auxiliary architectural wings & bike sheds so 2D contours match connected CAD blocks
        for (const [ax, az, aw, ad, aa, col] of [
            [15.6, 10.0, 8.8, 7.4, 0, '#8b2622'],
            [-35.2, -41.5, 11.0, 10.2, 0.10, '#8b2622'],
            [56.5, -36.5, 10.2, 12.4, 0, '#8b2622'],
            [-64.0, 67.5, 44.0, 6.2, 0, '#7f1d1d'],
            [34.0, 67.5, 56.0, 6.2, 0, '#7f1d1d'],
            [-29.21, -61.80, 36.0, 4.6, 0.4461, '#25638b'],
            [-59.01, -46.11, 14.0, 4.2, 0.4461, '#25638b'],
            [-74.6, -34.8, 21.0, 4.4, 0.06, '#25638b']
        ]) {
            const [cx, cy] = toCanvas(ax, az);
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(-aa);
            ctx.fillStyle = col;
            ctx.fillRect(-(aw * scaleLen) / 2, -(ad * scaleLen) / 2, aw * scaleLen, ad * scaleLen);
            ctx.restore();
        }

        // Buildings & Check-in Pin Dots
        for (const loc of CAMPUS_LOCATIONS) {
            if (loc.category !== 'sport' && loc.category !== 'gate') {
                const [bx, by] = toCanvas(loc.rect.cx, loc.rect.cz);
                ctx.save();
                ctx.translate(bx, by);
                ctx.rotate(-loc.rect.angle);
                ctx.fillStyle = '#8b2622';
                ctx.fillRect(-(loc.rect.w * scaleLen) / 2, -(loc.rect.d * scaleLen) / 2, loc.rect.w * scaleLen, loc.rect.d * scaleLen);
                ctx.restore();
            }
            const [lx, ly] = toCanvas(loc.x, loc.z);
            const checked = state.checkedIn.has(loc.id);
            ctx.beginPath();
            ctx.arc(lx, ly, isMini ? 3.5 : 4.6, 0, Math.PI * 2);
            ctx.fillStyle = checked ? '#22c55e' : '#facc15';
            ctx.fill();
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = '#0f172a';
            ctx.stroke();

            if (!isMini) {
                ctx.font = '700 9.5px Inter, sans-serif';
                ctx.fillStyle = '#0f172a';
                ctx.textAlign = 'center';
                let labelX = lx;
                let labelY = ly - 7;
                if (loc.id === 'san-bong-ro') { labelX = lx + 10; labelY = ly + 15; }
                else if (loc.id === 'nha-c') { labelX = lx - 16; labelY = ly - 6; }
                else if (loc.id === 'cong-dong-da') { labelX = lx - 18; labelY = ly - 7; }
                else if (loc.id === 'nha-khach') { labelX = lx + 16; labelY = ly - 7; }
                else if (loc.id === 'nha-a1-a2') { labelY = ly + 13; }
                ctx.fillText(loc.shortName, labelX, labelY);
            }
        }

        // Live 4-corner traffic signal markers for both LTK x Nguyen Hue and LTK x Dong Da intersections
        const sigState = envController.getSignalState ? envController.getSignalState() : null;
        if (sigState) {
            const sigColor = (phase) => (phase === 'green' ? '#22c55e' : phase === 'yellow' ? '#facc15' : '#ef4444');
            const nhSig = sigState.nh || sigState;
            const ddSig = sigState.dd || sigState;
            for (const [sx, sz, phase] of [
                [-104.6, 75.6, nhSig.ewState],
                [-122.8, 95.4, nhSig.ewState],
                [-123.4, 75.7, nhSig.nsState],
                [-104.2, 95.3, nhSig.nsState],
                [-127.94, -19.34, ddSig.ewState],
                [-109.00, -48.81, ddSig.ewState],
                [-128.28, -46.08, ddSig.nsState],
                [-109.05, -21.83, ddSig.nsState]
            ]) {
                const [px, py] = toCanvas(sx, sz);
                ctx.beginPath();
                ctx.arc(px, py, isMini ? 2.5 : 3.2, 0, Math.PI * 2);
                ctx.fillStyle = sigColor(phase);
                ctx.fill();
                ctx.lineWidth = 1;
                ctx.strokeStyle = '#0f172a';
                ctx.stroke();
            }
        }

        // Player directional chevron marker
        const [mx, my] = toCanvas(pX, pZ);
        ctx.save();
        ctx.translate(mx, my);
        ctx.rotate(-pYaw);
        ctx.fillStyle = '#2563eb';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -8);
        ctx.lineTo(6, 7);
        ctx.lineTo(0, 4);
        ctx.lineTo(-6, 7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    };

    const renderBigMap = () => {
        const ps = playerController.getState();
        drawSchematicOnCanvas(bigMapCtx, bigMapCanvas.width, ps.x, ps.z, ps.yaw, false);
        mapLocationsList.innerHTML = '';
        for (const loc of CAMPUS_LOCATIONS) {
            const done = state.checkedIn.has(loc.id);
            const card = document.createElement('div');
            card.className = 'map-loc-card';
            card.innerHTML = `
                <div class="map-loc-head">
                    <span class="map-loc-code">${loc.code}</span>
                    <span class="map-loc-status ${done ? 'is-done' : ''}">${done ? '✓ Đã check-in' : 'Chưa check-in'}</span>
                </div>
                <h3 class="map-loc-title">${loc.name}</h3>
                <p class="map-loc-desc">${loc.departments}</p>
                <button type="button" class="btn-teleport" data-loc-id="${loc.id}">Dịch chuyển tới đây</button>
            `;
            card.querySelector('.btn-teleport').addEventListener('click', () => {
                playerController.snapPlayerTo(loc.teleportTarget.x, loc.teleportTarget.z, loc.teleportTarget.yaw);
                sfx.teleport();
                mapDialog.close();
                showToast(`Đã dịch chuyển đến ${loc.name}`, 'success');
            });
            mapLocationsList.appendChild(card);
        }
    };

    // Populate Quiz Dialog cleanly
    const quizBody = document.getElementById('quizBody');
    const renderQuizList = () => {
        quizBody.innerHTML = '';
        CAMPUS_TRIVIA.forEach((item, idx) => {
            const solved = state.quizSolved.has(item.id);
            const block = document.createElement('div');
            block.className = 'quiz-item';
            block.innerHTML = `
                <p class="quiz-q"><strong>Câu ${idx + 1}:</strong> ${item.question} ${solved ? '<span class="quiz-badge">✓ Đã trả lời đúng</span>' : ''}</p>
                <div class="quiz-options"></div>
                <p class="quiz-feedback" hidden></p>
            `;
            const optsEl = block.querySelector('.quiz-options');
            const fbEl = block.querySelector('.quiz-feedback');
            if (solved) {
                fbEl.textContent = item.explanation;
                fbEl.hidden = false;
            }
            item.options.forEach((optText, oIdx) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'quiz-opt-btn';
                if (solved && oIdx === item.correctIndex) btn.classList.add('is-correct');
                btn.textContent = optText;
                btn.addEventListener('click', () => {
                    if (oIdx === item.correctIndex) {
                        state.quizSolved.add(item.id);
                        sfx.correct();
                        refreshProgressUI();
                        btn.classList.add('is-correct');
                        fbEl.textContent = 'Chính xác! ' + item.explanation;
                        fbEl.hidden = false;
                        showToast('Chính xác! Hoàn thành +1 câu hỏi HUSC', 'success');
                        renderQuizList();
                    } else {
                        btn.classList.add('is-wrong');
                        fbEl.textContent = 'Chưa đúng, thử chọn lại nhé!';
                        fbEl.hidden = false;
                    }
                });
                optsEl.appendChild(btn);
            });
            quizBody.appendChild(block);
        });
    };

    // Populate Photo Souvenir Gallery inside #galleryDialog
    const galleryGrid = document.getElementById('galleryGrid');
    const renderGallery = () => {
        galleryGrid.innerHTML = '';
        if (state.photos.length === 0) {
            galleryGrid.innerHTML = '<p class="empty-msg">Chưa có ảnh lưu niệm nào. Bấm nút Chụp ảnh hoặc phím C trong lúc dạo trường để lưu ảnh vào Kho ảnh!</p>';
            return;
        }
        state.photos.forEach((p, idx) => {
            const card = document.createElement('div');
            card.className = 'gallery-card';
            card.innerHTML = `
                <img src="${p.dataUrl}" alt="Ảnh lưu niệm tại ${p.location}" class="gallery-img" width="640" height="360">
                <div class="gallery-meta">
                    <div>
                        <strong>${p.location}</strong>
                        <span>${p.time}</span>
                    </div>
                    <a href="${p.dataUrl}" download="husc-3d-${idx + 1}.png" class="btn-download-img">Tải PNG</a>
                </div>
            `;
            galleryGrid.appendChild(card);
        });
    };

    // Capture Snapshot from WebGLRenderer and stamp commemorative HUSC frame overlay
    const triggerSnapshot = () => {
        const frameDataUrl = onCaptureFrame();
        if (!frameDataUrl) return;
        const img = new Image();
        img.onload = () => {
            const out = document.createElement('canvas');
            out.width = Math.min(1280, img.width);
            out.height = Math.round(out.width * (img.height / img.width));
            const ctx = out.getContext('2d');
            ctx.drawImage(img, 0, 0, out.width, out.height);

            // Subtle commemorative bottom watermark stamp
            ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
            ctx.fillRect(0, out.height - 54, out.width, 54);
            ctx.font = '700 20px Inter, sans-serif';
            ctx.fillStyle = '#facc15';
            ctx.fillText(`📸 ĐHKH Huế 3D · ${state.nearestLocation.name}`, 24, out.height - 20);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#e2e8f0';
            ctx.font = '500 16px Inter, sans-serif';
            ctx.fillText(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' · UniDocs', out.width - 24, out.height - 22);

            const stampedUrl = out.toDataURL('image/png');
            state.photos.unshift({
                dataUrl: stampedUrl,
                location: state.nearestLocation.shortName,
                time: new Date().toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
            });
            if (state.photos.length > 10) state.photos.length = 10;
            sfx.shutter();
            refreshProgressUI();
            showToast(`Đã lưu ảnh tại ${state.nearestLocation.shortName} vào Kho ảnh!`, 'success');
        };
        img.src = frameDataUrl;
    };

    // Execute primary context action when clicking prompt or pressing [E]
    const executeContextAction = () => {
        if (!state.activePrompt) return;
        const p = state.activePrompt;
        if (p.type === 'checkin') {
            state.checkedIn.add(p.target.id);
            sfx.checkin();
            refreshProgressUI();
            showToast(`🎉 Đã Check-in ${p.target.name}!`, 'success');
        } else if (p.type === 'teleport') {
            const dest = CAMPUS_LOCATIONS.find((l) => l.id === p.target.destId);
            if (dest) {
                state.lastTeleportAt = performance.now();
                playerController.snapPlayerTo(dest.teleportTarget.x, dest.teleportTarget.z, dest.teleportTarget.yaw);
                sfx.teleport();
                showToast(`🌀 Dịch chuyển đến ${dest.name}`, 'success');
            }
        }
    };

    contextPromptBtn.addEventListener('click', executeContextAction);

    // Top HUD Button Listeners
    const openMapBtn = document.getElementById('openMapBtn');
    if (openMapBtn) {
        openMapBtn.addEventListener('click', () => {
            renderBigMap();
            mapDialog.showModal();
        });
    }
    document.getElementById('minimapBtn').addEventListener('click', () => {
        renderBigMap();
        mapDialog.showModal();
    });

    // Open Photo Souvenir Gallery with clean single click
    const openGalleryBtn = document.getElementById('openGalleryBtn');
    if (openGalleryBtn) {
        openGalleryBtn.addEventListener('click', (e) => {
            e.preventDefault();
            renderGallery();
            galleryDialog.showModal();
        });
    }

    // Quest Row Click Handlers
    document.getElementById('questRowCheckin').addEventListener('click', () => {
        renderBigMap();
        mapDialog.showModal();
    });
    document.getElementById('questRowQuiz').addEventListener('click', () => {
        renderQuizList();
        quizDialog.showModal();
    });
    document.getElementById('questRowPhoto').addEventListener('click', triggerSnapshot);

    // Action Bar Listeners: Snapshot photo capture
    const snapshotBtn = document.getElementById('snapshotBtn');
    let lastSnapshotMs = 0;
    const handleSnapshotTrigger = (e) => {
        if (e && e.type === 'pointerdown' && e.pointerType === 'mouse' && e.button !== 0) return;
        const now = performance.now();
        if (now - lastSnapshotMs < 200) return;
        lastSnapshotMs = now;
        triggerSnapshot();
    };
    if (snapshotBtn) {
        snapshotBtn.addEventListener('pointerdown', handleSnapshotTrigger);
        snapshotBtn.addEventListener('click', handleSnapshotTrigger);
    }

    const toggleCameraMode = () => {
        const current = playerController.getState().cameraMode;
        const next = playerController.setCameraMode(current === 'third-person' ? 'fly' : 'third-person');
        if (camToggleLabel) {
            camToggleLabel.textContent = next === 'fly' ? 'Góc nhìn thứ 3' : 'Flycam toàn cảnh';
        }
        showToast(next === 'fly' ? 'Chế độ Flycam tự do (kéo để xoay toàn trường)' : 'Chế độ Nhân vật góc nhìn thứ 3');
    };
    camToggleBtn.addEventListener('click', toggleCameraMode);

    // Settings draft state, 3-step slider sync, progressive switch enhancement, deferred Save, and Reset
    const draftSettings = {
        lighting: state.lighting,
        quality: state.quality,
        qualityTouched: false,
        soundEnabled: state.soundEnabled
    };

    const lightPresetBtns = Array.from(document.querySelectorAll('[data-light-preset]'));
    const qualitySlider = document.getElementById('qualitySlider');
    const qualityStepBtns = Array.from(document.querySelectorAll('[data-quality-step]'));
    const soundToggleInput = document.getElementById('soundToggleInput');
    const soundStateLabel = document.getElementById('soundStateLabel');
    const settingsForm = document.getElementById('settingsForm');
    const settingsStatusMsg = document.getElementById('settingsStatusMsg');

    if (soundToggleInput && !('switch' in HTMLInputElement.prototype)) {
        // Apply ARIA switch role and custom toggle styling where HTML switch attribute is unsupported
        soundToggleInput.setAttribute('role', 'switch');
        soundToggleInput.classList.add('is-switch-fallback');
    }

    const syncQualitySliderUI = (tier) => {
        const idx = Math.max(0, QUALITY_STEPS.indexOf(tier));
        if (qualitySlider) {
            qualitySlider.value = String(idx);
            // Sync CSS bounds and live slider value for browsers without typed attr() or progress()
            qualitySlider.style.setProperty('--attr-min', qualitySlider.min || '0');
            qualitySlider.style.setProperty('--attr-max', qualitySlider.max || '2');
            qualitySlider.style.setProperty('--control-value', String(idx));
            qualitySlider.setAttribute('aria-valuetext', QUALITY_LABELS[tier] || 'Cao');
        }
        qualityStepBtns.forEach((btn) => {
            const active = Number(btn.dataset.qualityStep) === idx;
            btn.classList.toggle('is-active', active);
            btn.setAttribute('aria-pressed', String(active));
        });
    };

    const syncMenuDraftControls = () => {
        lightPresetBtns.forEach((b) => {
            const selected = b.dataset.lightPreset === draftSettings.lighting;
            b.classList.toggle('is-selected', selected);
            b.setAttribute('aria-pressed', String(selected));
        });
        syncQualitySliderUI(draftSettings.quality);
        if (soundToggleInput) {
            soundToggleInput.checked = draftSettings.soundEnabled;
        }
        if (soundStateLabel) {
            soundStateLabel.textContent = draftSettings.soundEnabled ? 'Đang bật' : 'Đang tắt';
        }
    };
    syncMenuDraftControls();

    // Update menu quality highlight when warm-up calibration steps down for low-end devices
    const setCalibratedQuality = (tier) => {
        if (!QUALITY_STEPS.includes(tier)) return;
        state.quality = tier;
        initialDefaultQuality = tier;
        if (!menuDialog.open) {
            draftSettings.quality = tier;
            syncMenuDraftControls();
        }
    };

    document.getElementById('openMenuBtn').addEventListener('click', () => {
        draftSettings.lighting = state.lighting;
        draftSettings.quality = state.quality;
        draftSettings.qualityTouched = false;
        draftSettings.soundEnabled = state.soundEnabled;
        if (settingsStatusMsg) settingsStatusMsg.textContent = '';
        syncMenuDraftControls();
        menuDialog.showModal();
    });

    // Menu Controls (Overview Flycam Replay, Draft Time/Quality/Sound Selection, Deferred Save, and Reset)
    document.getElementById('replayIntroBtn').addEventListener('click', () => {
        menuDialog.close();
        syncIntroVisibility(true);
        playerController.snapPlayerTo(CAMPUS_START_POSE.x, CAMPUS_START_POSE.z, CAMPUS_START_POSE.yaw);
        playerController.setCameraMode('third-person');
        if (camToggleLabel) camToggleLabel.textContent = 'Flycam toàn cảnh';
        playerController.startIntroFlycam();
    });

    lightPresetBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            const preset = btn.dataset.lightPreset;
            if (!VALID_LIGHTING.has(preset)) return;
            draftSettings.lighting = preset;
            if (settingsStatusMsg) settingsStatusMsg.textContent = '';
            syncMenuDraftControls();
        });
    });

    if (qualitySlider) {
        const handleSliderChange = () => {
            const idx = Math.max(0, Math.min(2, Number(qualitySlider.value) || 0));
            draftSettings.quality = QUALITY_STEPS[idx];
            draftSettings.qualityTouched = true;
            if (settingsStatusMsg) settingsStatusMsg.textContent = '';
            syncMenuDraftControls();
        };
        qualitySlider.addEventListener('input', handleSliderChange);
        qualitySlider.addEventListener('change', handleSliderChange);
    }

    qualityStepBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            const idx = Math.max(0, Math.min(2, Number(btn.dataset.qualityStep) || 0));
            draftSettings.quality = QUALITY_STEPS[idx];
            draftSettings.qualityTouched = true;
            if (settingsStatusMsg) settingsStatusMsg.textContent = '';
            syncMenuDraftControls();
        });
    });

    if (soundToggleInput) {
        soundToggleInput.addEventListener('change', () => {
            draftSettings.soundEnabled = Boolean(soundToggleInput.checked);
            if (settingsStatusMsg) settingsStatusMsg.textContent = '';
            syncMenuDraftControls();
        });
    }

    document.getElementById('resetSettingsBtn').addEventListener('click', () => {
        state.lighting = 'noon';
        state.quality = initialDefaultQuality;
        state.qualityManual = false;
        state.soundEnabled = true;

        draftSettings.lighting = state.lighting;
        draftSettings.quality = state.quality;
        draftSettings.qualityTouched = false;
        draftSettings.soundEnabled = state.soundEnabled;

        envController.setLightingPreset(state.lighting);
        refreshClockLabel();
        envController.setQualityLevel(state.quality, true);
        if (onResetQualityToAuto) onResetQualityToAuto(state.quality);
        persistState(state);
        syncMenuDraftControls();

        if (settingsStatusMsg) {
            settingsStatusMsg.textContent = 'Đã đặt lại tất cả cài đặt về mặc định ban đầu.';
        }
    });

    if (settingsForm) {
        settingsForm.addEventListener('submit', () => {
            const prevLighting = state.lighting;
            const prevQuality = state.quality;

            state.lighting = draftSettings.lighting;
            state.quality = draftSettings.quality;
            if (draftSettings.qualityTouched) {
                state.qualityManual = true;
            }
            state.soundEnabled = draftSettings.soundEnabled;

            if (state.lighting !== prevLighting) {
                envController.setLightingPreset(state.lighting);
                refreshClockLabel();
            }
            if (state.quality !== prevQuality) {
                envController.setQualityLevel(state.quality, true);
            }
            if (draftSettings.qualityTouched && onManualQualityChange) {
                onManualQualityChange(state.quality);
            }

            persistState(state);
            showToast('Đã lưu và áp dụng cài đặt!', 'success');
        });
    }

    // Multi-touch Mobile / Mouse Virtual Joystick with 4-way directional chevrons & active state highlights
    const joyBase = document.getElementById('joystickBase');
    const joyThumb = document.getElementById('joystickThumb');
    const joyDirUp = joyBase.querySelector('[data-joy-dir="up"]');
    const joyDirDown = joyBase.querySelector('[data-joy-dir="down"]');
    const joyDirLeft = joyBase.querySelector('[data-joy-dir="left"]');
    const joyDirRight = joyBase.querySelector('[data-joy-dir="right"]');
    let joyPointerId = null;
    let joyDownX = 0;
    let joyDownY = 0;
    let lockedArrowDir = null;

    const CARDINAL_VECTORS = {
        up: [0, 1],
        down: [0, -1],
        left: [-1, 0],
        right: [1, 0]
    };

    // Highlight active cardinal arrow badges matching normalized input vector
    const syncDirectionHighlights = (nx, ny) => {
        joyDirUp?.classList.toggle('is-active', ny > 0.28);
        joyDirDown?.classList.toggle('is-active', ny < -0.28);
        joyDirLeft?.classList.toggle('is-active', nx < -0.28);
        joyDirRight?.classList.toggle('is-active', nx > 0.28);
    };

    const applyJoystickNormalized = (nx, ny) => {
        const rect = joyBase.getBoundingClientRect();
        const maxR = Math.max(20, rect.width * 0.21);
        const clampLen = Math.hypot(nx, ny);
        const vx = clampLen > 1 ? nx / clampLen : nx;
        const vy = clampLen > 1 ? ny / clampLen : ny;
        // Negate Y so +1 forward renders visually upward toward the top arrow
        joyThumb.style.transform = `translate(${vx * maxR}px, ${-vy * maxR}px)`;
        syncDirectionHighlights(vx, vy);
        playerController.setJoystickInput(vx, vy);
    };

    const handleJoystickPointer = (clientX, clientY) => {
        const rect = joyBase.getBoundingClientRect();
        const cx = rect.left + rect.width * 0.5;
        const cy = rect.top + rect.height * 0.5;
        const maxR = Math.max(20, rect.width * 0.21);
        const dx = clientX - cx;
        const dy = clientY - cy;
        const len = Math.hypot(dx, dy);
        if (len < 6) {
            applyJoystickNormalized(0, 0);
            return;
        }
        const scale = Math.min(1, len / maxR);
        const nx = (dx / len) * scale;
        const ny = (-dy / len) * scale;
        applyJoystickNormalized(nx, ny);
    };

    joyBase.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        e.stopPropagation();
        joyPointerId = e.pointerId;
        joyDownX = e.clientX;
        joyDownY = e.clientY;
        joyBase.setPointerCapture(e.pointerId);
        joyBase.classList.add('is-dragging');
        const arrowEl = e.target.closest?.('[data-joy-dir]');
        lockedArrowDir = arrowEl ? arrowEl.dataset.joyDir : null;
        if (lockedArrowDir && CARDINAL_VECTORS[lockedArrowDir]) {
            const [vx, vy] = CARDINAL_VECTORS[lockedArrowDir];
            applyJoystickNormalized(vx, vy);
        } else {
            handleJoystickPointer(e.clientX, e.clientY);
        }
    });

    joyBase.addEventListener('pointermove', (e) => {
        if (e.pointerId !== joyPointerId) return;
        e.stopPropagation();
        if (lockedArrowDir && Math.hypot(e.clientX - joyDownX, e.clientY - joyDownY) < 8) return;
        lockedArrowDir = null;
        handleJoystickPointer(e.clientX, e.clientY);
    });

    const resetJoy = (e) => {
        if (joyPointerId === null) return;
        if (e && e.pointerId !== undefined && e.pointerId !== joyPointerId) return;
        joyPointerId = null;
        lockedArrowDir = null;
        joyBase.classList.remove('is-dragging');
        joyThumb.style.transform = 'translate(0px, 0px)';
        syncDirectionHighlights(0, 0);
        playerController.setJoystickInput(0, 0);
    };
    joyBase.addEventListener('pointerup', resetJoy);
    joyBase.addEventListener('pointercancel', resetJoy);
    joyBase.addEventListener('lostpointercapture', resetJoy);

    // Sync HUD arrow highlights cleanly when steering via WASD or physical keyboard arrow keys
    const heldKeys = new Set();
    const syncKeyboardIndicators = () => {
        if (joyPointerId !== null) return;
        let kx = 0;
        let ky = 0;
        if (heldKeys.has('w') || heldKeys.has('arrowup')) ky += 1;
        if (heldKeys.has('s') || heldKeys.has('arrowdown')) ky -= 1;
        if (heldKeys.has('a') || heldKeys.has('arrowleft')) kx -= 1;
        if (heldKeys.has('d') || heldKeys.has('arrowright')) kx += 1;
        syncDirectionHighlights(kx, ky);
    };
    window.addEventListener('keydown', (e) => {
        if (document.querySelector('dialog[open]')) return;
        const k = e.key.toLowerCase();
        if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) {
            heldKeys.add(k);
            syncKeyboardIndicators();
        }
    });
    window.addEventListener('keyup', (e) => {
        const k = e.key.toLowerCase();
        if (heldKeys.delete(k)) syncKeyboardIndicators();
    });
    window.addEventListener('blur', () => {
        heldKeys.clear();
        resetJoy(null);
        syncDirectionHighlights(0, 0);
    });

    // Frame-by-frame HUD update: nearest building, proximity prompts, signal sync, minimap, and FPS counter
    const sigEwLabel = document.getElementById('sigEwLabel');
    const sigEwDot = document.getElementById('sigEwDot');
    const sigEwSec = document.getElementById('sigEwSec');
    const sigNsDot = document.getElementById('sigNsDot');
    const sigNsSec = document.getElementById('sigNsSec');
    let lastSignalSyncKey = '';
    let lastZoneText = '';
    let lastPromptLabel = '';
    let lastPromptVisible = false;
    const initSig = envController.getSignalState ? envController.getSignalState() : null;
    let lastMiniX = CAMPUS_START_POSE.x;
    let lastMiniZ = CAMPUS_START_POSE.z;
    let lastMiniYaw = CAMPUS_START_POSE.yaw;
    let lastMiniCheckin = state.checkedIn.size;
    let lastMiniSigKey = initSig
        ? `${initSig.nh?.ewState || ''}${initSig.nh?.nsState || ''}${initSig.dd?.ewState || ''}${initSig.dd?.nsState || ''}`
        : '';
    let lastMiniRedrawMs = performance.now();
    // Pre-draw compact tactical radar behind loading curtain to prevent end-of-intro frame spike
    drawSchematicOnCanvas(minimapCtx, minimapCanvas.width, CAMPUS_START_POSE.x, CAMPUS_START_POSE.z, CAMPUS_START_POSE.yaw, true);
    let fpsAccumulator = 0;
    let fpsFrames = 0;

    const updateFrame = (dt) => {
        const ps = playerController.getState();

        const sigState = envController.getSignalState ? envController.getSignalState() : null;
        if (sigState && sigEwSec && sigNsSec) {
            const focusZ = ps.focusZ !== undefined ? ps.focusZ : ps.z;
            const isDongDaZone = focusZ < 20;
            const activeSig = isDongDaZone && sigState.dd ? sigState.dd : (sigState.nh || sigState);
            const axisTag = isDongDaZone ? 'ĐĐ' : 'NH';
            const sigKey = `${axisTag}|${activeSig.ewState}:${activeSig.ewSec}|${activeSig.nsState}:${activeSig.nsSec}`;
            if (sigKey !== lastSignalSyncKey) {
                lastSignalSyncKey = sigKey;
                if (sigEwLabel) sigEwLabel.textContent = axisTag;
                sigEwDot.className = `sig-dot is-${activeSig.ewState}`;
                sigEwSec.textContent = `${String(activeSig.ewSec).padStart(2, '0')}s`;
                sigNsDot.className = `sig-dot is-${activeSig.nsState}`;
                sigNsSec.textContent = `${String(activeSig.nsSec).padStart(2, '0')}s`;
            }
        }

        fpsAccumulator += dt;
        fpsFrames += 1;
        if (fpsAccumulator >= 0.5) {
            const fps = Math.round(fpsFrames / fpsAccumulator);
            if (fpsBadge) fpsBadge.textContent = `${fps} FPS`;
            fpsAccumulator = 0;
            fpsFrames = 0;
        }

        if (ps.introPlaying) return;


        // Briefly stagger initial prompt reveal past the Intro-to-HUD compositor transition frame
        const allowPromptShow = (performance.now() - introEndedAtMs) >= 180;

        // Find nearest campus building / zone
        let nearest = CAMPUS_LOCATIONS[0];
        let minDist = Infinity;
        for (const loc of CAMPUS_LOCATIONS) {
            const d = Math.hypot(ps.x - loc.x, ps.z - loc.z);
            if (d < minDist) {
                minDist = d;
                nearest = loc;
            }
        }
        state.nearestLocation = nearest;
        const zoneText = `77 Nguyễn Huệ · Gần ${nearest.shortName}`;
        if (zoneText !== lastZoneText) {
            lastZoneText = zoneText;
            currentZoneLabel.textContent = zoneText;
        }

        // Detect interactive proximity prompt (Teleport pad -> Unchecked Building)
        let prompt = null;
        for (const pad of TELEPORT_PADS) {
            const d = Math.hypot(ps.x - pad.x, ps.z - pad.z);
            if (d < 2.2) {
                const dest = CAMPUS_LOCATIONS.find((l) => l.id === pad.destId);
                prompt = { type: 'teleport', target: pad, label: `Dịch chuyển tới ${dest ? dest.shortName : 'Khu khác'} [E]` };
                break;
            }
        }
        if (!prompt && !state.checkedIn.has(nearest.id) && minDist <= nearest.checkinRadius) {
            prompt = { type: 'checkin', target: nearest, label: `Check-in ${nearest.shortName} [E]` };
        }

        state.activePrompt = prompt;
        if (prompt && allowPromptShow) {
            if (lastPromptLabel !== prompt.label) {
                lastPromptLabel = prompt.label;
                contextPromptBtn.textContent = prompt.label;
            }
            if (!lastPromptVisible) {
                lastPromptVisible = true;
                contextPromptBtn.hidden = false;
            }
        } else if (lastPromptVisible) {
            lastPromptVisible = false;
            contextPromptBtn.hidden = true;
        }

        // Dirty-check & rate-cap compact minimap redraws (0 draws when idle, <=30Hz while moving)
        const nowMs = performance.now();
        const miniSigKey = sigState
            ? `${sigState.nh?.ewState || ''}${sigState.nh?.nsState || ''}${sigState.dd?.ewState || ''}${sigState.dd?.nsState || ''}`
            : '';
        const moved = Math.hypot(ps.x - lastMiniX, ps.z - lastMiniZ) >= 0.06;
        const turned = Math.abs(ps.yaw - lastMiniYaw) >= 0.015;
        const checkinChanged = state.checkedIn.size !== lastMiniCheckin;
        const sigColorChanged = miniSigKey !== lastMiniSigKey;
        const canRateRefresh = nowMs - lastMiniRedrawMs >= 33;
        if (checkinChanged || sigColorChanged || ((moved || turned) && canRateRefresh)) {
            lastMiniX = ps.x;
            lastMiniZ = ps.z;
            lastMiniYaw = ps.yaw;
            lastMiniCheckin = state.checkedIn.size;
            lastMiniSigKey = miniSigKey;
            lastMiniRedrawMs = nowMs;
            drawSchematicOnCanvas(minimapCtx, minimapCanvas.width, ps.x, ps.z, ps.yaw, true);
        }
    };

    return {
        syncIntroVisibility,
        executeContextAction,
        triggerSnapshot,
        toggleCameraMode,
        setCalibratedQuality,
        updateFrame,
        showToast
    };
}
