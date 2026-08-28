/**
 * PORTFOLIO ASSISTANT — FIREBASE CLOUD FUNCTION
 * Secure proxy between the portfolio website and Groq API.
 *
 * This function:
 *  1. Validates incoming requests
 *  2. Builds a context-rich system prompt from Azmin's portfolio data
 *  3. Calls the Groq LLM API (key stored securely as a Firebase Secret)
 *  4. Logs every conversation turn to Firestore
 *  5. Returns the AI response to the frontend
 *
 * Deploy with:
 *   firebase deploy --only functions
 *
 * Set the Groq API key secret:
 *   firebase functions:secrets:set GROQ_API_KEY
 */

'use strict';

const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore');
const { logger } = require('firebase-functions');

// ── Initialize Firebase Admin ──────────────────────────────
initializeApp();
const db = getFirestore();

// ── Groq API Key Secret ────────────────────────────────────
// Stored securely in Firebase Secret Manager — never in code or frontend
const GROQ_API_KEY = defineSecret('GROQ_API_KEY');

/* ── Allowed Origins (CORS) ──────────────────────────────── */
const ALLOWED_ORIGINS = [
    'https://minazmin.my',
    'https://www.minazmin.my',
    'https://aezmine.github.io',
    'http://localhost',
    'http://localhost:3000',
    'http://127.0.0.1',
    'http://127.0.0.1:5500',
    'http://127.0.0.1:5501',
    // Add more local dev ports as needed
];

/* ── Portfolio Context ───────────────────────────────────── */
/**
 * This is the ground truth for the AI assistant.
 * The AI is ONLY allowed to answer from this context.
 * Update this whenever the portfolio content changes.
 */
const PORTFOLIO_CONTEXT = `
=== AZMIN HASSAN — PORTFOLIO CONTEXT ===

PERSONAL INFORMATION:
- Full Name: Azmin Hassan
- Preferred Name: Azmin
- Location: Pahang, Malaysia
- Email: aezmine@gmail.com
- Phone: +60-1139018046
- Website: https://minazmin.my
- LinkedIn: https://www.linkedin.com/in/aezmine/
- GitHub: https://github.com/aezmine
- Portfolio GitHub: https://aezmine.github.io

CURRENT STATUS:
- Computer Science Undergraduate at Universiti Malaysia Terengganu (UMT)
- Network Engineer Intern at CardBiz (started 3 August 2026)
- Available to relocate for the right opportunity

PROFESSIONAL SUMMARY:
Computer Science undergraduate at Universiti Malaysia Terengganu with hands-on experience in backend development, web technologies, and relational databases, alongside growing practical exposure to IT infrastructure and networking. Currently developing expertise and pursuing a career path in Cloud Computing, Networking, and DevOps. Fast learner with the ability to adapt to new technologies and fast-paced technical environments, with a strong focus on continuous improvement and practical problem-solving. Seeking opportunities to contribute to real-world cloud, network, infrastructure, and software projects.

EDUCATION:
1. Universiti Malaysia Terengganu (UMT) — 2023 to Present
   - Degree: Bachelor of Computer Science with Maritime Informatics (Honours)
   - Faculty: Faculty of Computing and Mathematics
   - Current CGPA: 3.54 (latest semester)
   - Expected Graduation: 2027
   - Semester GPA Trend: 3.06 → 3.30 → 3.71 → 3.88 → 3.55 → 3.81 (consistently strong)

2. Seri Lipis College — 2022 to 2023
   - Qualification: STPM (Malaysia's A-Level equivalent), Science Stream

3. SMK (F) Sungai Koyan — 2020 to 2022
   - Qualification: SPM (Malaysia's O-Level equivalent), Science Stream

TECHNICAL SKILLS:
Programming Languages:
  - Java (primary language, basic to intermediate)
  - JavaScript (frontend development)
  - HTML5 and CSS3 (web development)
  - Python (basic level)

Web Technologies:
  - JSP (JavaServer Pages)
  - Java Servlets
  - RESTful APIs
  - Frontend Development
  - Responsive Web Design

Databases:
  - MySQL — CRUD operations, query optimisation, schema design, SQL backup & migration

Networking:
  - TCP/IP, IP addressing, subnetting, DNS, DHCP
  - Network troubleshooting, VPN fundamentals, VoIP

Systems & Infrastructure:
  - Windows Server, software deployment, IT infrastructure
  - Endpoint security, system troubleshooting

Monitoring & Operations:
  - Zabbix, network monitoring, log analysis, incident troubleshooting

Cloud & DevOps:
  - Cloud computing fundamentals, Linux fundamentals
  - VPS deployment, Git workflows

Tools & Platforms:
  - Git and GitHub (version control)
  - VS Code (primary IDE)
  - Apache Tomcat (web server/servlet container)
  - ThingSpeak (IoT cloud platform for data visualisation)
  - Power BI (basic data visualisation)
  - Raspberry Pi Pico W (IoT hardware/microcontroller)

Core Strengths:
  - Problem solving and algorithmic thinking
  - Debugging and code optimisation
  - System design fundamentals
  - Fast learner and self-driven
  - Structured and logical approach to development

PROJECTS:

1. UMT Classroom Booking System
   Technologies: Java, JSP, MySQL, Apache Tomcat, HTML, CSS
   Description: Full web-based classroom reservation system for Universiti Malaysia Terengganu.
   Key achievements:
   - Implemented booking conflict detection logic to prevent scheduling overlaps
   - Designed relational database schema and CRUD operations for efficient booking management
   - Deployed on Apache Tomcat server
   - Reduced manual scheduling conflicts through automation scripts

2. Virtual Kelulut Repository System (In Progress)
   Technologies: Java, MySQL, JSP, Database Design
   Description: Centralised digital data management system for kelulut (stingless bee) research data at UMT.
   Key achievements:
   - Designed relational database schema for structured storage and retrieval
   - Improved data retrieval efficiency and accessibility for researchers and university staff
   - Applied core database management principles to a real-world academic use case

3. Mini Weather Station — IoT Project
   Technologies: Raspberry Pi Pico W, MicroPython, ThingSpeak, IoT Sensors (temperature, humidity, light, ultrasonic)
   Description: IoT-based real-time weather monitoring system.
   Key achievements:
   - Integrated multiple environmental sensors for real-time data collection
   - Connected system to ThingSpeak cloud platform for live monitoring and dashboard visualisation
   - Implemented automated Wi-Fi data transmission for continuous remote access

4. Hackathon X Smart City — Participant
   Technologies: Team collaboration, rapid prototyping, problem solving
   Description: Competitive hackathon project developing a Smart City solution.
   Key achievements:
   - Collaborated in a team to rapidly prototype under strict time constraints
   - Contributed to idea development, technical implementation, and final presentation
   - Applied critical thinking in a competitive environment

WORK EXPERIENCE:

1. CardBiz — Network Engineer Intern
   Period: August 2026 – Present (Started 3 August 2026)
   Responsibilities:
   - Started internship as Network Engineer on 3 August 2026
   - Assisting with network infrastructure, setup, configuration, and troubleshooting
   - Supporting network operations and monitoring

2. J&T Express & Shopee — Logistics Assistant (Part-Time)
   Period: 2024 – 2025
   Responsibilities:
   - Managed parcel sorting and logistics workflow with high accuracy across high-volume distribution runs
   - Handled time-sensitive operations requiring strong attention to detail
   - Optimised task execution in a fast-paced distribution environment
   - Developed discipline, process reliability, and cross-team coordination skills

3. McDonald's — Crew Trainee
   Period: 2023
   Responsibilities:
   - Maintained operational efficiency in a high-volume, fast-paced environment
   - Trained new staff on standard operating procedures (SOPs)
   - Developed strong teamwork, communication, and time management skills under pressure
   - Demonstrated consistency and discipline under high-pressure conditions

LANGUAGES:
- English: Intermediate level (proficient in reading and writing)
- Bahasa Melayu: Fluent (native speaker)

CERTIFICATIONS:
- No certifications listed at this time.

CAREER GOALS & AVAILABILITY:
- Seeking software internship opportunities, particularly in Java development or backend engineering roles
- Open to full-stack development internships as well
- Willing to relocate within Malaysia for the right opportunity
- Based in Pahang, Malaysia

ADDITIONAL INFORMATION:
- Strong problem-solving mindset with practical coding application
- Fast learner with ability to quickly adapt to new technologies
- Self-driven and capable of independent project development
- Structured and logical approach to debugging and optimisation

=== END OF PORTFOLIO CONTEXT ===
`.trim();

/* ── System Prompt ───────────────────────────────────────── */
const SYSTEM_PROMPT = `You are Azmin Hassan's Portfolio Assistant — a helpful AI assistant embedded in his personal portfolio website.

Your ONLY purpose is to answer questions about Azmin Hassan based on the portfolio context provided below.

STRICT RULES:
1. ONLY answer using the information in the PORTFOLIO CONTEXT below. Do not invent, guess, or extrapolate.
2. If a question is NOT answerable from the portfolio context, respond EXACTLY with:
   "I don't have information about that. Feel free to ask about Azmin's background, skills, projects, education, or experience."
3. If a question is unrelated to Azmin or his portfolio (e.g., general knowledge, math, coding help, news, politics, entertainment), respond EXACTLY with:
   "I'm designed to answer questions about Azmin and his portfolio only. Please ask about his background, education, skills, projects, or experience."
4. Be friendly, concise, and professional.
5. Never answer questions about yourself beyond saying you are Azmin's Portfolio Assistant.
6. If asked for contact information, provide it from the context.
7. Do not make up project names, technologies, GPA, dates, or any other specific details.
8. Keep responses concise — 2 to 5 sentences for most questions. Use bullet points for lists (skills, project details, etc.).

--- PORTFOLIO CONTEXT ---
${PORTFOLIO_CONTEXT}
--- END PORTFOLIO CONTEXT ---`;

/* ── Rate Limiting ───────────────────────────────────────── */
// Simple per-session rate limiting using Firestore counters
// Max 30 requests per session (prevents abuse)
const MAX_REQUESTS_PER_SESSION = 30;

async function checkRateLimit(sessionId) {
    try {
        const counterRef = db.collection('rate_limits').doc(sessionId);
        const counterDoc = await counterRef.get();

        if (!counterDoc.exists) {
            // First request from this session
            await counterRef.set({
                count: 1,
                createdAt: Timestamp.now(),
                expiresAt: Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000), // 24h
            });
            return { allowed: true, remaining: MAX_REQUESTS_PER_SESSION - 1 };
        }

        const data = counterDoc.data();
        const count = data.count || 0;

        // Check if expired (24h window)
        if (data.expiresAt && data.expiresAt.toMillis() < Date.now()) {
            await counterRef.set({
                count: 1,
                createdAt: Timestamp.now(),
                expiresAt: Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000),
            });
            return { allowed: true, remaining: MAX_REQUESTS_PER_SESSION - 1 };
        }

        if (count >= MAX_REQUESTS_PER_SESSION) {
            return { allowed: false, remaining: 0 };
        }

        await counterRef.update({ count: FieldValue.increment(1) });
        return { allowed: true, remaining: MAX_REQUESTS_PER_SESSION - count - 1 };

    } catch (err) {
        // If rate limit check fails, allow the request (fail open)
        logger.warn('Rate limit check failed:', err.message);
        return { allowed: true, remaining: -1 };
    }
}

/* ── Log Conversation to Firestore ───────────────────────── */
async function logToFirestore({ sessionId, userQuestion, aiResponse, pageUrl }) {
    try {
        await db.collection('chat_messages').add({
            sessionId,
            userQuestion,
            aiResponse,
            pageUrl: pageUrl || 'unknown',
            timestamp: new Date().toISOString(),
            createdAt: FieldValue.serverTimestamp(),
        });
    } catch (err) {
        // Log failure should not break the response
        logger.error('Firestore log failed:', err.message);
    }
}

/* ── Call Groq API ───────────────────────────────────────── */
async function callGroq(question, apiKey) {
    const Groq = require('groq-sdk');
    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: question },
        ],
        max_tokens: 512,
        temperature: 0.3,    // Low temperature = more factual, less creative
        top_p: 0.9,
    });

    return completion.choices[0]?.message?.content?.trim() || '';
}

/* ── Validate Input ──────────────────────────────────────── */
function validateInput(body) {
    const { question, sessionId } = body;

    if (!question || typeof question !== 'string') {
        return 'Missing or invalid "question" field.';
    }

    const trimmed = question.trim();
    if (trimmed.length === 0) {
        return 'Question cannot be empty.';
    }

    if (trimmed.length > 500) {
        return 'Question exceeds maximum length of 500 characters.';
    }

    if (!sessionId || typeof sessionId !== 'string') {
        return 'Missing or invalid "sessionId" field.';
    }

    // Basic sessionId format check (UUID-like)
    if (sessionId.length < 8 || sessionId.length > 64) {
        return 'Invalid sessionId format.';
    }

    return null; // No errors
}

/* ── Main Cloud Function ─────────────────────────────────── */
exports.askPortfolioAssistant = onRequest(
    {
        secrets: [GROQ_API_KEY],
        region: 'us-central1',
        cors: false, // We handle CORS manually for more control
        timeoutSeconds: 30,
        memory: '256MiB',
    },
    async (req, res) => {

        // ── CORS ───────────────────────────────────────────
        const origin = req.headers.origin || '';
        const isAllowedOrigin =
            ALLOWED_ORIGINS.some(o => origin.startsWith(o)) ||
            // Allow file:// for local development
            origin === '' ||
            req.headers.host === 'localhost' ||
            req.headers.host === '127.0.0.1';

        if (isAllowedOrigin) {
            res.set('Access-Control-Allow-Origin', origin || '*');
        } else {
            logger.warn('Blocked request from unauthorized origin:', origin);
            return res.status(403).json({ error: 'Origin not allowed.' });
        }

        res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Accept');
        res.set('Access-Control-Max-Age', '3600');

        // Handle preflight OPTIONS
        if (req.method === 'OPTIONS') {
            return res.status(204).send('');
        }

        // ── Method Check ───────────────────────────────────
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed. Use POST.' });
        }

        // ── Input Validation ───────────────────────────────
        const validationError = validateInput(req.body);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }

        const { question, sessionId, pageUrl } = req.body;
        const trimmedQuestion = question.trim();

        // ── Rate Limiting ──────────────────────────────────
        const rateCheck = await checkRateLimit(sessionId);
        if (!rateCheck.allowed) {
            logger.info('Rate limit exceeded for session:', sessionId);
            return res.status(429).json({
                error: 'Too many requests. Please try again later.',
                answer: "You've reached the daily message limit for this session. Please come back tomorrow! 😊",
            });
        }

        // ── Get API Key ────────────────────────────────────
        const apiKey = GROQ_API_KEY.value();
        if (!apiKey) {
            logger.error('GROQ_API_KEY secret is not set.');
            return res.status(500).json({ error: 'Server configuration error.' });
        }

        // ── Call Groq ──────────────────────────────────────
        let answer;
        try {
            logger.info('Groq request:', { sessionId, questionLength: trimmedQuestion.length });
            answer = await callGroq(trimmedQuestion, apiKey);

            if (!answer) {
                answer = "I'm sorry, I couldn't generate a response. Please try again.";
            }
        } catch (err) {
            logger.error('Groq API error:', err.message);
            return res.status(502).json({
                error: 'AI service error.',
                answer: "I'm having trouble connecting to my AI service right now. Please try again in a moment.",
            });
        }

        // ── Log to Firestore ───────────────────────────────
        await logToFirestore({
            sessionId,
            userQuestion: trimmedQuestion,
            aiResponse: answer,
            pageUrl: typeof pageUrl === 'string' ? pageUrl.substring(0, 200) : 'unknown',
        });

        // ── Respond ────────────────────────────────────────
        logger.info('Response sent for session:', sessionId);
        return res.status(200).json({ answer });
    }
);
