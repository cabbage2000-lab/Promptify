import { claudeCodeHost } from './claude-code.js';
import { codexHost } from './codex.js';

const hostsById = new Map([
  [claudeCodeHost.id, claudeCodeHost],
  [codexHost.id, codexHost]
]);

export function getHosts(ids) {
  return ids.map((id) => {
    const host = hostsById.get(id);
    if (!host) {
      throw new Error(`未知宿主：${id}`);
    }
    return host;
  });
}
