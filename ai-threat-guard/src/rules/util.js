// Shared helpers for detection rules.

export const SEVERITY_SCORE = { low: 10, medium: 30, high: 60, critical: 90 };

export function lineOf(text, index) {
  let line = 1;
  for (let i = 0; i < index && i < text.length; i++) if (text.charCodeAt(i) === 10) line++;
  return line;
}

export function snippet(text, index, length = 80) {
  const start = Math.max(0, index - 20);
  return text.slice(start, start + length).replace(/\s+/g, ' ').trim();
}

// Mask the middle of a secret so reports never re-leak it.
export function mask(value) {
  if (value.length <= 10) return '*'.repeat(value.length);
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

export function ext(filePath) {
  const m = /\.([a-z0-9]+)$/i.exec(filePath);
  return m ? m[1].toLowerCase() : '';
}

export function basename(filePath) {
  return filePath.split(/[\\/]/).pop();
}

// Run a list of { re, severity, title, detail } patterns and return findings.
export function matchPatterns(text, patterns, ruleId, { maxPerPattern = 3 } = {}) {
  const findings = [];
  for (const p of patterns) {
    const re = new RegExp(p.re.source, p.re.flags.includes('g') ? p.re.flags : p.re.flags + 'g');
    let m;
    let count = 0;
    while ((m = re.exec(text)) && count < maxPerPattern) {
      findings.push({
        ruleId,
        tag: p.tag,
        severity: p.severity,
        title: p.title,
        detail: p.detail,
        line: lineOf(text, m.index),
        evidence: p.secret ? mask(m[0]) : snippet(text, m.index),
      });
      count++;
      if (m.index === re.lastIndex) re.lastIndex++;
    }
  }
  return findings;
}

export function shannonEntropy(s) {
  const freq = new Map();
  for (const ch of s) freq.set(ch, (freq.get(ch) || 0) + 1);
  let h = 0;
  for (const n of freq.values()) {
    const p = n / s.length;
    h -= p * Math.log2(p);
  }
  return h;
}
