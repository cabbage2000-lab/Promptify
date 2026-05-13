# Promptify NPM CLI Install Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a lightweight NPM global CLI that installs, updates, uninstalls, and verifies Promptify for Claude Code and Codex.

**Architecture:** Keep Promptify's product behavior in Markdown under `shared/` and `adapters/`. Add a small Node.js CLI layer that copies packaged resources into `~/.promptify/current/`, plans host configuration changes, creates backups, applies confirmed Promptify-managed blocks, and runs read-only doctor checks.

**Tech Stack:** Node.js ESM, built-in `fs/promises`, `path`, `os`, `readline/promises`, `node:test`, Markdown assets, JSON package metadata.

---

## File Structure

Create these files:

```text
package.json
bin/promptify.js
lib/cli.js
lib/commands/install.js
lib/commands/update.js
lib/commands/uninstall.js
lib/commands/doctor.js
lib/commands/version.js
lib/paths.js
lib/fs-safe.js
lib/prompt.js
lib/resources.js
lib/hosts/index.js
lib/hosts/claude-code.js
lib/hosts/codex.js
test/paths.test.js
test/fs-safe.test.js
test/doctor.test.js
test/hosts.test.js
```

Modify these files:

```text
README.md
docs/release/install-update-plan.md
prd/promptify-prd.md
AGENTS.md
```

Responsibilities:

- `package.json`: NPM metadata, `bin` entry, files allowlist, test scripts.
- `bin/promptify.js`: executable Node entrypoint.
- `lib/cli.js`: parse command-line arguments and dispatch commands.
- `lib/commands/install.js`: interactive and non-interactive install flow.
- `lib/commands/update.js`: refresh installed resources and rerun doctor.
- `lib/commands/uninstall.js`: remove managed blocks and optionally restore backup.
- `lib/commands/doctor.js`: read-only verification.
- `lib/commands/version.js`: print package version.
- `lib/paths.js`: resolve install, backup, package resource, and host paths.
- `lib/fs-safe.js`: safe mkdir, copy, JSON read/write, backup helpers.
- `lib/prompt.js`: readline-based confirmation and multi-select helpers.
- `lib/resources.js`: copy `shared/`, `adapters/`, and docs into install path.
- `lib/hosts/*.js`: host-specific detect, plan, apply, uninstall, and doctor behavior.
- `test/*.test.js`: Node test coverage for path resolution, safe writes, doctor checks, and host planning.

## Task 1: Add NPM Package Skeleton

**Files:**
- Create: `package.json`
- Create: `bin/promptify.js`
- Create: `lib/cli.js`
- Create: `lib/commands/version.js`
- Test: `test/cli-version.test.js`

- [ ] **Step 1: Write the failing CLI version test**

Create `test/cli-version.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseArgs, runCli } from '../lib/cli.js';

test('parseArgs defaults to help for empty input', () => {
  assert.deepEqual(parseArgs([]), { command: 'help', flags: {}, values: [] });
});

test('parseArgs reads version command', () => {
  assert.deepEqual(parseArgs(['version']), { command: 'version', flags: {}, values: [] });
});

test('runCli returns package version output', async () => {
  const output = [];
  const code = await runCli(['version'], {
    stdout: (line) => output.push(line),
    stderr: () => {},
    cwd: process.cwd()
  });

  assert.equal(code, 0);
  assert.match(output.join('\n'), /^promptify \d+\.\d+\.\d+/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
node --test test/cli-version.test.js
```

Expected: FAIL with module-not-found errors for `../lib/cli.js`.

- [ ] **Step 3: Create package metadata**

Create `package.json`:

```json
{
  "name": "promptify",
  "version": "0.1.0",
  "description": "Markdown-first task workflow package for Claude Code and Codex.",
  "type": "module",
  "bin": {
    "promptify": "./bin/promptify.js"
  },
  "files": [
    "bin/",
    "lib/",
    "shared/",
    "adapters/",
    "README.md",
    "docs/release/"
  ],
  "scripts": {
    "test": "node --test",
    "pack:check": "npm pack --dry-run"
  },
  "engines": {
    "node": ">=18"
  },
  "license": "MIT"
}
```

- [ ] **Step 4: Create CLI entrypoint and dispatcher**

Create `bin/promptify.js`:

```js
#!/usr/bin/env node
import { runCli } from '../lib/cli.js';

const code = await runCli(process.argv.slice(2), {
  stdout: (line) => console.log(line),
  stderr: (line) => console.error(line),
  cwd: process.cwd()
});

process.exitCode = code;
```

Create `lib/cli.js`:

```js
import { versionCommand } from './commands/version.js';

export function parseArgs(argv) {
  const [command = 'help', ...rest] = argv;
  const flags = {};
  const values = [];

  for (const item of rest) {
    if (item.startsWith('--')) {
      const [key, value = true] = item.slice(2).split('=');
      flags[key] = value;
    } else {
      values.push(item);
    }
  }

  return { command, flags, values };
}

export async function runCli(argv, io) {
  const args = parseArgs(argv);

  if (args.command === 'version') {
    return versionCommand(io);
  }

  if (args.command === 'help') {
    io.stdout('promptify install|update|uninstall|doctor|version');
    return 0;
  }

  io.stderr(`未知命令：${args.command}`);
  return 1;
}
```

Create `lib/commands/version.js`:

```js
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export async function versionCommand(io) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
  io.stdout(`promptify ${pkg.version}`);
  return 0;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run:

```bash
node --test test/cli-version.test.js
```

Expected: PASS.

- [ ] **Step 6: Make executable and commit**

Run:

```bash
chmod +x bin/promptify.js
git add package.json bin/promptify.js lib/cli.js lib/commands/version.js test/cli-version.test.js
git commit -m "feat: add promptify npm cli skeleton"
```

## Task 2: Add Path And Safe Filesystem Helpers

**Files:**
- Create: `lib/paths.js`
- Create: `lib/fs-safe.js`
- Test: `test/paths.test.js`
- Test: `test/fs-safe.test.js`

- [ ] **Step 1: Write path tests**

Create `test/paths.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { createPaths } from '../lib/paths.js';

test('createPaths resolves promptify install layout', () => {
  const paths = createPaths({ homeDir: '/tmp/home', packageRoot: '/tmp/pkg' });

  assert.equal(paths.installRoot, path.join('/tmp/home', '.promptify'));
  assert.equal(paths.current, path.join('/tmp/home', '.promptify', 'current'));
  assert.equal(paths.backups, path.join('/tmp/home', '.promptify', 'backups'));
  assert.equal(paths.sharedSource, path.join('/tmp/pkg', 'shared'));
  assert.equal(paths.adaptersSource, path.join('/tmp/pkg', 'adapters'));
});
```

- [ ] **Step 2: Write fs-safe tests**

Create `test/fs-safe.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathExists, readJsonIfExists, writeJsonFile, backupFile, replaceManagedBlock, removeManagedBlock } from '../lib/fs-safe.js';

test('pathExists returns false for missing path', async () => {
  assert.equal(await pathExists('/tmp/promptify-missing-path-for-test'), false);
});

test('writeJsonFile writes formatted JSON', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'promptify-json-'));
  const file = path.join(dir, 'manifest.json');

  await writeJsonFile(file, { ok: true });

  assert.deepEqual(await readJsonIfExists(file), { ok: true });
});

test('backupFile copies an existing file', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'promptify-backup-'));
  const source = path.join(dir, 'source.txt');
  const backup = path.join(dir, 'backup.txt');
  await writeFile(source, 'hello', 'utf8');

  await backupFile(source, backup);

  assert.equal(await readFile(backup, 'utf8'), 'hello');
});

test('replaceManagedBlock preserves user content', () => {
  const original = 'user config\n';
  const next = replaceManagedBlock(original, 'managed\n');

  assert.equal(next.includes('user config'), true);
  assert.equal(next.includes('BEGIN PROMPTIFY MANAGED BLOCK'), true);
  assert.equal(next.includes('managed'), true);
});

test('removeManagedBlock preserves surrounding content', () => {
  const original = [
    'before',
    '# BEGIN PROMPTIFY MANAGED BLOCK',
    'managed',
    '# END PROMPTIFY MANAGED BLOCK',
    'after',
    ''
  ].join('\n');

  assert.equal(removeManagedBlock(original), 'before\nafter\n');
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run:

```bash
node --test test/paths.test.js test/fs-safe.test.js
```

Expected: FAIL with module-not-found errors for `lib/paths.js` and `lib/fs-safe.js`.

- [ ] **Step 4: Implement helpers**

Create `lib/paths.js`:

```js
import path from 'node:path';

export function createPaths({ homeDir, packageRoot }) {
  const installRoot = path.join(homeDir, '.promptify');
  return {
    installRoot,
    current: path.join(installRoot, 'current'),
    backups: path.join(installRoot, 'backups'),
    manifest: path.join(installRoot, 'manifest.json'),
    sharedSource: path.join(packageRoot, 'shared'),
    adaptersSource: path.join(packageRoot, 'adapters'),
    readmeSource: path.join(packageRoot, 'README.md')
  };
}
```

Create `lib/fs-safe.js`:

```js
import { access, cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const beginMarker = '# BEGIN PROMPTIFY MANAGED BLOCK';
const endMarker = '# END PROMPTIFY MANAGED BLOCK';

export async function pathExists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

export async function readJsonIfExists(target) {
  if (!(await pathExists(target))) {
    return null;
  }
  return JSON.parse(await readFile(target, 'utf8'));
}

export async function writeJsonFile(target, value) {
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

export async function backupFile(source, destination) {
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(source, destination, { recursive: true, force: true });
}

export function replaceManagedBlock(original, managedContent) {
  const block = `${beginMarker}\n${managedContent.trim()}\n${endMarker}\n`;
  const pattern = new RegExp(`${beginMarker}[\\s\\S]*?${endMarker}\\n?`);

  if (pattern.test(original)) {
    return original.replace(pattern, block);
  }

  return `${original.replace(/\n?$/, '\n')}${block}`;
}

export function removeManagedBlock(original) {
  const pattern = new RegExp(`${beginMarker}[\\s\\S]*?${endMarker}\\n?`);
  return original.replace(pattern, '');
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run:

```bash
node --test test/paths.test.js test/fs-safe.test.js
```

Expected: PASS.

- [ ] **Step 6: Commit**

Run:

```bash
git add lib/paths.js lib/fs-safe.js test/paths.test.js test/fs-safe.test.js
git commit -m "feat: add promptify install path helpers"
```

## Task 3: Add Resource Copy And Doctor Checks

**Files:**
- Create: `lib/resources.js`
- Create: `lib/commands/doctor.js`
- Modify: `lib/cli.js`
- Test: `test/doctor.test.js`

- [ ] **Step 1: Write doctor tests**

Create `test/doctor.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { mkdtemp } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { runDoctor } from '../lib/commands/doctor.js';

test('runDoctor reports missing install path', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'promptify-doctor-missing-'));
  const result = await runDoctor({ current: path.join(dir, 'current') });

  assert.equal(result.ok, false);
  assert.equal(result.checks.some((check) => check.name === 'install path' && !check.ok), true);
});

test('runDoctor passes for minimal installed resources', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'promptify-doctor-ok-'));
  const current = path.join(dir, 'current');
  await mkdir(path.join(current, 'shared/templates'), { recursive: true });
  await mkdir(path.join(current, 'adapters/claude-code/.claude-plugin'), { recursive: true });
  await mkdir(path.join(current, 'adapters/codex/skills/promptify'), { recursive: true });
  await writeFile(path.join(current, 'shared/templates/task.md'), '目标：\n模式：\n上下文：\n要求：\n', 'utf8');
  await writeFile(path.join(current, 'adapters/claude-code/.claude-plugin/plugin.json'), '{"name":"promptify"}\n', 'utf8');
  await writeFile(path.join(current, 'adapters/codex/skills/promptify/SKILL.md'), '# Promptify\n', 'utf8');

  const result = await runDoctor({ current });

  assert.equal(result.ok, true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
node --test test/doctor.test.js
```

Expected: FAIL with module-not-found error for `lib/commands/doctor.js`.

- [ ] **Step 3: Implement resource copy helper**

Create `lib/resources.js`:

```js
import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';

export async function copyResources(paths) {
  await rm(paths.current, { recursive: true, force: true });
  await mkdir(paths.current, { recursive: true });
  await cp(paths.sharedSource, path.join(paths.current, 'shared'), { recursive: true });
  await cp(paths.adaptersSource, path.join(paths.current, 'adapters'), { recursive: true });
  await cp(paths.readmeSource, path.join(paths.current, 'README.md'));
}
```

- [ ] **Step 4: Implement doctor command**

Create `lib/commands/doctor.js`:

```js
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathExists } from '../fs-safe.js';

export async function runDoctor({ current }) {
  const checks = [];
  const add = (name, ok, message) => checks.push({ name, ok, message });

  add('install path', await pathExists(current), current);
  add('shared templates', await pathExists(path.join(current, 'shared/templates')), 'shared/templates');

  const pluginJson = path.join(current, 'adapters/claude-code/.claude-plugin/plugin.json');
  try {
    JSON.parse(await readFile(pluginJson, 'utf8'));
    add('claude plugin json', true, pluginJson);
  } catch (error) {
    add('claude plugin json', false, error.message);
  }

  add(
    'codex skill',
    await pathExists(path.join(current, 'adapters/codex/skills/promptify/SKILL.md')),
    'adapters/codex/skills/promptify/SKILL.md'
  );

  let templateText = '';
  try {
    templateText = await readFile(path.join(current, 'shared/templates/task.md'), 'utf8');
  } catch {
    templateText = '';
  }
  add('template core blocks', ['目标：', '模式：', '上下文：', '要求：'].every((item) => templateText.includes(item)), 'task template');

  return { ok: checks.every((check) => check.ok), checks };
}

export async function doctorCommand(io, context) {
  const result = await runDoctor(context.paths);
  for (const check of result.checks) {
    io.stdout(`${check.ok ? 'OK' : 'FAIL'} ${check.name}: ${check.message}`);
  }
  return result.ok ? 0 : 1;
}
```

- [ ] **Step 5: Wire doctor command**

Modify `lib/cli.js` to import `doctorCommand`, construct paths with `os.homedir()` and package root, and dispatch `doctor`.

The final `runCli` must support:

```js
if (args.command === 'doctor') {
  return doctorCommand(io, context);
}
```

- [ ] **Step 6: Run tests**

Run:

```bash
node --test test/doctor.test.js test/cli-version.test.js
```

Expected: PASS.

- [ ] **Step 7: Commit**

Run:

```bash
git add lib/resources.js lib/commands/doctor.js lib/cli.js test/doctor.test.js
git commit -m "feat: add promptify doctor checks"
```

## Task 4: Add Host Planning Modules

**Files:**
- Create: `lib/hosts/index.js`
- Create: `lib/hosts/claude-code.js`
- Create: `lib/hosts/codex.js`
- Test: `test/hosts.test.js`

- [ ] **Step 1: Write host planning tests**

Create `test/hosts.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { getHosts } from '../lib/hosts/index.js';

test('getHosts returns selected host modules', () => {
  const hosts = getHosts(['claude-code', 'codex']);

  assert.equal(hosts.length, 2);
  assert.deepEqual(hosts.map((host) => host.id), ['claude-code', 'codex']);
});

test('claude-code install plan uses managed block', async () => {
  const [host] = getHosts(['claude-code']);
  const plan = await host.planInstall({
    installPath: '/tmp/promptify/current',
    configPath: '/tmp/claude/config.json'
  });

  assert.equal(plan.host, 'claude-code');
  assert.equal(plan.configPath, '/tmp/claude/config.json');
  assert.match(plan.content, /adapters\/claude-code/);
});

test('codex install plan uses managed block', async () => {
  const [, host] = getHosts(['claude-code', 'codex']);
  const plan = await host.planInstall({
    installPath: '/tmp/promptify/current',
    configPath: '/tmp/codex/instructions.md'
  });

  assert.equal(plan.host, 'codex');
  assert.match(plan.content, /adapters\/codex\/skills\/promptify\/SKILL.md/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
node --test test/hosts.test.js
```

Expected: FAIL with module-not-found error for `lib/hosts/index.js`.

- [ ] **Step 3: Implement host registry**

Create `lib/hosts/index.js`:

```js
import { claudeCodeHost } from './claude-code.js';
import { codexHost } from './codex.js';

const allHosts = {
  'claude-code': claudeCodeHost,
  codex: codexHost
};

export function getHosts(ids) {
  return ids.map((id) => {
    const host = allHosts[id];
    if (!host) {
      throw new Error(`未知宿主：${id}`);
    }
    return host;
  });
}
```

- [ ] **Step 4: Implement Claude Code host planning**

Create `lib/hosts/claude-code.js`:

```js
import path from 'node:path';

export const claudeCodeHost = {
  id: 'claude-code',
  label: 'Claude Code',
  defaultConfigPath(homeDir) {
    return path.join(homeDir, '.claude', 'promptify.md');
  },
  async planInstall({ installPath, configPath }) {
    return {
      host: 'claude-code',
      configPath,
      content: [
        `Promptify adapter: ${path.join(installPath, 'adapters/claude-code')}`,
        `Promptify shared: ${path.join(installPath, 'shared')}`,
        ''
      ].join('\n')
    };
  }
};
```

- [ ] **Step 5: Implement Codex host planning**

Create `lib/hosts/codex.js`:

```js
import path from 'node:path';

export const codexHost = {
  id: 'codex',
  label: 'Codex',
  defaultConfigPath(homeDir) {
    return path.join(homeDir, '.codex', 'promptify.md');
  },
  async planInstall({ installPath, configPath }) {
    return {
      host: 'codex',
      configPath,
      content: [
        `Promptify skill: ${path.join(installPath, 'adapters/codex/skills/promptify/SKILL.md')}`,
        `Promptify fallback instructions: ${path.join(installPath, 'adapters/codex/instructions/promptify.md')}`,
        ''
      ].join('\n')
    };
  }
};
```

- [ ] **Step 6: Run test to verify it passes**

Run:

```bash
node --test test/hosts.test.js
```

Expected: PASS.

- [ ] **Step 7: Commit**

Run:

```bash
git add lib/hosts/index.js lib/hosts/claude-code.js lib/hosts/codex.js test/hosts.test.js
git commit -m "feat: add promptify host install plans"
```

## Task 5: Implement Install Command

**Files:**
- Create: `lib/commands/install.js`
- Create: `lib/prompt.js`
- Modify: `lib/cli.js`
- Test: `test/install.test.js`

- [ ] **Step 1: Write install tests**

Create `test/install.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { installCommand } from '../lib/commands/install.js';
import { createPaths } from '../lib/paths.js';

test('installCommand copies resources and writes selected host config', async () => {
  const homeDir = await mkdtemp(path.join(os.tmpdir(), 'promptify-home-'));
  const packageRoot = process.cwd();
  const paths = createPaths({ homeDir, packageRoot });
  const output = [];

  const code = await installCommand(
    { flags: { host: 'claude-code', yes: true } },
    {
      stdout: (line) => output.push(line),
      stderr: (line) => output.push(line)
    },
    { homeDir, paths }
  );

  assert.equal(code, 0);
  const config = await readFile(path.join(homeDir, '.claude', 'promptify.md'), 'utf8');
  assert.match(config, /BEGIN PROMPTIFY MANAGED BLOCK/);
  assert.match(output.join('\n'), /安装完成/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
node --test test/install.test.js
```

Expected: FAIL with module-not-found error for `lib/commands/install.js`.

- [ ] **Step 3: Implement prompt helpers**

Create `lib/prompt.js`:

```js
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

export async function confirm(message) {
  const rl = createInterface({ input, output });
  const answer = await rl.question(`${message} [y/N] `);
  rl.close();
  return answer.trim().toLowerCase() === 'y';
}

export function parseHostFlag(value) {
  if (!value) {
    return [];
  }
  return String(value).split(',').map((item) => item.trim()).filter(Boolean);
}
```

- [ ] **Step 4: Implement install command**

Create `lib/commands/install.js`:

```js
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { copyResources } from '../resources.js';
import { backupFile, pathExists, replaceManagedBlock, writeJsonFile } from '../fs-safe.js';
import { parseHostFlag } from '../prompt.js';
import { getHosts } from '../hosts/index.js';

export async function installCommand(args, io, context) {
  const hostIds = parseHostFlag(args.flags.host || 'claude-code');
  const hosts = getHosts(hostIds);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupRoot = path.join(context.paths.backups, timestamp);

  await copyResources(context.paths);

  const installedHosts = [];
  const backups = [];

  for (const host of hosts) {
    const configPath = host.defaultConfigPath(context.homeDir);
    const plan = await host.planInstall({ installPath: context.paths.current, configPath });
    const backupPath = path.join(backupRoot, 'hosts', host.id);

    if (await pathExists(configPath)) {
      await backupFile(configPath, backupPath);
      backups.push({ host: host.id, path: configPath, backupPath });
    }

    const original = (await pathExists(configPath)) ? await readFile(configPath, 'utf8') : '';
    await mkdir(path.dirname(configPath), { recursive: true });
    await writeFile(configPath, replaceManagedBlock(original, plan.content), 'utf8');
    installedHosts.push(host.id);
  }

  await writeJsonFile(context.paths.manifest, {
    version: '0.1.0',
    installedAt: new Date().toISOString(),
    installPath: context.paths.current,
    hosts: installedHosts,
    backups
  });

  io.stdout(`安装完成：${installedHosts.join(', ')}`);
  return 0;
}
```

- [ ] **Step 5: Wire install command**

Modify `lib/cli.js` to dispatch:

```js
if (args.command === 'install') {
  return installCommand(args, io, context);
}
```

- [ ] **Step 6: Run tests**

Run:

```bash
node --test test/install.test.js test/hosts.test.js test/doctor.test.js
```

Expected: PASS.

- [ ] **Step 7: Commit**

Run:

```bash
git add lib/commands/install.js lib/prompt.js lib/cli.js test/install.test.js
git commit -m "feat: add promptify install command"
```

## Task 6: Implement Update And Uninstall Commands

**Files:**
- Create: `lib/commands/update.js`
- Create: `lib/commands/uninstall.js`
- Modify: `lib/cli.js`
- Test: `test/update-uninstall.test.js`

- [ ] **Step 1: Write update and uninstall tests**

Create `test/update-uninstall.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createPaths } from '../lib/paths.js';
import { installCommand } from '../lib/commands/install.js';
import { updateCommand } from '../lib/commands/update.js';
import { uninstallCommand } from '../lib/commands/uninstall.js';

test('update refreshes resources after install', async () => {
  const homeDir = await mkdtemp(path.join(os.tmpdir(), 'promptify-update-'));
  const paths = createPaths({ homeDir, packageRoot: process.cwd() });
  const io = { stdout: () => {}, stderr: () => {} };

  await installCommand({ flags: { host: 'codex', yes: true } }, io, { homeDir, paths });
  const code = await updateCommand({ flags: {} }, io, { homeDir, paths });

  assert.equal(code, 0);
});

test('uninstall removes selected host config', async () => {
  const homeDir = await mkdtemp(path.join(os.tmpdir(), 'promptify-uninstall-'));
  const paths = createPaths({ homeDir, packageRoot: process.cwd() });
  const io = { stdout: () => {}, stderr: () => {} };

  await installCommand({ flags: { host: 'claude-code', yes: true } }, io, { homeDir, paths });
  const code = await uninstallCommand({ flags: { host: 'claude-code', yes: true } }, io, { homeDir, paths });

  assert.equal(code, 0);
  const config = await readFile(path.join(homeDir, '.claude', 'promptify.md'), 'utf8');
  assert.equal(config.includes('BEGIN PROMPTIFY MANAGED BLOCK'), false);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
node --test test/update-uninstall.test.js
```

Expected: FAIL with module-not-found errors for update and uninstall commands.

- [ ] **Step 3: Implement update command**

Create `lib/commands/update.js`:

```js
import { copyResources } from '../resources.js';
import { doctorCommand } from './doctor.js';

export async function updateCommand(args, io, context) {
  await copyResources(context.paths);
  io.stdout('资源更新完成');
  return doctorCommand(io, context);
}
```

- [ ] **Step 4: Implement uninstall command**

Create `lib/commands/uninstall.js`:

```js
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseHostFlag } from '../prompt.js';
import { getHosts } from '../hosts/index.js';
import { pathExists, removeManagedBlock } from '../fs-safe.js';

export async function uninstallCommand(args, io, context) {
  const hostIds = parseHostFlag(args.flags.host || 'claude-code');
  const hosts = getHosts(hostIds);

  for (const host of hosts) {
    const configPath = host.defaultConfigPath(context.homeDir);
    const original = (await pathExists(configPath)) ? await readFile(configPath, 'utf8') : '';
    await mkdir(path.dirname(configPath), { recursive: true });
    await writeFile(configPath, removeManagedBlock(original), 'utf8');
    io.stdout(`已移除 ${host.id} 配置中的 Promptify 管理片段`);
  }

  return 0;
}
```

- [ ] **Step 5: Wire update and uninstall commands**

Modify `lib/cli.js` to dispatch:

```js
if (args.command === 'update') {
  return updateCommand(args, io, context);
}

if (args.command === 'uninstall') {
  return uninstallCommand(args, io, context);
}
```

- [ ] **Step 6: Run tests**

Run:

```bash
node --test test/update-uninstall.test.js test/install.test.js test/doctor.test.js
```

Expected: PASS.

- [ ] **Step 7: Commit**

Run:

```bash
git add lib/commands/update.js lib/commands/uninstall.js lib/cli.js test/update-uninstall.test.js
git commit -m "feat: add promptify update and uninstall commands"
```

## Task 7: Update Documentation And Release Checks

**Files:**
- Modify: `README.md`
- Modify: `docs/release/install-update-plan.md`
- Modify: `shared/test-plan.md`

- [ ] **Step 1: Document final CLI commands**

Update `README.md` installation section to include:

```markdown
推荐安装：

```bash
npm install -g promptify
promptify install
promptify doctor
```

升级：

```bash
promptify update
```

卸载：

```bash
promptify uninstall
```

安全行为：

- `promptify install` 允许选择 Claude Code、Codex 或两者。
- 写入宿主配置前会展示变更摘要。
- 写入前会创建备份。
- `promptify doctor` 只检查，不修改文件。
```

- [ ] **Step 2: Document release checks**

Update `docs/release/install-update-plan.md` release checks to include:

```bash
npm test
npm pack --dry-run
node bin/promptify.js version
node bin/promptify.js doctor
```

- [ ] **Step 3: Update manual QA checklist**

Update `shared/test-plan.md` with an NPM CLI checklist:

```markdown
## NPM CLI

- Run `npm test`.
- Run `npm pack --dry-run`.
- Run `node bin/promptify.js version`.
- Run `node bin/promptify.js doctor` after installing fixtures or a local install.
- Verify install/update/uninstall tests use temporary home directories.
```

- [ ] **Step 4: Run full verification**

Run:

```bash
npm test
npm pack --dry-run
rg -n "目标：|模式：|上下文：|要求：" shared/templates
rg -n "analysis-first|prompt-only|review-only|plan-only|shared/templates" adapters
rg -n "T[B]D|T[O]DO|implement late[r]|fill in detail[s]" shared adapters README.md AGENTS.md
python3 -m json.tool adapters/claude-code/.claude-plugin/plugin.json
git diff --check HEAD
```

Expected:

- `npm test` passes.
- `npm pack --dry-run` lists only expected package files.
- Existing Promptify scans match documented expectations.
- `git diff --check HEAD` reports no whitespace errors.

- [ ] **Step 5: Commit**

Run:

```bash
git add README.md docs/release/install-update-plan.md shared/test-plan.md
git commit -m "docs: document promptify npm cli workflow"
```

## Self-Review

- Spec coverage: tasks cover package skeleton, path helpers, resource copy, doctor, host selection, install, update, uninstall, docs, and release checks.
- Placeholder scan: this plan avoids banned placeholder words and includes concrete file paths, test commands, and expected results.
- Type consistency: command functions consistently accept `(args, io, context)` except `versionCommand(io)`, which does not need args or context.
