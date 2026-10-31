// Flags browser extensions that pose as AI assistants while requesting the
// permissions needed to read every page, steal cookies or hijack sessions.
// Fake "ChatGPT/AI" extensions have been one of the largest consumer threat
// campaigns since 2023.
import { basename } from './util.js';

const AI_BAIT = /\b(chat\s?gpt|gpt-?\d|openai|claude|gemini|bard|copilot|deepseek|grok|perplexity|ai assistant|ai sidebar|ai writer|ai chat|midjourney|sora)\b/i;
// Store IDs of genuine vendor extensions, so they are never flagged. Populate
// this from the vendors' official store listings before shipping; users can
// add their own through ctx.allowExtensions (see config.js).
const OFFICIAL_IDS = new Set([]);

export const browserExtension = {
  id: 'browser-extension',
  name: 'Fake / over-privileged AI browser extensions',
  appliesTo: (file) => basename(file) === 'manifest.json' && /[\\/]extensions[\\/]/i.test(file),
  scan(text, ctx = {}) {
    let m;
    try { m = JSON.parse(text.replace(/^﻿/, '')); } catch { return []; }
    const id = (ctx.file || '').split(/[\\/]extensions[\\/]/i)[1]?.split(/[\\/]/)[0] || '';
    const label = `${m.name || ''} ${m.description || ''} ${m.short_name || ''}`;
    if (OFFICIAL_IDS.has(id) || ctx.allowExtensions?.includes(id)) return [];

    const perms = [...(m.permissions || []), ...(m.host_permissions || []), ...(m.optional_permissions || [])].map(String);
    const allHosts = perms.some((p) => p === '<all_urls>' || p === '*://*/*' || p === 'http://*/*' || p === 'https://*/*')
      || (m.content_scripts || []).some((cs) => (cs.matches || []).includes('<all_urls>'));
    const risky = perms.filter((p) => ['cookies', 'webRequest', 'webRequestBlocking', 'declarativeNetRequest', 'scripting', 'debugger', 'proxy', 'management', 'nativeMessaging', 'clipboardRead'].includes(p));

    const findings = [];
    const bait = AI_BAIT.test(label) && !/^__MSG_/.test(m.name || '');
    if (bait && allHosts && risky.length) {
      findings.push({
        ruleId: this.id, tag: 'fake-ai-extension',
        severity: risky.includes('cookies') || risky.includes('debugger') || risky.includes('proxy') ? 'high' : 'medium',
        title: `AI-branded extension with broad access: "${(m.name || id).slice(0, 60)}"`,
        detail: `Can read every site you visit and uses: ${risky.join(', ')}. Many fake AI extensions use exactly this combination to steal session cookies (e.g. Facebook/Google business accounts). Remove it unless you installed it on purpose from the vendor's official listing.`,
        evidence: `extension id ${id}`,
      });
    } else if (allHosts && (risky.includes('debugger') || (risky.includes('cookies') && risky.includes('webRequest')))) {
      findings.push({
        ruleId: this.id, tag: 'overprivileged-extension', severity: 'low',
        title: `Highly privileged extension: "${(m.name || id).slice(0, 60)}"`,
        detail: `All-sites access plus ${risky.join(', ')}. Make sure you trust the publisher.`,
        evidence: `extension id ${id}`,
      });
    }
    if (m.update_url && !/clients2\.google\.com|edge\.microsoft\.com|addons\.mozilla\.org/.test(m.update_url)) {
      findings.push({
        ruleId: this.id, tag: 'sideloaded-extension', severity: 'medium',
        title: `Extension updates from a non-store server: "${(m.name || id).slice(0, 60)}"`,
        detail: `update_url is ${m.update_url}. Sideloaded extensions bypass store review.`,
        evidence: `extension id ${id}`,
      });
    }
    return findings;
  },
};
