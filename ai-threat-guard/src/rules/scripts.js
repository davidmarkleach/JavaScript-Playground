// Behavioural heuristics for scripts and droppers, including the newer family of
// malware that calls an LLM API at runtime to generate its next commands
// (so the payload is different every time and signature scanners miss it).
import { matchPatterns, ext, shannonEntropy, lineOf } from './util.js';

const SCRIPT_EXTS = new Set(['ps1', 'psm1', 'psd1', 'bat', 'cmd', 'vbs', 'vbe', 'js', 'jse', 'wsf', 'hta', 'py', 'sh', 'lnk', 'url', 'reg', 'scr', 'mjs', 'cjs']);

const PATTERNS = [
  // Execution & download cradles
  { re: /-e(nc(odedcommand)?|c)\s+[A-Za-z0-9+/=]{40,}/i, severity: 'high', tag: 'encoded-ps', title: 'Encoded PowerShell command', detail: 'Base64-encoded PowerShell hides what the script really runs.' },
  { re: /\b(iex|invoke-expression)\b[\s\S]{0,80}\b(downloadstring|invoke-webrequest|iwr|irm|invoke-restmethod|net\.webclient)\b|\b(downloadstring|irm|iwr)\b[^\n]{0,120}\|\s*(iex|invoke-expression)\b/i, severity: 'critical', tag: 'download-exec', title: 'Download-and-execute cradle', detail: 'Fetches code from the internet and runs it immediately in memory.' },
  { re: /\[(system\.)?convert\]::frombase64string|atob\s*\(|base64\s+(-d|--decode)/i, severity: 'medium', tag: 'b64-decode', title: 'Runtime Base64 decoding', detail: 'Common way to unpack a hidden payload.' },
  { re: /\bcertutil(\.exe)?\b[^\n]*-(urlcache|decode)/i, severity: 'high', tag: 'lolbin', title: 'certutil abused as a downloader/decoder', detail: 'Living-off-the-land binary abuse.' },
  { re: /\b(mshta|regsvr32|rundll32|bitsadmin|wmic)(\.exe)?\b[^\n]*(https?:|javascript:|\/i:|scrobj|\/transfer|process\s+call\s+create)/i, severity: 'high', tag: 'lolbin', title: 'Windows LOLBin used to run remote code', detail: 'Built-in Windows tools are being used to fetch or execute code.' },
  { re: /\bstart-process\b[^\n]*-windowstyle\s+hidden|-w(indowstyle)?\s+hidden|-nop\b[^\n]*-w\s+h/i, severity: 'medium', tag: 'hidden-window', title: 'Hidden window execution', detail: 'Runs a process the user cannot see.' },

  // Defense evasion
  { re: /\b(set|add)-mppreference\b[^\n]*(disablerealtimemonitoring|exclusionpath|exclusionprocess|exclusionextension)/i, severity: 'critical', tag: 'defender-tamper', title: 'Tampers with Microsoft Defender', detail: 'Disables real-time protection or adds exclusions so malware is not scanned.' },
  { re: /amsiutils|amsiinitfailed|amsiscanbuffer/i, severity: 'critical', tag: 'amsi-bypass', title: 'AMSI bypass', detail: 'Blinds the Windows Antimalware Scan Interface.' },
  { re: /\bvssadmin\b[^\n]*delete\s+shadows|\bwbadmin\b[^\n]*delete|bcdedit[^\n]*recoveryenabled\s+no/i, severity: 'critical', tag: 'ransomware', title: 'Deletes backups / shadow copies', detail: 'Typical ransomware preparation step.' },
  { re: /\b(wevtutil\s+cl|clear-eventlog)\b/i, severity: 'high', tag: 'log-wipe', title: 'Clears Windows event logs', detail: 'Covers tracks after an intrusion.' },

  // Persistence
  { re: /\\currentversion\\(run|runonce)\b|\bschtasks(\.exe)?\b[^\n]*\/create|\bregister-scheduledtask\b|\\start menu\\programs\\startup\\/i, severity: 'medium', tag: 'persistence', title: 'Sets up auto-start persistence', detail: 'Makes the program run again at every logon.' },

  // Credential / wallet theft (infostealer behaviour)
  { re: /\\(google\\chrome|microsoft\\edge|bravesoftware\\brave-browser)\\user data\\[^\n]*(login data|local state|cookies|web data)/i, severity: 'critical', tag: 'stealer', title: 'Reads browser password/cookie stores', detail: 'Infostealer behaviour: targets saved passwords, session cookies and the decryption key.' },
  { re: /\\(discord|discordcanary|telegram desktop)\\|leveldb[^\n]*token/i, severity: 'high', tag: 'stealer', title: 'Targets Discord/Telegram session data', detail: 'Session tokens let attackers take over accounts without a password.' },
  { re: /\b(metamask|exodus|electrum|atomic wallet|phantom|nkbihfbeogaeaoehlefnkodbefgpgknn)\b/i, severity: 'high', tag: 'wallet', title: 'References crypto wallets', detail: 'Wallet theft is a primary goal of modern stealers.' },
  { re: /api\.telegram\.org\/bot[0-9]{6,}:|discord(app)?\.com\/api\/webhooks\/\d+/i, severity: 'high', tag: 'exfil-channel', title: 'Telegram bot / Discord webhook exfiltration channel', detail: 'Stolen data is often posted to a chat bot or webhook.' },
  { re: /\\(\.claude|\.cursor|\.codeium|\.continue|\.aws|\.ssh|\.azure|\.config\\gcloud)\\|\b(claude_desktop_config|credentials\.json|id_rsa|id_ed25519)\b/i, severity: 'medium', tag: 'dev-creds', title: 'Touches AI-agent or developer credential files', detail: 'AI tool configs and developer keys are now prime stealer targets.' },
];

// Hosts of hosted LLM APIs. A script that both calls one of these AND executes
// shell commands may be an LLM-driven implant (prompt → command → execute loop).
const LLM_API = /\b(api\.openai\.com|api\.anthropic\.com|generativelanguage\.googleapis\.com|api\.mistral\.ai|api\.groq\.com|api\.deepseek\.com|openrouter\.ai\/api|api-inference\.huggingface\.co|router\.huggingface\.co|api\.together\.xyz|localhost:11434\/api|ollama)\b/i;
const EXEC = /\b(subprocess\.(run|popen|call|check_output)|os\.system|child_process|execSync|spawn\(|exec\(|invoke-expression|\biex\b|start-process|shell\.run|wscript\.shell|cmd(\.exe)?\s+\/c)/i;
const RECON_PROMPT = /\b(generate|write|give me|output)\b[^\n]{0,80}\b(commands?|powershell|cmd|bash|script)\b[^\n]{0,120}\b(collect|enumerate|gather|exfiltrate|encrypt|find|list|search)\b/i;

export const scripts = {
  id: 'script-heuristics',
  name: 'Malicious script & AI-driven dropper heuristics',
  appliesTo: (file) => SCRIPT_EXTS.has(ext(file)),
  scan(text) {
    const findings = matchPatterns(text, PATTERNS, this.id, { maxPerPattern: 2 });

    const llm = LLM_API.exec(text);
    if (llm && EXEC.test(text)) {
      const prompted = RECON_PROMPT.test(text);
      findings.push({
        ruleId: this.id, tag: 'llm-implant',
        severity: prompted ? 'critical' : 'high',
        title: prompted ? 'LLM-driven implant: asks an AI to generate attack commands, then runs them' : 'Script calls an LLM API and executes shell commands',
        detail: 'AI-powered malware (e.g. the 2025 LameHug/PromptLock families) generates its commands on the fly from a language model, so every run looks different. Legitimate tools rarely pipe model output straight into a shell.',
        line: lineOf(text, llm.index), evidence: llm[0],
      });
    }

    // Long high-entropy blobs: packed/obfuscated payloads.
    const blob = /[A-Za-z0-9+/=]{400,}/g;
    for (const m of text.matchAll(blob)) {
      if (shannonEntropy(m[0].slice(0, 2000)) > 5.3) {
        findings.push({
          ruleId: this.id, tag: 'obfuscation', severity: 'medium',
          title: 'Large high-entropy encoded blob',
          detail: 'Packed or encrypted payloads embedded inside scripts.',
          line: lineOf(text, m.index), evidence: `${m[0].length} chars, entropy ${shannonEntropy(m[0].slice(0, 2000)).toFixed(2)}`,
        });
        break;
      }
    }

    // Heavy string-concatenation / char-code obfuscation.
    const charcodes = (text.match(/\[char\]\s*\d{2,3}|String\.fromCharCode\(|chr\(\d+\)/gi) || []).length;
    if (charcodes > 15) {
      findings.push({
        ruleId: this.id, tag: 'obfuscation', severity: 'medium',
        title: 'Character-code obfuscation',
        detail: `${charcodes} character-code constructions: text is being built to dodge string signatures.`,
      });
    }
    return findings;
  },
};
