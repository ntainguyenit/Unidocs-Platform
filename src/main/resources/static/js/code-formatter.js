document.addEventListener('DOMContentLoaded', () => {
    // --- Tabs Logic ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => {
                c.classList.remove('block', 'flex');
                c.classList.add('hidden');
            });
            btn.classList.add('active');
            const target = document.getElementById(btn.dataset.target);
            target.classList.remove('hidden');
            if (btn.dataset.target === 'tab-regex') {
                target.classList.add('flex');
            } else {
                target.classList.add('flex');
            }
        });
    });

    // --- JSON Logic ---
    const jsonInput = document.getElementById('jsonInput');
    const jsonOutput = document.getElementById('jsonOutput');
    const jsonCopyBtn = document.getElementById('jsonCopyBtn');

    const formatJSON = () => {
        const val = jsonInput.value.trim();
        if(!val) {
            jsonOutput.innerHTML = 'Vui lòng nhập JSON hợp lệ ở bên trái.';
            jsonOutput.className = 'w-full flex-grow p-4 overflow-auto font-mono text-sm m-0 text-gray-500';
            return;
        }
        try {
            const parsed = JSON.parse(val);
            const formatted = JSON.stringify(parsed, null, 4);
            jsonOutput.innerHTML = formatted.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            jsonOutput.className = 'w-full flex-grow p-4 overflow-auto font-mono text-sm m-0 text-green-400';
        } catch(e) {
            jsonOutput.innerHTML = 'Lỗi Cú Pháp JSON: \n' + e.message;
            jsonOutput.className = 'w-full flex-grow p-4 overflow-auto font-mono text-sm m-0 text-red-400';
        }
    };
    jsonInput.addEventListener('input', formatJSON);
    
    jsonCopyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(jsonOutput.innerText).then(() => {
            jsonCopyBtn.innerText = 'Đã chép!';
            setTimeout(()=> jsonCopyBtn.innerText = 'Copy Code', 1500);
        });
    });

    // --- SQL Logic ---
    const sqlInput = document.getElementById('sqlInput');
    const sqlOutput = document.getElementById('sqlOutput');
    const sqlCopyBtn = document.getElementById('sqlCopyBtn');

    const formatSQL = () => {
        const val = sqlInput.value.trim();
        if(!val) {
            sqlOutput.innerHTML = 'Vui lòng nhập SQL ở bên trái.';
            sqlOutput.className = 'w-full flex-grow p-4 overflow-auto font-mono text-sm m-0 text-gray-500';
            return;
        }
        try {
            // Using sqlFormatter from CDN window.sqlFormatter
            if (window.sqlFormatter) {
                const formatted = window.sqlFormatter.format(val);
                sqlOutput.innerHTML = formatted.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                sqlOutput.className = 'w-full flex-grow p-4 overflow-auto font-mono text-sm m-0 text-blue-400';
            } else {
                sqlOutput.innerHTML = "Thư viện SQL Formatter đang tải...";
            }
        } catch(e) {
            sqlOutput.innerHTML = 'Lỗi Cú Pháp SQL: \n' + e.message;
            sqlOutput.className = 'w-full flex-grow p-4 overflow-auto font-mono text-sm m-0 text-red-400';
        }
    };
    sqlInput.addEventListener('input', formatSQL);
    
    sqlCopyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(sqlOutput.innerText).then(() => {
            sqlCopyBtn.innerText = 'Đã chép!';
            setTimeout(()=> sqlCopyBtn.innerText = 'Copy Code', 1500);
        });
    });

    // --- Regex Logic ---
    const regexInput = document.getElementById('regexInput');
    const regexFlags = document.getElementById('regexFlags');
    const regexTestStr = document.getElementById('regexTestStr');
    const regexOutput = document.getElementById('regexOutput');

    const testRegex = () => {
        const p = regexInput.value;
        const f = regexFlags.value;
        const t = regexTestStr.value;

        if(!p) {
            regexOutput.innerHTML = '<span class="text-gray-500">Nhập Regex để bắt đầu.</span>';
            return;
        }

        try {
            const re = new RegExp(p, f);
            
            // Tìm tất cả các matches
            const matches = [...t.matchAll(re)];
            
            if (matches.length === 0) {
                regexOutput.innerHTML = '<span class="text-red-500 font-bold">Không tìm thấy kết quả phù hợp (No matches)</span>';
                return;
            }

            let resultHtml = `<div class="text-green-600 font-bold mb-2">Tìm thấy ${matches.length} kết quả (Matches):</div>`;
            
            matches.forEach((m, idx) => {
                resultHtml += `<div class="mb-2 p-2 bg-white border border-gray-200 rounded shadow-sm">
                    <span class="text-xs text-gray-400">Match ${idx + 1}</span><br>
                    <span class="text-blue-800 font-bold">"${m[0].replace(/</g, '&lt;')}"</span> <span class="text-gray-500 text-xs">tại vị trí ${m.index}</span>
                </div>`;
            });
            regexOutput.innerHTML = resultHtml;

        } catch (e) {
            regexOutput.innerHTML = '<span class="text-red-500 font-bold">Lỗi Regex:</span><br>' + e.message;
        }
    };

    regexInput.addEventListener('input', testRegex);
    regexFlags.addEventListener('input', testRegex);
    regexTestStr.addEventListener('input', testRegex);
});
