(function() {
    const banner = document.getElementById('dynamic-banner');
    const pattern = document.getElementById('dynamic-banner-pattern');
    if (!banner || !pattern) return;

    const today = new Date();
    const month = today.getMonth() + 1; // 1-12
    const day = today.getDate();
    const year = today.getFullYear();

    // Lunar New Year Dates (approximate starting from mÃ¹ng 1) 2026-2035
    const lunarNewYearDates = {
        2026: { m: 2, d: 17 },
        2027: { m: 2, d: 6 },
        2028: { m: 1, d: 26 },
        2029: { m: 2, d: 13 },
        2030: { m: 2, d: 2 },
        2031: { m: 1, d: 23 },
        2032: { m: 2, d: 11 },
        2033: { m: 1, d: 31 },
        2034: { m: 2, d: 19 },
        2035: { m: 2, d: 8 }
    };

    let activeHoliday = null;

    // Check Tet (Lunar New Year) - 15 days before, 10 days after
    if (lunarNewYearDates[year]) {
        const lnyDate = new Date(year, lunarNewYearDates[year].m - 1, lunarNewYearDates[year].d);
        const diffDays = Math.round((today - lnyDate) / (1000 * 60 * 60 * 24));
        if (diffDays >= -15 && diffDays <= 10) {
            activeHoliday = 'TET';
        }
    }

    if (!activeHoliday) {
        if (month === 1 && day >= 1 && day <= 3) activeHoliday = 'NEW_YEAR';
        else if (month === 2 && day >= 12 && day <= 15) activeHoliday = 'VALENTINE';
        else if (month === 3 && day >= 6 && day <= 9) activeHoliday = 'WOMEN_DAY';
        else if ((month === 4 && day >= 28) || (month === 5 && day <= 3)) activeHoliday = 'REUNIFICATION';
        else if (month === 9 && day >= 1 && day <= 4) activeHoliday = 'INDEPENDENCE';
        else if (month === 10 && day >= 18 && day <= 21) activeHoliday = 'WOMEN_DAY_VN';
        else if (month === 10 && day >= 29 && day <= 31) activeHoliday = 'HALLOWEEN';
        else if (month === 11 && day >= 18 && day <= 21) activeHoliday = 'TEACHER_DAY';
        else if (month === 12 && day >= 22 && day <= 26) activeHoliday = 'CHRISTMAS';
    }

    const holidays = {
        'TET': {
            bg: 'bg-red-600',
            svg: '<svg width="400" height="400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
        },
        'NEW_YEAR': {
            bg: 'bg-red-500',
            svg: '<svg width="400" height="400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'
        },
        'VALENTINE': {
            bg: 'bg-rose-500',
            svg: '<svg width="400" height="400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>'
        },
        'WOMEN_DAY': {
            bg: 'bg-fuchsia-600',
            svg: '<svg width="400" height="400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-7l-2-2m4 0l-2 2m0-6a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/></svg>'
        },
        'WOMEN_DAY_VN': {
            bg: 'bg-fuchsia-600',
            svg: '<svg width="400" height="400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-7l-2-2m4 0l-2 2m0-6a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/></svg>'
        },
        'REUNIFICATION': {
            bg: 'bg-red-700',
            svg: '<svg width="400" height="400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>'
        },
        'INDEPENDENCE': {
            bg: 'bg-red-700',
            svg: '<svg width="400" height="400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>'
        },
        'HALLOWEEN': {
            bg: 'bg-orange-600',
            svg: '<svg width="400" height="400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M9 10l1 1-1 1M15 10l-1 1 1 1M10 16h4"></path></svg>'
        },
        'TEACHER_DAY': {
            bg: 'bg-blue-600',
            svg: '<svg width="400" height="400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>'
        },
        'CHRISTMAS': {
            bg: 'bg-emerald-700',
            svg: '<svg width="400" height="400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5l-10 14M7 5l10 14M22 12H2M19 17l-14-10M5 17l14-10"/></svg>'
        }
    };

    if (activeHoliday && holidays[activeHoliday]) {
        const theme = holidays[activeHoliday];
        banner.classList.remove('bg-primary-dark');
        banner.classList.add(theme.bg);
        pattern.innerHTML = theme.svg;
    }

    // Set greeting text based on current hour
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
        })();


