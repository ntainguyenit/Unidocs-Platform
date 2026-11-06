// Single-line English comment: Self-executing module for new document notification toast
(function () {
    // Single-line English comment: Check browser environment support
    if (typeof window === 'undefined' || !window.fetch) return;

    // Single-line English comment: Storage key tracking last seen approved document id
    const STORAGE_KEY = 'has_seen_new_document_notification';

    // Single-line English comment: Initialize notification check on DOM ready
    document.addEventListener('DOMContentLoaded', initNewDocumentToast);

    // Single-line English comment: Fetch latest approved document and display toast if unseen
    function initNewDocumentToast() {
        // Single-line English comment: Query backend for latest approved document
        fetch('/api/documents/latest-approved')
            .then(function (response) {
                // Single-line English comment: Return json if 200 OK
                if (response.status === 200) {
                    return response.json();
                }
                return null;
            })
            .then(function (data) {
                // Single-line English comment: Validate data object and id
                if (!data || !data.id || !data.message) {
                    return;
                }

                // Single-line English comment: Retrieve previously seen document id from local storage
                const seenDocId = localStorage.getItem(STORAGE_KEY);
                // Single-line English comment: Check if user already viewed notification for this document
                if (seenDocId && String(seenDocId) === String(data.id)) {
                    return;
                }

                // Single-line English comment: Render square toast notification on screen
                renderToast(data);
            })
            .catch(function () {
                // Single-line English comment: Fail silently without affecting website user experience
            });
    }

    // Single-line English comment: Create and render toast element with 4 sharp square corners
    function renderToast(data) {
        // Single-line English comment: Mark document as seen immediately in local storage
        localStorage.setItem(STORAGE_KEY, String(data.id));

        // Single-line English comment: Build toast container element
        const toast = document.createElement('div');
        toast.id = 'newDocNotificationToast';
        // Single-line English comment: Fixed top-right, flat black background, square corners, responsive width
        toast.className = 'fixed bg-slate-900 border border-slate-700/80 text-white rounded-none shadow-2xl p-4 flex items-start gap-3 transition-all duration-300 transform -translate-y-5 opacity-0 select-none';
        // Single-line English comment: Enforce strict top-right positioning and highest z-index above all layers
        toast.style.position = 'fixed';
        toast.style.top = '5rem';
        toast.style.right = '1.25rem';
        toast.style.left = 'auto';
        toast.style.zIndex = '99999';
        toast.style.maxWidth = 'min(420px, calc(100vw - 2.5rem))';

        // Single-line English comment: Extract title line and italicized smaller time line
        const titleLine = data.mainText || (data.courseName && data.facultyName
            ? ('Có tài liệu mới Học phần: ' + data.courseName + ' - ' + data.facultyName)
            : (data.message ? data.message.split('\n')[0] : 'Có tài liệu mới'));
        const timeLine = data.timeText || (data.time
            ? ('Lúc ' + data.time)
            : (data.message && data.message.includes('\n') ? data.message.split('\n')[1] : ''));

        // Single-line English comment: Build inner HTML structure with exact two-line format
        toast.innerHTML = [
            '<div class="w-8 h-8 rounded-none bg-blue-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">',
            '  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">',
            '    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>',
            '  </svg>',
            '</div>',
            '<div class="flex-1 min-w-0 pr-1">',
            '  <div class="flex items-center gap-2 mb-1">',
            '    <span class="inline-block w-2 h-2 rounded-none bg-emerald-400 animate-pulse"></span>',
            '    <span class="text-[11px] font-bold tracking-wider text-blue-400 uppercase">Thông báo học thuật</span>',
            '  </div>',
            '  <a href="' + (data.url || '#') + '" class="block group leading-relaxed break-words">',
            '    <div class="text-xs sm:text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">',
            '      ' + escapeHtml(titleLine),
            '    </div>',
            '    <div class="text-[11px] sm:text-xs text-slate-400 group-hover:text-blue-200 italic mt-0.5 transition-colors">',
            '      ' + escapeHtml(timeLine),
            '    </div>',
            '  </a>',
            '</div>',
            '<button type="button" id="btnDismissNewDocToast" class="text-slate-400 hover:text-white p-1 rounded-none hover:bg-slate-800 transition-colors shrink-0 cursor-pointer" aria-label="Đóng thông báo">',
            '  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">',
            '    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>',
            '  </svg>',
            '</button>'
        ].join('');

        // Single-line English comment: Append toast element to document body
        document.body.appendChild(toast);

        // Single-line English comment: Trigger smooth entry animation
        setTimeout(function () {
            toast.classList.remove('-translate-y-5', 'opacity-0');
            toast.classList.add('translate-y-0', 'opacity-100');
        }, 15);

        // Single-line English comment: Auto-hide toast after 5 seconds timeout
        let dismissTimer = setTimeout(dismissToast, 5000);

        // Single-line English comment: Pause dismissal timer on mouse hover
        toast.addEventListener('mouseenter', function () {
            if (dismissTimer) clearTimeout(dismissTimer);
        });

        // Single-line English comment: Resume dismissal timer when mouse leaves
        toast.addEventListener('mouseleave', function () {
            dismissTimer = setTimeout(dismissToast, 3000);
        });

        // Single-line English comment: Bind close button event listener
        const closeBtn = document.getElementById('btnDismissNewDocToast');
        if (closeBtn) {
            closeBtn.addEventListener('click', function (e) {
                // Single-line English comment: Prevent event bubbling
                e.stopPropagation();
                dismissToast();
            });
        }

        // Single-line English comment: Dismiss toast with smooth slide up transition
        function dismissToast() {
            if (dismissTimer) clearTimeout(dismissTimer);
            toast.classList.remove('translate-y-0', 'opacity-100');
            toast.classList.add('-translate-y-5', 'opacity-0');
            // Single-line English comment: Remove toast element from DOM after transition finishes
            setTimeout(function () {
                if (toast && toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }

    // Single-line English comment: Escape basic HTML entities to prevent XSS
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
})();
