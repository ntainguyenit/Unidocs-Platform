
        function openRenameModal(id, currentTitle) {
            document.getElementById('newName').value = currentTitle;
            // The endpoint /admin/documents/{id}/rename will handle it and redirect to documents page.
            // Wait, we need it to redirect back to reports!
            // I added a hidden input "fromReports=true", I will update AdminController to support this.
            document.getElementById('renameForm').action = '/admin/documents/' + id + '/rename';
            document.getElementById('renameModal').classList.remove('hidden');
        }
        
        document.addEventListener('DOMContentLoaded', () => {
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
                            color: "white",
                            fontWeight: "500",
                            padding: "12px 20px",
                            fontSize: "14px",
                            borderRadius: "8px",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                        },
                        destination: "/admin/reports",
                        newWindow: false
                    }).showToast();
                }
                
                // If on reports page, optionally reload
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            });
            
            eventSource.onerror = (e) => {
                console.error('Lỗi kết nối Notification Stream', e);
            };
        });
    

