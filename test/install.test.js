import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { parseArgs, runCli } from '../lib/cli.js';
import { installCommand } from '../lib/commands/install.js';
import { createPaths } from '../lib/paths.js';
import { readJsonIfExists } from '../lib/fs-safe.js';

test('parseArgs supports flags with separate values', () => {
  assert.deepEqual(parseArgs(['install', '--host', 'claude-code,codex']), {
    command: 'install',
    flags: { host: 'claude-code,codex' },
    values: []
  });
});

test('parseArgs preserves inline flag values after the first equals', () => {
  assert.deepEqual(parseArgs(['install', '--foo=a=b']), {
    command: 'install',
    flags: { foo: 'a=b' },
    values: []
  });
});

test('installCommand copies resources, preserves config, and writes manifest', async () => {
  const homeDir = await mkdtemp(path.join(os.tmpdir(), 'promptify-home-'));
  const packageRoot = process.cwd();
  const paths = createPaths({ homeDir, packageRoot });
  const configPath = path.join(homeDir, '.claude', 'CLAUDE.md');
  const output = [];

  await mkdir(path.dirname(configPath), { recursive: true });
  await writeInitialConfig(configPath);

  const code = await installCommand(
    { flags: { host: 'claude-code', yes: true } },
    {
      stdout: (line) => output.push(line),
      stderr: (line) => output.push(line)
    },
    { homeDir, paths }
  );

  assert.equal(code, 0);
  assert.match(output.join('\n'), /安装完成/);

  const config = await readFile(configPath, 'utf8');
  assert.match(config, /用户自己的说明/);
  assert.match(config, /BEGIN PROMPTIFY MANAGED BLOCK/);
  assert.match(config, /Promptify for Claude Code/);
  assert.match(config, /END PROMPTIFY MANAGED BLOCK/);

  assert.match(await readFile(path.join(paths.current, 'README.md'), 'utf8'), /Promptify/);
  assert.match(await readFile(path.join(paths.current, 'shared', 'templates', 'task.md'), 'utf8'), /目标：/);

  const manifest = await readJsonIfExists(paths.manifest);
  const pkg = JSON.parse(await readFile(path.join(packageRoot, 'package.json'), 'utf8'));
  assert.equal(manifest.version, pkg.version);
  assert.equal(manifest.installPath, paths.current);
  assert.deepEqual(manifest.hosts, ['claude-code']);
  assert.equal(manifest.backups.length, 1);
  assert.equal(manifest.backups[0].host, 'claude-code');
  assert.equal(manifest.backups[0].path, configPath);
  assert.match(await readFile(manifest.backups[0].backupPath, 'utf8'), /用户自己的说明/);
});

test('runCli dispatches install with temporary home directory', async () => {
  const homeDir = await mkdtemp(path.join(os.tmpdir(), 'promptify-cli-home-'));
  const output = [];
  const code = await runCli(['install', '--host=codex'], {
    stdout: (line) => output.push(line),
    stderr: (line) => output.push(line),
    homeDir,
    cwd: process.cwd()
  });

  assert.equal(code, 0);
  assert.match(output.join('\n'), /安装完成：codex/);

  const config = await readFile(path.join(homeDir, '.codex', 'AGENTS.md'), 'utf8');
  assert.match(config, /BEGIN PROMPTIFY MANAGED BLOCK/);
  assert.match(config, /Promptify for Codex/);
});

test('runCli fails cleanly for explicit empty host flag', async () => {
  const homeDir = await mkdtemp(path.join(os.tmpdir(), 'promptify-empty-host-'));
  const output = [];
  const errors = [];

  const code = await runCli(['install', '--host='], {
    stdout: (line) => output.push(line),
    stderr: (line) => errors.push(line),
    homeDir,
    cwd: process.cwd()
  });

  assert.equal(code, 1);
  assert.deepEqual(output, []);
  assert.match(errors.join('\n'), /宿主不能为空/);
});

test('runCli fails cleanly for unknown install host', async () => {
  const homeDir = await mkdtemp(path.join(os.tmpdir(), 'promptify-unknown-host-'));
  const output = [];
  const errors = [];

  const code = await runCli(['install', '--host=unknown'], {
    stdout: (line) => output.push(line),
    stderr: (line) => errors.push(line),
    homeDir,
    cwd: process.cwd()
  });

  assert.equal(code, 1);
  assert.deepEqual(output, []);
  assert.match(errors.join('\n'), /未知宿主：unknown/);
});

async function writeInitialConfig(configPath) {
  await mkdir(path.dirname(configPath), { recursive: true });
  await writeFile(configPath, '# 用户自己的说明\n\n保留这一段。\n', 'utf8');
}
