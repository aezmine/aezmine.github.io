/**
 * VERCEL SERVERLESS FUNCTION: /api/config
 * Returns Firebase web configuration securely from Vercel Environment Variables.
 */

module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    const config = {
        apiKey: process.env.FIREBASE_API_KEY || 'AIzaSyCiNN_0FVfV5908NNo7XC2DM9u0O6sb2bw',
        authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'portfolio-v001.firebaseapp.com',
        projectId: process.env.FIREBASE_PROJECT_ID || 'portfolio-v001',
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'portfolio-v001.firebasestorage.app',
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '329089542798',
        appId: process.env.FIREBASE_APP_ID || '1:329089542798:web:60e1a2e7f06045d4d7b7df'
    };

    return res.status(200).json(config);
};
