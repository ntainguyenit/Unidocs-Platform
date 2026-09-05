document.addEventListener('DOMContentLoaded', () => {
    const qrInput = document.getElementById('qrInput');
    const generateBtn = document.getElementById('generateBtn');
    const qrResult = document.getElementById('qrResult');
    const qrcodeContainer = document.getElementById('qrcode');
    let qr = null;

    generateBtn.addEventListener('click', () => {
        const text = qrInput.value.trim();
        
        if (!text) {
            alert('Vui lòng nhập nội dung hoặc đường link để tạo mã QR.');
            qrInput.focus();
            return;
        }

        // Hiện kết quả
        qrResult.classList.remove('hidden');
        qrResult.classList.add('flex');
        
        // Remove old QR if exists
        qrcodeContainer.innerHTML = '';
        
        // Generate new QR
        qr = new QRCode(qrcodeContainer, {
            text: text,
            width: 200,
            height: 200,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });
        
        // Hiệu ứng nút bấm
        const originalHTML = generateBtn.innerHTML;
        generateBtn.innerHTML = `<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Đã tạo thành công`;
        generateBtn.classList.replace('bg-blue-800', 'bg-green-600');
        generateBtn.classList.replace('hover:bg-blue-900', 'hover:bg-green-700');
        
        setTimeout(() => {
            generateBtn.innerHTML = originalHTML;
            generateBtn.classList.replace('bg-green-600', 'bg-blue-800');
            generateBtn.classList.replace('hover:bg-green-700', 'hover:bg-blue-900');
        }, 2000);
    });
    
    // Hỗ trợ tạo bằng phím Enter (nếu không nhập nhiều dòng)
    qrInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            generateBtn.click();
        }
    });
});
