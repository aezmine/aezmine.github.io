/* ============================================================
   PORTFOLIO ASSISTANT — INTERACTIVE CLIENT-SIDE GUIDE
   ============================================================
   Zero external API / backend dependencies.
   Instantly answers questions about Azmin's portfolio,
   skills, projects, education, experience, and contact info.
   ============================================================ */

(function () {
    'use strict';

    /* ── Configuration & Knowledge Base ──────────────────────── */
    const CONFIG = {
        assistantName: "Azmin's Assistant",
        assistantStatus: 'Portfolio Guide',
        welcomeMessage: "Hi there! 👋 I'm Azmin's Portfolio Assistant.\n\nI can instantly tell you about his education, technical skills, projects, experience, or how to contact him. Pick a topic below or type any question!",
    };

    /* ── Knowledge Base: Predefined Topics & Responses ────────── */
    const KNOWLEDGE_BASE = {
        about: {
            title: '👋 Who is Azmin Hassan?',
            shortLabel: 'About Azmin',
            keywords: ['who', 'about', 'azmin', 'background', 'bio', 'profile', 'intro', 'introduce', 'summary', 'person'],
            answer: `<strong>Azmin Hassan</strong> is a backend-focused Computer Science undergraduate at <strong>Universiti Malaysia Terengganu (UMT)</strong> with strong interests in <strong>Cloud Computing, Networking, and DevOps</strong>.<br><br>He has practical experience in Java, MySQL, web development, and IoT solutions, and is currently expanding his hands-on infrastructure skills as a <strong>Network Engineer Intern at CardBiz</strong>.<br><br>Fast learner, disciplined, and passionate about solving real-world infrastructure and software problems.`,
            followups: ['education', 'projects', 'skills', 'contact']
        },
        education: {
            title: '🎓 Education & CGPA',
            shortLabel: 'Education',
            keywords: ['education', 'degree', 'cgpa', 'gpa', 'study', 'studying', 'university', 'umt', 'stpm', 'spm', 'school', 'grade', 'result', 'academic', 'faculty'],
            answer: `🎓 <strong>Universiti Malaysia Terengganu (UMT)</strong> (2023 – Expected 2027)<br>• <strong>Degree:</strong> Bachelor of Computer Science with Maritime Informatics (Honours)<br>• <strong>Faculty:</strong> Faculty of Computing and Mathematics<br>• <strong>Current CGPA:</strong> <strong>3.54</strong><br>• Consistent top academic record across all semesters.<br><br>🏛️ <strong>Prior Education:</strong><br>• <strong>STPM (Science Stream):</strong> Kolej Tingkatan Enam Seri Lipis (2022 – 2023)<br>• <strong>SPM (Science Stream):</strong> SMK (F) Sungai Koyan (2020 – 2022)`,
            followups: ['experience', 'projects', 'resume']
        },
        projects: {
            title: '🛠️ Key Projects',
            shortLabel: 'Projects',
            keywords: ['project', 'projects', 'booking', 'kelulut', 'weather', 'iot', 'hackathon', 'build', 'built', 'system', 'classroom', 'work done'],
            answer: `Here are Azmin's featured projects:<br><br>1. <strong>UMT Classroom Booking System</strong><br>• Built with <strong>Java, JSP, MySQL, and Apache Tomcat</strong>.<br>• Features automated conflict detection to prevent scheduling overlaps and structured database management.<br><br>2. <strong>Virtual Repository Kelulut System</strong> (In Progress)<br>• Centralized digital research repository for stingless bee (kelulut) research data at UMT.<br>• Designed relational schema for structured data accessibility.<br><br>3. <strong>Mini Weather Station (IoT)</strong><br>• Real-time environmental monitoring built using <strong>Raspberry Pi Pico W</strong> &amp; <strong>MicroPython</strong>.<br>• Transmits live sensor readings to the <strong>ThingSpeak</strong> cloud platform.<br><br>4. <strong>Hackathon X Smart City</strong><br>• Team hackathon participant developing rapid prototypes under tight deadlines.<br><br><a href="#projects" class="chat-link">👉 Jump to Projects section on page</a>`,
            followups: ['skills', 'experience', 'resume']
        },
        skills: {
            title: '💻 Technical Skills & Tools',
            shortLabel: 'Technical Skills',
            keywords: ['skill', 'skills', 'tech', 'stack', 'language', 'languages', 'java', 'python', 'javascript', 'html', 'css', 'jsp', 'mysql', 'database', 'sql', 'tools', 'zabbix', 'network', 'networking', 'linux', 'cloud', 'devops'],
            answer: `Here is Azmin's technical skillset:<br><br>• <strong>Languages:</strong> Java (Primary), JavaScript, HTML5, CSS3, Python (Basic)<br>• <strong>Web &amp; Backend:</strong> JSP, Servlets, RESTful APIs, Apache Tomcat<br>• <strong>Databases:</strong> MySQL (CRUD, schema design, queries, backup &amp; migration)<br>• <strong>Networking:</strong> TCP/IP, IP addressing, subnetting, DNS, DHCP, VPN fundamentals, VoIP<br>• <strong>Systems &amp; Cloud:</strong> Windows Server, Linux fundamentals, VPS deployment, IT infrastructure<br>• <strong>Monitoring &amp; Tools:</strong> Zabbix, Git &amp; GitHub, VS Code, Raspberry Pi Pico W, ThingSpeak<br><br><a href="#skills" class="chat-link">👉 Jump to Skills section on page</a>`,
            followups: ['projects', 'roles', 'contact']
        },
        experience: {
            title: '💼 Work Experience',
            shortLabel: 'Work Experience',
            keywords: ['experience', 'work', 'job', 'intern', 'internship', 'cardbiz', 'mcdonald', 'mcdonalds', 'shopee', 'j&t', 'history', 'career', 'employment'],
            answer: `Azmin's professional and practical experience:<br><br>• <strong>Network Engineer Intern | CardBiz</strong> (Aug 2026 – Present)<br>Assisting with network infrastructure, hardware configuration, troubleshooting, and network operations.<br><br>• <strong>Logistics Assistant (Part-Time) | J&T Express &amp; Shopee</strong> (2024 – 2025)<br>Handled accurate parcel sorting and logistics workflow in high-volume distribution centers.<br><br>• <strong>Crew Trainee | McDonald's</strong> (2023)<br>Maintained operational speed and quality under high-pressure conditions, trained new staff on SOPs.`,
            followups: ['education', 'projects', 'resume']
        },
        resume: {
            title: '📄 View & Download Resume',
            shortLabel: 'Resume / CV',
            keywords: ['resume', 'cv', 'pdf', 'ats', 'download', 'drive', 'document'],
            answer: `You can access Azmin's resume directly:<br><br>• <a href="assets/AZMIN_RESUME.pdf" download="Azmin_Hassan_Resume.pdf" class="chat-link">📥 <strong>Download PDF Resume</strong></a><br>• <a href="ats.html" target="_blank" rel="noopener noreferrer" class="chat-link">📄 <strong>Open ATS-Friendly Version</strong> ↗</a><br>• <a href="https://drive.google.com/file/d/1OkCXofpvz6rof-wE3wqWuxB-YvXyEnY-/view" target="_blank" rel="noopener noreferrer" class="chat-link">☁️ <strong>View on Google Drive</strong> ↗</a>`,
            followups: ['contact', 'skills', 'experience']
        },
        roles: {
            title: '🏢 Career Goals & Target Roles',
            shortLabel: 'Target Roles',
            keywords: ['role', 'roles', 'position', 'seeking', 'interested', 'goal', 'goals', 'objective', 'looking for', 'hire', 'opportunity'],
            answer: `Azmin is actively pursuing opportunities in:<br><br>• <strong>Cloud Computing &amp; DevOps</strong><br>• <strong>Network Engineering &amp; Infrastructure</strong><br>• <strong>Backend Software Development (Java / Web)</strong><br>• <strong>Systems Administration &amp; IT Support</strong><br><br>He is adaptable, proactive, and open to relocation for compelling roles.`,
            followups: ['skills', 'experience', 'contact']
        },
        contact: {
            title: '📬 How to Contact Azmin',
            shortLabel: 'Contact Info',
            keywords: ['contact', 'email', 'phone', 'whatsapp', 'linkedin', 'github', 'reach', 'call', 'message', 'social', 'address', 'location', 'where'],
            answer: `You can reach Azmin directly via:<br><br>• <strong>Email:</strong> <a href="mailto:aezmine@gmail.com" class="chat-link">aezmine@gmail.com</a><br>• <strong>Phone / WhatsApp:</strong> <a href="tel:+601139018046" class="chat-link">+60 11-3901 8046</a><br>• <strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/aezmine/" target="_blank" rel="noopener noreferrer" class="chat-link">linkedin.com/in/aezmine ↗</a><br>• <strong>GitHub:</strong> <a href="https://github.com/aezmine" target="_blank" rel="noopener noreferrer" class="chat-link">github.com/aezmine ↗</a><br>• <strong>Location:</strong> Pahang / Terengganu, Malaysia (Open to relocate)`,
            followups: ['resume', 'projects', 'about']
        }
    };

    // Primary questions shown at start
    const STARTER_KEYS = ['about', 'education', 'projects', 'skills', 'experience', 'resume', 'contact'];

    /* ── Chat State ─────────────────────────────────────────── */
    const chatHistory = [];
    let isTyping = false;

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

    /* ── Match User Query to Knowledge Base ─────────────────── */
    function matchQuery(query) {
        const cleaned = query.toLowerCase().trim();

        // Check for greetings
        if (/^(hi|hello|hey|salam|assalam|halo|good\s*(morning|afternoon|evening)|hai|hola)\b/i.test(cleaned)) {
            return {
                answer: `Hello! 👋 Great to have you here. I'm Azmin's portfolio assistant. What would you like to explore about Azmin today?`,
                followups: ['about', 'projects', 'skills', 'resume', 'contact']
            };
        }

        // Check for "thank you"
        if (/\b(thank|thanks|terima kasih|tq|thx|appreciate)\b/i.test(cleaned)) {
            return {
                answer: `You're very welcome! 😊 Feel free to ask anything else about Azmin's projects, skills, or resume.`,
                followups: ['projects', 'skills', 'contact']
            };
        }

        // Score each knowledge item based on keyword matches
        let bestKey = null;
        let maxScore = 0;

        for (const [key, item] of Object.entries(KNOWLEDGE_BASE)) {
            let score = 0;
            for (const kw of item.keywords) {
                const regex = new RegExp(`\\b${kw}`, 'i');
                if (regex.test(cleaned)) {
                    score += kw.length > 4 ? 3 : 2;
                }
            }
            if (score > maxScore) {
                maxScore = score;
                bestKey = key;
            }
        }

        if (bestKey && maxScore > 0) {
            return KNOWLEDGE_BASE[bestKey];
        }

        // Default fallback if no match
        return {
            answer: `I'm focused on Azmin's portfolio background, projects, skills, education, and contact details.<br><br>Here are the most popular topics you can ask me about:`,
            followups: ['about', 'education', 'projects', 'skills', 'experience', 'contact']
        };
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
        <button id="chat-reset-btn" class="chat-header-btn" title="Reset chat" aria-label="Reset chat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
            </svg>
        </button>
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

    <!-- Suggested questions container -->
    <div id="chat-suggestions" aria-label="Suggested questions"></div>

    <!-- Input Area -->
    <div class="chat-input-area">
        <textarea
            id="chat-input"
            rows="1"
            placeholder="Ask about Azmin's projects, skills, education…"
            aria-label="Type your question"
            maxlength="300"
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

    /* ── Render Starter Questions ───────────────────────────── */
    function renderStarterSuggestions() {
        const container = document.getElementById('chat-suggestions');
        if (!container) return;

        container.style.display = 'flex';
        container.innerHTML = '';
        const label = document.createElement('p');
        label.className = 'chat-suggestions-label';
        label.textContent = 'Popular topics:';
        container.appendChild(label);

        const list = document.createElement('div');
        list.className = 'chat-suggestion-list';

        STARTER_KEYS.forEach(key => {
            const item = KNOWLEDGE_BASE[key];
            if (!item) return;

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'suggestion-btn';
            btn.textContent = item.title;
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                handleUserQuestion(item.title, item);
            });
            list.appendChild(btn);
        });

        container.appendChild(list);
    }

    /* ── Render Follow-up Chips ─────────────────────────────── */
    function createFollowupChips(followupKeys) {
        if (!followupKeys || followupKeys.length === 0) return null;

        const group = document.createElement('div');
        group.className = 'chat-followup-group';

        followupKeys.forEach(key => {
            const item = KNOWLEDGE_BASE[key];
            if (!item) return;

            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'chat-chip';
            chip.textContent = item.shortLabel || item.title;
            chip.addEventListener('click', (e) => {
                e.stopPropagation();
                handleUserQuestion(item.title, item);
            });
            group.appendChild(chip);
        });

        return group;
    }

    /* ── Append Message ─────────────────────────────────────── */
    function appendMessage(role, htmlContent, followups = null) {
        const log = document.getElementById('chat-messages');
        if (!log) return;

        const msg = document.createElement('div');
        msg.className = `chat-msg ${role}`;

        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble';

        if (role === 'user') {
            bubble.textContent = htmlContent;
        } else {
            bubble.innerHTML = htmlContent;
        }

        const time = document.createElement('span');
        time.className = 'chat-msg-time';
        time.textContent = formatTime();

        msg.appendChild(bubble);

        // Add follow-up chips under assistant message
        if (role === 'ai' && followups) {
            const chips = createFollowupChips(followups);
            if (chips) msg.appendChild(chips);
        }

        msg.appendChild(time);
        log.appendChild(msg);

        // Smooth scroll
        log.scrollTop = log.scrollHeight;
    }

    /* ── Typing Indicator ───────────────────────────────────── */
    function showTyping() {
        isTyping = true;
        const el = document.getElementById('chat-typing');
        if (el) {
            el.classList.add('visible');
            const log = document.getElementById('chat-messages');
            if (log) log.scrollTop = log.scrollHeight;
        }
    }

    function hideTyping() {
        isTyping = false;
        const el = document.getElementById('chat-typing');
        if (el) el.classList.remove('visible');
    }

    /* ── User Action Handler ────────────────────────────────── */
    function handleUserQuestion(userText, matchedItem = null) {
        if (isTyping) return;

        const question = userText.trim();
        if (!question) return;

        // Clear input field and starter suggestions
        const input = document.getElementById('chat-input');
        const sendBtn = document.getElementById('chat-send-btn');
        const suggestionsEl = document.getElementById('chat-suggestions');

        if (input) {
            input.value = '';
            input.style.height = 'auto';
        }
        if (sendBtn) sendBtn.disabled = true;
        if (suggestionsEl) {
            suggestionsEl.style.display = 'none';
            suggestionsEl.innerHTML = '';
        }

        // Show user question bubble
        appendMessage('user', question);
        chatHistory.push({ role: 'user', text: question });

        // Show typing indicator for a realistic smooth response feel (400ms)
        showTyping();

        setTimeout(() => {
            hideTyping();
            const result = matchedItem || matchQuery(question);
            appendMessage('ai', result.answer, result.followups);
            chatHistory.push({ role: 'ai', text: result.answer });
        }, 380);
    }

    /* ── Reset Chat ─────────────────────────────────────────── */
    function resetChat() {
        chatHistory.length = 0;
        const log = document.getElementById('chat-messages');
        if (log) log.innerHTML = '';

        // Greeting
        appendMessage('ai', CONFIG.welcomeMessage.replace(/\n\n/g, '<br><br>'));
        renderStarterSuggestions();
    }

    /* ── Toggle Send Button ─────────────────────────────────── */
    function updateSendBtn() {
        const input = document.getElementById('chat-input');
        const btn = document.getElementById('chat-send-btn');
        if (!input || !btn) return;
        btn.disabled = input.value.trim().length === 0 || isTyping;
    }

    /* ── Auto-resize Textarea ───────────────────────────────── */
    function autoResize(el) {
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 100) + 'px';
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

            // Show greeting on first open
            if (chatHistory.length === 0) {
                setTimeout(() => {
                    appendMessage('ai', CONFIG.welcomeMessage.replace(/\n\n/g, '<br><br>'));
                    renderStarterSuggestions();
                }, 150);
            }

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

        root.innerHTML = buildWidgetHTML();

        const panel = document.getElementById('chat-panel');
        const triggerBtn = document.getElementById('chat-trigger-btn');
        const resetBtn = document.getElementById('chat-reset-btn');
        const input = document.getElementById('chat-input');
        const sendBtn = document.getElementById('chat-send-btn');

        // Prevent any clicks inside the chat panel from bubbling to document (closing the chat)
        if (panel) {
            panel.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        // Trigger button
        if (triggerBtn) {
            triggerBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleChat();
            });
        }

        // Reset button
        if (resetBtn) {
            resetBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                resetChat();
            });
        }

        // Input textarea
        if (input) {
            input.addEventListener('input', () => {
                autoResize(input);
                updateSendBtn();
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (!sendBtn.disabled) {
                        handleUserQuestion(input.value);
                    }
                }
            });
        }

        // Send button
        if (sendBtn) {
            sendBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (input && !sendBtn.disabled) {
                    handleUserQuestion(input.value);
                }
            });
        }

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const panel = document.getElementById('chat-panel');
                if (panel && panel.classList.contains('visible')) {
                    toggleChat(false);
                    if (triggerBtn) triggerBtn.focus();
                }
            }
        });

        // Close on click outside
        document.addEventListener('click', (e) => {
            const panel = document.getElementById('chat-panel');
            if (!panel || !panel.classList.contains('visible')) return;

            // Using composedPath safely handles cases where clicked elements were removed from DOM
            const path = e.composedPath ? e.composedPath() : [];
            if (path.includes(root) || (e.target && root.contains(e.target))) {
                return;
            }

            toggleChat(false);
        });
    }

    // Auto-init on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
