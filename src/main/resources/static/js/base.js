function openReportModal(docId) {
    document.getElementById('reportDocumentId').value = docId;
    document.getElementById('reportModal').classList.remove('hidden');
}

function closeReportModal() {
    document.getElementById('reportModal').classList.add('hidden');
}

function submitReport(e) {
    e.preventDefault();
    const btn = document.getElementById('btnSubmitReport');
    btn.disabled = true;
    btn.innerText = 'Đang gửi...';

    const docId = document.getElementById('reportDocumentId').value;
    const type = document.getElementById('reportType').value;
    const msg = document.getElementById('reportMessage').value;

    fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: docId, reportType: type, message: msg })
    })
    .then(res => res.json())
    .then(data => {
        btn.disabled = false;
        btn.innerText = 'Gửi báo cáo';
        if(data.message) {
            alert(data.message);
            closeReportModal();
        } else {
            alert(data.error || 'Có lỗi xảy ra');
        }
    }).catch(err => {
        btn.disabled = false;
        btn.innerText = 'Gửi báo cáo';
        alert('Lỗi kết nối');
    });
}

// UX Protection (bảo vệ phiên làm việc)
window.isFormDirty = false;
const beforeUnloadHandler = function (e) {
    e.preventDefault();
    e.returnValue = '';
    return '';
};

// Custom setter để tự động add/remove listener
Object.defineProperty(window, 'isFormDirty', {
    get: function() { return this._isFormDirty || false; },
    set: function(value) {
        this._isFormDirty = value;
        if (value) {
            window.addEventListener('beforeunload', beforeUnloadHandler);
        } else {
            window.removeEventListener('beforeunload', beforeUnloadHandler);
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const dateEl = document.getElementById('realtimeDate');
    if (dateEl) {
        updateDate();
        setInterval(updateDate, 60000);
    }
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        const updatePlaceholder = () => {
            if(window.innerWidth < 768) {
                searchInput.placeholder = "Lập Trình Nâng Cao, Báo In,...";
            } else {
                searchInput.placeholder = "Nhập tên học phần (VD: Lập Trình Nâng Cao, Báo In,...)";
            }
        };
        updatePlaceholder();
        window.addEventListener('resize', updatePlaceholder);
    }

    const searchResults = document.getElementById('searchResults');
    let allCourses = [];
    let isLoaded = false;

    function removeAccents(str) {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
    }

    function renderResults(query) {
        let filtered = [];
        
        if (query.length < 1) {
            filtered = allCourses.slice(0, 10);
        } else {
            const normalizedQuery = removeAccents(query.toLowerCase());
            filtered = allCourses.filter(item => {
                return removeAccents(item.title.toLowerCase()).includes(normalizedQuery) || 
                       removeAccents(item.subtitle.toLowerCase()).includes(normalizedQuery);
            }).slice(0, 10);
        }

        searchResults.innerHTML = '';
        if (filtered.length === 0) {
            searchResults.innerHTML = '<div class="px-4 py-3 text-gray-500 text-sm">Không tìm thấy kết quả.</div>';
            searchResults.classList.remove('hidden');
            return;
        }

        filtered.forEach(item => {
            const a = document.createElement('a');
            a.href = item.url;
            a.className = 'block px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-0 transition-colors text-left';
            
            let titleHTML = item.title;
            let subtitleHTML = item.subtitle;
            if (query) {
                const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`(${escapedQuery})`, 'gi');
                const replaceSpan = '<span class="text-blue-600 font-bold">$1</span>';
                titleHTML = item.title.replace(regex, replaceSpan);
                subtitleHTML = item.subtitle.replace(regex, replaceSpan);
            }

            a.innerHTML = `
                <div class="font-semibold text-text">${titleHTML}</div>
                <div class="text-xs text-gray-500 mt-1">${subtitleHTML}</div>
            `;
            searchResults.appendChild(a);
        });
        searchResults.classList.remove('hidden');
    }

    if (searchInput && searchResults) {
        // Preload search data for zero delay
        fetch('/api/search')
            .then(res => res.json())
            .then(data => {
                allCourses = data;
                isLoaded = true;
            })
            .catch(err => console.error("Search preload error", err));

        const handleSearchInteraction = (e) => {
            const query = e.target.value.trim();
            if (!isLoaded) {
                // Fallback if user typing before preload completes
                fetch('/api/search')
                    .then(res => res.json())
                    .then(data => {
                        allCourses = data;
                        isLoaded = true;
                        renderResults(query);
                    })
                    .catch(err => {});
            } else {
                renderResults(query);
            }
        };

        searchInput.addEventListener('input', handleSearchInteraction);
        searchInput.addEventListener('click', handleSearchInteraction);
        searchInput.addEventListener('focus', handleSearchInteraction);

        document.addEventListener('click', (e) => {
            if (!document.getElementById('searchContainer').contains(e.target)) {
                searchResults.classList.add('hidden');
            }
        });
    }

    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (scrollToTopBtn) {
        const toggleVisibility = () => {
            if (window.scrollY > 50) {
                scrollToTopBtn.classList.remove('opacity-0', 'invisible');
                scrollToTopBtn.classList.add('opacity-100', 'visible');
            } else {
                scrollToTopBtn.classList.remove('opacity-100', 'visible');
                scrollToTopBtn.classList.add('opacity-0', 'invisible');
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        toggleVisibility();

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});

// Theme Toggle Logic
const themes = ['light', 'dark'];
let currentThemeIndex = 0; 
const savedTheme = localStorage.getItem('unidocs_theme');
if (savedTheme) {
    currentThemeIndex = themes.indexOf(savedTheme) !== -1 ? themes.indexOf(savedTheme) : 0;
}

function applyTheme() {
    const theme = themes[currentThemeIndex];
    
    const themeIconSvg = document.getElementById('themeIconSvg');
    if (themeIconSvg) {
        if (theme === 'light') {
            themeIconSvg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>';
        } else if (theme === 'dark') {
            themeIconSvg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>';
        }
    }
    
    // Determine actual theme
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

function cycleTheme() {
    currentThemeIndex = (currentThemeIndex + 1) % themes.length;
    localStorage.setItem('unidocs_theme', themes[currentThemeIndex]);
    applyTheme();
}

// Modal Logic
function showManualModal() {
    const modal = document.getElementById('manualModal');
    if(modal) modal.classList.remove('hidden');
}

function closeManualModal() {
    const modal = document.getElementById('manualModal');
    if(modal) modal.classList.add('hidden');
}

// Init
// Language Toggle Logic
const langs = ['vi', 'en', 'ja'];
let currentLangIndex = 0;
const savedLang = localStorage.getItem('unidocs_lang');
if (savedLang) {
    currentLangIndex = langs.indexOf(savedLang) !== -1 ? langs.indexOf(savedLang) : 0;
}

function applyLanguage() {
    const lang = langs[currentLangIndex];
    const langNames = ['VIE', 'ENG', 'JPN'];
    
    const currentLangText = document.getElementById('currentLangText');
    if (currentLangText) currentLangText.textContent = langNames[currentLangIndex];
    
    updateDate();
    
    if (typeof I18N_DICT !== 'undefined' && I18N_DICT[lang]) {
        const dict = I18N_DICT[lang];
        
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key]) el.innerHTML = dict[key];
        });
        
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (dict[key]) el.setAttribute('placeholder', dict[key]);
        });
        
        document.querySelectorAll('[data-i18n-value]').forEach(el => {
            const key = el.getAttribute('data-i18n-value');
            if (dict[key]) el.value = dict[key];
        });
        
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            if (dict[key]) el.setAttribute('title', dict[key]);
        });
    }
}

function cycleLanguage() {
    currentLangIndex = (currentLangIndex + 1) % langs.length;
    localStorage.setItem('unidocs_lang', langs[currentLangIndex]);
    applyLanguage();
}

function updateDate() {
    const dateEl = document.getElementById('realtimeDate');
    if (!dateEl) return;
    
    const now = new Date();
    const lang = langs[currentLangIndex];
    if (lang === 'vi') {
        const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        dateEl.textContent = `${days[now.getDay()]}, ngày ${now.getDate()} tháng ${now.getMonth() + 1} năm ${now.getFullYear()}`;
    } else if (lang === 'en') {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        dateEl.textContent = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
    } else if (lang === 'ja') {
        const days = ['日', '月', '火', '水', '木', '金', '土'];
        dateEl.textContent = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 (${days[now.getDay()]})`;
    }
}

applyLanguage();
applyTheme();

// --- Bookmarks Logic ---
const BOOKMARKS_KEY = 'unidocs_bookmarks';

function getBookmarks() {
    try {
        const stored = localStorage.getItem(BOOKMARKS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        return [];
    }
}

function saveBookmarks(bookmarks) {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    updateBookmarkBadge();
}

function toggleBookmarkFromBtn(btn) {
    const id = btn.getAttribute('data-doc-id');
    const title = btn.getAttribute('data-doc-title');
    const slug = btn.getAttribute('data-doc-slug');
    const fileType = btn.getAttribute('data-doc-filetype');
    toggleBookmark(btn, id, title, slug, fileType);
}

function toggleBookmark(btn, id, title, slug, fileType) {
    let bookmarks = getBookmarks();
    const index = bookmarks.findIndex(b => b.id == id);
    
    if (index !== -1) {
        // Remove
        bookmarks.splice(index, 1);
        btn.classList.remove('text-blue-500', 'bg-blue-50');
        btn.classList.add('text-gray-400');
        btn.querySelector('svg').setAttribute('fill', 'none');
        Toastify({
            text: "Đã bỏ lưu tài liệu",
            duration: 2000,
            close: true,
            gravity: "bottom",
            position: "right",
            style: { background: "#4B5563" }
        }).showToast();
    } else {
        // Add
        bookmarks.push({ id, title, slug, fileType, dateSaved: new Date().toISOString() });
        btn.classList.add('text-blue-500', 'bg-blue-50');
        btn.classList.remove('text-gray-400');
        btn.querySelector('svg').setAttribute('fill', 'currentColor');
        Toastify({
            text: "Đã lưu tài liệu",
            duration: 2000,
            close: true,
            gravity: "bottom",
            position: "right",
            style: { background: "#3b82f6" }
        }).showToast();
    }
    
    saveBookmarks(bookmarks);
    
    // If modal is open, re-render
    if (document.getElementById('bookmarksModal') && !document.getElementById('bookmarksModal').classList.contains('hidden')) {
        renderBookmarks();
    }
}

function removeBookmark(id) {
    let bookmarks = getBookmarks();
    bookmarks = bookmarks.filter(b => b.id != id);
    saveBookmarks(bookmarks);
    renderBookmarks();
    
    // Update button in course page if it exists
    const btn = document.querySelector(`.btn-bookmark[data-doc-id="${id}"]`);
    if (btn) {
        btn.classList.remove('text-blue-500', 'bg-blue-50');
        btn.classList.add('text-gray-400');
        btn.querySelector('svg').setAttribute('fill', 'none');
    }
}

function updateBookmarkBadge() {
    const badge = document.getElementById('bookmarkBadge');
    if (!badge) return;
    const count = getBookmarks().length;
    if (count > 0) {
        badge.textContent = count > 99 ? '99+' : count;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

function openBookmarksModal() {
    const modal = document.getElementById('bookmarksModal');
    if (modal) {
        modal.classList.remove('hidden');
        renderBookmarks();
    }
}

function closeBookmarksModal() {
    const modal = document.getElementById('bookmarksModal');
    if (modal) modal.classList.add('hidden');
}

function openStatsModal() {
    const modal = document.getElementById('statsModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeStatsModal() {
    const modal = document.getElementById('statsModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function renderBookmarks() {
    const container = document.getElementById('bookmarksContainer');
    const emptyState = document.getElementById('emptyBookmarksState');
    if (!container || !emptyState) return;
    
    // Clear existing
    const existingCards = container.querySelectorAll('.bookmark-card');
    existingCards.forEach(c => c.remove());
    
    const bookmarks = getBookmarks();
    
    if (bookmarks.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        
        // Sort by date descending
        bookmarks.sort((a, b) => new Date(b.dateSaved) - new Date(a.dateSaved));
        
        bookmarks.forEach(doc => {
            let iconHtml = '';
            if (doc.fileType === 'PDF') iconHtml = `<div class="w-10 h-10 flex items-center justify-center rounded bg-red-50 text-red-600 shrink-0"><span class="font-bold text-[10px]">PDF</span></div>`;
            else if (doc.fileType === 'DOCX') iconHtml = `<div class="w-10 h-10 flex items-center justify-center rounded bg-blue-50 text-blue-600 shrink-0"><span class="font-bold text-[10px]">DOCX</span></div>`;
            else if (doc.fileType === 'PPTX') iconHtml = `<div class="w-10 h-10 flex items-center justify-center rounded bg-orange-50 text-orange-600 shrink-0"><span class="font-bold text-[10px]">PPTX</span></div>`;
            else iconHtml = `<div class="w-10 h-10 flex items-center justify-center rounded bg-green-50 text-green-600 shrink-0"><span class="font-bold text-[10px]">IMG</span></div>`;

            const card = document.createElement('div');
            card.className = 'bookmark-card flex items-start justify-between gap-3 p-3 mb-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow';
            card.innerHTML = `
                <div class="flex items-start gap-3 min-w-0">
                    ${iconHtml}
                    <div class="min-w-0">
                        <a href="/document/${doc.slug}/view" target="_blank" class="block font-bold text-gray-900 text-sm hover:text-primary truncate" title="${doc.title}">${doc.title}</a>
                        <p class="text-xs text-gray-500 mt-1">Đã lưu: ${new Date(doc.dateSaved).toLocaleDateString('vi-VN')}</p>
                    </div>
                </div>
                <button type="button" onclick="removeBookmark(${doc.id})" class="shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Bỏ lưu">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            `;
            container.appendChild(card);
        });
    }
}

// Initialize bookmark buttons on page load
document.addEventListener('DOMContentLoaded', () => {
    updateBookmarkBadge();
    
    const bookmarks = getBookmarks();
    const buttons = document.querySelectorAll('.btn-bookmark');
    buttons.forEach(btn => {
        const id = btn.getAttribute('data-doc-id');
        if (bookmarks.some(b => b.id == id)) {
            btn.classList.add('text-blue-500', 'bg-blue-50');
            btn.classList.remove('text-gray-400');
            btn.querySelector('svg').setAttribute('fill', 'currentColor');
        }
    });
});
