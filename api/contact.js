const nodemailer = require('nodemailer');

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const ipRequests = new Map();

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

function isRateLimited(ip) {
  const now = Date.now();
  const record = ipRequests.get(ip);

  if (!record || now - record.windowStart > RATE_LIMIT_WINDOW_MS) {
    ipRequests.set(ip, { count: 1, windowStart: now });
    return false;
  }

  if (record.count >= RATE_LIMIT_MAX) return true;
  record.count += 1;
  return false;
}

function sanitizeSingleLine(value, maxLen) {
  return String(value || '').replace(/[\r\n]/g, ' ').trim().slice(0, maxLen);
}

function sanitizeMultiLine(value, maxLen) {
  return String(value || '').replace(/\r/g, '').trim().slice(0, maxLen);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function verifyTurnstile(token, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { success: false, reason: 'Missing Turnstile secret key.' };
  if (!token) return { success: false, reason: 'Missing Turnstile token.' };

  const formData = new URLSearchParams();
  formData.append('secret', secret);
  formData.append('response', token);
  formData.append('remoteip', ip);

  const resp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: formData
  });

  if (!resp.ok) {
    return { success: false, reason: `Turnstile verify request failed (${resp.status}).` };
  }
  const data = await resp.json();
  if (!data.success) {
    const codes = Array.isArray(data['error-codes']) ? data['error-codes'].join(', ') : 'unknown';
    return { success: false, reason: `Turnstile rejected token: ${codes}` };
  }

  return { success: true, reason: '' };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  const {
    name,
    email,
    service,
    message,
    honeypot,
    formStartedAt,
    'cf-turnstile-response': turnstileToken
  } = req.body || {};

  if (honeypot) {
    return res.status(400).json({ error: 'Spam detected.' });
  }

  const turnstileResult = await verifyTurnstile(turnstileToken, ip);
  if (!turnstileResult.success) {
    console.error('Turnstile verification failed:', turnstileResult.reason);
    return res.status(400).json({ error: 'Bot verification failed. Please retry the captcha.' });
  }

  const startedAt = Number(formStartedAt);
  const now = Date.now();
  const tooFast = Number.isFinite(startedAt) && now - startedAt < 3000;
  const tooOld = Number.isFinite(startedAt) && now - startedAt > 2 * 60 * 60 * 1000;
  if (!Number.isFinite(startedAt) || tooFast || tooOld) {
    return res.status(400).json({ error: 'Form validation failed.' });
  }

  const safeName = sanitizeSingleLine(name, 80);
  const safeEmail = sanitizeSingleLine(email, 150);
  const safeService = sanitizeSingleLine(service || 'General Inquiry', 100);
  const safeMessage = sanitizeMultiLine(message, 5000);

  if (!safeName || !safeEmail || !safeMessage) {
    return res.status(400).json({ error: 'Name, email and message are required.' });
  }

  if (!isValidEmail(safeEmail)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  const requiredEnvVars = [
    'EMAIL_HOST',
    'EMAIL_PORT',
    'EMAIL_USER',
    'EMAIL_PASS',
    'RECEIVER_EMAIL',
    'TURNSTILE_SECRET_KEY'
  ];
  const missing = requiredEnvVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error('Missing env vars:', missing);
    return res.status(500).json({ error: 'Email service is not configured.' });
  }

  const emailPort = Number(process.env.EMAIL_PORT);
  if (!Number.isFinite(emailPort) || emailPort <= 0) {
    console.error('Invalid EMAIL_PORT:', process.env.EMAIL_PORT);
    return res.status(500).json({ error: 'Email service is not configured.' });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: emailPort,
    secure: emailPort === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER;

  try {
    await transporter.verify();

    await transporter.sendMail({
      from: `"QuantumSD Contact" <${fromAddress}>`,
      to: process.env.RECEIVER_EMAIL,
      replyTo: safeEmail,
      subject: `QuantumSD Inquiry: ${safeService}`,
      text: [
        `Name: ${safeName}`,
        `Email: ${safeEmail}`,
        `Service: ${safeService}`,
        '',
        'Message:',
        safeMessage
      ].join('\n')
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email Error:', error);
    return res.status(500).json({ error: 'Email failed to send.' });
  }
};
