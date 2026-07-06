
        const amountInput = document.getElementById('amountInput');
        const fromCurrency = document.getElementById('fromCurrency');
        const toCurrency = document.getElementById('toCurrency');
        const swapBtn = document.getElementById('swapBtn');
        const resultValue = document.getElementById('resultValue');
        const resultSymbol = document.getElementById('resultSymbol');
        const rateInfo = document.getElementById('rateInfo');
        
        const loadingIndicator = document.getElementById('loadingIndicator');
        const converterContent = document.getElementById('converterContent');

        let exchangeRates = {};
        let currentBase = "";

        async function fetchRates(base) {
            if (currentBase === base && exchangeRates[base]) return exchangeRates[base];
            
            // Show loading initially or if changing base
            loadingIndicator.classList.remove('hidden');
            converterContent.classList.add('opacity-50');

            try {
                const response = await fetch(`https://open.er-api.com/v6/latest/${base}`);
                const data = await response.json();
                if(data.result === "success") {
                    exchangeRates[base] = data.rates;
                    currentBase = base;
                } else {
                    throw new Error("API Error");
                }
            } catch (err) {
                console.error("Lỗi lấy tỷ giá:", err);
                alert("Đã có lỗi khi lấy tỷ giá tiền tệ. Vui lòng thử lại sau.");
            } finally {
                loadingIndicator.classList.add('hidden');
                converterContent.classList.remove('opacity-50');
            }
            return exchangeRates[base];
        }

        async function updateConversion() {
            const amount = parseFloat(amountInput.value) || 0;
            const from = fromCurrency.value;
            const to = toCurrency.value;

            const rates = await fetchRates(from);
            if (!rates) return;

            const rate = rates[to];
            const result = amount * rate;

            // Format number (e.g. 1,000,000.50)
            const formatter = new Intl.NumberFormat('en-US', {
                maximumFractionDigits: 2
            });

            resultValue.innerText = formatter.format(result);
            resultSymbol.innerText = to;
            rateInfo.innerText = `1 ${from} = ${formatter.format(rate)} ${to}`;
        }

        [amountInput, fromCurrency, toCurrency].forEach(el => {
            el.addEventListener('input', updateConversion);
            el.addEventListener('change', updateConversion);
        });

        swapBtn.addEventListener('click', () => {
            const temp = fromCurrency.value;
            fromCurrency.value = toCurrency.value;
            toCurrency.value = temp;
            updateConversion();
        });

        // Init
        updateConversion();
    

