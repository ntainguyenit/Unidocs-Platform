document.addEventListener('DOMContentLoaded', () => {
    const textColorPicker = document.getElementById('textColorPicker');
    const textColorHex = document.getElementById('textColorHex');
    const bgColorPicker = document.getElementById('bgColorPicker');
    const bgColorHex = document.getElementById('bgColorHex');
    const swapBtn = document.getElementById('swapBtn');
    
    const previewBox = document.getElementById('previewBox');
    const ratioText = document.getElementById('ratioText');
    const statusBadge = document.getElementById('statusBadge');
    
    const resLarge = document.getElementById('resLarge');
    const resNormal = document.getElementById('resNormal');
    const resAAA = document.getElementById('resAAA');

    const iconPass = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;
    const iconFail = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;

    // Tính Luminance của 1 màu (công thức WCAG)
    const getLuminance = (r, g, b) => {
        let [rs, gs, bs] = [r / 255, g / 255, b / 255];
        rs = rs <= 0.03928 ? rs / 12.92 : Math.pow(((rs + 0.055) / 1.055), 2.4);
        gs = gs <= 0.03928 ? gs / 12.92 : Math.pow(((gs + 0.055) / 1.055), 2.4);
        bs = bs <= 0.03928 ? bs / 12.92 : Math.pow(((bs + 0.055) / 1.055), 2.4);
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    // Chuyển HEX sang RGB
    const hexToRgb = (hex) => {
        hex = hex.replace(/^#/, '');
        if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
        const num = parseInt(hex, 16);
        return [num >> 16, num >> 8 & 255, num & 255];
    };

    // Cập nhật giao diện và tỷ lệ
    const calculateContrast = () => {
        let textHex = textColorHex.value;
        let bgHex = bgColorHex.value;
        
        // Cập nhật màu Preview
        previewBox.style.color = textHex;
        previewBox.style.backgroundColor = bgHex;

        // Tính toán
        try {
            const rgbText = hexToRgb(textHex);
            const rgbBg = hexToRgb(bgHex);
            
            const lumText = getLuminance(...rgbText);
            const lumBg = getLuminance(...rgbBg);
            
            const lighter = Math.max(lumText, lumBg);
            const darker = Math.min(lumText, lumBg);
            const ratio = (lighter + 0.05) / (darker + 0.05);
            
            const r = ratio.toFixed(2);
            ratioText.innerText = r;

            // Đánh giá
            const isLargePass = ratio >= 3;
            const isNormalPass = ratio >= 4.5;
            const isAAAPass = ratio >= 7;

            // Update icons
            resLarge.innerHTML = isLargePass ? iconPass : iconFail;
            resLarge.className = isLargePass ? 'text-green-600' : 'text-red-500';

            resNormal.innerHTML = isNormalPass ? iconPass : iconFail;
            resNormal.className = isNormalPass ? 'text-green-600' : 'text-red-500';

            resAAA.innerHTML = isAAAPass ? iconPass : iconFail;
            resAAA.className = isAAAPass ? 'text-green-600' : 'text-red-500';

            // Update Badge
            if (isAAAPass) {
                statusBadge.innerText = 'TUYỆT VỜI';
                statusBadge.className = 'px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800';
            } else if (isNormalPass) {
                statusBadge.innerText = 'ĐẠT (TỐT)';
                statusBadge.className = 'px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800';
            } else if (isLargePass) {
                statusBadge.innerText = 'KÉM (CHỈ CHỮ LỚN)';
                statusBadge.className = 'px-3 py-1 rounded-full text-sm font-bold bg-yellow-100 text-yellow-800';
            } else {
                statusBadge.innerText = 'KHÔNG ĐẠT';
                statusBadge.className = 'px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-800';
            }

        } catch (e) {
            console.error('Lỗi tính toán', e);
        }
    };

    // Listeners
    const onColorChange = (type, val) => {
        if (type === 'text') {
            textColorPicker.value = val;
            textColorHex.value = val;
        } else {
            bgColorPicker.value = val;
            bgColorHex.value = val;
        }
        calculateContrast();
    };

    textColorPicker.addEventListener('input', (e) => onColorChange('text', e.target.value));
    bgColorPicker.addEventListener('input', (e) => onColorChange('bg', e.target.value));
    
    // Hex input validation
    textColorHex.addEventListener('input', (e) => {
        let val = e.target.value;
        if (/^#[0-9A-F]{6}$/i.test(val)) onColorChange('text', val);
    });
    bgColorHex.addEventListener('input', (e) => {
        let val = e.target.value;
        if (/^#[0-9A-F]{6}$/i.test(val)) onColorChange('bg', val);
    });

    // Swap button
    swapBtn.addEventListener('click', () => {
        const t = textColorHex.value;
        onColorChange('text', bgColorHex.value);
        onColorChange('bg', t);
    });

    // Chạy lần đầu
    calculateContrast();
});
