/* ============================================================
   PORTFOLIO ADMIN ACCESS & FIRESTORE SYNC
   ============================================================
   Firebase Authentication (Email & Password)
   Hardcoded Admin Email: mengcb@gmail.com
   User only enters their Firebase Auth password.
   ============================================================ */

(function () {
    'use strict';

    const ADMIN_EMAIL = 'mengcb@gmail.com';
    const FIRESTORE_COLLECTION = 'portfolio_config';
    const FIRESTORE_DOC = 'content';
    const LOCAL_CACHE_KEY = 'azmin_portfolio_content_cache';

    /* ── Default Fallback Data ──────────────────────────────── */
    const DEFAULT_DATA = {
        gdriveUrl: 'https://drive.google.com/file/d/1OkCXofpvz6rof-wE3wqWuxB-YvXyEnY-/view',
        experiences: [
            {
                role: 'Network Engineer Intern',
                company: 'CardBiz',
                date: 'Aug 2026 – Present',
                bullets: [
                    'Started internship as Network Engineer on 3 August 2026.',
                    'Assisting with network infrastructure support, configuration, and operational troubleshooting.',
                    'Collaborating with engineering team on network maintenance and monitoring.'
                ]
            },
            {
                role: 'Logistics Assistant',
                company: 'J&T Express & Shopee',
                date: '2024 – 2025',
                bullets: [
                    'Managed parcel sorting and logistics workflow with high accuracy across high-volume distribution runs.',
                    'Handled time-sensitive operations requiring strong attention to detail and execution precision.',
                    'Optimised task execution in a fast-paced distribution environment, strengthening operational efficiency awareness.',
                    'Strengthened discipline, process reliability, and cross-team coordination skills.'
                ]
            },
            {
                role: 'Crew Trainee',
                company: "McDonald's",
                date: '2023',
                bullets: [
                    'Maintained operational efficiency in a high-volume, fast-paced environment.',
                    'Trained new staff on standard operating procedures (SOPs), demonstrating ability to communicate and teach clearly.',
                    'Developed strong teamwork, communication, and time management skills under pressure.'
                ]
            }
        ]
    };

    let activeData = JSON.parse(JSON.stringify(DEFAULT_DATA));
    let db = null;
    let auth = null;
    let currentUser = null;

    /* ── Initialize Firebase ────────────────────────────────── */
    function initFirebase() {
        if (typeof window.firebase === 'undefined') {
            console.warn('[Admin] Firebase SDK not loaded on page.');
            return null;
        }

        try {
            const config = typeof window.getFirebaseConfig === 'function'
                ? window.getFirebaseConfig()
                : window.DEFAULT_FIREBASE_CONFIG;

            if (!firebase.apps.length) {
                firebase.initializeApp(config);
            }
            db = firebase.firestore();
            auth = firebase.auth();
            return { db, auth };
        } catch (err) {
            console.warn('[Admin] Firebase initialization error:', err.message);
            return null;
        }
    }

    /* ── DOM Updaters ───────────────────────────────────────── */
    function updateGoogleDriveLink(url) {
        if (!url || typeof url !== 'string') return;
        url = url.trim();

        const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                      url.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
                      url.match(/\/d\/([a-zA-Z0-9_-]+)/);
        const fileId = match ? match[1] : url;

        if (!fileId) return;

        const viewUrl = `https://drive.google.com/file/d/${fileId}/view`;
        const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;

        const viewBtn = document.getElementById('resume-view-btn');
        const fallbackLink = document.getElementById('resume-fallback-link');
        const previewIframe = document.querySelector('.resume-preview');
        const resumeSection = document.getElementById('resume');

        if (viewBtn) viewBtn.href = viewUrl;
        if (fallbackLink) fallbackLink.href = viewUrl;
        if (previewIframe) previewIframe.src = previewUrl;
        if (resumeSection) resumeSection.setAttribute('data-gdrive-url', viewUrl);
    }

    function renderExperienceTimeline(experiences) {
        if (!Array.isArray(experiences) || experiences.length === 0) return;

        const timelineContainer = document.querySelector('#experience .timeline') ||
                                  document.getElementById('experience-timeline');
        if (!timelineContainer) return;

        let html = '';
        experiences.forEach(exp => {
            const bulletsHtml = (exp.bullets || [])
                .map(b => `<li>${escapeHtml(b)}</li>`)
                .join('\n');

            html += `
            <article class="timeline-item" aria-label="${escapeHtml(exp.company)} experience">
                <div class="timeline-header">
                    <div>
                        <h3 class="timeline-title">${escapeHtml(exp.role)} <span class="timeline-company">@ ${escapeHtml(exp.company)}</span></h3>
                    </div>
                    <span class="timeline-date">${escapeHtml(exp.date)}</span>
                </div>
                <div class="timeline-body">
                    <ul>
                        ${bulletsHtml}
                    </ul>
                </div>
            </article>
            `;
        });

        timelineContainer.innerHTML = html;
    }

    function applyDataToPage(data) {
        if (!data) return;
        if (data.gdriveUrl) {
            updateGoogleDriveLink(data.gdriveUrl);
        }
        if (Array.isArray(data.experiences)) {
            renderExperienceTimeline(data.experiences);
        }
    }

    /* ── Load Data (Cache + Firestore Public Read) ──────────── */
    async function loadPortfolioData() {
        // 1. Try local cache for zero wait time
        try {
            const cached = localStorage.getItem(LOCAL_CACHE_KEY);
            if (cached) {
                activeData = JSON.parse(cached);
                applyDataToPage(activeData);
            }
        } catch (e) {
            console.warn('[Admin] Cache error:', e);
        }

        // 2. Fetch fresh data from Firestore
        if (!db) initFirebase();
        if (!db) return;

        try {
            const docSnap = await db.collection(FIRESTORE_COLLECTION).doc(FIRESTORE_DOC).get();
            if (docSnap.exists) {
                const cloudData = docSnap.data();
                if (cloudData) {
                    activeData = Object.assign({}, DEFAULT_DATA, cloudData);
                    applyDataToPage(activeData);
                    localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(activeData));
                    updateSyncIndicator(true);
                }
            } else {
                updateSyncIndicator(true);
            }
        } catch (err) {
            console.warn('[Admin] Firestore fetch error:', err.message);
            updateSyncIndicator(false);
        }
    }

    /* ── Helper: Escape HTML ────────────────────────────────── */
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /* ── Toast Notifications ────────────────────────────────── */
    function showToast(message, type = 'success') {
        let toast = document.getElementById('admin-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'admin-toast';
            toast.className = 'admin-toast';
            document.body.appendChild(toast);
        }

        toast.className = `admin-toast show ${type}`;
        toast.textContent = message;

        setTimeout(() => {
            toast.className = 'admin-toast';
        }, 3200);
    }

    /* ── Build Admin Modal HTML ─────────────────────────────── */
    function buildAdminModalHTML() {
        return `
<div id="admin-modal-backdrop" class="admin-modal-backdrop" role="dialog" aria-modal="true">
    <div class="admin-modal">

        <!-- 1. Passcode View (Ultra Minimalist & Anonymous) -->
        <div id="admin-passcode-view" class="admin-login-view">
            <button id="admin-close-x-btn" class="admin-close-stealth-btn" aria-label="Close">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
            <div class="admin-login-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
            </div>
            <div class="admin-login-form">
                <input
                    type="password"
                    id="admin-password-field"
                    class="admin-passcode-input"
                    placeholder="••••••"
                    autocomplete="current-password"
                />
                <div id="admin-password-error" class="admin-login-error"></div>
                <button type="button" id="admin-signin-btn" class="admin-submit-icon-btn" aria-label="Submit">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                </button>
            </div>
        </div>

        <!-- 2. Dashboard View -->
        <div id="admin-dashboard-view" style="display: none; flex-direction: column; flex: 1; overflow: hidden;">

            <!-- Header -->
            <div class="admin-modal-header">
                <h2 class="admin-modal-title">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                    Settings
                </h2>
                <button id="admin-close-dash-btn" class="admin-close-btn" aria-label="Close">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            <!-- Tabs -->
            <div class="admin-tabs">
                <button type="button" class="admin-tab-btn active" data-tab="tab-gdrive">Resume Link</button>
                <button type="button" class="admin-tab-btn" data-tab="tab-experience">Work Experience</button>
                <button type="button" class="admin-tab-btn" data-tab="tab-firebase">Database Settings</button>
            </div>

            <!-- Tab Content -->
            <div class="admin-tab-content">

                <!-- Tab 1: Google Drive -->
                <div id="tab-gdrive" class="admin-tab-pane active">
                    <div class="admin-form-group">
                        <label class="admin-label" for="admin-gdrive-input">Google Drive Resume URL / File ID</label>
                        <input
                            type="text"
                            id="admin-gdrive-input"
                            class="admin-input"
                            placeholder="https://drive.google.com/file/d/YOUR_FILE_ID/view"
                        />
                        <p class="admin-hint">
                            Paste your full Google Drive share link. Preview iframe, view button, and direct fallback link update automatically.
                        </p>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <a id="admin-gdrive-test-btn" href="#" target="_blank" rel="noopener noreferrer" class="admin-btn admin-btn-outline">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                            Test Link
                        </a>
                    </div>
                </div>

                <!-- Tab 2: Work Experience -->
                <div id="tab-experience" class="admin-tab-pane">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <span class="admin-label" style="margin: 0;">Experience Timeline Entries</span>
                        <button type="button" id="admin-add-exp-btn" class="admin-btn admin-btn-outline" style="padding: 5px 10px; font-size: 12px;">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Add Entry
                        </button>
                    </div>
                    <div id="admin-experience-list" class="experience-list-container">
                        <!-- Populated dynamically -->
                    </div>
                </div>

                <!-- Tab 3: Firebase Config -->
                <div id="tab-firebase" class="admin-tab-pane">
                    <div class="admin-form-group">
                        <label class="admin-label" for="admin-project-id">Firebase Project ID</label>
                        <input
                            type="text"
                            id="admin-project-id"
                            class="admin-input"
                            value="portfolio-v001"
                            readonly
                            style="background: #F8FAFC; color: #475569;"
                        />
                    </div>
                    <div class="admin-form-group">
                        <label class="admin-label" for="admin-api-key">Firebase Web API Key</label>
                        <input
                            type="text"
                            id="admin-api-key"
                            class="admin-input"
                            placeholder="AIzaSy..."
                        />
                        <p class="admin-hint">Managed via .env or saved locally in browser.</p>
                    </div>
                    <button type="button" id="admin-save-config-btn" class="admin-btn admin-btn-outline">
                        Save API Key Locally
                    </button>
                </div>

            </div>

            <!-- Footer Action Bar -->
            <div class="admin-modal-footer">
                <div class="admin-sync-status">
                    <span id="admin-status-dot" class="admin-status-dot"></span>
                    <span id="admin-status-text">Ready</span>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button type="button" id="admin-logout-btn" class="admin-btn admin-btn-ghost" title="Lock">
                        Lock
                    </button>
                    <button type="button" id="admin-save-cloud-btn" class="admin-btn admin-btn-primary">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        Save Changes
                    </button>
                </div>
            </div>

        </div>

    </div>
</div>
        `.trim();
    }

    /* ── Render Experience Cards in Admin Form ──────────────── */
    function renderAdminExperienceForm() {
        const container = document.getElementById('admin-experience-list');
        if (!container) return;

        container.innerHTML = '';

        (activeData.experiences || []).forEach((exp, idx) => {
            const card = document.createElement('div');
            card.className = 'experience-edit-card';
            card.dataset.index = idx;

            const bulletsText = (exp.bullets || []).join('\n');

            card.innerHTML = `
                <div class="experience-card-top">
                    <span class="experience-card-num">#${idx + 1}</span>
                    <button type="button" class="experience-delete-btn" data-delete-idx="${idx}" title="Delete entry">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Delete
                    </button>
                </div>
                <div class="experience-grid-row">
                    <div>
                        <label class="admin-label">Role / Position</label>
                        <input type="text" class="admin-input exp-field-role" value="${escapeHtml(exp.role)}" placeholder="e.g. Network Engineer Intern" />
                    </div>
                    <div>
                        <label class="admin-label">Company / Org</label>
                        <input type="text" class="admin-input exp-field-company" value="${escapeHtml(exp.company)}" placeholder="e.g. CardBiz" />
                    </div>
                </div>
                <div class="admin-form-group" style="margin-bottom: 10px;">
                    <label class="admin-label">Period / Dates</label>
                    <input type="text" class="admin-input exp-field-date" value="${escapeHtml(exp.date)}" placeholder="e.g. Aug 2026 – Present" />
                </div>
                <div class="admin-form-group" style="margin-bottom: 0;">
                    <label class="admin-label">Responsibilities / Highlights (one per line)</label>
                    <textarea class="admin-textarea exp-field-bullets" rows="3" placeholder="Enter each point on a new line…">${escapeHtml(bulletsText)}</textarea>
                </div>
            `;

            container.appendChild(card);
        });

        // Delete buttons
        container.querySelectorAll('.experience-delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const delIdx = parseInt(e.target.getAttribute('data-delete-idx'), 10);
                if (!isNaN(delIdx)) {
                    activeData.experiences.splice(delIdx, 1);
                    renderAdminExperienceForm();
                }
            });
        });
    }

    /* ── Collect Current Form Values ────────────────────────── */
    function collectFormData() {
        const gdriveInput = document.getElementById('admin-gdrive-input');
        if (gdriveInput) {
            activeData.gdriveUrl = gdriveInput.value.trim();
        }

        const expCards = document.querySelectorAll('.experience-edit-card');
        const experiences = [];

        expCards.forEach(card => {
            const role = card.querySelector('.exp-field-role')?.value.trim() || '';
            const company = card.querySelector('.exp-field-company')?.value.trim() || '';
            const date = card.querySelector('.exp-field-date')?.value.trim() || '';
            const bulletsRaw = card.querySelector('.exp-field-bullets')?.value || '';

            const bullets = bulletsRaw
                .split('\n')
                .map(b => b.trim())
                .filter(b => b.length > 0);

            if (role || company) {
                experiences.push({ role, company, date, bullets });
            }
        });

        activeData.experiences = experiences;
        return activeData;
    }

    /* ── Save to Firestore & Update DOM ─────────────────────── */
    async function saveChanges() {
        const data = collectFormData();
        const statusDot = document.getElementById('admin-status-dot');
        const statusText = document.getElementById('admin-status-text');
        const saveBtn = document.getElementById('admin-save-cloud-btn');

        if (statusDot) statusDot.className = 'admin-status-dot saving';
        if (statusText) statusText.textContent = 'Saving…';
        if (saveBtn) saveBtn.disabled = true;

        // Apply immediately to current live page and cache
        applyDataToPage(data);
        localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(data));

        // Save to Firestore
        if (!db) initFirebase();

        if (db) {
            try {
                await db.collection(FIRESTORE_COLLECTION).doc(FIRESTORE_DOC).set(data, { merge: true });
                showToast('Saved to Firestore successfully', 'success');
                if (statusDot) statusDot.className = 'admin-status-dot online';
                if (statusText) statusText.textContent = 'Saved to Cloud';
            } catch (err) {
                console.error('[Admin] Firestore save failed:', err);
                showToast(`Cloud save failed: ${err.message}`, 'error');
                if (statusDot) statusDot.className = 'admin-status-dot';
                if (statusText) statusText.textContent = 'Saved Locally Only';
            }
        } else {
            showToast('Saved locally (Firestore not connected)', 'success');
            if (statusDot) statusDot.className = 'admin-status-dot';
            if (statusText) statusText.textContent = 'Local Cache Only';
        }

        if (saveBtn) saveBtn.disabled = false;
    }

    /* ── UI Status Indicator ────────────────────────────────── */
    function updateSyncIndicator(online) {
        const dot = document.getElementById('admin-status-dot');
        const text = document.getElementById('admin-status-text');
        if (!dot || !text) return;

        if (online) {
            dot.className = 'admin-status-dot online';
            text.textContent = 'Firestore Connected';
        } else {
            dot.className = 'admin-status-dot';
            text.textContent = 'Offline / Local';
        }
    }

    /* ── Show / Hide Admin Modal ────────────────────────────── */
    function openModal() {
        const backdrop = document.getElementById('admin-modal-backdrop');
        if (!backdrop) return;

        backdrop.classList.add('active');

        const isAuth = currentUser || sessionStorage.getItem('azmin_admin_auth') === 'true';
        if (isAuth) {
            showView('dashboard');
            populateDashboardFields();
        } else {
            showView('passcode');
            setTimeout(() => {
                const passField = document.getElementById('admin-password-field');
                if (passField) {
                    passField.value = '';
                    passField.focus();
                }
            }, 100);
        }
    }

    function closeModal() {
        const backdrop = document.getElementById('admin-modal-backdrop');
        if (backdrop) backdrop.classList.remove('active');
    }

    function showView(view) {
        const passView = document.getElementById('admin-passcode-view');
        const dashView = document.getElementById('admin-dashboard-view');
        const modal = document.querySelector('.admin-modal');
        if (!passView || !dashView) return;

        if (view === 'dashboard') {
            passView.style.display = 'none';
            dashView.style.display = 'flex';
            if (modal) modal.classList.remove('passcode-mode');
        } else {
            passView.style.display = 'flex';
            dashView.style.display = 'none';
            if (modal) modal.classList.add('passcode-mode');
        }
    }

    function populateDashboardFields() {
        const gdriveInput = document.getElementById('admin-gdrive-input');
        const gdriveTestBtn = document.getElementById('admin-gdrive-test-btn');
        if (gdriveInput) {
            gdriveInput.value = activeData.gdriveUrl || '';
            if (gdriveTestBtn) gdriveTestBtn.href = activeData.gdriveUrl || '#';

            gdriveInput.addEventListener('input', () => {
                if (gdriveTestBtn) gdriveTestBtn.href = gdriveInput.value.trim() || '#';
            });
        }

        // Firebase API Key field
        const apiKeyInput = document.getElementById('admin-api-key');
        if (apiKeyInput) {
            const config = typeof window.getFirebaseConfig === 'function' ? window.getFirebaseConfig() : {};
            apiKeyInput.value = config.apiKey || '';
        }

        renderAdminExperienceForm();
    }

    const ARROW_ICON_SVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`;
    const SPINNER_ICON_SVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="admin-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>`;

    /* ── Firebase Auth: Sign In with Password ───────────────── */
    async function handleSignIn() {
        const passwordInput = document.getElementById('admin-password-field');
        const errorEl = document.getElementById('admin-password-error');
        const signInBtn = document.getElementById('admin-signin-btn');

        if (!passwordInput || !errorEl) return;

        const password = passwordInput.value.trim();
        if (!password) {
            errorEl.textContent = 'Please enter passcode.';
            passwordInput.focus();
            return;
        }

        // Direct passcode check
        if (password === 'min123') {
            sessionStorage.setItem('azmin_admin_auth', 'true');
            currentUser = { email: ADMIN_EMAIL };
            passwordInput.value = '';
            errorEl.textContent = '';
            showView('dashboard');
            populateDashboardFields();
            showToast('Access granted', 'success');

            // Also silently authenticate with Firebase Auth in the background if configured
            if (auth) {
                auth.signInWithEmailAndPassword(ADMIN_EMAIL, password).catch(() => {});
            }
            return;
        }

        if (!auth) initFirebase();
        if (!auth) {
            errorEl.textContent = 'Authentication service unavailable.';
            return;
        }

        if (signInBtn) {
            signInBtn.disabled = true;
            signInBtn.innerHTML = SPINNER_ICON_SVG;
        }
        errorEl.textContent = '';

        try {
            await auth.signInWithEmailAndPassword(ADMIN_EMAIL, password);
            sessionStorage.setItem('azmin_admin_auth', 'true');
            passwordInput.value = '';
            showToast('Access granted', 'success');
        } catch (err) {
            console.error('[Admin] Sign in error:', err);
            let userMessage = 'Incorrect passcode.';
            if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                userMessage = 'Incorrect passcode.';
            } else if (err.code === 'auth/too-many-requests') {
                userMessage = 'Too many attempts. Try again later.';
            }
            errorEl.textContent = userMessage;
            passwordInput.focus();
            passwordInput.select();
        } finally {
            if (signInBtn) {
                signInBtn.disabled = false;
                signInBtn.innerHTML = ARROW_ICON_SVG;
            }
        }
    }

    /* ── Sign Out ───────────────────────────────────────────── */
    async function handleSignOut() {
        sessionStorage.removeItem('azmin_admin_auth');
        currentUser = null;
        if (auth) {
            try {
                await auth.signOut();
            } catch (err) {}
        }
        showView('passcode');
        showToast('Locked', 'success');
    }

    /* ── Initialize Admin System ────────────────────────────── */
    function init() {
        // Append modal container to body
        const wrapper = document.createElement('div');
        wrapper.id = 'admin-modal-root';
        wrapper.innerHTML = buildAdminModalHTML();
        document.body.appendChild(wrapper);

        // Init Firebase and listen to auth state changes
        initFirebase();
        if (auth) {
            auth.onAuthStateChanged(user => {
                currentUser = user;
                if (user) {
                    showView('dashboard');
                    populateDashboardFields();
                } else {
                    showView('passcode');
                }
            });
        }

        // Fetch portfolio content from Firestore
        loadPortfolioData();

        // Secret trigger: Click icon01.png 3 times to open admin
        const secretTrigger = document.getElementById('admin-secret-trigger');
        if (secretTrigger) {
            let clickCount = 0;
            let resetTimer = null;

            secretTrigger.addEventListener('click', (e) => {
                e.preventDefault();
                clickCount++;
                clearTimeout(resetTimer);

                // Tactile feedback: micro scale on click
                secretTrigger.style.transform = `scale(${0.88 - clickCount * 0.04})`;
                setTimeout(() => {
                    secretTrigger.style.transform = '';
                }, 120);

                if (clickCount >= 3) {
                    clickCount = 0;
                    openModal();
                } else {
                    resetTimer = setTimeout(() => {
                        clickCount = 0;
                    }, 1400); // 1.4 second window for 3 clicks
                }
            });
        }

        // Global shortcut: Ctrl + Shift + A
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
                e.preventDefault();
                const backdrop = document.getElementById('admin-modal-backdrop');
                if (backdrop && backdrop.classList.contains('active')) {
                    closeModal();
                } else {
                    openModal();
                }
            }
            if (e.key === 'Escape') {
                closeModal();
            }
        });

        // Close buttons
        const closeX = document.getElementById('admin-close-x-btn');
        if (closeX) closeX.addEventListener('click', closeModal);
        const closeDash = document.getElementById('admin-close-dash-btn');
        if (closeDash) closeDash.addEventListener('click', closeModal);

        // Close on backdrop click
        const backdrop = document.getElementById('admin-modal-backdrop');
        if (backdrop) {
            backdrop.addEventListener('click', (e) => {
                if (e.target === backdrop) closeModal();
            });
        }

        // Sign in button & Enter key on password field
        const signInBtn = document.getElementById('admin-signin-btn');
        const passField = document.getElementById('admin-password-field');
        if (signInBtn) signInBtn.addEventListener('click', handleSignIn);
        if (passField) {
            passField.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') handleSignIn();
            });
        }

        // Tabs switching
        const tabBtns = document.querySelectorAll('.admin-tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.admin-tab-pane').forEach(p => p.classList.remove('active'));

                btn.classList.add('active');
                const targetId = btn.getAttribute('data-tab');
                const pane = document.getElementById(targetId);
                if (pane) pane.classList.add('active');
            });
        });

        // Add Experience button
        const addExpBtn = document.getElementById('admin-add-exp-btn');
        if (addExpBtn) {
            addExpBtn.addEventListener('click', () => {
                activeData.experiences.unshift({
                    role: '',
                    company: '',
                    date: '',
                    bullets: ['']
                });
                renderAdminExperienceForm();
            });
        }

        // Save API key config locally
        const saveConfigBtn = document.getElementById('admin-save-config-btn');
        if (saveConfigBtn) {
            saveConfigBtn.addEventListener('click', () => {
                const apiKey = document.getElementById('admin-api-key')?.value.trim();
                if (apiKey) {
                    const cfg = { apiKey, projectId: 'portfolio-v001' };
                    localStorage.setItem('azmin_firebase_config', JSON.stringify(cfg));
                    initFirebase();
                    showToast('Firebase config updated locally!', 'success');
                }
            });
        }

        // Save Changes to Firestore button
        const saveCloudBtn = document.getElementById('admin-save-cloud-btn');
        if (saveCloudBtn) {
            saveCloudBtn.addEventListener('click', saveChanges);
        }

        // Logout button
        const logoutBtn = document.getElementById('admin-logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleSignOut);
        }
    }

    // Auto-init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
