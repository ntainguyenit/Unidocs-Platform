document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('markdownInput');
    const preview = document.getElementById('markdownPreview');
    const downloadBtn = document.getElementById('downloadBtn');
    const copyHtmlBtn = document.getElementById('copyHtmlBtn');

    const defaultMD = `# Chào mừng đến với Markdown Editor

Công cụ soạn thảo Markdown nhỏ gọn chạy trực tiếp trên trình duyệt, phù hợp cho sinh viên viết README cho đồ án trên Github.

## Tính năng
- **Real-time Preview**: Xem trước kết quả tức thì
- **Hỗ trợ Code Block**:
\`\`\`javascript
const sayHello = () => {
    console.log("Hello UniDocs!");
};
\`\`\`
- *In nghiêng*, **In đậm**, ~~Gạch ngang~~

### Danh sách
1. Dễ sử dụng
2. Đơn giản
3. Tốc độ cao

[Truy cập UniDocs](https://unidocs.vn) ngay hôm nay!`;

    // Khởi tạo
    input.value = defaultMD;

    // Render logic
    const render = () => {
        const mdText = input.value;
        const html = marked.parse(mdText);
        preview.innerHTML = html;
    };

    input.addEventListener('input', render);
    render();

    // Export .md
    downloadBtn.addEventListener('click', () => {
        const text = input.value;
        const blob = new Blob([text], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'README.md';
        a.click();
        URL.revokeObjectURL(url);
    });

    // Copy HTML
    copyHtmlBtn.addEventListener('click', () => {
        const html = preview.innerHTML;
        navigator.clipboard.writeText(html).then(() => {
            const originText = copyHtmlBtn.innerHTML;
            copyHtmlBtn.innerHTML = 'Đã chép!';
            setTimeout(() => {
                copyHtmlBtn.innerHTML = originText;
            }, 1500);
        });
    });
});
