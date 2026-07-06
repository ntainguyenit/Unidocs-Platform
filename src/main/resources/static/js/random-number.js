
        const minInput = document.getElementById('minInput');
        const maxInput = document.getElementById('maxInput');
        const resultValue = document.getElementById('resultValue');
        const generateBtn = document.getElementById('generateBtn');
        
        let isGenerating = false;

        generateBtn.addEventListener('click', () => {
            if (isGenerating) return;

            const min = parseInt(minInput.value);
            const max = parseInt(maxInput.value);

            if (isNaN(min) || isNaN(max) || min >= max) {
                alert("Vui lòng nhập Min nhỏ hơn Max.");
                return;
            }

            isGenerating = true;
            generateBtn.disabled = true;
            generateBtn.classList.add('opacity-50', 'cursor-not-allowed');
            
            // Slot machine effect
            let duration = 1500; // 1.5s
            let interval = 50; // updates every 50ms
            let elapsed = 0;

            const roll = setInterval(() => {
                elapsed += interval;
                
                // Slow down effect
                if (elapsed > duration * 0.7) {
                    interval = 100;
                }
                if (elapsed > duration * 0.85) {
                    interval = 200;
                }

                const randomTemp = Math.floor(Math.random() * (max - min + 1)) + min;
                resultValue.innerText = randomTemp;

                if (elapsed >= duration) {
                    clearInterval(roll);
                    // Final value
                    const finalResult = Math.floor(Math.random() * (max - min + 1)) + min;
                    resultValue.innerText = finalResult;
                    
                    // Add a tiny bump animation
                    resultValue.classList.add('scale-110', 'text-yellow-200');
                    setTimeout(() => {
                        resultValue.classList.remove('scale-110', 'text-yellow-200');
                    }, 200);

                    isGenerating = false;
                    generateBtn.disabled = false;
                    generateBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                }
            }, interval);
        });
    

