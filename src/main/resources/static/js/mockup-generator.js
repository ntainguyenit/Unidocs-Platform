document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('imageUpload');
    const mockupImage = document.getElementById('mockupImage');
    const imagePlaceholder = document.getElementById('imagePlaceholder');
    const captureArea = document.getElementById('captureArea');
    const bgBtns = document.querySelectorAll('.bg-btn');
    const downloadBtn = document.getElementById('downloadBtn');

    // Xử lý upload ảnh
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

    // Đổi màu nền
    bgBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Xóa hết class bg-grad
            captureArea.classList.remove('bg-grad-1', 'bg-grad-2', 'bg-grad-3', 'bg-grad-4');
            // Thêm class mới
            captureArea.classList.add(btn.dataset.bg);
        });
    });

    // Xuất ảnh PNG
    downloadBtn.addEventListener('click', () => {
        // Chờ hình ảnh render (nếu vừa đổi nền)
        setTimeout(() => {
            // Lưu trạng thái gốc
            const originalHTML = downloadBtn.innerHTML;
            downloadBtn.innerHTML = 'Đang xử lý...';
            downloadBtn.disabled = true;

            html2canvas(captureArea, {
                scale: 2, // Tăng chất lượng ảnh xuất ra (Retina)
                backgroundColor: null,
                useCORS: true // Hỗ trợ nếu dùng ảnh ngoài
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = 'unidocs-mockup.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
                
                // Trả lại trạng thái nút
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
