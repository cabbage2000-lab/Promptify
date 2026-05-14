import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { registerClaudeCodePlugin } from '../claude-code-plugin.js';
import { registerCodexSkill } from '../codex-skill.js';
import { backupFile, pathExists, replaceManagedBlock, writeJsonFile } from '../fs-safe.js';
import { getHosts } from '../hosts/index.js';
import { parseHostFlag } from '../prompt.js';
import { copyResources } from '../resources.js';

export async function installCommand(args, io, context) {
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

  const backupRoot = path.join(context.paths.backups, fileSafeTimestamp());

  await copyResources(context.paths);

  const installedHosts = [];
  const backups = [];
  const version = await readPackageVersion(context);

  for (const host of hosts) {
    const configPath = host.defaultConfigPath(context.homeDir);
    const plan = await host.planInstall({
      installPath: context.paths.current,
      configPath
    });
    const existed = await pathExists(configPath);
    const original = existed ? await readFile(configPath, 'utf8') : '';

    if (existed) {
      const backupPath = path.join(backupRoot, 'hosts', host.id);
      await backupFile(configPath, backupPath);
      backups.push({ host: host.id, path: configPath, backupPath });
    }

    await mkdir(path.dirname(configPath), { recursive: true });
    await writeFile(configPath, replaceManagedBlock(original, plan.content), 'utf8');

    if (host.id === 'claude-code') {
      const registration = await registerClaudeCodePlugin({
        homeDir: context.homeDir,
        installPath: context.paths.current,
        version
      });
      io.stdout(`已注册 Claude Code 插件：${registration.pluginKey}`);
    }

    if (host.id === 'codex') {
      const registration = await registerCodexSkill({
        homeDir: context.homeDir,
        installPath: context.paths.current
      });
      io.stdout(`已注册 Codex skill：${registration.skillPath}`);
    }

    installedHosts.push(host.id);
  }

  await writeJsonFile(context.paths.manifest, {
    version,
    installedAt: new Date().toISOString(),
    installPath: context.paths.current,
    hosts: installedHosts,
    backups
  });

  io.stdout(`安装完成：${installedHosts.join(', ')}`);
  return 0;
}

function fileSafeTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

async function readPackageVersion(context) {
  const packageRoot = context.packageRoot ?? process.cwd();
  const pkg = JSON.parse(await readFile(path.join(packageRoot, 'package.json'), 'utf8'));
  return pkg.version;
}
