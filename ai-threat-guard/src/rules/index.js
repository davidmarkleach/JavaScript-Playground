import { promptInjection } from './promptInjection.js';
import { secrets } from './secrets.js';
import { scripts } from './scripts.js';
import { agentConfig } from './agentConfig.js';
import { browserExtension } from './browserExtension.js';
import { scam } from './scam.js';

export const RULES = [promptInjection, secrets, scripts, agentConfig, browserExtension, scam];
export { scoreMessage } from './scam.js';
