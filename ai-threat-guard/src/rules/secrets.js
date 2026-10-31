// Finds AI-provider and cloud API keys lying around in plain files. Infostealers
// now harvest these specifically: a leaked LLM key is resold for "LLMjacking".
import { matchPatterns, ext } from './util.js';

const SKIP_EXTS = new Set(['exe', 'dll', 'png', 'jpg', 'jpeg', 'gif', 'mp4', 'mp3', 'zip', 'pdf', 'woff', 'woff2']);

const PATTERNS = [
  { re: /\bsk-ant-(api|admin)\d{2}-[A-Za-z0-9_-]{80,}/, title: 'Anthropic API key', tag: 'anthropic' },
  { re: /\bsk-(proj|svcacct|admin)-[A-Za-z0-9_-]{40,}/, title: 'OpenAI API key', tag: 'openai' },
  { re: /\bsk-[A-Za-z0-9]{20}T3BlbkFJ[A-Za-z0-9]{20}\b/, title: 'OpenAI API key (legacy)', tag: 'openai' },
  { re: /\bAIza[0-9A-Za-z_-]{35}\b/, title: 'Google / Gemini API key', tag: 'google' },
  { re: /\bhf_[A-Za-z0-9]{34,}\b/, title: 'Hugging Face token', tag: 'huggingface' },
  { re: /\bgsk_[A-Za-z0-9]{48,}\b/, title: 'Groq API key', tag: 'groq' },
  { re: /\bxai-[A-Za-z0-9]{70,}\b/, title: 'xAI API key', tag: 'xai' },
  { re: /\br8_[A-Za-z0-9]{37}\b/, title: 'Replicate API token', tag: 'replicate' },
  { re: /\b(AKIA|ASIA)[0-9A-Z]{16}\b/, title: 'AWS access key ID', tag: 'aws' },
  { re: /\bgh[pousr]_[A-Za-z0-9]{36,}\b/, title: 'GitHub token', tag: 'github' },
  { re: /\bgithub_pat_[A-Za-z0-9_]{60,}\b/, title: 'GitHub fine-grained token', tag: 'github' },
  { re: /\bxox[baprs]-[A-Za-z0-9-]{10,}/, title: 'Slack token', tag: 'slack' },
  { re: /\b(sk|rk)_live_[A-Za-z0-9]{24,}\b/, title: 'Stripe live secret key', tag: 'stripe' },
  { re: /-----BEGIN (RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY( BLOCK)?-----/, title: 'Private key', tag: 'private-key' },
].map((p) => ({
  ...p,
  severity: 'high',
  secret: true,
  detail: 'A live credential stored in a readable file. Info-stealing malware scans for exactly this. Move it to a secrets manager or Windows Credential Manager and rotate it.',
}));

export const secrets = {
  id: 'exposed-secret',
  name: 'Exposed AI & cloud API keys',
  appliesTo: (file) => !SKIP_EXTS.has(ext(file)),
  scan(text) {
    return matchPatterns(text, PATTERNS, this.id, { maxPerPattern: 2 });
  },
};
