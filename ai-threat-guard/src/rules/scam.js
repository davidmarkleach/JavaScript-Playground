// Scores a message (email, SMS, chat, voicemail transcript) for the social
// engineering patterns that AI has made cheap: flawless phishing, voice-clone
// "family emergency" calls, deepfake executive payment requests.
import { ext } from './util.js';

const SIGNALS = [
  { re: /\b(urgent(ly)?|immediately|right now|within (the next )?\d+\s*(minutes?|hours?)|act now|final notice|last chance|before it'?s too late)\b/i, w: 15, tag: 'urgency', label: 'Pressure / urgency' },
  { re: /\b(gift ?cards?|itunes|google play cards?|steam cards?|bitcoin|btc|usdt|crypto(currency)?|wire transfer|zelle|western union|moneygram|cash app|venmo)\b/i, w: 25, tag: 'payment', label: 'Untraceable payment method' },
  { re: /\b(don'?t|do not) (tell|call|contact) (anyone|mom|dad|the police|your bank|the bank)\b|\bkeep (this|it) (between us|secret|confidential)\b/i, w: 25, tag: 'secrecy', label: 'Demands secrecy' },
  { re: /\b(grandma|grandpa|mom|dad|it'?s me)\b[^.\n]{0,60}\b(arrested|jail|accident|hospital|kidnapp?ed|bail|in trouble)\b/i, w: 30, tag: 'family-emergency', label: 'Family-emergency script (common with AI voice clones)' },
  { re: /\b(ceo|cfo|president|director|boss)\b[^.\n]{0,80}\b(wire|payment|transfer|invoice|gift cards?)\b|\b(new|updated|changed) (bank|banking|payment) (details|account|information)\b/i, w: 25, tag: 'bec', label: 'Executive / invoice payment change (deepfake & BEC pattern)' },
  { re: /\b(verify|confirm|unlock|reactivate|validate) (your )?(account|identity|payment|password|login)\b|\baccount (has been |will be )?(suspended|locked|disabled|limited)\b/i, w: 20, tag: 'credential-lure', label: 'Account-verification lure' },
  { re: /\b(one[- ]time (pass)?code|OTP|verification code|2fa code|6-digit code)\b[^.\n]{0,40}\b(send|share|read|tell|give)\b|\b(send|share|read|tell|give)\b[^.\n]{0,40}\b(code|OTP)\b/i, w: 30, tag: 'otp', label: 'Asks you to share a one-time code' },
  { re: /\b(microsoft|windows|apple|amazon|paypal) (support|security|technician|defender)\b[^.\n]{0,80}\b(call|virus|infected|refund|remote|anydesk|teamviewer)\b|\b(anydesk|teamviewer|ultraviewer|quick ?assist)\b/i, w: 25, tag: 'tech-support', label: 'Tech-support / remote-access scam' },
  { re: /\b(guaranteed|risk[- ]free|double your|10x|passive income)\b[^.\n]{0,40}\b(returns?|profit|investment|crypto)\b|\b(ai|quantum) trading (bot|platform)\b/i, w: 20, tag: 'investment', label: 'Too-good investment / "AI trading bot" pitch' },
  { re: /\b(deepfake|voice (note|message)|video call)\b[^.\n]{0,60}\b(can'?t|cannot|unable)\b/i, w: 10, tag: 'avoid-verify', label: 'Avoids live verification' },
];

const URL = /\bhttps?:\/\/[^\s<>"')]+/gi;
const BRANDS = ['paypal', 'microsoft', 'apple', 'amazon', 'netflix', 'google', 'chase', 'wellsfargo', 'bankofamerica', 'coinbase', 'binance', 'openai', 'chatgpt', 'anthropic', 'claude', 'irs', 'usps', 'fedex', 'dhl'];

function urlSignals(text) {
  const out = [];
  for (const u of text.match(URL) || []) {
    let host;
    try { host = new globalThis.URL(u).hostname.toLowerCase(); } catch { continue; }
    if (host.startsWith('xn--') || host.includes('.xn--')) out.push({ w: 30, tag: 'punycode', label: `Look-alike (punycode) domain: ${host}` });
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(host)) out.push({ w: 25, tag: 'ip-url', label: `Link to a raw IP address: ${host}` });
    if (/\.(zip|mov|top|xyz|click|country|gq|tk|ml|cf|rest|cam|lol)$/.test(host)) out.push({ w: 10, tag: 'cheap-tld', label: `High-abuse domain ending: ${host}` });
    if (/(bit\.ly|tinyurl\.com|t\.co|is\.gd|cutt\.ly|rb\.gy|shorturl\.at)$/.test(host)) out.push({ w: 10, tag: 'shortener', label: `Shortened link hides destination: ${host}` });
    const registrable = host.split('.').slice(-2).join('.');
    for (const b of BRANDS) {
      if (host.includes(b) && !registrable.startsWith(b + '.')) { out.push({ w: 30, tag: 'brand-impersonation', label: `Brand name "${b}" used on an unrelated domain: ${host}` }); break; }
    }
  }
  return out;
}

// Returns { score 0-100, verdict, signals[] }.
export function scoreMessage(text) {
  const signals = [];
  for (const s of SIGNALS) if (s.re.test(text)) signals.push({ tag: s.tag, label: s.label, w: s.w });
  signals.push(...urlSignals(text));
  const raw = signals.reduce((a, s) => a + s.w, 0);
  // Diminishing returns so a single noisy word cannot max out the score.
  const score = Math.round(100 * (1 - Math.exp(-raw / 60)));
  const verdict = score >= 70 ? 'likely-scam' : score >= 40 ? 'suspicious' : 'no-strong-signals';
  return { score, verdict, signals };
}

export const scam = {
  id: 'scam-message',
  name: 'AI-era phishing & scam messages',
  appliesTo: (file) => ['eml', 'msg'].includes(ext(file)),
  scan(text) {
    const r = scoreMessage(text);
    if (r.verdict === 'no-strong-signals') return [];
    return [{
      ruleId: this.id, tag: 'scam', severity: r.verdict === 'likely-scam' ? 'high' : 'medium',
      title: `Email scores ${r.score}/100 for scam patterns`,
      detail: r.signals.map((s) => s.label).join('; '),
    }];
  },
};
