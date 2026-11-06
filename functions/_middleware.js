// Cloudflare Pages Functions Middleware
// Intercepts requests, detects Render suspension (502 Service Suspended) or downtime (503 Service Unavailable),
// and intelligently redirects or serves the UniDocs Maintenance Page directly from the Cloudflare edge.

const MAINTENANCE_HTML = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hệ thống đang bảo trì | UniDocs HUSC</title>
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%231E3A8A'><path d='M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z'/></svg>">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        brand: '#1E3A8A',
                    }
                }
            }
        }
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
        }
    </style>
</head>
<body class="bg-[#F4F7FE] text-slate-800 min-h-screen flex items-center justify-center p-4 sm:p-6 antialiased">
    <main class="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-10 text-center relative overflow-hidden">
        <div id="iconBox" class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center mx-auto mb-6 shadow-sm transition-colors duration-300">
            <svg class="w-9 h-9 sm:w-11 sm:h-11" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 14l9-5-9-5-9 5 9 5z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 14v7"></path>
            </svg>
        </div>

        <h1 id="mainTitle" class="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
            Hệ thống đang bảo trì
        </h1>

        <p id="mainDesc" class="text-slate-600 text-sm sm:text-base leading-relaxed mb-6 font-normal">
            UniDocs HUSC đang được bảo trì định kỳ, nâng cấp hạ tầng hoặc tạm ngưng để tối ưu hóa tài nguyên cho sinh viên.
        </p>

        <div id="statusBox" class="bg-blue-50/80 border border-blue-100 rounded-xl p-4 sm:p-5 mb-6 text-center transition-all duration-300">
            <div class="flex items-center justify-center gap-2 mb-1.5">
                <span id="statusIndicator" class="inline-block w-2.5 h-2.5 rounded-full bg-[#1E3A8A] animate-pulse"></span>
                <span id="statusTitle" class="text-sm sm:text-base font-bold text-[#1E3A8A] tracking-wide">
                    Vui lòng quay trở lại sau
                </span>
            </div>
            <p id="statusDesc" class="text-xs sm:text-sm text-slate-600 font-medium">
                Dự kiến hoàn tất nâng cấp và mở lại hệ thống trong thời gian sớm nhất.
            </p>
        </div>

        <div class="mb-6 space-y-3">
            <div id="countdownContainer" class="text-xs text-slate-500 font-medium flex items-center justify-center gap-1.5">
                <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke-width="2"></circle>
                    <polyline points="12 6 12 12 16 14" stroke-width="2"></polyline>
                </svg>
                <span>Tự động kiểm tra lại sau <span id="retryCountdown" class="font-bold text-[#1E3A8A]">15</span>s</span>
            </div>
            
            <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button id="btnRetry" onclick="checkServerHealth(true)" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white font-semibold text-sm transition-all duration-200 shadow-sm active:scale-95 cursor-pointer">
                    <svg id="retryIcon" class="w-4 h-4 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    <span id="retryText">Kiểm tra kết nối lại</span>
                </button>
                <a href="/" id="btnHome" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm transition-colors">
                    <span>Về trang chủ</span>
                </a>
            </div>
            <div id="checkMessage" class="text-xs font-medium text-amber-600 hidden"></div>
        </div>

        <footer class="pt-4 border-t border-slate-100 text-xs sm:text-sm text-slate-500 leading-relaxed">
            <p>
                Cảm ơn bạn đã kiên nhẫn chờ đợi. Mọi thắc mắc vui lòng liên hệ tại
                <a href="mailto:ntainguyen.it@gmail.com" class="text-[#1E3A8A] font-semibold hover:underline transition-colors whitespace-nowrap">
                    ntainguyen.it@gmail.com
                </a>.
            </p>
        </footer>
    </main>

    <script>
        let countdown = 15;
        let isChecking = false;
        let isRecovered = false;
        const countdownEl = document.getElementById('retryCountdown');
        const retryIcon = document.getElementById('retryIcon');
        const retryText = document.getElementById('retryText');
        const checkMessage = document.getElementById('checkMessage');
        const statusBox = document.getElementById('statusBox');
        const statusIndicator = document.getElementById('statusIndicator');
        const statusTitle = document.getElementById('statusTitle');
        const statusDesc = document.getElementById('statusDesc');
        const iconBox = document.getElementById('iconBox');

        const urlParams = new URLSearchParams(window.location.search);
        const fromUrl = urlParams.get('from');

        async function checkServerHealth(isManual = false) {
            if (isChecking || isRecovered) return;
            isChecking = true;
            if (retryIcon) retryIcon.classList.add('animate-spin');
            if (retryText) retryText.innerText = 'Đang kiểm tra...';
            if (checkMessage) checkMessage.classList.add('hidden');

            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 6000);
                const res = await fetch('/api/health?t=' + Date.now(), {
                    cache: 'no-store',
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                if (res.ok) {
                    const data = await res.json().catch(() => ({ status: 'UP' }));
                    if (data && data.status === 'UP') {
                        isRecovered = true;
                        if (iconBox) {
                            iconBox.className = 'w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-sm transition-colors duration-300';
                        }
                        if (statusBox) {
                            statusBox.className = 'bg-emerald-50 border border-emerald-200 rounded-xl p-4 sm:p-5 mb-6 text-center transition-all duration-300';
                        }
                        if (statusIndicator) {
                            statusIndicator.className = 'inline-block w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping';
                        }
                        if (statusTitle) {
                            statusTitle.className = 'text-sm sm:text-base font-bold text-emerald-700 tracking-wide';
                            statusTitle.innerText = 'Máy chủ đã hoạt động trở lại!';
                        }
                        if (statusDesc) {
                            statusDesc.className = 'text-xs sm:text-sm text-emerald-600 font-medium';
                            statusDesc.innerText = 'Đang chuyển hướng bạn trở lại hệ thống...';
                        }
                        const countdownContainer = document.getElementById('countdownContainer');
                        if (countdownContainer) countdownContainer.classList.add('hidden');

                        setTimeout(() => {
                            if (fromUrl && fromUrl.startsWith('/') && !fromUrl.startsWith('//')) {
                                window.location.href = fromUrl;
                            } else {
                                window.location.href = '/';
                            }
                        }, 1200);
                        return;
                    }
                }
                throw new Error('Service still down');
            } catch (err) {
                if (isManual && checkMessage) {
                    checkMessage.innerText = 'Máy chủ vẫn đang bảo trì hoặc đang khởi động. Hệ thống sẽ tiếp tục thử lại tự động!';
                    checkMessage.classList.remove('hidden');
                }
            } finally {
                isChecking = false;
                if (retryIcon) retryIcon.classList.remove('animate-spin');
                if (retryText) retryText.innerText = 'Kiểm tra kết nối lại';
                countdown = 15;
                if (countdownEl) countdownEl.innerText = countdown;
            }
        }

        setInterval(() => {
            if (isChecking || isRecovered) return;
            countdown--;
            if (countdownEl) countdownEl.innerText = countdown;
            if (countdown <= 0) {
                countdown = 15;
                checkServerHealth(false);
            }
        }, 1000);
    </script>
</body>
</html>`;

export async function onRequest(context) {
    const { request } = context;
    const url = new URL(request.url);

    // 1. Direct request to /maintenance or /maintenance.html: Serve maintenance HTML directly from Cloudflare Edge
    if (url.pathname === '/maintenance' || url.pathname === '/maintenance.html') {
        return new Response(MAINTENANCE_HTML, {
            status: 200,
            headers: {
                'Content-Type': 'text/html; charset=UTF-8',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'X-Edge-Handler': 'UniDocs-Edge-Maintenance'
            }
        });
    }

    // 2. Health check endpoint: Allow request to reach origin to check if Render has recovered
    if (url.pathname === '/api/health') {
        try {
            const response = await context.next();
            if (response.status === 200) {
                return response;
            }
            return new Response(JSON.stringify({ status: "DOWN", code: response.status }), {
                status: 503,
                headers: { 'Content-Type': 'application/json; charset=UTF-8', 'Cache-Control': 'no-cache' }
            });
        } catch (e) {
            return new Response(JSON.stringify({ status: "DOWN", error: "Origin unreachable" }), {
                status: 503,
                headers: { 'Content-Type': 'application/json; charset=UTF-8', 'Cache-Control': 'no-cache' }
            });
        }
    }

    try {
        const response = await context.next();

        // 3. Inspect response for Render suspension (502) or downtime (503/504)
        if (response.status === 502 || response.status === 503 || response.status === 504) {
            let isRenderFailure = false;

            if (response.status === 503 || response.status === 504) {
                isRenderFailure = true;
            } else if (response.status === 502) {
                // Check if response body mentions Render error or suspension
                try {
                    const cloned = response.clone();
                    const text = await cloned.text();
                    if (
                        text.includes('Service Suspended') ||
                        text.includes('suspended') ||
                        text.includes('Application failed to respond') ||
                        text.includes('Render') ||
                        text.includes('Bad Gateway')
                    ) {
                        isRenderFailure = true;
                    }
                } catch (e) {
                    isRenderFailure = true;
                }
            }

            if (isRenderFailure) {
                // API request: return JSON 503
                const accept = request.headers.get('Accept') || '';
                if (url.pathname.startsWith('/api/') || accept.includes('application/json')) {
                    return new Response(JSON.stringify({
                        status: 503,
                        error: "Service Maintenance",
                        message: "Hệ thống đang bảo trì hoặc tạm ngưng. Vui lòng quay lại sau.",
                        maintenanceUrl: "/maintenance"
                    }), {
                        status: 503,
                        headers: {
                            'Content-Type': 'application/json; charset=UTF-8',
                            'Retry-After': '60',
                            'X-Edge-Handler': 'UniDocs-Edge-Maintenance'
                        }
                    });
                }

                // If static asset (.css, .js, .png, etc.), let response pass through
                if (/\.(css|js|png|jpg|jpeg|svg|ico|woff2?|webmanifest)$/i.test(url.pathname)) {
                    return response;
                }

                // Page navigation: smart redirect to /maintenance preserving 'from'
                const targetUrl = new URL('/maintenance', request.url);
                if (url.pathname !== '/' && !url.searchParams.has('from')) {
                    targetUrl.searchParams.set('from', url.pathname + url.search);
                }
                return Response.redirect(targetUrl.toString(), 302);
            }
        }

        return response;
    } catch (err) {
        // 4. Origin completely unreachable (e.g. Render server offline / timeout)
        const accept = request.headers.get('Accept') || '';
        if (url.pathname.startsWith('/api/') || accept.includes('application/json')) {
            return new Response(JSON.stringify({
                status: 503,
                error: "Service Maintenance",
                message: "Không thể kết nối đến máy chủ. Hệ thống đang bảo trì.",
                maintenanceUrl: "/maintenance"
            }), {
                status: 503,
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8',
                    'Retry-After': '60'
                }
            });
        }

        if (/\.(css|js|png|jpg|jpeg|svg|ico|woff2?|webmanifest)$/i.test(url.pathname)) {
            return new Response('Asset temporarily unavailable', { status: 503 });
        }

        const targetUrl = new URL('/maintenance', request.url);
        if (url.pathname !== '/' && !url.searchParams.has('from')) {
            targetUrl.searchParams.set('from', url.pathname + url.search);
        }
        return Response.redirect(targetUrl.toString(), 302);
    }
}
