document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('imageUpload');
    const imagePreview = document.getElementById('imagePreview');
    const uploadArea = document.getElementById('uploadArea');
    const resetBtn = document.getElementById('resetBtn');
    const paletteContainer = document.getElementById('paletteContainer');

    const colorThief = new ColorThief();

    const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');

    const displayColors = (palette) => {
        paletteContainer.innerHTML = ''; // Xóa text cũ

        palette.forEach(rgb => {
            const hex = rgbToHex(rgb[0], rgb[1], rgb[2]).toUpperCase();
            
            const item = document.createElement('div');
            item.className = "flex flex-col items-center group cursor-pointer w-24";
            
            // Cục màu
            const colorBox = document.createElement('div');
            colorBox.className = "w-16 h-16 rounded-full shadow-md border-2 border-white mb-2 transform transition-transform group-hover:scale-110";
            colorBox.style.backgroundColor = hex;
            
            // Text HEX
            const text = document.createElement('span');
            text.className = "text-xs font-mono font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded transition-colors group-hover:bg-blue-100 group-hover:text-blue-700";
            text.innerText = hex;
            
            item.appendChild(colorBox);
            item.appendChild(text);

            // Copy logic
            item.addEventListener('click', () => {
                navigator.clipboard.writeText(hex).then(() => {
                    const oldText = text.innerText;
                    text.innerText = 'Đã chép!';
                    text.classList.add('bg-green-100', 'text-green-700');
                    setTimeout(() => {
                        text.innerText = oldText;
                        text.classList.remove('bg-green-100', 'text-green-700');
                    }, 1500);
                });
            });

            paletteContainer.appendChild(item);
        });
    };

    const processImage = () => {
        // Đảm bảo ảnh đã load xong mới lấy màu
        if (imagePreview.complete) {
            try {
                // Lấy 6 màu
                const palette = colorThief.getPalette(imagePreview, 6);
                displayColors(palette);
            } catch (e) {
                console.error(e);
                paletteContainer.innerHTML = '<p class="text-red-500">Lỗi trích xuất màu. Hãy thử ảnh khác!</p>';
            }
        }
    };

    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                imagePreview.src = event.target.result;
                
                uploadArea.classList.add('hidden');
                imagePreview.classList.remove('hidden');
                resetBtn.classList.remove('hidden');

                // Khi ảnh render trên màn hình xong thì xử lý
                imagePreview.onload = processImage;
            };
            reader.readAsDataURL(file);
        }
    });

    resetBtn.addEventListener('click', () => {
        imageUpload.value = '';
        imagePreview.src = '';
        imagePreview.classList.add('hidden');
        uploadArea.classList.remove('hidden');
        resetBtn.classList.add('hidden');
        paletteContainer.innerHTML = 'Hãy tải một bức ảnh lên để xem điều kỳ diệu!';
    });
});
