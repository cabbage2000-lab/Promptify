import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { runCli } from '../lib/cli.js';
import { installCommand } from '../lib/commands/install.js';
import { updateCommand } from '../lib/commands/update.js';
import { uninstallCommand } from '../lib/commands/uninstall.js';
import { createPaths } from '../lib/paths.js';
import { pathExists } from '../lib/fs-safe.js';

test('update refreshes resources after install and runs doctor', async () => {
  const homeDir = await mkdtemp(path.join(os.tmpdir(), 'promptify-update-'));
  const paths = createPaths({ homeDir, packageRoot: process.cwd() });
  const output = [];
  const io = {
    stdout: (line) => output.push(line),
    stderr: (line) => output.push(line)
  };

  await installCommand({ flags: { host: 'codex', yes: true } }, io, { homeDir, paths });
  await writeFile(path.join(paths.current, 'README.md'), 'stale\n', 'utf8');

  const code = await updateCommand({ flags: {} }, io, { homeDir, paths });

  assert.equal(code, 0);
  assert.match(output.join('\n'), /更新完成/);
  assert.match(output.join('\n'), /OK install path/);
  assert.match(await readFile(path.join(paths.current, 'README.md'), 'utf8'), /Promptify/);
});

test('uninstall removes selected host managed block and preserves user content', async () => {
  const homeDir = await mkdtemp(path.join(os.tmpdir(), 'promptify-uninstall-'));
  const paths = createPaths({ homeDir, packageRoot: process.cwd() });
  const claudeConfigPath = path.join(homeDir, '.claude', 'CLAUDE.md');
  const codexConfigPath = path.join(homeDir, '.codex', 'AGENTS.md');
  const output = [];
  const io = {
    stdout: (line) => output.push(line),
    stderr: (line) => output.push(line)
  };

  await writeInitialConfig(claudeConfigPath, '# 用户自己的说明\n\n保留 Claude 内容。\n');
  await writeInitialConfig(codexConfigPath, '# Codex 用户说明\n\n保留 Codex 内容。\n');
  await installCommand({ flags: { host: 'claude-code,codex', yes: true } }, io, { homeDir, paths });

  const code = await uninstallCommand({ flags: { host: 'claude-code' } }, io, { homeDir, paths });

  assert.equal(code, 0);
  assert.match(output.join('\n'), /已移除 claude-code/);

  const claudeConfig = await readFile(claudeConfigPath, 'utf8');
  assert.match(claudeConfig, /用户自己的说明/);
  assert.match(claudeConfig, /保留 Claude 内容/);
  assert.doesNotMatch(claudeConfig, /BEGIN PROMPTIFY MANAGED BLOCK/);
  assert.doesNotMatch(claudeConfig, /Promptify for Claude Code/);

  const codexConfig = await readFile(codexConfigPath, 'utf8');
  assert.match(codexConfig, /BEGIN PROMPTIFY MANAGED BLOCK/);
  assert.match(codexConfig, /Promptify for Codex/);
});

test('uninstall treats a missing config file as already absent', async () => {
  const homeDir = await mkdtemp(path.join(os.tmpdir(), 'promptify-uninstall-missing-'));
  const paths = createPaths({ homeDir, packageRoot: process.cwd() });
  const output = [];

  const code = await uninstallCommand(
    { flags: { host: 'codex' } },
    {
      stdout: (line) => output.push(line),
      stderr: (line) => output.push(line)
    },
    { homeDir, paths }
  );

  assert.equal(code, 0);
  assert.match(output.join('\n'), /原本不存在/);
  assert.equal(await pathExists(path.join(homeDir, '.codex', 'AGENTS.md')), false);
});

test('uninstall fails cleanly for explicit empty host flag', async () => {
  const homeDir = await mkdtemp(path.join(os.tmpdir(), 'promptify-uninstall-empty-host-'));
  const errors = [];

  const code = await runCli(['uninstall', '--host='], {
    stdout: () => {},
    stderr: (line) => errors.push(line),
    homeDir,
    cwd: process.cwd()
  });

  assert.equal(code, 1);
  assert.match(errors.join('\n'), /宿主不能为空/);
});

test('uninstall fails cleanly for unknown host', async () => {
  const homeDir = await mkdtemp(path.join(os.tmpdir(), 'promptify-uninstall-unknown-host-'));
  const errors = [];

  const code = await runCli(['uninstall', '--host=unknown'], {
    stdout: () => {},
    stderr: (line) => errors.push(line),
    homeDir,
    cwd: process.cwd()
  });

  assert.equal(code, 1);
  assert.match(errors.join('\n'), /未知宿主：unknown/);
});

test('runCli dispatches update and uninstall commands', async () => {
  const homeDir = await mkdtemp(path.join(os.tmpdir(), 'promptify-cli-update-uninstall-'));
  const output = [];
  const installCode = await runCli(['install', '--host', 'claude-code'], {
    stdout: (line) => output.push(line),
    stderr: (line) => output.push(line),
    homeDir,
    cwd: process.cwd()
  });
  const updateCode = await runCli(['update'], {
    stdout: (line) => output.push(line),
    stderr: (line) => output.push(line),
    homeDir,
    cwd: process.cwd()
  });
  const uninstallCode = await runCli(['uninstall', '--host', 'claude-code'], {
    stdout: (line) => output.push(line),
    stderr: (line) => output.push(line),
    homeDir,
    cwd: process.cwd()
  });

  assert.equal(installCode, 0);
  assert.equal(updateCode, 0);
  assert.equal(uninstallCode, 0);
  assert.match(output.join('\n'), /更新完成/);
  assert.match(output.join('\n'), /已移除 claude-code/);
});

async function writeInitialConfig(configPath, content) {
  await mkdir(path.dirname(configPath), { recursive: true });
  await writeFile(configPath, content, 'utf8');
}
