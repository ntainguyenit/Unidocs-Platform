document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('markdownInput');
    const svgEl = document.getElementById('markmapPreview');
    const fitBtn = document.getElementById('fitBtn');

    // Khởi tạo Markmap
    const { Transformer, Markmap } = window.markmap;
    const transformer = new Transformer();
    let mm;

    const defaultContent = `# Lập trình Web
## Frontend
- HTML5
- CSS3
  - TailwindCSS
  - Bootstrap
- Javascript
  - React
  - Vue
## Backend
- Java
  - Spring Boot
- Python
  - Django
- Node.js
## Database
- SQL (MySQL)
- NoSQL (MongoDB)`;

    input.value = defaultContent;

    const renderMap = () => {
        try {
            const markdown = input.value;
            // Parse MD to internal JSON structure
            const { root } = transformer.transform(markdown);
            
            if (!mm) {
                mm = Markmap.create(svgEl, {
                    color: () => '#1e40af', // Dark blue scheme
                    paddingX: 32,
                    autoFit: true
                }, root);
            } else {
                mm.setData(root);
                mm.fit(); // Auto fit container
            }
        } catch(e) {
            console.error("Lỗi vẽ map", e);
        }
    };

    input.addEventListener('input', () => {
        renderMap();
    });

    fitBtn.addEventListener('click', () => {
        if(mm) mm.fit();
    });

    // Initial draw
    setTimeout(renderMap, 100);
});
