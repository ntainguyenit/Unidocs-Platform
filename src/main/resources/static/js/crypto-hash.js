document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const hmacKey = document.getElementById('hmacKey');
    
    const hashSha1 = document.getElementById('hashSha1');
    const hashSha256 = document.getElementById('hashSha256');
    const hashSha512 = document.getElementById('hashSha512');
    const hashHmac = document.getElementById('hashHmac');

    const buf2hex = (buffer) => {
        return [...new Uint8Array(buffer)].map(x => x.toString(16).padStart(2, '0')).join('');
    };

    const updateHashes = async () => {
        const text = inputText.value;
        const keyText = hmacKey.value;
        
        if (!text) {
            hashSha1.value = '';
            hashSha256.value = '';
            hashSha512.value = '';
            hashHmac.value = '';
            return;
        }

        const encoder = new TextEncoder();
        const data = encoder.encode(text);

        try {
            // SHA-1
            const hash1Buffer = await crypto.subtle.digest('SHA-1', data);
            hashSha1.value = buf2hex(hash1Buffer);

            // SHA-256
            const hash256Buffer = await crypto.subtle.digest('SHA-256', data);
            hashSha256.value = buf2hex(hash256Buffer);

            // SHA-512
            const hash512Buffer = await crypto.subtle.digest('SHA-512', data);
            hashSha512.value = buf2hex(hash512Buffer);

            // HMAC SHA-256
            if (keyText) {
                const keyData = encoder.encode(keyText);
                const cryptoKey = await crypto.subtle.importKey(
                    'raw', keyData, { name: 'HMAC', hash: 'SHA-256' },
                    false, ['sign']
                );
                const hmacBuffer = await crypto.subtle.sign('HMAC', cryptoKey, data);
                hashHmac.value = buf2hex(hmacBuffer);
            } else {
                hashHmac.value = 'Vui lòng nhập Khóa bí mật (Secret Key) ở trên';
            }
        } catch (e) {
            console.error("Crypto Error:", e);
        }
    };

    inputText.addEventListener('input', updateHashes);
    hmacKey.addEventListener('input', updateHashes);
});
