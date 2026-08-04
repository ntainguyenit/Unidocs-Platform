document.addEventListener('DOMContentLoaded', () => {
    const colorPicker = document.getElementById('colorPicker');
    const colorInput = document.getElementById('colorInput');
    const errorMsg = document.getElementById('errorMsg');
    const resultsGrid = document.getElementById('resultsGrid');

    const updateUI = (val, fromPicker = false) => {
        const tColor = tinycolor(val);
        
        if (!tColor.isValid()) {
            errorMsg.classList.remove('hidden');
            return;
        }
        errorMsg.classList.add('hidden');

        const hex = tColor.toHexString();
        if (!fromPicker) {
            colorPicker.value = hex;
        }

        // CMYK Approximation (since tinycolor doesn't do cmyk out of box perfectly)
        const toCMYK = (color) => {
            let r = color._r / 255;
            let g = color._g / 255;
            let b = color._b / 255;
            let k = 1 - Math.max(r, g, b);
            if (k === 1) return `cmyk(0%, 0%, 0%, 100%)`;
            let c = (1 - r - k) / (1 - k);
            let m = (1 - g - k) / (1 - k);
            let y = (1 - b - k) / (1 - k);
            return `cmyk(${Math.round(c*100)}%, ${Math.round(m*100)}%, ${Math.round(y*100)}%, ${Math.round(k*100)}%)`;
        };

        const formats = [
            { name: 'HEX', val: hex.toUpperCase() },
            { name: 'RGB', val: tColor.toRgbString() },
            { name: 'HSL', val: tColor.toHslString() },
            { name: 'HSV', val: tColor.toHsvString() },
            { name: 'CMYK', val: toCMYK(tColor) },
            { name: 'CSS Name', val: tColor.toName() || 'Không có tên' }
        ];

        resultsGrid.innerHTML = formats.map(f => `
            <div class="bg-gray-50 border border-gray-200 rounded-xl p-4 flex justify-between items-center group hover:border-blue-300 transition-colors">
                <div>
                    <p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">${f.name}</p>
                    <p class="font-mono text-gray-900 font-medium">${f.val}</p>
                </div>
                <button onclick="navigator.clipboard.writeText('${f.val}'); this.innerHTML='Đã chép!'; setTimeout(()=>this.innerHTML='Copy', 1500);" class="text-xs bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium py-1.5 px-3 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">Copy</button>
            </div>
        `).join('');
    };

    colorPicker.addEventListener('input', (e) => {
        colorInput.value = e.target.value.toUpperCase();
        updateUI(e.target.value, true);
    });

    colorInput.addEventListener('input', (e) => {
        updateUI(e.target.value, false);
    });

    // Init
    updateUI(colorInput.value);
});
