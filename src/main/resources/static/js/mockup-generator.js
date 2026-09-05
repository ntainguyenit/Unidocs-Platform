document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('imageUpload');
    const mockupImage = document.getElementById('mockupImage');
    const imagePlaceholder = document.getElementById('imagePlaceholder');
    const captureArea = document.getElementById('captureArea');
    const bgBtns = document.querySelectorAll('.bg-btn');
    const downloadBtn = document.getElementById('downloadBtn');

    // Handle image upload
    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                mockupImage.src = event.target.result;
                mockupImage.classList.remove('hidden');
                imagePlaceholder.classList.add('hidden');
            };
            reader.readAsDataURL(file);
        }
    });

    // Change background color
    bgBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove all bg-grad classes
            captureArea.classList.remove('bg-grad-1', 'bg-grad-2', 'bg-grad-3', 'bg-grad-4');
            // Add new class
            captureArea.classList.add(btn.dataset.bg);
        });
    });

    // Export PNG image
    downloadBtn.addEventListener('click', () => {
        // Chờ hình ảnh render (nếu vừa đổi nền)
        setTimeout(() => {
            // Lưu trạng thái gốc
            const originalHTML = downloadBtn.innerHTML;
            downloadBtn.innerHTML = 'Đang xử lý...';
            downloadBtn.disabled = true;

            html2canvas(captureArea, {
                scale: 2, // Increase output image quality (Retina)
                backgroundColor: null,
                useCORS: true // Hỗ trợ nếu dùng ảnh ngoài
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = 'unidocs-mockup.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
                
                // Restore button state
                downloadBtn.innerHTML = originalHTML;
                downloadBtn.disabled = false;
            }).catch(err => {
                console.error("Lỗi tạo ảnh:", err);
                alert("Đã xảy ra lỗi khi tạo ảnh!");
                downloadBtn.innerHTML = originalHTML;
                downloadBtn.disabled = false;
            });
        }, 100);
    });
});
