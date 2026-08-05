
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
        const feedbackList = document.getElementById('feedbackList');
        const emptyState = document.getElementById('emptyState');

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

        // Handle Form Submission via AJAX
        function submitFeedback(e) {
            e.preventDefault();
            const content = contentInput.value.trim();
            if (!content) return showMessage('Vui lòng nhập nội dung', 'error');

            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Đang gửi...';

            fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: content })
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    showMessage(data.error, 'error');
                } else {
                    showMessage('Gửi góp ý thành công!', 'success');
                    contentInput.value = '';
                    charCount.innerText = '0/500';
                }
            })
            .catch(error => {
                showMessage('Lỗi kết nối đến máy chủ.', 'error');
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Gửi Góp Ý';
            });
        }

        // Helper to format date
        function formatDate(dateStr) {
            const date = new Date(dateStr);
            return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
        }

        // Initialize Server-Sent Events (SSE)
        const eventSource = new EventSource('/api/feedback/stream');

        eventSource.addEventListener('NEW_FEEDBACK', function(e) {
            const fb = JSON.parse(e.data);
            
            // Check if already exists
            if (document.getElementById('fb-' + fb.id)) return;

            if (emptyState) emptyState.style.display = 'none';

            const fbDiv = document.createElement('div');
            fbDiv.id = 'fb-' + fb.id;
            fbDiv.className = 'border border-gray-200 rounded-lg p-4 bg-gray-50 transition-colors sse-new-item';
            
            fbDiv.innerHTML = `
                <div class="flex justify-between items-start mb-2">
                    <div class="font-bold text-gray-900">${fb.authorName}</div>
                    <div class="text-xs text-gray-500">${formatDate(fb.createdAt)}</div>
                </div>
                <p class="text-gray-700 text-sm whitespace-pre-wrap">${fb.content}</p>
                <div id="reply-${fb.id}"></div>
            `;
            
            if(feedbackList) {
                feedbackList.insertBefore(fbDiv, feedbackList.firstChild);
                updateFeedbackCount();
            }
        });

        eventSource.addEventListener('REPLY_FEEDBACK', function(e) {
            const fb = JSON.parse(e.data);
            const replyContainer = document.getElementById('reply-' + fb.id);
            if (replyContainer && fb.replyContent) {
                replyContainer.className = 'mt-4 bg-white border border-blue-200 border-l-4 border-l-blue-500 p-3 rounded-md shadow-sm sse-new-item';
                replyContainer.innerHTML = `
                    <div class="flex justify-between items-center mb-1">
                        <span class="font-bold text-xs text-blue-800">Quản trị UniDocs</span>
                        <span class="text-xs text-blue-600">${formatDate(fb.repliedAt)}</span>
                    </div>
                    <p class="text-sm text-blue-900 whitespace-pre-wrap">${fb.replyContent}</p>
                `;
            }
        });

        eventSource.onerror = function(err) {
            console.error("SSE Error:", err);
            // Browser will automatically attempt to reconnect
        };
    

        let sortAsc = false;
        let currentFeedbackPage = 1;
        const feedbacksPerPage = 5;

        function renderFeedbackItems() {
            const list = document.getElementById('feedbackList');
            if (!list) return;
            const items = Array.from(list.children).filter(item => item.id && item.id.startsWith('fb-'));
            if (items.length === 0) return;
            
            const totalPages = Math.ceil(items.length / feedbacksPerPage);
            if (currentFeedbackPage > totalPages) currentFeedbackPage = totalPages;
            
            items.forEach((item, index) => {
                if (index >= (currentFeedbackPage - 1) * feedbacksPerPage && index < currentFeedbackPage * feedbacksPerPage) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
            
            renderFeedbackPagination(items.length, totalPages);
        }

        function createFeedbackPageButton(text, page, disabled, isActive) {
            const btn = document.createElement('button');
            btn.innerHTML = text;
            btn.disabled = disabled;
            
            btn.className = 'w-10 h-10 flex items-center justify-center rounded-md border text-base font-medium transition-colors cursor-pointer';
            
            if (isActive) {
                btn.classList.add('bg-primary', 'text-white', 'border-primary');
            } else if (disabled) {
                btn.classList.add('bg-gray-50', 'text-gray-300', 'border-gray-200', 'cursor-not-allowed');
            } else {
                btn.classList.add('bg-white', 'text-gray-600', 'border-gray-300', 'hover:bg-gray-50', 'hover:text-gray-900', 'hover:border-gray-400');
                btn.onclick = () => {
                    currentFeedbackPage = page;
                    renderFeedbackItems();
                    document.getElementById('feedbackList').scrollIntoView({ behavior: 'smooth', block: 'center' });
                };
            }
            return btn;
        }

        function renderFeedbackPagination(totalItems, totalPages) {
            const paginationContainer = document.getElementById('feedbackPagination');
            if (!paginationContainer) return;
            
            if (totalItems <= feedbacksPerPage) {
                paginationContainer.classList.add('hidden');
                return;
            }
            
            paginationContainer.classList.remove('hidden');
            paginationContainer.classList.add('flex');
            paginationContainer.innerHTML = '';
            
            // Nút First (<<) và Previous (<)
            paginationContainer.appendChild(createFeedbackPageButton('&laquo;', 1, currentFeedbackPage === 1, false));
            paginationContainer.appendChild(createFeedbackPageButton('&lsaquo;', currentFeedbackPage - 1, currentFeedbackPage === 1, false));
            
            // Các số trang
            for (let i = 1; i <= totalPages; i++) {
                if (i === 1 || i === totalPages || (i >= currentFeedbackPage - 1 && i <= currentFeedbackPage + 1)) {
                    paginationContainer.appendChild(createFeedbackPageButton(i, i, false, i === currentFeedbackPage));
                } else if (i === currentFeedbackPage - 2 || i === currentFeedbackPage + 2) {
                    const dots = document.createElement('span');
                    dots.className = 'w-10 h-10 flex items-center justify-center text-gray-500 text-base';
                    dots.innerHTML = '&hellip;';
                    paginationContainer.appendChild(dots);
                }
            }
            
            // Nút Next (>) và Last (>>)
            paginationContainer.appendChild(createFeedbackPageButton('&rsaquo;', currentFeedbackPage + 1, currentFeedbackPage === totalPages, false));
            paginationContainer.appendChild(createFeedbackPageButton('&raquo;', totalPages, currentFeedbackPage === totalPages, false));
        }

        function toggleSort() {
            const list = document.getElementById('feedbackList');
            if (!list) return;
            const items = Array.from(list.children).filter(item => item.id && item.id.startsWith('fb-'));
            if (items.length <= 1) return;
            items.reverse();
            const emptyState = document.getElementById('emptyState');
            items.forEach(item => {
                if (emptyState) {
                    list.insertBefore(item, emptyState);
                } else {
                    list.appendChild(item);
                }
            });
            sortAsc = !sortAsc;
            currentFeedbackPage = 1;
            renderFeedbackItems();
        }

        function updateFeedbackCount() {
            const list = document.getElementById('feedbackList');
            if (!list) return;
            const count = list.querySelectorAll('div[id^="fb-"]').length;
            const countDisplay = document.getElementById('feedbackCountDisplay');
            if (countDisplay) {
                countDisplay.innerText = count + ' lần góp ý';
            }
            renderFeedbackItems();
        }

        document.addEventListener('DOMContentLoaded', () => {
            updateFeedbackCount();
            renderFeedbackItems();
        });


// Utility Likes Feature
document.addEventListener('DOMContentLoaded', () => {
    const likeBtns = document.querySelectorAll('.util-like-btn');
    if (likeBtns.length > 0) {
        fetch('/api/utilities/likes')
            .then(res => res.json())
            .then(data => {
                const counts = data.counts || {};
                const likedByMe = data.likedByMe || [];
                
                likeBtns.forEach(btn => {
                    const utilId = btn.getAttribute('data-utility-id');
                    const countSpan = btn.querySelector('.like-count');
                    const svgIcon = btn.querySelector('.like-icon');
                    
                    if (counts[utilId]) {
                        countSpan.textContent = counts[utilId];
                    }
                    
                    if (likedByMe.includes(utilId)) {
                        svgIcon.setAttribute('fill', 'currentColor');
                    }
                });
            })
            .catch(err => console.error('Error fetching likes:', err));
    }
});

window.toggleUtilityLike = function(utilityId) {
    const btn = document.querySelector('.util-like-btn[data-utility-id="' + utilityId + '"]');
    if (!btn) return;
    
    fetch('/api/utilities/' + utilityId + '/like', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
            const countSpan = btn.querySelector('.like-count');
            const svgIcon = btn.querySelector('.like-icon');
            
            countSpan.textContent = data.count;
            
            if (data.liked) {
                svgIcon.setAttribute('fill', 'currentColor');
            } else {
                svgIcon.setAttribute('fill', 'none');
            }
        })
        .catch(err => console.error('Error toggling like:', err));
};
