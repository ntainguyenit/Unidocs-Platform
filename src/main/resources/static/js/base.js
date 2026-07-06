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
        const updateDate = () => {
            const now = new Date();
            const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
            dateEl.textContent = `${days[now.getDay()]}, ngày ${now.getDate()} tháng ${now.getMonth() + 1} năm ${now.getFullYear()}`;
        };
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
const themes = ['light', 'dark', 'system'];
let currentThemeIndex = 0; 
const savedTheme = localStorage.getItem('unidocs_theme');
if (savedTheme) {
    currentThemeIndex = themes.indexOf(savedTheme) !== -1 ? themes.indexOf(savedTheme) : 0;
}

function applyTheme() {
    const theme = themes[currentThemeIndex];
    const themeNames = ['Sáng', 'Tối', 'Hệ thống'];
    const currentThemeEl = document.getElementById('currentTheme');
    if (currentThemeEl) currentThemeEl.textContent = themeNames[currentThemeIndex];
    
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
function applyLanguage() {}
applyLanguage();
applyTheme();
