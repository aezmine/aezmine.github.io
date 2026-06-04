/**
 * PORTFOLIO ASSISTANT — VERCEL SERVERLESS FUNCTION
 * File: api/ask.js
 *
 * This function:
 *  1. Validates incoming requests (POST only)
 *  2. Rate-limits by session via Firestore (rd-pokajimat project)
 *  3. Calls the Groq LLM API using GROQ_API_KEY env variable
 *  4. Logs every conversation turn to Firestore
 *  5. Returns the AI response to the frontend
 *
 * Environment variables required in Vercel Dashboard:
 *  - GROQ_API_KEY               → your gsk_... Groq API key
 *  - FIREBASE_SERVICE_ACCOUNT   → JSON string of your Firebase service account private key
 *
 * Firebase Project: rd-pokajimat
 */

'use strict';

const Groq = require('groq-sdk');
const admin = require('firebase-admin');

/* ── Firebase Admin Init ─────────────────────────────────── */
// Uses FIREBASE_SERVICE_ACCOUNT env var (JSON string of service account key)
if (!admin.apps.length) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                projectId: 'rd-pokajimat',
            });
        } catch (e) {
            console.error('[Firebase] Failed to parse FIREBASE_SERVICE_ACCOUNT:', e.message);
        }
    } else {
        console.warn('[Firebase] FIREBASE_SERVICE_ACCOUNT not set — Firestore logging disabled.');
    }
}

const db = admin.apps.length ? admin.firestore() : null;

/* ── CORS Allowed Origins ────────────────────────────────── */
const ALLOWED_ORIGINS = [
    'https://minazmin.my',
    'https://www.minazmin.my',
    'https://aezmine.github.io',
    'http://localhost',
    'http://localhost:3000',
    'http://localhost:5500',
    'http://127.0.0.1',
    'http://127.0.0.1:5500',
    'http://127.0.0.1:5501',
];

/* ── Portfolio Context ───────────────────────────────────── */
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

CURRENT STATUS:
- Computer Science Undergraduate at Universiti Malaysia Terengganu (UMT)
- Actively seeking software internship opportunities (Java Developer / backend-related roles)
- Available to relocate for the right opportunity

PROFESSIONAL SUMMARY:
Computer Science undergraduate specialising in Maritime Informatics at UMT, Faculty of Computing and Mathematics. Hands-on experience building backend-driven systems using Java, JSP, and MySQL. Demonstrates strong ability to design, develop, and optimise functional applications with a focus on scalability and data management. Fast learner who quickly adapts to new technologies. Actively seeking internship opportunities to contribute to real-world software engineering projects.

EDUCATION:
1. Universiti Malaysia Terengganu (UMT) — 2023 to Present
   - Degree: Bachelor of Computer Science with Maritime Informatics (Honours)
   - Faculty: Faculty of Computing and Mathematics
   - Current CGPA: 3.49 (latest semester)
   - Expected Graduation: 2027
   - Semester GPA Trend: 3.06 → 3.30 → 3.71 → 3.88 → 3.55 (consistently strong)

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
  - MySQL — CRUD operations, query optimisation, schema design

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

1. J&T Express & Shopee — Logistics Assistant (Part-Time)
   Period: 2024 – 2025
   Responsibilities:
   - Managed parcel sorting and logistics workflow with high accuracy across high-volume distribution runs
   - Handled time-sensitive operations requiring strong attention to detail
   - Optimised task execution in a fast-paced distribution environment
   - Developed discipline, process reliability, and cross-team coordination skills

2. McDonald's — Crew Trainee
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
8. Keep responses concise — 2 to 5 sentences for most questions. Use bullet points for lists.

--- PORTFOLIO CONTEXT ---
${PORTFOLIO_CONTEXT}
--- END PORTFOLIO CONTEXT ---`;

/* ── Rate Limiting via Firestore ─────────────────────────── */
const MAX_REQUESTS_PER_SESSION = 30;

async function checkRateLimit(sessionId) {
    if (!db) return { allowed: true, remaining: -1 };

    try {
        const counterRef = db.collection('rate_limits').doc(sessionId);
        const counterDoc = await counterRef.get();

        if (!counterDoc.exists) {
            await counterRef.set({
                count: 1,
                createdAt: admin.firestore.Timestamp.now(),
                expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000),
            });
            return { allowed: true, remaining: MAX_REQUESTS_PER_SESSION - 1 };
        }

        const data = counterDoc.data();
        const count = data.count || 0;

        if (data.expiresAt && data.expiresAt.toMillis() < Date.now()) {
            await counterRef.set({
                count: 1,
                createdAt: admin.firestore.Timestamp.now(),
                expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000),
            });
            return { allowed: true, remaining: MAX_REQUESTS_PER_SESSION - 1 };
        }

        if (count >= MAX_REQUESTS_PER_SESSION) {
            return { allowed: false, remaining: 0 };
        }

        await counterRef.update({ count: admin.firestore.FieldValue.increment(1) });
        return { allowed: true, remaining: MAX_REQUESTS_PER_SESSION - count - 1 };

    } catch (err) {
        console.warn('[RateLimit] Check failed (fail open):', err.message);
        return { allowed: true, remaining: -1 };
    }
}

/* ── Log to Firestore ────────────────────────────────────── */
async function logToFirestore({ sessionId, userQuestion, aiResponse, pageUrl }) {
    if (!db) return;
    try {
        await db.collection('chat_messages').add({
            sessionId,
            userQuestion,
            aiResponse,
            pageUrl: pageUrl || 'unknown',
            timestamp: new Date().toISOString(),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    } catch (err) {
        console.error('[Firestore] Log failed:', err.message);
    }
}

/* ── Main Handler ────────────────────────────────────────── */
module.exports = async function handler(req, res) {
    // ── CORS ──────────────────────────────────────────────
    const origin = req.headers.origin || '';
    const isAllowed =
        ALLOWED_ORIGINS.some(o => origin.startsWith(o)) ||
        origin === '' ||
        req.headers.host?.includes('localhost') ||
        req.headers.host?.includes('127.0.0.1') ||
        // Allow all *.vercel.app preview URLs
        /\.vercel\.app$/.test(origin);

    res.setHeader('Access-Control-Allow-Origin', isAllowed ? (origin || '*') : '');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
    res.setHeader('Access-Control-Max-Age', '3600');

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    if (!isAllowed) {
        return res.status(403).json({ error: 'Origin not allowed.' });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    // ── Input Validation ──────────────────────────────────
    const { question, sessionId, pageUrl } = req.body || {};

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
        return res.status(400).json({ error: 'Missing or empty "question" field.' });
    }
    if (question.trim().length > 500) {
        return res.status(400).json({ error: 'Question exceeds 500 character limit.' });
    }
    if (!sessionId || typeof sessionId !== 'string' || sessionId.length < 8 || sessionId.length > 64) {
        return res.status(400).json({ error: 'Missing or invalid "sessionId" field.' });
    }

    const trimmedQuestion = question.trim();

    // ── Rate Limit ────────────────────────────────────────
    const rateCheck = await checkRateLimit(sessionId);
    if (!rateCheck.allowed) {
        return res.status(429).json({
            error: 'Too many requests.',
            answer: "You've reached the daily message limit for this session. Please come back tomorrow! 😊",
        });
    }

    // ── Call Groq ─────────────────────────────────────────
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        console.error('[Groq] GROQ_API_KEY is not set.');
        return res.status(500).json({ error: 'Server configuration error.' });
    }

    let answer;
    try {
        const groq = new Groq({ apiKey });
        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: trimmedQuestion },
            ],
            max_tokens: 512,
            temperature: 0.3,
            top_p: 0.9,
        });
        answer = completion.choices[0]?.message?.content?.trim() || '';
        if (!answer) {
            answer = "I'm sorry, I couldn't generate a response. Please try again.";
        }
    } catch (err) {
        console.error('[Groq] API error:', err.message);
        return res.status(502).json({
            error: 'AI service error.',
            answer: "I'm having trouble connecting right now. Please try again in a moment.",
        });
    }

    // ── Log to Firestore ──────────────────────────────────
    await logToFirestore({
        sessionId,
        userQuestion: trimmedQuestion,
        aiResponse: answer,
        pageUrl: typeof pageUrl === 'string' ? pageUrl.substring(0, 200) : 'unknown',
    });

    return res.status(200).json({ answer });
};
