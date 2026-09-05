document.addEventListener('DOMContentLoaded', () => {
    // === TABS LOGIC ===
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => {
                c.classList.remove('block');
                c.classList.add('hidden');
            });
            btn.classList.add('active');
            document.getElementById(btn.dataset.target).classList.remove('hidden');
            document.getElementById(btn.dataset.target).classList.add('block');
        });
    });

    // === 1. DISTANCE LOGIC ===
    const distStart = document.getElementById('distStart');
    const distEnd = document.getElementById('distEnd');
    const distResult = document.getElementById('distResult');

    // Default to today and tomorrow
    const today = new Date();
    distStart.value = today.toISOString().split('T')[0];
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    distEnd.value = tomorrow.toISOString().split('T')[0];

    const calcDistance = () => {
        if (!distStart.value || !distEnd.value) return;
        const d1 = new Date(distStart.value);
        const d2 = new Date(distEnd.value);
        const diffTime = Math.abs(d2 - d1);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        distResult.innerText = diffDays.toLocaleString('vi-VN') + " ngày";
    };

    distStart.addEventListener('change', calcDistance);
    distEnd.addEventListener('change', calcDistance);
    calcDistance();

    // === 2. COUNTDOWN LOGIC ===
    const countTarget = document.getElementById('countTarget');
    const cD = document.getElementById('countD');
    const cH = document.getElementById('countH');
    const cM = document.getElementById('countM');
    const cS = document.getElementById('countS');
    let countdownInterval;

    // Default to next year
    const nextYear = new Date(today.getFullYear() + 1, 0, 1);
    // Format for datetime-local: YYYY-MM-DDThh:mm
    const tzOffset = (new Date()).getTimezoneOffset() * 60000;
    countTarget.value = (new Date(nextYear - tzOffset)).toISOString().slice(0, 16);

    const updateCountdown = () => {
        const target = new Date(countTarget.value).getTime();
        const now = new Date().getTime();
        const distance = target - now;

        if (distance < 0) {
            cD.innerText = '0'; cH.innerText = '0';
            cM.innerText = '0'; cS.innerText = '0';
            return;
        }

        cD.innerText = Math.floor(distance / (1000 * 60 * 60 * 24));
        cH.innerText = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        cM.innerText = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        cS.innerText = Math.floor((distance % (1000 * 60)) / 1000);
    };

    const startCountdown = () => {
        clearInterval(countdownInterval);
        updateCountdown();
        countdownInterval = setInterval(updateCountdown, 1000);
    };

    countTarget.addEventListener('change', startCountdown);
    startCountdown();

    // === 3. AGE LOGIC ===
    const ageBirth = document.getElementById('ageBirth');
    const ageY = document.getElementById('ageY');
    const ageMo = document.getElementById('ageMo');
    const ageD = document.getElementById('ageD');
    const ageT_D = document.getElementById('ageT_D');
    const ageT_H = document.getElementById('ageT_H');
    const ageT_M = document.getElementById('ageT_M');
    const ageT_S = document.getElementById('ageT_S');
    let ageInterval;

    const calcAge = () => {
        if (!ageBirth.value) return;
        const birth = new Date(ageBirth.value).getTime();
        const now = new Date().getTime();
        
        if (now < birth) return; // Future birthdate invalid

        const diff = now - birth;

        // Overview (Estimated)
        const dDate = new Date(now);
        const bDate = new Date(birth);
        
        let years = dDate.getFullYear() - bDate.getFullYear();
        let months = dDate.getMonth() - bDate.getMonth();
        let days = dDate.getDate() - bDate.getDate();

        if (days < 0) {
            months--;
            const lastMonth = new Date(dDate.getFullYear(), dDate.getMonth(), 0);
            days += lastMonth.getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }

        ageY.innerText = years;
        ageMo.innerText = months;
        ageD.innerText = days;

        // Details
        const tDays = Math.floor(diff / (1000 * 60 * 60 * 24));
        const tHours = Math.floor(diff / (1000 * 60 * 60));
        const tMins = Math.floor(diff / (1000 * 60));
        const tSecs = Math.floor(diff / 1000);

        ageT_D.innerText = tDays.toLocaleString('vi-VN');
        ageT_H.innerText = tHours.toLocaleString('vi-VN');
        ageT_M.innerText = tMins.toLocaleString('vi-VN');
        ageT_S.innerText = tSecs.toLocaleString('vi-VN');
    };

    const startAgeCounter = () => {
        clearInterval(ageInterval);
        calcAge();
        ageInterval = setInterval(calcAge, 1000);
    };

    ageBirth.addEventListener('change', startAgeCounter);
    
    // Set default birth (18 years ago roughly)
    const defB = new Date();
    defB.setFullYear(defB.getFullYear() - 18);
    ageBirth.value = (new Date(defB - tzOffset)).toISOString().slice(0, 16);
    startAgeCounter();
});
