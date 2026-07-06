
        const canvas = document.getElementById('wheelCanvas');
        const ctx = canvas.getContext('2d');
        const itemsInput = document.getElementById('itemsInput');
        const spinBtn = document.getElementById('spinBtn');
        const winnerModal = document.getElementById('winnerModal');
        const winnerText = document.getElementById('winnerText');

        let items = [];
        let currentDeg = 0;
        let isSpinning = false;

        const colors = [
            '#ef4444', '#f97316', '#f59e0b', '#84cc16', 
            '#10b981', '#06b6d4', '#3b82f6', '#6366f1', 
            '#8b5cf6', '#d946ef', '#f43f5e'
        ];

        function getItems() {
            return itemsInput.value.split('\n').map(i => i.trim()).filter(i => i !== '');
        }

        function drawWheel() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            items = getItems();
            
            if (items.length === 0) {
                ctx.beginPath();
                ctx.arc(200, 200, 200, 0, 2 * Math.PI);
                ctx.fillStyle = '#e5e7eb';
                ctx.fill();
                ctx.fillStyle = '#6b7280';
                ctx.font = '20px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Danh sách rỗng', 200, 200);
                return;
            }

            const sliceAngle = (2 * Math.PI) / items.length;

            for (let i = 0; i < items.length; i++) {
                ctx.beginPath();
                ctx.moveTo(200, 200);
                ctx.arc(200, 200, 200, i * sliceAngle, (i + 1) * sliceAngle);
                ctx.fillStyle = colors[i % colors.length];
                ctx.fill();
                ctx.save();

                // Draw text
                ctx.translate(200, 200);
                ctx.rotate(i * sliceAngle + sliceAngle / 2);
                ctx.textAlign = 'right';
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 16px Arial';
                // Adjust text position
                let text = items[i];
                if(text.length > 20) text = text.substring(0, 17) + '...';
                ctx.fillText(text, 180, 5);
                ctx.restore();
            }
        }

        function updateWheel() {
            if(isSpinning) return;
            drawWheel();
        }

        spinBtn.addEventListener('click', () => {
            if (isSpinning) return;
            items = getItems();
            if (items.length === 0) return;

            isSpinning = true;
            spinBtn.classList.add('opacity-50', 'cursor-not-allowed');

            // Tính toán góc quay ngẫu nhiên (tối thiểu 5 vòng + random)
            const spinRevolutions = 5 + Math.random() * 5;
            const extraDeg = Math.random() * 360;
            const totalDeg = spinRevolutions * 360 + extraDeg;
            
            currentDeg += totalDeg;
            canvas.style.transform = `rotate(${currentDeg}deg)`;

            setTimeout(() => {
                isSpinning = false;
                spinBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                
                // Tính toán kết quả
                // Vòng quay quay theo chiều kim đồng hồ, nhưng góc tính bằng CSS là độ.
                // Kim chỉ nằm ở góc 270 độ (đỉnh trên cùng).
                // Phải tính góc thực tế đã quay modulo 360
                const actualDeg = currentDeg % 360;
                
                // Mặc định CSS quay kim đồng hồ. 
                // Slice 0 bắt đầu từ 0 độ (hướng 3h), quay đến sliceAngle.
                // Để kim (hướng 12h, góc 270) chỉ vào đâu:
                // Công thức = (360 - actualDeg + 270) % 360
                const pointerDeg = (630 - actualDeg) % 360;
                
                const sliceAngleDeg = 360 / items.length;
                const winnerIndex = Math.floor(pointerDeg / sliceAngleDeg);
                
                const winner = items[winnerIndex];
                showWinnerModal(winner);

            }, 5000); // 5s transition
        });

        function showWinnerModal(text) {
            winnerText.innerText = text;
            winnerModal.classList.remove('hidden');
            // Bắn pháo hoa
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 },
                zIndex: 1000
            });
        }

        function closeWinnerModal() {
            winnerModal.classList.add('hidden');
        }

        // Init
        drawWheel();
    

