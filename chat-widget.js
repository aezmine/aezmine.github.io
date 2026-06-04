/* ============================================================
   PORTFOLIO ASSISTANT — CHAT WIDGET JAVASCRIPT
   ============================================================

   SETUP REQUIRED:
   Replace the placeholder below with your actual Cloud Function URL.
   You get this URL from the Firebase console after deploying functions.
   It looks like:
     https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/askPortfolioAssistant
   ============================================================ */

(function () {
    'use strict';

    /* ── Configuration ──────────────────────────────────────── */
    const CONFIG = {
        // Vercel serverless function — works automatically on localhost and minazmin.my
        functionUrl: '/api/ask',

        // Widget labels
        assistantName: 'Azmin\'s Assistant',
        assistantStatus: 'Portfolio AI',

        // Suggested starter questions shown on first open
        suggestions: [
            '👋 Who is Azmin Hassan?',
            '🎓 What degree is he studying?',
            '💻 What programming languages does he know?',
            '🛠️ Tell me about his projects',
            '📧 How can I contact him?',
            '🏢 What internship roles is he seeking?',
        ],

        // Page origin sent to Cloud Function for logging
        pageUrl: window.location.href,
    };

    /* ── Session ID ─────────────────────────────────────────── */
    /**
     * Generates or retrieves an anonymous session ID.
     * Stored in sessionStorage so it resets on each new browser tab.
     */
    function getSessionId() {
        const key = 'azmin_chat_session';
        let id = sessionStorage.getItem(key);
        if (!id) {
            // Generate UUID v4
            if (crypto && crypto.randomUUID) {
                id = crypto.randomUUID();
            } else {
                id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
                    const r = Math.random() * 16 | 0;
                    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
                });
            }
            sessionStorage.setItem(key, id);
        }
        return id;
    }

    const SESSION_ID = getSessionId();

    /* ── Chat History ───────────────────────────────────────── */
    // Preserved for the full browser session
    const chatHistory = [];

    /* ── Helpers ────────────────────────────────────────────── */
    function formatTime() {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /* ── Build Widget HTML ──────────────────────────────────── */
    function buildWidgetHTML() {
        return `
<!-- Chat Panel -->
<div id="chat-panel" role="dialog" aria-modal="true" aria-label="Portfolio Assistant Chat" aria-live="polite">

    <!-- Header -->
    <div class="chat-header">
        <div class="chat-header-avatar" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
            </svg>
        </div>
        <div class="chat-header-info">
            <div class="chat-header-name">${CONFIG.assistantName}</div>
            <div class="chat-header-status">
                <span class="chat-status-dot" aria-hidden="true"></span>
                ${CONFIG.assistantStatus}
            </div>
        </div>
    </div>

    <!-- Messages -->
    <div id="chat-messages" role="log" aria-label="Chat messages" aria-live="polite"></div>

    <!-- Typing indicator -->
    <div id="chat-typing" aria-label="Assistant is typing" aria-live="polite">
        <div class="typing-bubble" aria-hidden="true">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        </div>
    </div>

    <!-- Suggested questions (shown when no messages) -->
    <div id="chat-suggestions" aria-label="Suggested questions"></div>

    <!-- Input -->
    <div class="chat-input-area">
        <textarea
            id="chat-input"
            rows="1"
            placeholder="Ask about Azmin's background, skills, or projects…"
            aria-label="Type your question"
            maxlength="500"
            autocomplete="off"
            spellcheck="false"
        ></textarea>
        <button id="chat-send-btn" aria-label="Send message" disabled>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
        </button>
    </div>

    <p class="chat-disclaimer">Powered by Groq AI · Answers based on portfolio content</p>
</div>

<!-- Floating Trigger Button -->
<button
    id="chat-trigger-btn"
    aria-label="Open Portfolio Assistant chat"
    aria-expanded="false"
    aria-controls="chat-panel"
>
    <span class="chat-notif-dot" aria-hidden="true"></span>
    <!-- Chat icon -->
    <svg class="icon-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
    <!-- Close icon -->
    <svg class="icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
</button>
        `.trim();
    }

    /* ── Render Suggestions ─────────────────────────────────── */
    function renderSuggestions() {
        const container = document.getElementById('chat-suggestions');
        if (!container) return;

        if (chatHistory.length > 0) {
            container.innerHTML = '';
            return;
        }

        const label = document.createElement('p');
        label.className = 'chat-suggestions-label';
        label.textContent = 'Try asking…';

        container.innerHTML = '';
        container.appendChild(label);

        CONFIG.suggestions.forEach(q => {
            const btn = document.createElement('button');
            btn.className = 'suggestion-btn';
            btn.textContent = q;
            btn.addEventListener('click', () => {
                const input = document.getElementById('chat-input');
                if (input) {
                    // Strip emoji prefix (e.g. "👋 Who is...")
                    const clean = q.replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}]\s*/u, '');
                    input.value = clean;
                    input.dispatchEvent(new Event('input'));
                    sendMessage(clean);
                }
            });
            container.appendChild(btn);
        });
    }

    /* ── Append Message to DOM ──────────────────────────────── */
    function appendMessage(role, text, isError = false) {
        const log = document.getElementById('chat-messages');
        if (!log) return;

        const msg = document.createElement('div');
        msg.className = `chat-msg ${role}${isError ? ' error' : ''}`;

        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble';
        // Preserve line breaks from AI responses
        bubble.innerHTML = escapeHtml(text).replace(/\n/g, '<br>');

        const time = document.createElement('span');
        time.className = 'chat-msg-time';
        time.textContent = formatTime();

        msg.appendChild(bubble);
        msg.appendChild(time);
        log.appendChild(msg);

        // Scroll to bottom
        log.scrollTop = log.scrollHeight;
    }

    /* ── Typing Indicator ───────────────────────────────────── */
    function showTyping() {
        const el = document.getElementById('chat-typing');
        if (el) {
            el.classList.add('visible');
            const log = document.getElementById('chat-messages');
            if (log) log.scrollTop = log.scrollHeight;
        }
    }

    function hideTyping() {
        const el = document.getElementById('chat-typing');
        if (el) el.classList.remove('visible');
    }

    /* ── Toggle Send Button ─────────────────────────────────── */
    function updateSendBtn() {
        const input = document.getElementById('chat-input');
        const btn = document.getElementById('chat-send-btn');
        if (!input || !btn) return;
        btn.disabled = input.value.trim().length === 0;
    }

    /* ── Auto-resize Textarea ───────────────────────────────── */
    function autoResize(el) {
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 100) + 'px';
    }

    /* ── Send Message ───────────────────────────────────────── */
    async function sendMessage(question) {
        question = question.trim();
        if (!question) return;

        // Clear input and suggestions
        const input = document.getElementById('chat-input');
        const sendBtn = document.getElementById('chat-send-btn');
        const suggestionsEl = document.getElementById('chat-suggestions');

        if (input) { input.value = ''; input.style.height = 'auto'; }
        if (sendBtn) sendBtn.disabled = true;
        if (suggestionsEl) suggestionsEl.innerHTML = '';

        // Render user bubble
        appendMessage('user', question);
        chatHistory.push({ role: 'user', text: question });

        // Show typing
        showTyping();

        try {
            const response = await fetch(CONFIG.functionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    question,
                    sessionId: SESSION_ID,
                    pageUrl: CONFIG.pageUrl,
                }),
            });

            hideTyping();

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            const answer = data.answer || 'Sorry, I could not generate a response. Please try again.';

            appendMessage('ai', answer);
            chatHistory.push({ role: 'ai', text: answer });

        } catch (err) {
            hideTyping();
            console.error('[ChatWidget] Error:', err);

            const isNetworkErr = err.message.includes('Failed to fetch') || err.message.includes('NetworkError');
            const errorMsg = isNetworkErr
                ? 'I\'m having trouble connecting. Please check your internet connection and try again.'
                : 'Something went wrong on my end. Please try again in a moment.';

            appendMessage('ai', errorMsg, true);
        }
    }

    /* ── Toggle Panel Open / Close ──────────────────────────── */
    function toggleChat(open) {
        const panel = document.getElementById('chat-panel');
        const btn = document.getElementById('chat-trigger-btn');
        if (!panel || !btn) return;

        const isOpen = open !== undefined ? open : !panel.classList.contains('visible');

        if (isOpen) {
            panel.classList.add('visible');
            btn.classList.add('open', 'seen');
            btn.setAttribute('aria-expanded', 'true');
            btn.setAttribute('aria-label', 'Close Portfolio Assistant chat');

            // Show AI greeting if first open
            if (chatHistory.length === 0) {
                setTimeout(() => {
                    appendMessage('ai',
                        'Hi there! 👋 I\'m Azmin\'s Portfolio Assistant. I can answer questions about his background, skills, projects, education, and experience.\n\nWhat would you like to know?'
                    );
                }, 200);
            }

            renderSuggestions();

            // Focus input
            setTimeout(() => {
                const input = document.getElementById('chat-input');
                if (input) input.focus();
            }, 250);
        } else {
            panel.classList.remove('visible');
            btn.classList.remove('open');
            btn.setAttribute('aria-expanded', 'false');
            btn.setAttribute('aria-label', 'Open Portfolio Assistant chat');
        }
    }

    /* ── Initialize Widget ──────────────────────────────────── */
    function init() {
        const root = document.getElementById('chat-widget-root');
        if (!root) {
            console.warn('[ChatWidget] #chat-widget-root not found in DOM');
            return;
        }

        // Inject widget HTML
        root.innerHTML = buildWidgetHTML();

        // ── Event: trigger button
        const triggerBtn = document.getElementById('chat-trigger-btn');
        if (triggerBtn) {
            triggerBtn.addEventListener('click', () => toggleChat());
        }

        // ── Event: input → update send button + auto-resize
        const input = document.getElementById('chat-input');
        if (input) {
            input.addEventListener('input', () => {
                updateSendBtn();
                autoResize(input);
            });

            // Send on Enter (Shift+Enter = new line)
            input.addEventListener('keydown', e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    const q = input.value.trim();
                    if (q) sendMessage(q);
                }
            });
        }

        // ── Event: send button
        const sendBtn = document.getElementById('chat-send-btn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => {
                const q = document.getElementById('chat-input')?.value.trim();
                if (q) sendMessage(q);
            });
        }

        // ── Close panel when clicking outside
        document.addEventListener('click', e => {
            const root = document.getElementById('chat-widget-root');
            const panel = document.getElementById('chat-panel');
            if (
                panel &&
                panel.classList.contains('visible') &&
                root &&
                !root.contains(e.target)
            ) {
                toggleChat(false);
            }
        });

        // ── Close on Escape key
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                const panel = document.getElementById('chat-panel');
                if (panel && panel.classList.contains('visible')) {
                    toggleChat(false);
                    document.getElementById('chat-trigger-btn')?.focus();
                }
            }
        });

        console.log('[ChatWidget] Initialized. Session:', SESSION_ID);
    }

    /* ── Boot ───────────────────────────────────────────────── */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
