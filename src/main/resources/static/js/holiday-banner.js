(function() {
    const today = new Date();
    const greetingEl = document.getElementById('greeting-text');
    if (greetingEl) {
        const hour = today.getHours();
        let greeting = '';
        if (hour >= 0 && hour < 11) {
            greeting = 'Chào buổi sáng, chúc bạn ngày mới tốt lành!';
        } else if (hour >= 11 && hour < 14) {
            greeting = 'Chào buổi trưa, chúc bạn ngày mới tốt lành!';
        } else if (hour >= 14 && hour < 18) {
            greeting = 'Chào buổi chiều, chúc bạn ngày mới tốt lành!';
        } else {
            greeting = 'Chào buổi tối, chúc bạn ngày mới tốt lành!';
        }
        
        greetingEl.innerHTML = '';
        function startTypeWriter() {
            let i = 0;
            greetingEl.innerHTML = '';
            
            function typeWriter() {
                if (i < greeting.length) {
                    greetingEl.innerHTML += greeting.charAt(i);
                    i++;
                    setTimeout(typeWriter, 50);
                } else {
                    greetingEl.innerHTML += '<span class="animate-pulse">|</span>';
                    setTimeout(startTypeWriter, 3000); // 3 seconds delay before restarting
                }
            }
            typeWriter();
        }
        startTypeWriter();
    }
})();
