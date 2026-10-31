// Detects documents and web pages carrying instructions aimed at AI assistants
// and agents (indirect prompt injection), including text hidden from humans.
import { matchPatterns, lineOf, snippet, ext } from './util.js';

const TEXT_EXTS = new Set(['md', 'txt', 'html', 'htm', 'xml', 'json', 'csv', 'eml', 'rtf', 'svg', 'yaml', 'yml', 'ics', 'vcf']);

const PATTERNS = [
  {
    re: /\b(ignore|disregard|forget|override)\s+(all\s+|any\s+)?(the\s+)?(previous|prior|above|earlier|preceding|system)\s+(instructions|prompts?|rules|directions|messages)/i,
    severity: 'high', tag: 'override',
    title: 'Instruction-override phrase',
    detail: 'Classic prompt-injection phrasing that tries to make an AI assistant drop its original instructions.',
  },
  {
    re: /\b(you are now|from now on,? you (are|will)|act as (an?\s+)?(unrestricted|jailbroken|DAN))\b/i,
    severity: 'medium', tag: 'persona',
    title: 'Persona hijack phrase',
    detail: 'Attempts to reassign the role of an AI model that reads this file.',
  },
  {
    re: /\b(do not|don't|never)\s+(tell|inform|mention|reveal|alert)\s+(this\s+to\s+)?the\s+user\b/i,
    severity: 'high', tag: 'concealment',
    title: 'Instruction to hide actions from the user',
    detail: 'Injected instructions commonly ask the AI to conceal what it is doing.',
  },
  {
    re: /\b(AI|assistant|agent|LLM|model|copilot|claude|chatgpt|gemini)\b[^.\n]{0,60}\b(send|email|upload|post|forward|exfiltrate|transmit)\b[^.\n]{0,80}\b(password|credentials?|api[\s_-]?keys?|tokens?|ssh|cookies?|files?|contacts|wallet|seed phrase)/i,
    severity: 'critical', tag: 'exfiltration',
    title: 'Data-exfiltration instruction aimed at an AI agent',
    detail: 'Text tells an AI agent to send sensitive data somewhere.',
  },
  {
    re: /\b(run|execute|open a terminal and run|invoke)\b[^.\n]{0,40}(powershell|cmd\.exe|bash|curl|iwr|invoke-webrequest|wget)\b/i,
    severity: 'medium', tag: 'command',
    title: 'Instruction to run a shell command',
    detail: 'Tells an AI agent with tool access to execute commands. Dangerous for coding agents and computer-use agents.',
  },
  {
    re: /<\s*\/?\s*(system|im_start|im_end|instructions?|admin)\s*>|\[\s*(SYSTEM|INST)\s*\]|<\|im_start\|>/i,
    severity: 'medium', tag: 'fake-delimiter',
    title: 'Fake chat/system delimiter',
    detail: 'Spoofed model control tokens or system tags used to make injected text look authoritative.',
  },
  {
    re: /!\[[^\]]*\]\(https?:\/\/[^)\s]+[?&][a-z0-9_]+=(\{|%7B|\$\{|<)[^)]*\)/i,
    severity: 'high', tag: 'markdown-exfil',
    title: 'Markdown image exfiltration template',
    detail: 'An image URL with a placeholder query parameter: rendering it can leak chat data to a remote server.',
  },
];

// Unicode "tag" characters (U+E0000–U+E007F) are invisible and can smuggle ASCII
// instructions that models still read.
const TAG_CHARS = /[\u{E0000}-\u{E007F}]{4,}/gu;
const ZERO_WIDTH = /[​-‏⁠-⁤﻿]{6,}/g;
const BIDI = /[‪-‮⁦-⁩]/g;

// HTML text styled to be invisible to a person but visible to a model.
const HIDDEN_HTML = /<([a-z]+)[^>]*style\s*=\s*["'][^"']*(display\s*:\s*none|visibility\s*:\s*hidden|font-size\s*:\s*0(px)?\b|opacity\s*:\s*0(\.0+)?\b|color\s*:\s*(#fff(fff)?|white)\b[^"']*background(-color)?\s*:\s*(#fff(fff)?|white))[^"']*["'][^>]*>([\s\S]{0,600}?)<\/\1>/gi;
const INSTRUCTION_WORDS = /\b(ignore|instruction|assistant|AI|model|you must|summar|respond|reply|do not|password|send|execute)\b/i;

export const promptInjection = {
  id: 'prompt-injection',
  name: 'AI prompt-injection payloads',
  appliesTo: (file) => TEXT_EXTS.has(ext(file)),
  scan(text, ctx = {}) {
    const findings = matchPatterns(text, PATTERNS, this.id);

    const decodedTags = [];
    for (const m of text.matchAll(TAG_CHARS)) {
      const decoded = [...m[0]].map((c) => String.fromCharCode(c.codePointAt(0) - 0xe0000)).join('');
      decodedTags.push(decoded);
      findings.push({
        ruleId: this.id, tag: 'ascii-smuggling', severity: 'critical',
        title: 'Invisible Unicode tag-character text (ASCII smuggling)',
        detail: 'Hidden characters spell out text that humans cannot see but AI models read.',
        line: lineOf(text, m.index),
        evidence: `decoded: "${decoded.slice(0, 80)}"`,
      });
    }
    // Re-scan the decoded hidden text with the phrase patterns.
    if (decodedTags.length) {
      for (const f of matchPatterns(decodedTags.join('\n'), PATTERNS, this.id)) {
        findings.push({ ...f, severity: 'critical', title: `${f.title} (inside hidden text)`, line: undefined });
      }
    }

    for (const m of text.matchAll(ZERO_WIDTH)) {
      findings.push({
        ruleId: this.id, tag: 'zero-width', severity: 'low',
        title: 'Run of zero-width characters',
        detail: 'Can be used to watermark, fingerprint or hide content from human readers.',
        line: lineOf(text, m.index), evidence: `${m[0].length} zero-width chars`,
      });
      break;
    }
    const bidi = text.match(BIDI);
    if (bidi && bidi.length >= 2) {
      findings.push({
        ruleId: this.id, tag: 'bidi', severity: 'medium',
        title: 'Bidirectional control characters',
        detail: 'Bidi overrides can make text display differently from what a model or compiler reads ("Trojan Source").',
        evidence: `${bidi.length} bidi control chars`,
      });
    }

    if (/^(html|htm|svg|xml|eml)$/.test(ext(ctx.file || '')) || /<[a-z][\s\S]*>/i.test(text.slice(0, 5000))) {
      for (const m of text.matchAll(HIDDEN_HTML)) {
        const inner = m[m.length - 1].replace(/<[^>]+>/g, ' ');
        if (INSTRUCTION_WORDS.test(inner) && inner.trim().length > 20) {
          findings.push({
            ruleId: this.id, tag: 'hidden-html', severity: 'high',
            title: 'Instruction-like text hidden with CSS',
            detail: 'Text styled to be invisible to people but readable by AI browsers, summarizers and email assistants.',
            line: lineOf(text, m.index), evidence: snippet(inner, 0, 100),
          });
        }
      }
      const comment = /<!--([\s\S]{20,800}?)-->/g;
      for (const m of text.matchAll(comment)) {
        if (/\b(ignore|disregard)\b[\s\S]{0,40}\binstructions\b|\b(AI|assistant|agent)\b[\s\S]{0,40}\b(must|should|will)\b/i.test(m[1])) {
          findings.push({
            ruleId: this.id, tag: 'html-comment', severity: 'medium',
            title: 'AI-directed instructions inside an HTML comment',
            detail: 'Comments are invisible on the rendered page but are read by AI tools that ingest raw HTML.',
            line: lineOf(text, m.index), evidence: snippet(m[1], 0, 100),
          });
        }
      }
    }
    return findings;
  },
};
