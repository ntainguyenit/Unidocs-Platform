document.addEventListener('DOMContentLoaded', () => {
    const loading = document.getElementById('loading');
    const ipResult = document.getElementById('ipResult');
    const errorState = document.getElementById('errorState');
    
    const ipAddress = document.getElementById('ipAddress');
    const ipIsp = document.getElementById('ipIsp');
    const ipLocation = document.getElementById('ipLocation');
    const copyBtn = document.getElementById('copyBtn');

    // Fetch IP Data
    fetch('https://ipapi.co/json/')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            // Hide loading
            loading.classList.add('hidden');
            
            // Show result
            ipResult.classList.remove('hidden');
            ipResult.classList.add('flex');
            
            // Populate data
            ipAddress.innerText = data.ip || 'Không xác định';
            ipIsp.innerText = data.org || 'Không xác định';
            
            const city = data.city || '';
            const country = data.country_name || '';
            ipLocation.innerText = [city, country].filter(Boolean).join(', ') || 'Không xác định';
        })
        .catch(err => {
            console.error('Error fetching IP:', err);
            // Fallback to simpler API if ipapi.co fails or rate limits
            fetch('https://api.ipify.org?format=json')
                .then(res => res.json())
                .then(data => {
                    loading.classList.add('hidden');
                    ipResult.classList.remove('hidden');
                    ipResult.classList.add('flex');
                    
                    ipAddress.innerText = data.ip;
                    ipIsp.innerText = 'Không có thông tin (chế độ dự phòng)';
                    ipLocation.innerText = 'Không có thông tin';
                })
                .catch(fallbackErr => {
                    console.error('Fallback error:', fallbackErr);
                    loading.classList.add('hidden');
                    errorState.classList.remove('hidden');
                });
        });

    // Copy to clipboard
    const handleCopy = () => {
        const text = ipAddress.innerText;
        if (!text || text === 'Không xác định') return;
        
        navigator.clipboard.writeText(text).then(() => {
            const originalHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = `<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Đã chép`;
            copyBtn.classList.replace('text-blue-700', 'text-green-700');
            copyBtn.classList.replace('bg-blue-50', 'bg-green-50');
            copyBtn.classList.replace('hover:bg-blue-100', 'hover:bg-green-100');
            copyBtn.classList.replace('border-blue-200', 'border-green-200');
            
            setTimeout(() => {
                copyBtn.innerHTML = originalHTML;
                copyBtn.classList.replace('text-green-700', 'text-blue-700');
                copyBtn.classList.replace('bg-green-50', 'bg-blue-50');
                copyBtn.classList.replace('hover:bg-green-100', 'hover:bg-blue-100');
                copyBtn.classList.replace('border-green-200', 'border-blue-200');
            }, 2000);
        });
    };

    copyBtn.addEventListener('click', handleCopy);
    ipAddress.addEventListener('click', handleCopy);
});
