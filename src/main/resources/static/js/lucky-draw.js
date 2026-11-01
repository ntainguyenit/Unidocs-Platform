// Lucky Exam Draw Engine for UniDocs with 3D Card Flip, Web Audio API, and No-Duplication Logic

(function () {
    // Web Audio API context for zero-latency multiplatform sound synthesis
    let audioCtx = null;
    let isMuted = localStorage.getItem('unidocs_lucky_muted') === 'true';

    // State management
    let facultiesList = [];
    let allDocuments = [];
    let remainingDeck = [];
    let drawnHistory = [];
    let currentCard = null;
    let isFlipped = false;
    let isShuffling = false;

    // Inspirational student study quotes
    const luckyQuotes = [
        "Vía đề thi êm đềm, làm bài mượt mà như lướt web!",
        "Gặp đề này là chắc suất điểm A trong tầm tay rồi!",
        "Ôn kỹ câu trọng tâm, tự tin rinh trọn điểm tối đa!",
        "Thần may mắn đang độ bạn, vào phòng thi là trúng tủ!",
        "Không có đề nào khó, chỉ sợ bạn chưa bắt đầu ôn!",
        "Đề này dễ thở hơn bạn nghĩ nhiều, tự tin lên nhé!",
        "Chiến thần luyện đề HUSC, quyết không lùi bước!",
        "Học sâu hiểu chắc, điểm 9 điểm 10 tự khắc tìm đến!"
    ];

    // Fallback sample cards if database has no records yet
    const fallbackCards = [
        { id: 1, title: "Đề thi Cuối kỳ Giải tích 2 - Khóa K46", courseName: "Giải tích 2", facultyName: "Toán - Tin học", folderName: "Đề thi chính thức", slug: "de-thi-cuoi-ky-giai-tich-2-k46", fileType: "PDF" },
        { id: 2, title: "Đề cương Tổng hợp Cấu trúc Dữ liệu & Giải thuật", courseName: "Cấu trúc dữ liệu", facultyName: "Công nghệ thông tin", folderName: "Đề cương ôn tập", slug: "de-cuong-cau-truc-du-lieu-va-giai-thuat", fileType: "PDF" },
        { id: 3, title: "Đề thi Giữa kỳ Kiến trúc Máy tính & Hệ điều hành", courseName: "Kiến trúc máy tính", facultyName: "Công nghệ thông tin", folderName: "Đề thi giữa kỳ", slug: "de-thi-giua-ky-kien-truc-may-tinh", fileType: "PDF" },
        { id: 4, title: "Bộ đề trắc nghiệm Xác suất Thống kê có đáp án", courseName: "Xác suất thống kê", facultyName: "Toán - Tin học", folderName: "Đề thi & Đáp án", slug: "bo-de-xac-suat-thong-ke-co-dap-an", fileType: "PDF" },
        { id: 5, title: "Đề thi Cuối kỳ Lập trình Hướng đối tượng Java", courseName: "Lập trình Java", facultyName: "Công nghệ thông tin", folderName: "Đề thi chính thức", slug: "de-thi-cuoi-ky-lap-trinh-huong-doi-tuong-java", fileType: "PDF" },
        { id: 6, title: "Đề cương Ôn tập Trọng tâm Vật lý Đại cương 1", courseName: "Vật lý đại cương 1", facultyName: "Vật lý", folderName: "Đề cương ôn tập", slug: "de-cuong-vat-ly-dai-cuong-1", fileType: "PDF" },
        { id: 7, title: "Đề thi Cuối kỳ Cơ sở Dữ liệu Quan hệ & SQL", courseName: "Cơ sở dữ liệu", facultyName: "Công nghệ thông tin", folderName: "Đề thi cuối kỳ", slug: "de-thi-cuoi-ky-co-so-du-lieu", fileType: "PDF" },
        { id: 8, title: "Đề thi Thử Mạng máy tính & An toàn Thông tin", courseName: "Mạng máy tính", facultyName: "Công nghệ thông tin", folderName: "Đề thi thử", slug: "de-thi-thu-mang-may-tinh", fileType: "PDF" }
    ];

    // Initialize audio context safely on first user gesture
    function initAudio() {
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                audioCtx = new AudioContextClass();
            }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    // Play synthesized card flip whoosh sound
    function playFlipSound() {
        if (isMuted) return;
        try {
            initAudio();
            if (!audioCtx) return;

            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            const now = audioCtx.currentTime;

            osc.frequency.setValueAtTime(200, now);
            osc.frequency.exponentialRampToValueAtTime(800, now + 0.12);

            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start(now);
            osc.stop(now + 0.15);
        } catch (e) {
            // Audio synthesis fallback
        }
    }

    // Play synthesized card shuffle sound
    function playShuffleSound() {
        if (isMuted) return;
        try {
            initAudio();
            if (!audioCtx) return;

            const bufferSize = audioCtx.sampleRate * 0.25;
            const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = audioCtx.createBufferSource();
            noise.buffer = buffer;

            const filter = audioCtx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1200, audioCtx.currentTime);
            filter.Q.setValueAtTime(3.0, audioCtx.currentTime);

            const gain = audioCtx.createGain();
            const now = audioCtx.currentTime;
            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);

            noise.start(now);
        } catch (e) {
            // Audio synthesis fallback
        }
    }

    // Play victory celebration chime chords
    function playVictorySound() {
        if (isMuted) return;
        try {
            initAudio();
            if (!audioCtx) return;

            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio
            const now = audioCtx.currentTime;

            notes.forEach((freq, idx) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + idx * 0.08);

                gain.gain.setValueAtTime(0.001, now + idx * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.3, now + idx * 0.08 + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.5);

                osc.connect(gain);
                gain.connect(audioCtx.destination);

                osc.start(now + idx * 0.08);
                osc.stop(now + idx * 0.08 + 0.55);
            });
        } catch (e) {
            // Audio synthesis fallback
        }
    }

    // Trigger haptic vibration on mobile
    function triggerHaptic() {
        if ('vibrate' in navigator) {
            try {
                navigator.vibrate([35, 45, 35]);
            } catch (e) {
                // Ignore vibration failure
            }
        }
    }

    // Trigger celebration confetti
    function triggerConfetti() {
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 60,
                spread: 70,
                origin: { y: 0.65 },
                colors: ['#1e3a8a', '#2563eb', '#38bdf8', '#60a5fa', '#ffffff']
            });
        }
    }

    // Fisher-Yates shuffle algorithm
    function shuffleArray(arr) {
        const result = [...arr];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }

    // Fetch faculties list from API
    async function loadFaculties() {
        const select = document.getElementById('luckyFacultySelect');
        if (!select) return;

        try {
            const res = await fetch('/api/utilities/lucky-draw/faculties');
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    facultiesList = data;
                    select.innerHTML = '<option value="0">Tất cả các ngành / Toàn trường</option>';
                    facultiesList.forEach(f => {
                        const opt = document.createElement('option');
                        opt.value = f.id;
                        opt.textContent = f.name;
                        select.appendChild(opt);
                    });
                }
            }
        } catch (e) {
            // Network fallback
        }
    }

    // Fetch documents for the selected faculty
    async function loadDocuments(facultyId) {
        const counterEl = document.getElementById('luckyDeckCounter');
        const emptyStateEl = document.getElementById('luckyEmptyDeckState');
        const cardScene = document.getElementById('luckyCardScene');

        if (counterEl) counterEl.textContent = 'Đang xáo bài...';

        try {
            const url = facultyId && facultyId > 0
                ? `/api/utilities/lucky-draw/documents?facultyId=${facultyId}`
                : '/api/utilities/lucky-draw/documents';

            const res = await fetch(url);
            let docs = [];
            if (res.ok) {
                docs = await res.json();
            }

            if (!Array.isArray(docs) || docs.length === 0) {
                docs = fallbackCards;
            }

            allDocuments = docs;
            remainingDeck = shuffleArray(allDocuments);
            drawnHistory = [];
            currentCard = null;

            resetCardVisualState();
            updateCounter();
            playShuffleSound();
        } catch (e) {
            allDocuments = fallbackCards;
            remainingDeck = shuffleArray(allDocuments);
            drawnHistory = [];
            currentCard = null;
            resetCardVisualState();
            updateCounter();
        }
    }

    // Update remaining deck counter display
    function updateCounter() {
        const counterEl = document.getElementById('luckyDeckCounter');
        const progressBar = document.getElementById('luckyDeckProgress');
        const emptyState = document.getElementById('luckyEmptyDeckState');
        const cardScene = document.getElementById('luckyCardScene');
        const drawBtn = document.getElementById('btnDrawCard');

        const remaining = remainingDeck.length;
        const total = allDocuments.length;

        if (counterEl) {
            counterEl.textContent = `Còn lại ${remaining} / ${total} đề thi`;
        }

        if (progressBar && total > 0) {
            const pct = Math.round((remaining / total) * 100);
            progressBar.style.width = `${pct}%`;
        }

        if (remaining === 0 && !isFlipped) {
            if (emptyState) emptyState.classList.remove('hidden');
            if (cardScene) cardScene.classList.add('hidden');
            if (drawBtn) drawBtn.disabled = true;
        } else {
            if (emptyState) emptyState.classList.add('hidden');
            if (cardScene) cardScene.classList.remove('hidden');
            if (drawBtn) drawBtn.disabled = false;
        }
    }

    // Reset card visual state to back
    function resetCardVisualState() {
        const card = document.getElementById('lucky3DCard');
        const actionArea = document.getElementById('luckyCardActionArea');
        const drawBtn = document.getElementById('btnDrawCard');

        isFlipped = false;
        if (card) {
            card.classList.remove('card-is-flipped');
        }
        if (actionArea) {
            actionArea.classList.add('hidden');
        }
        if (drawBtn) {
            drawBtn.classList.remove('hidden');
        }
    }

    // Execute drawing a card with animation
    function drawCard() {
        if (isShuffling || isFlipped) return;

        if (remainingDeck.length === 0) {
            updateCounter();
            return;
        }

        isShuffling = true;
        initAudio();
        playFlipSound();
        triggerHaptic();

        // Pop card from remaining deck to guarantee no duplicates
        currentCard = remainingDeck.pop();
        drawnHistory.push(currentCard);

        // Populate front card content
        const titleEl = document.getElementById('luckyCardTitle');
        const courseEl = document.getElementById('luckyCardCourse');
        const facultyEl = document.getElementById('luckyCardFaculty');
        const folderEl = document.getElementById('luckyCardFolder');
        const quoteEl = document.getElementById('luckyCardQuote');
        const viewLinkEl = document.getElementById('luckyCardViewLink');

        if (titleEl) titleEl.textContent = currentCard.title || 'Đề thi học thuật';
        if (courseEl) courseEl.textContent = currentCard.courseName || 'Học phần chung';
        if (facultyEl) facultyEl.textContent = currentCard.facultyName || 'UniDocs HUSC';
        if (folderEl) folderEl.textContent = currentCard.folderName || 'Đề thi & Đề cương';
        
        const randomQuote = luckyQuotes[Math.floor(Math.random() * luckyQuotes.length)];
        if (quoteEl) quoteEl.textContent = `"${randomQuote}"`;

        if (viewLinkEl) {
            viewLinkEl.href = currentCard.slug ? `/document/${currentCard.slug}` : '/#section-university';
        }

        // Apply 3D flip animation
        const card = document.getElementById('lucky3DCard');
        if (card) {
            card.classList.add('card-is-flipped');
            isFlipped = true;
        }

        setTimeout(() => {
            playVictorySound();
            triggerConfetti();

            const actionArea = document.getElementById('luckyCardActionArea');
            const drawBtn = document.getElementById('btnDrawCard');
            if (actionArea) actionArea.classList.remove('hidden');
            if (drawBtn) drawBtn.classList.add('hidden');

            updateCounter();
            isShuffling = false;
        }, 400);
    }

    // Reshuffle deck from scratch
    function reshuffleDeck() {
        if (allDocuments.length === 0) {
            allDocuments = fallbackCards;
        }
        remainingDeck = shuffleArray(allDocuments);
        drawnHistory = [];
        currentCard = null;

        playShuffleSound();
        resetCardVisualState();
        updateCounter();
    }

    // Open lucky draw modal
    function openModal() {
        const modal = document.getElementById('luckyDrawModal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            document.body.style.overflow = 'hidden';

            if (allDocuments.length === 0) {
                const select = document.getElementById('luckyFacultySelect');
                const facultyId = select ? select.value : 0;
                loadDocuments(facultyId);
            }
        }
    }

    // Close lucky draw modal
    function closeModal() {
        const modal = document.getElementById('luckyDrawModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            document.body.style.overflow = '';
        }
    }

    // Toggle mute state
    function toggleMute() {
        isMuted = !isMuted;
        localStorage.setItem('unidocs_lucky_muted', isMuted);
        const iconOn = document.getElementById('luckySoundOnIcon');
        const iconOff = document.getElementById('luckySoundOffIcon');
        if (iconOn && iconOff) {
            if (isMuted) {
                iconOn.classList.add('hidden');
                iconOff.classList.remove('hidden');
            } else {
                iconOn.classList.remove('hidden');
                iconOff.classList.add('hidden');
            }
        }
    }

    // Bind event listeners on DOM ready
    document.addEventListener('DOMContentLoaded', () => {
        loadFaculties();

        // Floating trigger button
        const floatingBtn = document.getElementById('luckyDrawBtn');
        if (floatingBtn) {
            floatingBtn.addEventListener('click', openModal);
        }

        // Generic trigger buttons with data attribute
        document.querySelectorAll('[data-open-lucky-draw]').forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                openModal();
            });
        });

        // Close modal buttons
        const closeBtn = document.getElementById('btnCloseLuckyDraw');
        const backdrop = document.getElementById('luckyDrawBackdrop');
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (backdrop) backdrop.addEventListener('click', closeModal);

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });

        // Faculty change event
        const facultySelect = document.getElementById('luckyFacultySelect');
        if (facultySelect) {
            facultySelect.addEventListener('change', () => {
                loadDocuments(facultySelect.value);
            });
        }

        // Draw card button and card click
        const drawBtn = document.getElementById('btnDrawCard');
        if (drawBtn) drawBtn.addEventListener('click', drawCard);

        const cardScene = document.getElementById('luckyCardScene');
        if (cardScene) {
            cardScene.addEventListener('click', () => {
                if (!isFlipped) {
                    drawCard();
                }
            });
        }

        // Draw next card button
        const drawNextBtn = document.getElementById('btnDrawNextCard');
        if (drawNextBtn) {
            drawNextBtn.addEventListener('click', () => {
                resetCardVisualState();
                setTimeout(() => {
                    drawCard();
                }, 300);
            });
        }

        // Reshuffle buttons
        const reshuffleBtn = document.getElementById('btnReshuffleDeck');
        const reshuffleEmptyBtn = document.getElementById('btnReshuffleEmptyDeck');
        if (reshuffleBtn) reshuffleBtn.addEventListener('click', reshuffleDeck);
        if (reshuffleEmptyBtn) reshuffleEmptyBtn.addEventListener('click', reshuffleDeck);

        // Sound toggle button
        const soundToggleBtn = document.getElementById('btnToggleLuckySound');
        if (soundToggleBtn) soundToggleBtn.addEventListener('click', toggleMute);

        // Set initial sound icon
        const iconOn = document.getElementById('luckySoundOnIcon');
        const iconOff = document.getElementById('luckySoundOffIcon');
        if (iconOn && iconOff && isMuted) {
            iconOn.classList.add('hidden');
            iconOff.classList.remove('hidden');
        }
        // Auto-open modal if on dedicated /utilities/lucky-exam page
        if (window.location.pathname.includes('/utilities/lucky-exam')) {
            setTimeout(() => {
                openModal();
            }, 350);
        }
    });

    // Expose functions globally if needed
    window.openLuckyDrawModal = openModal;
    window.closeLuckyDrawModal = closeModal;
})();
