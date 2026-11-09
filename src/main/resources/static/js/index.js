
            function copyWebsiteLink() {
                if (navigator.clipboard && window.isSecureContext) {
                    navigator.clipboard.writeText(window.location.href).then(() => {
                        showToast();
                    });
                } else {
                    // Fallback for older browsers
                    let textArea = document.createElement("textarea");
                    textArea.value = window.location.href;
                    textArea.style.position = "fixed";
                    textArea.style.left = "-999999px";
                    textArea.style.top = "-999999px";
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    try {
                        document.execCommand('copy');
                        showToast();
                    } catch (err) {
                        console.error('Fallback: Oops, unable to copy', err);
                    }
                    document.body.removeChild(textArea);
                }
            }

            function showToast() {
                const toast = document.getElementById('toastNotification');
                toast.classList.remove('translate-y-20', 'opacity-0');
                setTimeout(() => {
                    toast.classList.add('translate-y-20', 'opacity-0');
                }, 3000);
            }
        

        let autoCloseInterval;
        let autoCloseTimeout;
        let secondsLeft = 25;

        function openInfoModal(type) {
            let title = "";
            let contentId = "";
            let downloadBtn = "";
            if(type === 'TotNghiep') {
                title = "Điều kiện tốt nghiệp";
                contentId = "contentTotNghiep";
            } else if(type === 'TinChi') {
                title = "Mẹo đăng ký tín chỉ hiệu quả";
                contentId = "contentTinChi";
            } else if(type === 'LoiTat') {
                title = "Lối tắt truy cập nhanh";
                contentId = "contentLoiTat";
            } else if(type === 'CampusMap') {
                title = "Sơ đồ trường";
                contentId = "contentCampusMap";
                downloadBtn = `<a href="/images/campus-map.jpeg" download="campus-map.jpeg" class="text-sm bg-primary text-white hover:bg-blue-700 px-4 py-1.5 rounded transition-colors font-medium flex items-center gap-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg> Tải ảnh nhanh</a>`;
            }
            
            document.getElementById('infoModalTitle').textContent = title;
            document.getElementById('infoModalBody').innerHTML = document.getElementById(contentId).innerHTML;
            document.getElementById('modalFooterActions').innerHTML = downloadBtn;
            document.getElementById('infoModal').classList.remove('hidden');

            // Reset and start auto-close countdown if not TinChi
            clearInterval(autoCloseInterval);
            clearTimeout(autoCloseTimeout);
            const timerEl = document.getElementById('autoCloseTimer');
            
            if (type !== 'TinChi') {
                secondsLeft = 25;
                timerEl.textContent = `Tự động đóng sau: ${secondsLeft}s`;
                
                autoCloseInterval = setInterval(() => {
                    secondsLeft--;
                    if (secondsLeft > 0) {
                        timerEl.textContent = `Tự động đóng sau: ${secondsLeft}s`;
                    } else {
                        clearInterval(autoCloseInterval);
                    }
                }, 1000);

                autoCloseTimeout = setTimeout(() => {
                    closeInfoModal();
                }, 25000);
            } else {
                timerEl.textContent = '';
            }
        }

        function closeInfoModal() {
            clearInterval(autoCloseInterval);
            clearTimeout(autoCloseTimeout);
            document.getElementById('infoModal').classList.add('hidden');
        }

        function copyModalContent() {
            const body = document.getElementById('infoModalBody');
            const textToCopy = body.innerText;
            navigator.clipboard.writeText(textToCopy).then(() => {
                alert("Đã copy văn bản thành công!");
            }).catch(err => {
                console.error('Lỗi copy: ', err);
                alert("Không thể copy. Trình duyệt của bạn không hỗ trợ.");
            });
        }
    

        const contentInput = document.getElementById('content');
        const charCount = document.getElementById('charCount');
        const submitBtn = document.getElementById('submitBtn');
        const formMessage = document.getElementById('formMessage');

        // Character count
        if(contentInput) {
            contentInput.addEventListener('input', function() {
                charCount.innerText = this.value.length + '/500';
            });
        }

        function showMessage(msg, type) {
            formMessage.innerText = msg;
            formMessage.className = `mb-4 text-sm px-3 py-2 rounded-md block ${type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`;
            setTimeout(() => {
                formMessage.classList.add('hidden');
            }, 5000);
        }

        const authorNames = [
  "Sinh viên chăm chỉ",
  "Sinh viên vui vẻ",
  "Sinh viên thân thiện",
  "Sinh viên nhiệt tình",
  "Sinh viên bí ẩn",
  "Sinh viên tích cực",
  "Sinh viên ngáp ngủ",
  "Sinh viên ngủ gật",
  "Sinh viên siêng năng",
  "Sinh viên cần cù",
  "Sinh viên lạc lối",
  "Sinh viên đáng yêu",
  "Sinh viên tốt bụng",
  "Sinh viên năng động",
  "Sinh viên sáng tạo",
  "Sinh viên thông minh",
  "Sinh viên hài hước",
  "Sinh viên mơ mộng",
  "Sinh viên tự tin",
  "Sinh viên trầm tính",
  "Học giả chăm chỉ",
  "Học giả vui vẻ",
  "Học giả thân thiện",
  "Học giả nhiệt tình",
  "Học giả bí ẩn",
  "Học giả tích cực",
  "Học giả ngáp ngủ",
  "Học giả ngủ gật",
  "Học giả siêng năng",
  "Học giả cần cù",
  "Học giả lạc lối",
  "Học giả đáng yêu",
  "Học giả tốt bụng",
  "Học giả năng động",
  "Học giả sáng tạo",
  "Học giả thông minh",
  "Học giả hài hước",
  "Học giả mơ mộng",
  "Học giả tự tin",
  "Học giả trầm tính",
  "Mọt sách chăm chỉ",
  "Mọt sách vui vẻ",
  "Mọt sách thân thiện",
  "Mọt sách nhiệt tình",
  "Mọt sách bí ẩn",
  "Mọt sách tích cực",
  "Mọt sách ngáp ngủ",
  "Mọt sách ngủ gật",
  "Mọt sách siêng năng",
  "Mọt sách cần cù",
  "Mọt sách lạc lối",
  "Mọt sách đáng yêu",
  "Mọt sách tốt bụng",
  "Mọt sách năng động",
  "Mọt sách sáng tạo",
  "Mọt sách thông minh",
  "Mọt sách hài hước",
  "Mọt sách mơ mộng",
  "Mọt sách tự tin",
  "Mọt sách trầm tính",
  "Cú đêm chăm chỉ",
  "Cú đêm vui vẻ",
  "Cú đêm thân thiện",
  "Cú đêm nhiệt tình",
  "Cú đêm bí ẩn",
  "Cú đêm tích cực",
  "Cú đêm ngáp ngủ",
  "Cú đêm ngủ gật",
  "Cú đêm siêng năng",
  "Cú đêm cần cù",
  "Cú đêm lạc lối",
  "Cú đêm đáng yêu",
  "Cú đêm tốt bụng",
  "Cú đêm năng động",
  "Cú đêm sáng tạo",
  "Cú đêm thông minh",
  "Cú đêm hài hước",
  "Cú đêm mơ mộng",
  "Cú đêm tự tin",
  "Cú đêm trầm tính",
  "Người hùng chăm chỉ",
  "Người hùng vui vẻ",
  "Người hùng thân thiện",
  "Người hùng nhiệt tình",
  "Người hùng bí ẩn",
  "Người hùng tích cực",
  "Người hùng ngáp ngủ",
  "Người hùng ngủ gật",
  "Người hùng siêng năng",
  "Người hùng cần cù",
  "Người hùng lạc lối",
  "Người hùng đáng yêu",
  "Người hùng tốt bụng",
  "Người hùng năng động",
  "Người hùng sáng tạo",
  "Người hùng thông minh",
  "Người hùng hài hước",
  "Người hùng mơ mộng",
  "Người hùng tự tin",
  "Người hùng trầm tính"
];

        window.randomizeName = function() {
            const authorInput = document.getElementById('authorName');
            const randomName = authorNames[Math.floor(Math.random() * authorNames.length)];
            authorInput.value = randomName;
        };

// Single-line English comment: Handle feedback form submission via AJAX without public list reload
        window.submitFeedback = function(e) {
            e.preventDefault();
            const content = contentInput ? contentInput.value.trim() : '';
            const authorName = document.getElementById('authorName') ? document.getElementById('authorName').value.trim() : "Người dùng";

            if (!content) return showMessage('Vui lòng nhập nội dung', 'error');

            showButtonLoading('submitBtn', 'Đang gửi...');

            fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: content, authorName: authorName })
            })
            .then(async response => {
                const text = await response.text();
                let data = {};
                try {
                    data = text ? JSON.parse(text) : {};
                } catch (err) {
                    // Single-line English comment: Gracefully map plain-text rate-limit or proxy error responses
                    data = {
                        error: response.status === 429
                            ? 'Vui lòng đợi 1 phút trước khi gửi góp ý tiếp theo.'
                            : (text || 'Có lỗi xảy ra khi gửi góp ý.')
                    };
                }
                if (!response.ok && !data.error) {
                    data.error = 'Có lỗi xảy ra khi gửi góp ý.';
                }
                return data;
            })
            .then(data => {
                if (data.error) {
                    showMessage(data.error, 'error');
                } else {
                    showMessage('Gửi góp ý thành công! Cảm ơn bạn đã đóng góp cho UniDocs.', 'success');
                    if (contentInput) contentInput.value = '';
                    if (charCount) charCount.innerText = '0/500';
                }
            })
            .catch(() => {
                showMessage('Lỗi kết nối đến máy chủ.', 'error');
            })
            .finally(() => {
                hideButtonLoading('submitBtn');
            });
        };
