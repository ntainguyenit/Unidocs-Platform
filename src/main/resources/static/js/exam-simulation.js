pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        // Logic Đếm ngược
        let timerInterval;
        let totalSeconds = 0;
        let remainingSeconds = 0;
        let halfTimeAlerted = false;
        let fifteenMinAlerted = false;
        const circle = document.getElementById('timerCircle');
        const circumference = 2 * Math.PI * 120; // 753.98
        circle.style.strokeDasharray = `${circumference} ${circumference}`;

        function updateDisplay() {
            const m = Math.floor(remainingSeconds / 60);
            const s = remainingSeconds % 60;
            document.getElementById('countdownDisplay').textContent = 
                `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            
            // Cập nhật vòng tròn
            const offset = circumference - (remainingSeconds / totalSeconds) * circumference;
            circle.style.strokeDashoffset = offset;

            // Change color when time is running out
            if (remainingSeconds <= 300) { // Last 5 minutes
                circle.classList.remove('text-primary', 'text-orange-500');
                circle.classList.add('text-red-500');
                document.getElementById('countdownDisplay').classList.add('text-red-600', 'animate-pulse');
            } else if (remainingSeconds <= 900 && totalSeconds > 900) { // 15 minutes
                circle.classList.remove('text-primary');
                circle.classList.add('text-orange-500');
            }

            // Cảnh báo
            if (!halfTimeAlerted && remainingSeconds <= totalSeconds / 2 && totalSeconds > 0) {
                showAlert("Đã trôi qua một nửa thời gian", "Hãy kiểm tra lại tốc độ làm bài của bạn nhé!");
                halfTimeAlerted = true;
            }
            if (!fifteenMinAlerted && remainingSeconds === 900 && totalSeconds > 900) {
                showAlert("Chỉ còn 15 phút", "Hãy nhanh chóng hoàn thiện và kiểm tra lại bài làm!");
                fifteenMinAlerted = true;
            }
            if (remainingSeconds === 0 && totalSeconds > 0) {
                window.isFormDirty = false;
                clearInterval(timerInterval);
                document.getElementById('statusText').textContent = "HẾT GIỜ";
                document.getElementById('startBtn').style.display = 'block';
                document.getElementById('stopBtn').style.display = 'none';
                document.getElementById('finishSound').play();
                showAlert("Hết giờ làm bài!", "Vui lòng dừng bút/chuột và nộp bài.");
            }
        }

        document.getElementById('startBtn').addEventListener('click', () => {
            window.isFormDirty = true;
            const minutes = parseInt(document.getElementById('timeSelect').value);
            totalSeconds = minutes * 60;
            remainingSeconds = totalSeconds;
            halfTimeAlerted = false;
            fifteenMinAlerted = false;
            
            circle.classList.remove('text-red-500', 'text-orange-500');
            circle.classList.add('text-primary');
            document.getElementById('countdownDisplay').classList.remove('text-red-600', 'animate-pulse');
            
            document.getElementById('startBtn').style.display = 'none';
            document.getElementById('stopBtn').style.display = 'block';
            document.getElementById('statusText').textContent = "Đang làm bài";
            document.getElementById('timeSelect').disabled = true;

            clearInterval(timerInterval);
            updateDisplay();
            timerInterval = setInterval(() => {
                remainingSeconds--;
                updateDisplay();
            }, 1000);
        });

        document.getElementById('stopBtn').addEventListener('click', () => {
            window.isFormDirty = false;
            clearInterval(timerInterval);
            remainingSeconds = 0;
            updateDisplay();
            document.getElementById('statusText').textContent = "Đã nộp bài";
            document.getElementById('timeSelect').disabled = false;
        });

        function showAlert(title, message) {
            document.getElementById('alertTitle').textContent = title;
            document.getElementById('alertMessage').textContent = message;
            const modal = document.getElementById('alertModal');
            const content = document.getElementById('alertModalContent');
            modal.classList.remove('hidden');
            document.getElementById('alertSound').play().catch(e=>console.log(e));
        }

        function closeAlert() {
            const modal = document.getElementById('alertModal');
            if (modal) modal.classList.add('hidden');
        }

        // Logic Drag & Drop
        const dropZone = document.getElementById('examDropZone');
        const overlay = document.getElementById('overlay');
        const fileInput = document.getElementById('fileInput');
        const dropPlaceholder = document.getElementById('dropPlaceholder');
        const viewerContainer = document.getElementById('viewerContainer');

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => overlay.classList.remove('hidden'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => overlay.classList.add('hidden'), false);
        });

        dropZone.addEventListener('drop', handleDrop, false);
        fileInput.addEventListener('change', function() {
            if (this.files.length > 0) handleFiles(this.files);
        });

        function handleDrop(e) {
            let dt = e.dataTransfer;
            let files = dt.files;
            handleFiles(files);
        }

        function handleFiles(files) {
            const file = files[0];
            if (!file) return;

            dropPlaceholder.classList.add('hidden');
            viewerContainer.classList.remove('hidden');

            if (file.type === 'application/pdf') {
                document.getElementById('imageViewer').classList.add('hidden');
                document.getElementById('pdfViewer').innerHTML = ''; // Clear old
                const fileReader = new FileReader();
                fileReader.onload = function() {
                    const typedarray = new Uint8Array(this.result);
                    renderPDF(typedarray);
                };
                fileReader.readAsArrayBuffer(file);
            } else if (file.type.startsWith('image/')) {
                document.getElementById('pdfViewer').innerHTML = '';
                const img = document.getElementById('imageViewer');
                img.classList.remove('hidden');
                img.src = URL.createObjectURL(file);
            } else {
                alert('Chỉ hỗ trợ file PDF hoặc Hình ảnh!');
                dropPlaceholder.classList.remove('hidden');
                viewerContainer.classList.add('hidden');
            }
        }

        async function renderPDF(data) {
            const pdf = await pdfjsLib.getDocument(data).promise;
            const container = document.getElementById('pdfViewer');
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const viewport = page.getViewport({scale: 1.5});
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                canvas.className = 'shadow-md bg-white rounded max-w-full';
                container.appendChild(canvas);

                const renderContext = {
                    canvasContext: ctx,
                    viewport: viewport
                };
                page.render(renderContext);
            }
        }
        // Khởi tạo kéo thả
        setupDragAndDrop();
    

