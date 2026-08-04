document.addEventListener('DOMContentLoaded', () => {
    const titleFontSel = document.getElementById('titleFontSel');
    const bodyFontSel = document.getElementById('bodyFontSel');
    
    const previewTitle = document.getElementById('previewTitle');
    const previewSubtitle = document.getElementById('previewSubtitle');
    const previewBody1 = document.getElementById('previewBody1');
    const previewBody2 = document.getElementById('previewBody2');
    
    const presetBtns = document.querySelectorAll('.preset-btn');

    const allClasses = ['font-inter', 'font-roboto', 'font-opensans', 'font-montserrat', 'font-oswald', 'font-merriweather', 'font-lora', 'font-playfair'];

    const updateFonts = () => {
        const titleClass = titleFontSel.value;
        const bodyClass = bodyFontSel.value;

        // Reset
        previewTitle.classList.remove(...allClasses);
        previewSubtitle.classList.remove(...allClasses);
        previewBody1.classList.remove(...allClasses);
        previewBody2.classList.remove(...allClasses);

        // Apply
        previewTitle.classList.add(titleClass);
        previewSubtitle.classList.add(titleClass); // Use title font for H2 as well usually
        previewBody1.classList.add(bodyClass);
        previewBody2.classList.add(bodyClass);
    };

    titleFontSel.addEventListener('change', updateFonts);
    bodyFontSel.addEventListener('change', updateFonts);

    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            titleFontSel.value = btn.dataset.title;
            bodyFontSel.value = btn.dataset.body;
            updateFonts();
        });
    });

    // Initialize default
    updateFonts();
});
