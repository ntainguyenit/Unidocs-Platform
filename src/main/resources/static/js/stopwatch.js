
        const display = document.getElementById('display');
        const startBtn = document.getElementById('startBtn');
        const lapBtn = document.getElementById('lapBtn');
        const lapsList = document.getElementById('lapsList');

        let startTime = 0;
        let elapsedTime = 0;
        let timerInterval;
        let isRunning = false;
        let laps = [];

        function formatTime(time) {
            let date = new Date(time);
            let m = date.getUTCMinutes().toString().padStart(2, '0');
            let s = date.getUTCSeconds().toString().padStart(2, '0');
            let ms = Math.floor(date.getUTCMilliseconds() / 10).toString().padStart(2, '0');
            return `${m}:${s}<span class="text-4xl md:text-5xl text-gray-400">.${ms}</span>`;
        }

        function formatLapTime(time) {
            let date = new Date(time);
            let m = date.getUTCMinutes().toString().padStart(2, '0');
            let s = date.getUTCSeconds().toString().padStart(2, '0');
            let ms = Math.floor(date.getUTCMilliseconds() / 10).toString().padStart(2, '0');
            return `${m}:${s}.${ms}`;
        }

        function printTime() {
            display.innerHTML = formatTime(elapsedTime);
        }

        function start() {
            startTime = Date.now() - elapsedTime;
            timerInterval = setInterval(() => {
                elapsedTime = Date.now() - startTime;
                printTime();
            }, 10);
            
            startBtn.innerText = 'Dừng';
            startBtn.className = 'w-20 h-20 rounded-full bg-red-100 text-red-700 font-bold hover:bg-red-200 transition-colors';
            
            lapBtn.innerText = 'Vòng';
            lapBtn.disabled = false;
            
            isRunning = true;
        }

        function stop() {
            clearInterval(timerInterval);
            
            startBtn.innerText = 'Tiếp tục';
            startBtn.className = 'w-20 h-20 rounded-full bg-green-100 text-green-700 font-bold hover:bg-green-200 transition-colors';
            
            lapBtn.innerText = 'Đặt lại';
            isRunning = false;
        }

        function reset() {
            clearInterval(timerInterval);
            elapsedTime = 0;
            laps = [];
            printTime();
            lapsList.innerHTML = '';
            
            startBtn.innerText = 'Bắt đầu';
            startBtn.className = 'w-20 h-20 rounded-full bg-green-100 text-green-700 font-bold hover:bg-green-200 transition-colors';
            
            lapBtn.innerText = 'Vòng';
            lapBtn.disabled = true;
            isRunning = false;
        }

        function lap() {
            laps.unshift(elapsedTime); // add to front
            renderLaps();
        }

        function renderLaps() {
            lapsList.innerHTML = '';
            laps.forEach((lapTime, idx) => {
                const li = document.createElement('li');
                li.className = 'flex justify-between items-center py-3 border-b border-gray-50 text-gray-600 font-medium tabular-nums px-2';
                
                // Calculate difference from previous lap
                let diffTime = lapTime;
                if (idx < laps.length - 1) {
                    diffTime = lapTime - laps[idx + 1];
                }

                li.innerHTML = `
                    <span class="text-gray-400">Vòng ${laps.length - idx}</span>
                    <span class="text-gray-400 text-sm">+${formatLapTime(diffTime)}</span>
                    <span class="text-gray-900">${formatLapTime(lapTime)}</span>
                `;
                lapsList.appendChild(li);
            });
        }

        startBtn.addEventListener('click', () => {
            if (isRunning) {
                stop();
            } else {
                start();
            }
        });

        lapBtn.addEventListener('click', () => {
            if (isRunning) {
                lap();
            } else {
                reset();
            }
        });
    

