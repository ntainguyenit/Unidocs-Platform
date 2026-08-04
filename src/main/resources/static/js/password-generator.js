document.addEventListener('DOMContentLoaded', () => {
    const passwordOutput = document.getElementById('passwordOutput');
    const copyBtn = document.getElementById('copyBtn');
    const lengthSlider = document.getElementById('lengthSlider');
    const lengthVal = document.getElementById('lengthVal');
    const chkUpper = document.getElementById('chkUpper');
    const chkLower = document.getElementById('chkLower');
    const chkNumbers = document.getElementById('chkNumbers');
    const chkSymbols = document.getElementById('chkSymbols');
    const generateBtn = document.getElementById('generateBtn');
    const errorMsg = document.getElementById('errorMsg');

    const UPPER_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const LOWER_CHARS = 'abcdefghijklmnopqrstuvwxyz';
    const NUMBER_CHARS = '0123456789';
    const SYMBOL_CHARS = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    // Update slider value display
    lengthSlider.addEventListener('input', () => {
        lengthVal.innerText = lengthSlider.value;
    });

    const generatePassword = () => {
        let chars = '';
        if (chkUpper.checked) chars += UPPER_CHARS;
        if (chkLower.checked) chars += LOWER_CHARS;
        if (chkNumbers.checked) chars += NUMBER_CHARS;
        if (chkSymbols.checked) chars += SYMBOL_CHARS;

        if (chars.length === 0) {
            errorMsg.classList.remove('hidden');
            passwordOutput.innerText = '-----';
            return;
        }
        errorMsg.classList.add('hidden');

        let password = '';
        const length = parseInt(lengthSlider.value);
        
        // Use crypto for better randomness if available
        if (window.crypto && window.crypto.getRandomValues) {
            const randomArray = new Uint32Array(length);
            window.crypto.getRandomValues(randomArray);
            for (let i = 0; i < length; i++) {
                password += chars[randomArray[i] % chars.length];
            }
        } else {
            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * chars.length);
                password += chars[randomIndex];
            }
        }
        
        passwordOutput.innerText = password;
        passwordOutput.classList.remove('text-gray-400');
        passwordOutput.classList.add('text-blue-900');
    };

    // Copy to clipboard
    copyBtn.addEventListener('click', () => {
        const password = passwordOutput.innerText;
        if (!password || password === 'Click tạo mật khẩu...' || password === '-----') return;

        navigator.clipboard.writeText(password).then(() => {
            // Visual feedback
            const originalHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;
            copyBtn.classList.replace('text-blue-700', 'text-green-600');
            copyBtn.classList.replace('bg-blue-100', 'bg-green-100');
            
            setTimeout(() => {
                copyBtn.innerHTML = originalHTML;
                copyBtn.classList.replace('text-green-600', 'text-blue-700');
                copyBtn.classList.replace('bg-green-100', 'bg-blue-100');
            }, 1500);
        }).catch(err => {
            console.error('Failed to copy: ', err);
            alert('Không thể copy mật khẩu. Vui lòng copy thủ công.');
        });
    });

    generateBtn.addEventListener('click', generatePassword);

    // Initial generate
    generatePassword();
});
