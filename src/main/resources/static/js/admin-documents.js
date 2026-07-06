
        document.addEventListener('DOMContentLoaded', () => {
            const statusFilter = document.getElementById('statusFilter');
            const sortFilter = document.getElementById('sortFilter');
            
            function applyFilters() {
                let url = '?';
                if (statusFilter.value) url += 'status=' + encodeURIComponent(statusFilter.value) + '&';
                if (sortFilter.value) url += 'sort=' + encodeURIComponent(sortFilter.value);
                window.location.href = url;
            }
            
            statusFilter.addEventListener('change', applyFilters);
            sortFilter.addEventListener('change', applyFilters);

            const eventSource = new EventSource('/admin/api/notifications/stream');
            
            eventSource.addEventListener('report', (e) => {
                const data = JSON.parse(e.data);
                console.log('SSE Report Received:', data);
                
                let bgColor = '#3b82f6'; // blue
                if (data.priority === 'HIGH') bgColor = '#ef4444'; // red
                else if (data.priority === 'MEDIUM') bgColor = '#f59e0b'; // amber
                
                let msg = `Có báo cáo (${data.reportType}) cho tài liệu: ${data.documentTitle}. Đã có ${data.totalPendingReports} lượt báo lỗi. Ưu tiên: ${data.priority}`;
                
                if (typeof Toastify !== 'undefined') {
                    Toastify({
                        text: msg,
                        duration: 10000,
                        close: true,
                        gravity: "top",
                        position: "right",
                        style: {
                            background: bgColor,
                            padding: "16px",
                            fontSize: "14px",
                            borderRadius: "8px",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                        },
                        destination: "/admin/reports",
                        newWindow: false
                    }).showToast();
                }
            });
            
            eventSource.onerror = (e) => {
                console.error('Lỗi kết nối Notification Stream', e);
            };
        });

        function startImport() {
            var btn = document.getElementById('submitBtn');
            var container = document.getElementById('progressContainer');
            var bar = document.getElementById('progressBar');
            var text = document.getElementById('progressText');
            
            btn.disabled = true;
            btn.classList.add('opacity-50', 'cursor-not-allowed');
            container.classList.remove('hidden');
            
            // Simulate progress since actual progress needs complex SSE or websockets
            var width = 0;
            var interval = setInterval(function() {
                if (width >= 90) {
                    clearInterval(interval);
                    text.innerText = "Đang xử lý ở máy chủ, vui lòng đợi...";
                } else {
                    width += 5;
                    bar.style.width = width + '%';
                    if (width < 30) text.innerText = "Đang tải lên file...";
                    else if (width < 60) text.innerText = "Đang giải nén & Quét cấu trúc...";
                    else text.innerText = "Đang đồng bộ dữ liệu vào DB & Storage...";
                }
            }, 1000);
            
            return true;
        }
    

        function openRenameModal(id, currentTitle) {
            document.getElementById('newName').value = currentTitle;
            document.getElementById('renameForm').action = '/admin/documents/' + id + '/rename';
            document.getElementById('renameModal').classList.remove('hidden');
        }
    

