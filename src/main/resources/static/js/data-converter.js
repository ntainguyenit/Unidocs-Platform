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
            target.classList.add('flex');
        });
    });

    // --- JSON to XML ---
    const j2xInput = document.getElementById('j2xInput');
    const j2xOutput = document.getElementById('j2xOutput');
    const j2xCopyBtn = document.getElementById('j2xCopyBtn');

    function json2xml(obj) {
        let xml = '';
        for (let prop in obj) {
            xml += obj[prop] instanceof Array ? '' : "<" + prop + ">";
            if (obj[prop] instanceof Array) {
                for (let array in obj[prop]) {
                    xml += "<" + prop + ">";
                    xml += json2xml(new Object(obj[prop][array]));
                    xml += "</" + prop + ">";
                }
            } else if (typeof obj[prop] == "object") {
                xml += json2xml(new Object(obj[prop]));
            } else {
                xml += obj[prop];
            }
            xml += obj[prop] instanceof Array ? '' : "</" + prop + ">";
        }
        xml = xml.replace(/<\/?[0-9]{1,}>/g, ''); // Fix array index tags
        return xml;
    }

    const formatXml = (xml) => {
        let formatted = '';
        let reg = /(>)(<)(\/*)/g;
        xml = xml.replace(reg, '$1\r\n$2$3');
        let pad = 0;
        xml.split('\r\n').forEach(function(node) {
            let indent = 0;
            if (node.match( /.+<\/\w[^>]*>$/ )) {
                indent = 0;
            } else if (node.match( /^<\/\w/ )) {
                if (pad != 0) pad -= 1;
            } else if (node.match( /^<\w[^>]*[^\/]>.*$/ )) {
                indent = 1;
            } else {
                indent = 0;
            }
            let padding = '';
            for (let i = 0; i < pad; i++) padding += '  ';
            formatted += padding + node + '\r\n';
            pad += indent;
        });
        return formatted;
    }

    const handleJ2X = () => {
        const val = j2xInput.value.trim();
        if(!val) {
            j2xOutput.innerHTML = 'Vui lòng nhập JSON hợp lệ ở bên trái.';
            j2xOutput.className = 'w-full flex-grow p-4 overflow-auto font-mono text-sm m-0 text-gray-500';
            return;
        }
        try {
            const parsed = JSON.parse(val);
            let rawXml = json2xml(parsed);
            if (!rawXml.startsWith('<root>')) rawXml = `<root>${rawXml}</root>`;
            const formatted = formatXml(rawXml);
            j2xOutput.innerHTML = formatted.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            j2xOutput.className = 'w-full flex-grow p-4 overflow-auto font-mono text-sm m-0 text-green-400';
        } catch (e) {
            j2xOutput.innerHTML = 'Lỗi JSON: ' + e.message;
            j2xOutput.className = 'w-full flex-grow p-4 overflow-auto font-mono text-sm m-0 text-red-400';
        }
    };
    j2xInput.addEventListener('input', handleJ2X);

    j2xCopyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(j2xOutput.innerText).then(() => {
            j2xCopyBtn.innerText = 'Đã chép!';
            setTimeout(()=> j2xCopyBtn.innerText = 'Copy Code', 1500);
        });
    });

    // --- CSV to JSON ---
    const c2jInput = document.getElementById('c2jInput');
    const c2jOutput = document.getElementById('c2jOutput');
    const c2jCopyBtn = document.getElementById('c2jCopyBtn');

    const handleC2J = () => {
        const val = c2jInput.value.trim();
        if(!val) {
            c2jOutput.innerHTML = 'Vui lòng nhập CSV hợp lệ ở bên trái.';
            c2jOutput.className = 'w-full flex-grow p-4 overflow-auto font-mono text-sm m-0 text-gray-500';
            return;
        }
        try {
            const lines = val.split('\n');
            const result = [];
            const headers = lines[0].split(',').map(h => h.trim());

            for (let i = 1; i < lines.length; i++) {
                if(!lines[i].trim()) continue;
                const obj = {};
                // Handle basic comma separation (Doesn't handle complex quoted CSV but good enough for students)
                const currentline = lines[i].split(',');
                for (let j = 0; j < headers.length; j++) {
                    obj[headers[j]] = currentline[j] ? currentline[j].trim() : "";
                }
                result.push(obj);
            }
            
            const formatted = JSON.stringify(result, null, 4);
            c2jOutput.innerHTML = formatted.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            c2jOutput.className = 'w-full flex-grow p-4 overflow-auto font-mono text-sm m-0 text-blue-400';
        } catch (e) {
            c2jOutput.innerHTML = 'Lỗi CSV: ' + e.message;
            c2jOutput.className = 'w-full flex-grow p-4 overflow-auto font-mono text-sm m-0 text-red-400';
        }
    };
    c2jInput.addEventListener('input', handleC2J);

    c2jCopyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(c2jOutput.innerText).then(() => {
            c2jCopyBtn.innerText = 'Đã chép!';
            setTimeout(()=> c2jCopyBtn.innerText = 'Copy Code', 1500);
        });
    });

});
