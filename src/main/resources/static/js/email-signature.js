document.addEventListener('DOMContentLoaded', () => {
    // Inputs
    const sigName = document.getElementById('sigName');
    const sigTitle = document.getElementById('sigTitle');
    const sigCompany = document.getElementById('sigCompany');
    const sigPhone = document.getElementById('sigPhone');
    const sigEmail = document.getElementById('sigEmail');
    
    // Preview
    const signaturePreview = document.getElementById('signaturePreview');
    const copySigBtn = document.getElementById('copySigBtn');

    // HTML signature template with inline CSS for Gmail
    const generateSignatureHTML = (name, title, company, phone, email) => {
        return `
<table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, sans-serif; font-size: 14px; color: #333333; line-height: 1.5;">
    <tr>
        <td style="padding-right: 15px; border-right: 2px solid #1e40af; vertical-align: top;">
            <div style="font-size: 18px; font-weight: bold; color: #1e40af; margin-bottom: 3px;">
                ${name || 'Tên của bạn'}
            </div>
            <div style="font-size: 14px; color: #666666; font-style: italic;">
                ${title || 'Chức danh'}
            </div>
            <div style="font-size: 14px; color: #666666; font-weight: bold; margin-top: 2px;">
                ${company || 'Tên tổ chức'}
            </div>
        </td>
        <td style="padding-left: 15px; vertical-align: top;">
            <table cellpadding="0" cellspacing="0" border="0">
                ${phone ? `<tr>
                    <td style="padding-bottom: 5px; color: #1e40af; font-weight: bold; padding-right: 8px;">P:</td>
                    <td style="padding-bottom: 5px;">${phone}</td>
                </tr>` : ''}
                ${email ? `<tr>
                    <td style="color: #1e40af; font-weight: bold; padding-right: 8px;">E:</td>
                    <td><a href="mailto:${email}" style="color: #3b82f6; text-decoration: none;">${email}</a></td>
                </tr>` : ''}
            </table>
        </td>
    </tr>
</table>
        `;
    };

    const updatePreview = () => {
        signaturePreview.innerHTML = generateSignatureHTML(
            sigName.value,
            sigTitle.value,
            sigCompany.value,
            sigPhone.value,
            sigEmail.value
        );
    };

    // Attach listeners
    [sigName, sigTitle, sigCompany, sigPhone, sigEmail].forEach(input => {
        input.addEventListener('input', updatePreview);
    });

    // Initial render
    updatePreview();

    // Rich Text copy command (Copy HTML instead of plaintext)
    copySigBtn.addEventListener('click', () => {
        // Create a range to select HTML preview block
        const range = document.createRange();
        range.selectNode(signaturePreview);
        const windowSelection = window.getSelection();
        windowSelection.removeAllRanges();
        windowSelection.addRange(range);

        try {
            // Copy (Lệnh này sẽ copy đúng định dạng HTML vào clipboard)
            document.execCommand('copy');
            windowSelection.removeAllRanges(); // Clear selection block

            // Hiệu ứng copy
            const originalHTML = copySigBtn.innerHTML;
            copySigBtn.innerHTML = `<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Đã chép chữ ký`;
            copySigBtn.classList.replace('bg-blue-800', 'bg-green-600');
            copySigBtn.classList.replace('hover:bg-blue-900', 'hover:bg-green-700');
            
            setTimeout(() => {
                copySigBtn.innerHTML = originalHTML;
                copySigBtn.classList.replace('bg-green-600', 'bg-blue-800');
                copySigBtn.classList.replace('hover:bg-green-700', 'hover:bg-blue-900');
            }, 2500);

        } catch (err) {
            console.error('Không thể copy chữ ký: ', err);
            alert("Trình duyệt không hỗ trợ tự động copy, vui lòng quét chọn và copy thủ công bằng phím Ctrl+C!");
        }
    });
});
