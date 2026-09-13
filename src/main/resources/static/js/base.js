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

// UX Protection (protect session)
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
        const iframe = document.getElementById('lookerStudioIframe');
        if (iframe) {
            // Show loader and force iframe reload for real-time updates
            const loader = document.getElementById('statsLoader');
            if (loader) loader.classList.remove('hidden');
            iframe.src = iframe.getAttribute('data-src');
        }
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

function copyDocLink(slug) {
    const url = window.location.origin + '/document/' + slug + '/view';
    navigator.clipboard.writeText(url).then(() => {
        if (typeof Toastify !== 'undefined') {
            Toastify({
                text: 'Đã sao chép liên kết tài liệu!',
                duration: 3000,
                close: true,
                gravity: 'bottom',
                position: 'right',
                style: {
                    background: '#10b981',
                    color: 'white',
                    borderRadius: '0.375rem'
                }
            }).showToast();
        } else {
            alert('Đã sao chép liên kết tài liệu!');
        }
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}


// --- UI HELPERS ---

/**
 * Hiển thị trạng thái loading cho một nút bấm
 * @param {string} buttonId ID của nút
 * @param {string} loadingText Text hiển thị khi đang load
 */
function showButtonLoading(buttonId, loadingText = "Đang xử lý...") {
    const btn = document.getElementById(buttonId);
    if (!btn) return;
    
    // Lưu lại trạng thái HTML ban đầu
    if (!btn.dataset.originalHtml) {
        btn.dataset.originalHtml = btn.innerHTML;
    }
    
    btn.disabled = true;
    btn.classList.add("opacity-75", "cursor-not-allowed");
    
    btn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        ${loadingText}
    `;
}

/**
 * Tắt trạng thái loading, trả lại nút như cũ
 * @param {string} buttonId ID của nút
 */
function hideButtonLoading(buttonId) {
    const btn = document.getElementById(buttonId);
    if (!btn || !btn.dataset.originalHtml) return;
    
    btn.disabled = false;
    btn.classList.remove("opacity-75", "cursor-not-allowed");
    btn.innerHTML = btn.dataset.originalHtml;
}

// --- SPLASH SCREEN ---
// Khóa cuộn trang khi splash screen đang hiển thị
if (document.getElementById("splash-screen") && document.getElementById("splash-screen").style.display !== 'none') {
    document.body.style.overflow = 'hidden';
}

function hideSplashScreen() {
    const splashScreen = document.getElementById("splash-screen");
    if (splashScreen && splashScreen.style.display !== 'none') {
        // Đảm bảo hiển thị ít nhất 1 giây
        setTimeout(() => {
            if(splashScreen.style.display === "none") return; // Tránh chạy 2 lần
            splashScreen.classList.add("opacity-0");
            setTimeout(() => {
                splashScreen.style.display = "none";
                splashScreen.remove();
                document.body.style.overflow = ''; // Mở khóa cuộn trang
                window.dispatchEvent(new Event('splashScreenFinished'));
            }, 500);
        }, 1000); // 1000ms = 1 giây
    } else {
        document.body.style.overflow = '';
    }
}

// Fail-safe: Đảm bảo splash screen luôn được tắt sau tối đa 4 giây (đề phòng lỗi kẹt màn hình)
let fallbackSplashTimeout = setTimeout(() => {
    hideSplashScreen();
}, 4000);

if (document.readyState === 'complete') {
    hideSplashScreen();
} else {
    window.addEventListener("load", hideSplashScreen);
}

const MOTIVATIONAL_QUOTES = [
    { text: "Cuộc sống giống như việc lái một chiếc xe đạp. Để giữ thăng bằng, bạn phải luôn tiến về phía trước.", author: "Albert Einstein" },
    { text: "Giáo dục là vũ khí mạnh nhất mà bạn có thể dùng để thay đổi thế giới.", author: "Nelson Mandela" },
    { text: "Cách duy nhất để làm tốt một việc là yêu việc bạn đang làm.", author: "Steve Jobs" },
    { text: "Đừng bao giờ coi việc học là một nghĩa vụ, mà hãy coi đó là một cơ hội tuyệt vời.", author: "Albert Einstein" },
    { text: "Học tập là hạt giống của tri thức, tri thức là hạt giống của hạnh phúc.", author: "Ngạn ngữ Georgia" },
    { text: "Đầu tư vào tri thức luôn mang lại lợi nhuận cao nhất.", author: "Benjamin Franklin" },
    { text: "Người duy nhất bạn nên cố gắng để giỏi hơn chính là bạn của ngày hôm qua.", author: "Khuyết danh" },
    { text: "Thành công không phải là chìa khóa của hạnh phúc. Hạnh phúc mới là chìa khóa của thành công.", author: "Albert Schweitzer" },
    { text: "Hãy hướng về phía mặt trời, bóng tối sẽ ngả về sau bạn.", author: "Helen Keller" },
    { text: "Đừng đếm những gì bạn đã mất, hãy quý trọng những gì bạn đang có và lên kế hoạch cho những gì sẽ đạt được bởi vì quá khứ không bao giờ trở lại, nhưng tương lai có thể bù đắp cho sự mất mát.", author: "Khuyết danh" },
    { text: "Kẻ ngốc tìm kiếm hạnh phúc ở nơi xa xôi, người khôn ngoan trồng nó dưới chân mình.", author: "James Oppenheim" },
    { text: "Nếu bạn muốn biến những giấc mơ của mình thành hiện thực, điều đầu tiên mà bạn cần làm là thức dậy.", author: "J.M. Power" },
    { text: "Không có giới hạn nào về những gì bạn có thể hoàn thành, ngoại trừ các giới hạn bạn đặt ra trong chính tâm trí mình.", author: "Brian Tracy" },
    { text: "Thời gian của bạn là hữu hạn, đừng lãng phí nó bằng cách sống cuộc đời của người khác.", author: "Steve Jobs" }
];

function initMotivationalQuotes() {
    const containers = document.querySelectorAll('.motivational-quote-container');
    if (containers.length === 0) return;

    let currentIndex = 0;

    function updateQuotes() {
        const quote = MOTIVATIONAL_QUOTES[currentIndex];
        
        containers.forEach(container => {
            const textEl = container.querySelector('.quote-text');
            const authorEl = container.querySelector('.quote-author');
            
            if (textEl && authorEl) {
                container.style.opacity = '0';
                
                setTimeout(() => {
                    textEl.textContent = `"${quote.text}"`;
                    authorEl.textContent = `- ${quote.author}`;
                    container.style.opacity = '1';
                }, 500);
            }
        });
        
        currentIndex = (currentIndex + 1) % MOTIVATIONAL_QUOTES.length;
    }

    updateQuotes();
    setInterval(updateQuotes, 3500);
}

document.addEventListener('DOMContentLoaded', initMotivationalQuotes);
