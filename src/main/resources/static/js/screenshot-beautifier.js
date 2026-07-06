
        const canvas = document.getElementById('previewCanvas');
        const ctx = canvas.getContext('2d');
        const imageUpload = document.getElementById('imageUpload');
        const paddingInput = document.getElementById('paddingInput');
        const radiusInput = document.getElementById('radiusInput');
        const shadowInput = document.getElementById('shadowInput');
        const macOsDots = document.getElementById('macOsDots');
        const downloadBtn = document.getElementById('downloadBtn');
        const bgSelectors = document.getElementById('bgSelectors');
        
        let currentImage = null;
        let currentBgGradient = ['#8EC5FC', '#E0C3FC'];

        const gradients = [
            ['#8EC5FC', '#E0C3FC'],
            ['#FF9A9E', '#FECFEF'],
            ['#a18cd1', '#fbc2eb'],
            ['#f6d365', '#fda085'],
            ['#84fab0', '#8fd3f4'],
            ['#a1c4fd', '#c2e9fb'],
            ['#ffecd2', '#fcb69f'],
            ['#cfd9df', '#e2ebf0'],
            ['#1c92d2', '#f2fcfe'],
            ['#fccb90', '#d57eeb'],
            ['#e0c3fc', '#8ec5fc'],
            ['#ff0844', '#ffb199']
        ];

        // Init background selectors
        gradients.forEach((grad, idx) => {
            const div = document.createElement('div');
            div.className = `w-8 h-8 rounded-full cursor-pointer border-2 transition-transform hover:scale-110 ${idx === 0 ? 'border-gray-800' : 'border-transparent'}`;
            div.style.background = `linear-gradient(135deg, ${grad[0]}, ${grad[1]})`;
            div.onclick = () => {
                Array.from(bgSelectors.children).forEach(c => c.classList.replace('border-gray-800', 'border-transparent'));
                div.classList.replace('border-transparent', 'border-gray-800');
                currentBgGradient = grad;
                renderCanvas();
            };
            bgSelectors.appendChild(div);
        });

        // Load default text on canvas
        ctx.fillStyle = '#6b7280';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Vui lòng tải ảnh lên', canvas.width/2 || 150, canvas.height/2 || 75);

        imageUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                const imgObj = new Image();
                imgObj.onload = () => {
                    currentImage = imgObj;
                    renderCanvas();
                };
                imgObj.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });

        [paddingInput, radiusInput, shadowInput, macOsDots].forEach(el => {
            el.addEventListener('input', () => {
                document.getElementById('paddingVal').innerText = paddingInput.value + 'px';
                document.getElementById('radiusVal').innerText = radiusInput.value + 'px';
                document.getElementById('shadowVal').innerText = shadowInput.value + 'px';
                renderCanvas();
            });
        });

        function renderCanvas() {
            if (!currentImage) return;

            const padding = parseInt(paddingInput.value);
            const radius = parseInt(radiusInput.value);
            const shadow = parseInt(shadowInput.value);
            const hasDots = macOsDots.checked;
            const topBarHeight = hasDots ? 40 : 0;

            const imgW = currentImage.width;
            const imgH = currentImage.height;

            canvas.width = imgW + padding * 2;
            canvas.height = imgH + padding * 2 + topBarHeight;

            // Draw Background
            const grd = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            grd.addColorStop(0, currentBgGradient[0]);
            grd.addColorStop(1, currentBgGradient[1]);
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Setup Shadow
            ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
            ctx.shadowBlur = shadow * 3;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = shadow;

            // Draw Inner Window Background
            const winX = padding;
            const winY = padding;
            const winW = imgW;
            const winH = imgH + topBarHeight;

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.roundRect(winX, winY, winW, winH, radius);
            ctx.fill();

            // Reset shadow before drawing image so it doesn't leak
            ctx.shadowColor = 'transparent';

            // Draw Top Bar (macOS)
            if (hasDots) {
                const dotY = winY + 20;
                ctx.fillStyle = '#ff5f56';
                ctx.beginPath(); ctx.arc(winX + 20, dotY, 6, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = '#ffbd2e';
                ctx.beginPath(); ctx.arc(winX + 40, dotY, 6, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = '#27c93f';
                ctx.beginPath(); ctx.arc(winX + 60, dotY, 6, 0, Math.PI*2); ctx.fill();
            }

            // Draw Image (clipped to border radius)
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(winX, winY + topBarHeight, imgW, imgH, [hasDots ? 0 : radius, hasDots ? 0 : radius, radius, radius]);
            ctx.clip();
            ctx.drawImage(currentImage, winX, winY + topBarHeight, imgW, imgH);
            ctx.restore();
        }

        downloadBtn.addEventListener('click', () => {
            if (!currentImage) {
                alert('Vui lòng tải ảnh lên trước!');
                return;
            }
            const link = document.createElement('a');
            link.download = 'beautified-screenshot.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    

