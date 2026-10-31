// Audits AI agent / MCP server configuration (Claude Desktop, Cursor, VS Code,
// Windsurf, etc.). A poisoned MCP config is a persistence and code-execution
// vector: the AI app launches whatever command is listed, every time it starts.
import { basename } from './util.js';

const CONFIG_NAMES = /^(claude_desktop_config\.json|mcp\.json|mcp_config\.json|\.mcp\.json|settings\.json|cline_mcp_settings\.json)$/i;

const BAD_COMMAND = [
  { re: /(curl|wget|iwr|invoke-webrequest|irm)\b[^|]*\|\s*(sh|bash|iex|powershell|pwsh|python)/i, severity: 'critical', title: 'MCP server pipes a download straight into a shell' },
  { re: /-e(nc(odedcommand)?)?\s+[A-Za-z0-9+/=]{30,}/i, severity: 'critical', title: 'MCP server runs an encoded PowerShell command' },
  { re: /\b(mshta|regsvr32|rundll32|certutil|bitsadmin)\b/i, severity: 'high', title: 'MCP server launches a Windows LOLBin' },
  { re: /(\\|\/)(temp|tmp|appdata\\local\\temp|downloads)(\\|\/)/i, severity: 'medium', title: 'MCP server binary runs from a temp/downloads folder' },
  { re: /https?:\/\/(\d{1,3}\.){3}\d{1,3}/i, severity: 'high', title: 'MCP server points at a raw IP address' },
  { re: /\b(ngrok\.io|ngrok-free\.app|trycloudflare\.com|serveo\.net|pastebin\.com|transfer\.sh)\b/i, severity: 'high', title: 'MCP server uses a tunnel/paste host often used by attackers' },
];

function* iterServers(json) {
  // Claude Desktop / Cursor / Windsurf: { mcpServers: {...} }. VS Code: { servers: {...} } or { mcp: { servers } }.
  const buckets = [json?.mcpServers, json?.servers, json?.mcp?.servers, json?.['mcp.servers']];
  for (const b of buckets) {
    if (b && typeof b === 'object') for (const [name, cfg] of Object.entries(b)) yield [name, cfg];
  }
}

export const agentConfig = {
  id: 'agent-config',
  name: 'AI agent & MCP server configuration audit',
  appliesTo: (file) => CONFIG_NAMES.test(basename(file)),
  scan(text) {
    let json;
    try { json = JSON.parse(text); } catch { return []; }
    const findings = [];
    for (const [name, cfg] of iterServers(json)) {
      if (!cfg || typeof cfg !== 'object') continue;
      const cmdline = [cfg.command, ...(Array.isArray(cfg.args) ? cfg.args : [])].filter(Boolean).join(' ');
      const where = `server "${name}"`;

      for (const p of BAD_COMMAND) {
        if (p.re.test(cmdline) || (cfg.url && p.re.test(cfg.url))) {
          findings.push({ ruleId: this.id, tag: 'mcp-command', severity: p.severity, title: p.title, detail: `${where}: ${cmdline || cfg.url}`.slice(0, 300), evidence: where });
        }
      }

      // npx -y some-package with no version pin auto-installs whatever is latest: a supply-chain risk.
      if (/\b(npx|bunx|pnpm\s+dlx|uvx)\b/.test(cmdline)) {
        const pkg = (cfg.args || []).find((a) => typeof a === 'string' && !a.startsWith('-'));
        if (pkg && !/@\d/.test(pkg.replace(/^@[^/]+\//, ''))) {
          findings.push({
            ruleId: this.id, tag: 'mcp-unpinned', severity: 'low',
            title: 'MCP server auto-installs an unpinned package',
            detail: `${where} runs "${pkg}" with no version pin, so a hijacked or typosquatted release would run automatically. Pin an exact version you have reviewed.`,
            evidence: where,
          });
        }
      }

      if (cfg.url && /^http:\/\/(?!localhost|127\.0\.0\.1)/i.test(cfg.url)) {
        findings.push({ ruleId: this.id, tag: 'mcp-plaintext', severity: 'medium', title: 'Remote MCP server over unencrypted HTTP', detail: `${where}: ${cfg.url}`, evidence: where });
      }

      for (const [k, v] of Object.entries(cfg.env || {})) {
        if (typeof v === 'string' && v.length >= 20 && /(key|token|secret|password)/i.test(k)) {
          findings.push({
            ruleId: this.id, tag: 'mcp-inline-secret', severity: 'medium',
            title: 'Secret stored in plain text in an AI agent config',
            detail: `${where} has ${k} inline. These config files are a known infostealer target.`,
            evidence: `${k}=${v.slice(0, 4)}…`,
          });
        }
      }
    }

    // Agent "auto-approve everything" settings remove the human check on tool calls.
    const flat = JSON.stringify(json);
    if (/"(alwaysAllow|autoApprove)"\s*:\s*\[\s*"\*"|"(chat\.tools\.autoApprove|yolo|dangerouslySkipPermissions|bypassPermissions)"\s*:\s*true/i.test(flat)) {
      findings.push({
        ruleId: this.id, tag: 'auto-approve', severity: 'medium',
        title: 'AI agent is set to auto-approve all tool calls',
        detail: 'With approvals off, a single prompt injection in a web page or file can make the agent run commands without asking you.',
      });
    }
    return findings;
  },
};
