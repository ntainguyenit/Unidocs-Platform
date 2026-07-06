
        const video = document.getElementById('videoElement');
        const canvas = document.getElementById('photoCanvas');
        const ctx = canvas.getContext('2d');
        const startCameraBtn = document.getElementById('startCameraBtn');
        const captureBtn = document.getElementById('captureBtn');
        const filterSelect = document.getElementById('filterSelect');
        const frameSelect = document.getElementById('frameSelect');
        const cameraPlaceholder = document.getElementById('cameraPlaceholder');
        const resultContainer = document.getElementById('resultContainer');
        const downloadBtn = document.getElementById('downloadBtn');

        let currentStream = null;

        startCameraBtn.addEventListener('click', async () => {
            try {
                if (currentStream) {
                    currentStream.getTracks().forEach(track => track.stop());
                }
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                currentStream = stream;
                video.srcObject = stream;
                video.classList.remove('hidden');
                cameraPlaceholder.classList.add('hidden');
                
                captureBtn.disabled = false;
                captureBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                startCameraBtn.innerHTML = 'Khởi động lại Camera';
            } catch (err) {
                alert("Không thể truy cập Camera. Vui lòng kiểm tra quyền trình duyệt!");
                console.error(err);
            }
        });

        filterSelect.addEventListener('change', (e) => {
            video.className = `w-full h-auto filter-${e.target.value}`;
        });

        captureBtn.addEventListener('click', () => {
            if (!currentStream) return;

            // set canvas size to video size
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Apply filter to context
            const filter = filterSelect.value;
            let filterString = "none";
            switch(filter) {
                case "grayscale": filterString = "grayscale(100%)"; break;
                case "sepia": filterString = "sepia(100%)"; break;
                case "invert": filterString = "invert(100%)"; break;
                case "blur": filterString = "blur(4px)"; break;
                case "contrast": filterString = "contrast(150%)"; break;
                case "hue": filterString = "hue-rotate(90deg)"; break;
            }
            ctx.filter = filterString;

            // Draw video frame
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Reset filter for UI overlays
            ctx.filter = "none";

            // Draw Frame
            const frame = frameSelect.value;
            if (frame === "polaroid") {
                ctx.fillStyle = "white";
                // Top, Left, Right borders
                ctx.fillRect(0, 0, canvas.width, 20);
                ctx.fillRect(0, 0, 20, canvas.height);
                ctx.fillRect(canvas.width - 20, 0, 20, canvas.height);
                // Bottom thick border
                ctx.fillRect(0, canvas.height - 80, canvas.width, 80);
                
                ctx.fillStyle = "black";
                ctx.font = "bold 24px 'Comic Sans MS', cursive, sans-serif";
                ctx.textAlign = "center";
                ctx.fillText("Kỷ niệm UniDocs", canvas.width/2, canvas.height - 35);
            } else if (frame === "film") {
                ctx.fillStyle = "#111";
                ctx.fillRect(0, 0, canvas.width, 30);
                ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
                ctx.fillStyle = "white";
                for(let i=10; i<canvas.width; i+=40) {
                    ctx.fillRect(i, 5, 20, 20);
                    ctx.fillRect(i, canvas.height - 25, 20, 20);
                }
            } else if (frame === "vintage") {
                ctx.strokeStyle = "#8b5a2b";
                ctx.lineWidth = 15;
                ctx.strokeRect(0, 0, canvas.width, canvas.height);
                ctx.strokeStyle = "#cd853f";
                ctx.lineWidth = 5;
                ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);
            } else if (frame === "neon") {
                ctx.strokeStyle = "#ff1493";
                ctx.lineWidth = 10;
                ctx.shadowColor = "#ff69b4";
                ctx.shadowBlur = 20;
                ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
                ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40); // Thêm viền để sáng hơn
                ctx.shadowBlur = 0; // Reset
            } else if (frame === "love") {
                ctx.strokeStyle = "#ffb6c1";
                ctx.lineWidth = 20;
                ctx.strokeRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = "#ff69b4";
                ctx.font = "40px Arial";
                ctx.fillText("❤️", 40, 50);
                ctx.fillText("❤️", canvas.width - 40, 50);
                ctx.fillText("❤️", 40, canvas.height - 30);
                ctx.fillText("❤️", canvas.width - 40, canvas.height - 30);
            }

            resultContainer.classList.remove('hidden');
            resultContainer.scrollIntoView({ behavior: 'smooth' });
        });

        downloadBtn.addEventListener('click', () => {
            const link = document.createElement('a');
            link.download = 'unidocs-photo.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    

