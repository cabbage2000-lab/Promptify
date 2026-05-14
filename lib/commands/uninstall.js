import { readFile, writeFile } from 'node:fs/promises';
import { unregisterClaudeCodePlugin } from '../claude-code-plugin.js';
import { unregisterCodexSkill } from '../codex-skill.js';
import { getHosts } from '../hosts/index.js';
import { pathExists, removeManagedBlock } from '../fs-safe.js';
import { parseHostFlag } from '../prompt.js';

export async function uninstallCommand(args, io, context) {
  const hostValue = Object.hasOwn(args.flags, 'host') ? args.flags.host : 'claude-code';
  const hostIds = parseHostFlag(hostValue);

  if (hostIds.length === 0) {
    io.stderr('宿主不能为空。请使用 --host=claude-code 或 --host=codex。');
    return 1;
  }

  let hosts;
  try {
    hosts = getHosts(hostIds);
  } catch (error) {
    io.stderr(error.message);
    return 1;
  }

  for (const host of hosts) {
    const configPath = host.defaultConfigPath(context.homeDir);
    if (host.id === 'codex') {
      const removed = await unregisterCodexSkill({ homeDir: context.homeDir });
      if (removed) {
        io.stdout('已移除 Codex skill 注册。');
      }
    }

    if (!(await pathExists(configPath))) {
      io.stdout(`已跳过 ${host.id}：配置文件原本不存在。`);
      continue;
    }

    const original = await readFile(configPath, 'utf8');
    await writeFile(configPath, removeManagedBlock(original), 'utf8');
    io.stdout(`已移除 ${host.id} 配置中的 Promptify 管理片段。`);

    if (host.id === 'claude-code') {
      const removed = await unregisterClaudeCodePlugin({ homeDir: context.homeDir });
      if (removed) {
        io.stdout('已移除 Claude Code 插件注册。');
      }
    }
  }

  return 0;
}
