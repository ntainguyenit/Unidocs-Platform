document.addEventListener('DOMContentLoaded', () => {
    // Utilities for formatting
    const formatNumber = (num) => {
        if (!isFinite(num)) return '--';
        return Number.isInteger(num) ? num.toString() : parseFloat(num.toFixed(2)).toString();
    };

    // Type 1: X% của Y
    const t1_p = document.getElementById('t1_p');
    const t1_v = document.getElementById('t1_v');
    const t1_res = document.getElementById('t1_res');

    const calcType1 = () => {
        const p = parseFloat(t1_p.value);
        const v = parseFloat(t1_v.value);
        if (!isNaN(p) && !isNaN(v)) {
            t1_res.innerText = formatNumber((p / 100) * v);
        } else {
            t1_res.innerText = '--';
        }
    };
    t1_p.addEventListener('input', calcType1);
    t1_v.addEventListener('input', calcType1);

    // Type 2: A là bao nhiêu % của B
    const t2_a = document.getElementById('t2_a');
    const t2_b = document.getElementById('t2_b');
    const t2_res = document.getElementById('t2_res');
    const t2_unit = document.getElementById('t2_unit');

    const calcType2 = () => {
        const a = parseFloat(t2_a.value);
        const b = parseFloat(t2_b.value);
        if (!isNaN(a) && !isNaN(b) && b !== 0) {
            t2_res.innerText = formatNumber((a / b) * 100);
            t2_unit.classList.remove('hidden');
        } else {
            t2_res.innerText = '--';
            t2_unit.classList.add('hidden');
        }
    };
    t2_a.addEventListener('input', calcType2);
    t2_b.addEventListener('input', calcType2);

    // Type 3: Tăng/giảm từ X sang Y
    const t3_old = document.getElementById('t3_old');
    const t3_new = document.getElementById('t3_new');
    const t3_res = document.getElementById('t3_res');
    const t3_unit = document.getElementById('t3_unit');
    const t3_status = document.getElementById('t3_status');

    const calcType3 = () => {
        const oldVal = parseFloat(t3_old.value);
        const newVal = parseFloat(t3_new.value);
        if (!isNaN(oldVal) && !isNaN(newVal) && oldVal !== 0) {
            const diff = newVal - oldVal;
            const percentage = (diff / Math.abs(oldVal)) * 100;
            
            t3_res.innerText = formatNumber(Math.abs(percentage));
            t3_unit.classList.remove('hidden');
            
            t3_status.classList.remove('text-green-600', 'text-red-600', 'text-gray-500');
            if (percentage > 0) {
                t3_status.innerText = 'Tăng';
                t3_status.classList.add('text-green-600');
                t3_res.className = 'text-2xl font-black text-green-600';
                t3_unit.className = 'text-lg font-bold text-green-500 ml-1';
            } else if (percentage < 0) {
                t3_status.innerText = 'Giảm';
                t3_status.classList.add('text-red-600');
                t3_res.className = 'text-2xl font-black text-red-600';
                t3_unit.className = 'text-lg font-bold text-red-500 ml-1';
            } else {
                t3_status.innerText = 'Không đổi';
                t3_status.classList.add('text-gray-500');
                t3_res.className = 'text-2xl font-black text-gray-700';
                t3_unit.className = 'text-lg font-bold text-gray-500 ml-1';
            }
        } else {
            t3_res.innerText = '--';
            t3_res.className = 'text-2xl font-black text-blue-800';
            t3_unit.classList.add('hidden');
            t3_status.innerText = '';
        }
    };
    t3_old.addEventListener('input', calcType3);
    t3_new.addEventListener('input', calcType3);
});
