/* ============================================================
   FIREBASE FIRESTORE CONFIGURATION
   ============================================================
   Project: portfolio-v001
   Environment variables can be managed in .env (for Vercel)
   or configured directly via the Admin Panel (🔒 Admin in footer).
   ============================================================ */

window.DEFAULT_FIREBASE_CONFIG = {
    apiKey: "AIzaSyCiNN_0FVfV5908NNo7XC2DM9u0O6sb2bw",
    authDomain: "portfolio-v001.firebaseapp.com",
    projectId: "portfolio-v001",
    storageBucket: "portfolio-v001.firebasestorage.app",
    messagingSenderId: "329089542798",
    appId: "1:329089542798:web:60e1a2e7f06045d4d7b7df"
};

/**
 * Returns active Firebase config:
 * 1. Checks localStorage ('azmin_firebase_config')
 * 2. Falls back to window.DEFAULT_FIREBASE_CONFIG
 */
window.getFirebaseConfig = function () {
    try {
        const saved = localStorage.getItem('azmin_firebase_config');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed && parsed.projectId) {
                return Object.assign({}, window.DEFAULT_FIREBASE_CONFIG, parsed);
            }
        }
    } catch (e) {
        console.warn('[FirebaseConfig] Error reading local config cache:', e);
    }
    return window.DEFAULT_FIREBASE_CONFIG;
};

// Try fetching environment config from Vercel serverless /api/config
(function tryFetchVercelConfig() {
    if (typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http')) {
        fetch('/api/config')
            .then(res => res.ok ? res.json() : null)
            .then(config => {
                if (config && config.apiKey) {
                    window.DEFAULT_FIREBASE_CONFIG = Object.assign({}, window.DEFAULT_FIREBASE_CONFIG, config);
                }
            })
            .catch(() => {
                // Silently fallback if not deployed on Vercel
            });
    }
})();
