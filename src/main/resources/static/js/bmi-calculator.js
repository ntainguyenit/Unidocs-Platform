
        const heightInput = document.getElementById('heightInput');
        const weightInput = document.getElementById('weightInput');
        const bmiValue = document.getElementById('bmiValue');
        const bmiCategory = document.getElementById('bmiCategory');
        const bmiAdvice = document.getElementById('bmiAdvice');
        const bmiScaleContainer = document.getElementById('bmiScaleContainer');
        const bmiMarker = document.getElementById('bmiMarker');

        function calculateBMI() {
            const h = parseFloat(heightInput.value);
            const w = parseFloat(weightInput.value);

            if (!h || !w || h <= 0 || w <= 0) {
                alert("Vui lòng nhập chiều cao và cân nặng hợp lệ.");
                return;
            }

            // BMI = W(kg) / (H(m) * H(m))
            const hm = h / 100;
            const bmi = w / (hm * hm);
            const roundedBMI = Math.round(bmi * 10) / 10;

            bmiValue.innerText = roundedBMI;
            bmiScaleContainer.classList.remove('hidden');

            let category = "";
            let colorClass = "";
            let advice = "";
            let percentage = 0; // mapping 15-40 to 0%-100%

            if (bmi < 18.5) {
                category = "Thiếu cân";
                colorClass = "text-blue-500";
                advice = "Bạn đang hơi gầy. Cần bổ sung thêm dinh dưỡng và tập thể dục nhẹ nhàng để tăng cơ.";
                percentage = ((bmi - 15) / (18.5 - 15)) * 25; // First 25% zone
            } else if (bmi >= 18.5 && bmi < 25) {
                category = "Bình thường";
                colorClass = "text-green-500";
                advice = "Tuyệt vời! Cơ thể bạn đang ở trạng thái rất cân đối. Hãy tiếp tục duy trì lối sống lành mạnh nhé.";
                percentage = 25 + ((bmi - 18.5) / (25 - 18.5)) * 25; // Second 25% zone
            } else if (bmi >= 25 && bmi < 30) {
                category = "Thừa cân";
                colorClass = "text-yellow-500";
                advice = "Bạn đang có dấu hiệu thừa cân. Hãy chú ý giảm bớt đồ ngọt, tinh bột và tăng cường vận động.";
                percentage = 50 + ((bmi - 25) / (30 - 25)) * 25; // Third 25% zone
            } else {
                category = "Béo phì";
                colorClass = "text-red-500";
                advice = "Cảnh báo! Thể trạng béo phì có thể dẫn đến nhiều vấn đề sức khỏe. Nên tham khảo ý kiến bác sĩ để có chế độ giảm cân phù hợp.";
                percentage = 75 + ((bmi - 30) / (40 - 30)) * 25; // Fourth 25% zone
            }

            // Clamp percentage
            if (percentage < 0) percentage = 0;
            if (percentage > 100) percentage = 100;

            bmiCategory.innerText = category;
            bmiCategory.className = `text-xl font-bold mb-4 ${colorClass}`;
            bmiAdvice.innerText = advice;
            bmiMarker.style.left = `${percentage}%`;
        }

        // Allow Enter key to calculate
        [heightInput, weightInput].forEach(el => {
            el.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    calculateBMI();
                }
            });
        });
    

