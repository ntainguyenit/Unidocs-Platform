document.addEventListener('DOMContentLoaded', () => {
    const inpDec = document.getElementById('inpDec');
    const inpBin = document.getElementById('inpBin');
    const inpHex = document.getElementById('inpHex');
    const inpOct = document.getElementById('inpOct');
    const errorMsg = document.getElementById('errorMsg');
    const clearBtn = document.getElementById('clearBtn');

    const validateAndConvert = (value, baseFrom) => {
        if (!value.trim()) {
            clearAll();
            return;
        }

        let decimalValue = NaN;

        try {
            // Regex validation before parsing
            if (baseFrom === 10 && !/^-?\d+$/.test(value)) throw new Error("Chỉ cho phép số thập phân (0-9)");
            if (baseFrom === 2 && !/^[01]+$/.test(value)) throw new Error("Chỉ cho phép số nhị phân (0-1)");
            if (baseFrom === 16 && !/^[0-9A-Fa-f]+$/.test(value)) throw new Error("Chỉ cho phép số Hex (0-9, A-F)");
            if (baseFrom === 8 && !/^[0-7]+$/.test(value)) throw new Error("Chỉ cho phép số bát phân (0-7)");

            decimalValue = parseInt(value, baseFrom);
            
            if (isNaN(decimalValue)) {
                throw new Error("Không thể chuyển đổi giá trị này.");
            }

            errorMsg.classList.add('hidden');

            // Update others
            if (baseFrom !== 10) inpDec.value = decimalValue.toString(10);
            if (baseFrom !== 2) inpBin.value = decimalValue.toString(2);
            if (baseFrom !== 16) inpHex.value = decimalValue.toString(16).toUpperCase();
            if (baseFrom !== 8) inpOct.value = decimalValue.toString(8);

        } catch (e) {
            errorMsg.innerText = e.message;
            errorMsg.classList.remove('hidden');
        }
    };

    const clearAll = () => {
        inpDec.value = '';
        inpBin.value = '';
        inpHex.value = '';
        inpOct.value = '';
        errorMsg.classList.add('hidden');
    };

    inpDec.addEventListener('input', (e) => validateAndConvert(e.target.value, 10));
    inpBin.addEventListener('input', (e) => validateAndConvert(e.target.value, 2));
    inpHex.addEventListener('input', (e) => validateAndConvert(e.target.value, 16));
    inpOct.addEventListener('input', (e) => validateAndConvert(e.target.value, 8));

    clearBtn.addEventListener('click', clearAll);
});
