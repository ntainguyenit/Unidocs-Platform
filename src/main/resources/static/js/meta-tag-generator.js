document.addEventListener('DOMContentLoaded', () => {
    const inputs = [
        document.getElementById('metaTitle'),
        document.getElementById('metaDesc'),
        document.getElementById('metaKeys'),
        document.getElementById('metaAuthor'),
        document.getElementById('metaUrl'),
        document.getElementById('metaImage')
    ];
    
    const codeOutput = document.getElementById('codeOutput');
    const copyBtn = document.getElementById('copyBtn');

    const escapeHTML = (str) => str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag] || tag));

    const generateMeta = () => {
        const title = escapeHTML(inputs[0].value.trim());
        const desc = escapeHTML(inputs[1].value.trim());
        const keys = escapeHTML(inputs[2].value.trim());
        const author = escapeHTML(inputs[3].value.trim());
        const url = escapeHTML(inputs[4].value.trim());
        const img = escapeHTML(inputs[5].value.trim());

        let code = `<!-- Primary Meta Tags -->\n`;
        if (title) code += `<title>${title}</title>\n`;
        if (title) code += `<meta name="title" content="${title}">\n`;
        if (desc) code += `<meta name="description" content="${desc}">\n`;
        if (keys) code += `<meta name="keywords" content="${keys}">\n`;
        if (author) code += `<meta name="author" content="${author}">\n`;

        if (title || desc || url || img) {
            code += `\n<!-- Open Graph / Facebook -->\n`;
            code += `<meta property="og:type" content="website">\n`;
            if (url) code += `<meta property="og:url" content="${url}">\n`;
            if (title) code += `<meta property="og:title" content="${title}">\n`;
            if (desc) code += `<meta property="og:description" content="${desc}">\n`;
            if (img) code += `<meta property="og:image" content="${img}">\n`;

            code += `\n<!-- Twitter -->\n`;
            code += `<meta property="twitter:card" content="summary_large_image">\n`;
            if (url) code += `<meta property="twitter:url" content="${url}">\n`;
            if (title) code += `<meta property="twitter:title" content="${title}">\n`;
            if (desc) code += `<meta property="twitter:description" content="${desc}">\n`;
            if (img) code += `<meta property="twitter:image" content="${img}">\n`;
        }

        codeOutput.innerHTML = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    };

    inputs.forEach(input => {
        input.addEventListener('input', generateMeta);
    });

    // Generate once
    generateMeta();

    copyBtn.addEventListener('click', () => {
        const text = codeOutput.innerText;
        navigator.clipboard.writeText(text).then(() => {
            const originalHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = 'Đã chép!';
            copyBtn.classList.replace('bg-gray-700', 'bg-green-600');
            setTimeout(() => {
                copyBtn.innerHTML = originalHTML;
                copyBtn.classList.replace('bg-green-600', 'bg-gray-700');
            }, 2000);
        });
    });
});
