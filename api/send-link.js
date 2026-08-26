const axios = require('axios');

const BASE_URL = 'https://am.yappi.my.id';
const COOKIE_API = `${BASE_URL}/api/cookie`;
const SEND_API = `${BASE_URL}/api/send`;

const HEADERS = {
    'Content-Type': 'application/json',
    'Origin': BASE_URL,
    'Referer': `${BASE_URL}/`,
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36'
};

module.exports = async (req, res) => {
    // Set CORS Headers agar bisa diakses dari Frontend domain lain
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Parameter "email" wajib diisi!' });
    }

    try {
        // 1. Get Cookie Session
        const cookieRes = await axios.get(COOKIE_API, { 
            timeout: 10000, 
            headers: HEADERS 
        });

        if (!cookieRes.data?.ok || !cookieRes.data?.cookie) {
            throw new Error('Gagal mendapatkan session cookie dari target host');
        }

        const cookie = cookieRes.data.cookie;

        // 2. Send Magic Link
        const sendRes = await axios.post(SEND_API, { email, cookie }, {
            headers: HEADERS,
            timeout: 30000
        });

        if (sendRes.data?.ok) {
            return res.status(200).json({
                success: true,
                message: 'Verification link sent successfully! Check your email inbox.',
                sessionCookie: cookie // Kirim balik cookie ke client untuk step 2
            });
        }

        throw new Error(sendRes.data?.error || 'Gagal mengirimkan link verifikasi');

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.response?.data?.error || err.message
        });
    }
};
