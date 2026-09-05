
        let exams = [];
        try {
            const stored = localStorage.getItem('unidocs_exams');
            if (stored) exams = JSON.parse(decodeURIComponent(atob(stored)));
        } catch(e) {
            try { exams = JSON.parse(localStorage.getItem('unidocs_exams')) || []; } catch(e){}
        }
        let countdownInterval;

        function saveExams() {
            localStorage.setItem('unidocs_exams', btoa(encodeURIComponent(JSON.stringify(exams))));
        }

        function renderExams() {
            const listEl = document.getElementById('examList');
            const emptyEl = document.getElementById('emptyList');
            
            listEl.innerHTML = '';
            
            // Remove past exams older than 1 day
            const now = new Date().getTime();
            exams = exams.filter(e => new Date(e.date).getTime() > now - 86400000);
            
            // Sort by most recent
            exams.sort((a, b) => new Date(a.date) - new Date(b.date));
            saveExams();

            if (exams.length === 0) {
                emptyEl.classList.remove('hidden');
                document.getElementById('closestExamContainer').classList.add('hidden');
                if (countdownInterval) clearInterval(countdownInterval);
                return;
            } else {
                emptyEl.classList.add('hidden');
            }

            exams.forEach((exam, index) => {
                const examTime = new Date(exam.date).getTime();
                const isPast = now > examTime;
                
                const div = document.createElement('div');
                div.className = `flex justify-between items-center p-4 rounded-lg border ${index === 0 ? 'border-red-300 bg-red-50/30' : 'border-gray-200 bg-white'}`;
                
                let timeStr = new Date(exam.date).toLocaleString('vi-VN');
                
                div.innerHTML = `
                    <div>
                        <h4 class="font-bold text-gray-900 ${isPast ? 'line-through text-gray-500' : ''}">${exam.name} ${index === 0 ? '<span class="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Tiếp theo</span>' : ''}</h4>
                        <p class="text-sm text-gray-500">${timeStr}</p>
                    </div>
                    <button onclick="deleteExam('${exam.id}')" class="text-red-400 hover:text-red-600 p-2" title="Xóa">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                `;
                listEl.appendChild(div);
            });

            startCountdown();
        }

        function deleteExam(id) {
            if(confirm('Xóa lịch thi này?')) {
                exams = exams.filter(e => e.id !== id);
                renderExams();
            }
        }

        function startCountdown() {
            if (countdownInterval) clearInterval(countdownInterval);
            
            const upcomingExams = exams.filter(e => new Date(e.date).getTime() > new Date().getTime());
            
            if (upcomingExams.length === 0) {
                document.getElementById('closestExamContainer').classList.add('hidden');
                return;
            }

            document.getElementById('closestExamContainer').classList.remove('hidden');
            const nextExam = upcomingExams[0];
            const examTime = new Date(nextExam.date).getTime();
            
            document.getElementById('closestName').innerText = nextExam.name;
            document.getElementById('closestDateStr').innerText = new Date(nextExam.date).toLocaleString('vi-VN');

            countdownInterval = setInterval(() => {
                const now = new Date().getTime();
                const distance = examTime - now;

                if (distance < 0) {
                    clearInterval(countdownInterval);
                    renderExams();
                    return;
                }

                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                document.getElementById('countDays').innerText = days;
                document.getElementById('countHours').innerText = hours.toString().padStart(2, '0');
                document.getElementById('countMins').innerText = minutes.toString().padStart(2, '0');
                document.getElementById('countSecs').innerText = seconds.toString().padStart(2, '0');
            }, 1000);
        }

        document.getElementById('examForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('examName').value;
            const date = document.getElementById('examDate').value;

            if (name && date) {
                exams.push({
                    id: Date.now().toString(),
                    name: name,
                    date: date
                });
                
                document.getElementById('examName').value = '';
                document.getElementById('examDate').value = '';
                
                renderExams();
            }
        });

        // Initialize minimum date for input
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        document.getElementById('examDate').min = now.toISOString().slice(0,16);

        renderExams();
    

