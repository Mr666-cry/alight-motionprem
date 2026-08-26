const axios = require('axios');

const BASE_URL = 'https://am.yappi.my.id';
const VERIFY_API = `${BASE_URL}/api/verify`;

const HEADERS = {
    'Content-Type': 'application/json',
    'Origin': BASE_URL,
    'Referer': `${BASE_URL}/`,
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36'
};

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    const { email, link, sessionCookie } = req.body;

    if (!email || !link || !sessionCookie) {
        return res.status(400).json({ 
            success: false, 
            message: 'Parameter "email", "link", dan "sessionCookie" wajib disertakan!' 
        });
    }

    try {
        const verifyRes = await axios.post(VERIFY_API, {
            email: email,
            link: link,
            cookie: sessionCookie
        }, {
            headers: HEADERS,
            timeout: 30000
        });

        if (verifyRes.data?.ok) {
            return res.status(200).json({
                success: true,
                message: 'VERIFICATION SUCCESSFUL!',
                userData: verifyRes.data.data?.user || null
            });
        }

        throw new Error(verifyRes.data?.error || 'Verifikasi gagal!');

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.response?.data?.error || err.message
        });
    }
};
