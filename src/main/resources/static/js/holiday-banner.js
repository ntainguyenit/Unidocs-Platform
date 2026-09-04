(function() {
    const today = new Date();
    const greetingEl = document.getElementById('greeting-text');
    if (greetingEl) {
        const hour = today.getHours();
        let greeting = '';
        if (hour >= 0 && hour < 11) {
            greeting = 'Chào buổi sáng! ☕';
        } else if (hour >= 11 && hour < 14) {
            greeting = 'Chào buổi trưa! 🍲';
        } else if (hour >= 14 && hour < 18) {
            greeting = 'Chào buổi chiều! 🌤️';
        } else {
            greeting = 'Chào buổi tối! 🌙';
        }
        greetingEl.innerText = greeting;
    }
})();
