
(function() {
    // 1. Chặn chuột phải (Context Menu)
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });

    // 2. Chặn phím tắt mở DevTools và Sao chép
    document.addEventListener('keydown', function(e) {
        // F12
        if (e.key === 'F12' || e.keyCode === 123) {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+I / J / C (Windows/Linux)
        if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
            e.preventDefault();
            return false;
        }
        // Cmd+Option+I / J / C (Mac)
        if (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
            e.preventDefault();
            return false;
        }
        // Ctrl+U / Cmd+Option+U (View Source)
        if ((e.ctrlKey || (e.metaKey && e.altKey)) && (e.key === 'U' || e.key === 'u')) {
            e.preventDefault();
            return false;
        }
    });

    // 3. DevTools Debugger loop (Bypass mobile devices)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) {
        setInterval(function() {
            try {
                debugger;
            } catch (e) {}
        }, 1000);
    }

    // 4. Invisible Watermark (Steganography) khi copy text
    document.addEventListener('copy', function(e) {
        const selectedText = window.getSelection().toString();
        if (selectedText) {
            const watermark = '\n\n--- \nNguồn: UniDocs Platform (https://unidocs.vn) \nVui lòng không sao chép trái phép.';
            e.clipboardData.setData('text/plain', selectedText + watermark);
            e.preventDefault();
        }
    });
})();
