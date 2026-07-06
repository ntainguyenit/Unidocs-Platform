
        function exportToPDF() {
            // Collect all inputs
            const inputs = document.querySelectorAll('#timetable tbody input[type="text"]');
            const data = Array.from(inputs).map(input => input.value.trim());
            
            // Validate if completely empty
            if (data.every(val => val === '')) {
                alert("Vui lòng nhập ít nhất một môn học để xuất PDF.");
                return;
            }

            document.getElementById('loadingOverlay').classList.remove('hidden');
            document.getElementById('loadingOverlay').classList.add('flex');
            
            document.getElementById('timetableData').value = JSON.stringify(data);
            document.getElementById('exportForm').submit();

            // Hide overlay after a short delay (assuming download starts)
            setTimeout(() => {
                document.getElementById('loadingOverlay').classList.add('hidden');
                document.getElementById('loadingOverlay').classList.remove('flex');
            }, 2000);
        }
    

