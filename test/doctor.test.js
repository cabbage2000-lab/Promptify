import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { doctorCommand, runDoctor } from '../lib/commands/doctor.js';
import { copyResources } from '../lib/resources.js';

const expectedTemplates = ['task.md', 'bugfix.md', 'feature.md', 'refactor.md', 'test.md', 'review.md', 'docs.md', 'plan.md'];
const coreBlocks = '目标：\n模式：\n上下文：\n要求：\n';

async function createMinimalInstall(prefix) {
  const dir = await mkdtemp(path.join(os.tmpdir(), prefix));
  const current = path.join(dir, 'current');
  await mkdir(path.join(current, 'shared/templates'), { recursive: true });
  await mkdir(path.join(current, 'adapters/claude-code/.claude-plugin'), { recursive: true });
  await mkdir(path.join(current, 'adapters/codex/skills/promptify'), { recursive: true });
  for (const template of expectedTemplates) {
    await writeFile(path.join(current, 'shared/templates', template), coreBlocks, 'utf8');
  }
  await writeFile(path.join(current, 'adapters/claude-code/.claude-plugin/plugin.json'), '{"name":"promptify"}\n', 'utf8');
  await writeFile(path.join(current, 'adapters/codex/skills/promptify/SKILL.md'), '# Promptify\n', 'utf8');
  return current;
}

async function createResourceSources(prefix) {
  const packageRoot = await mkdtemp(path.join(os.tmpdir(), prefix));
  const sharedSource = path.join(packageRoot, 'shared');
  const adaptersSource = path.join(packageRoot, 'adapters');
  const readmeSource = path.join(packageRoot, 'README.md');

  await mkdir(path.join(sharedSource, 'templates'), { recursive: true });
  await mkdir(path.join(adaptersSource, 'codex'), { recursive: true });
  await writeFile(path.join(sharedSource, 'templates/task.md'), coreBlocks, 'utf8');
  await writeFile(path.join(adaptersSource, 'codex/promptify.md'), '# Codex\n', 'utf8');
  await writeFile(readmeSource, '# Promptify\n', 'utf8');

  return { sharedSource, adaptersSource, readmeSource };
}

test('runDoctor reports missing install path', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'promptify-doctor-missing-'));
  const result = await runDoctor({ current: path.join(dir, 'current') });

  assert.equal(result.ok, false);
  assert.equal(result.checks.some((check) => check.name === 'install path' && !check.ok), true);
});

test('runDoctor passes for minimal installed resources', async () => {
  const current = await createMinimalInstall('promptify-doctor-ok-');
  const result = await runDoctor({ current });

  assert.equal(result.ok, true);
});

test('runDoctor fails when any expected template is missing', async () => {
  const current = await createMinimalInstall('promptify-doctor-template-missing-');
  await writeFile(path.join(current, 'shared/templates/bugfix.md'), 'missing required blocks\n', 'utf8');

  const result = await runDoctor({ current });

  assert.equal(result.ok, false);
  assert.equal(result.checks.some((check) => check.name === 'template bugfix.md' && !check.ok), true);
});

test('doctorCommand prints check status and returns success code', async () => {
  const output = [];
  const current = await createMinimalInstall('promptify-doctor-command-ok-');
  const code = await doctorCommand(
    {
      stdout: (line) => output.push(line),
      stderr: () => {}
    },
    { paths: { current } }
  );

  assert.equal(code, 0);
  assert.equal(output.every((line) => line.startsWith('OK ')), true);
});

test('doctorCommand prints failures and returns failure code', async () => {
  const output = [];
  const dir = await mkdtemp(path.join(os.tmpdir(), 'promptify-doctor-command-fail-'));
  const code = await doctorCommand(
    {
      stdout: (line) => output.push(line),
      stderr: () => {}
    },
    { paths: { current: path.join(dir, 'current') } }
  );

  assert.equal(code, 1);
  assert.equal(output.some((line) => line.startsWith('FAIL install path:')), true);
});

test('copyResources keeps current install when staging fails', async () => {
  const installRoot = await mkdtemp(path.join(os.tmpdir(), 'promptify-copy-atomic-'));
  const current = path.join(installRoot, 'current');
  const paths = {
    installRoot,
    current,
    ...(await createResourceSources('promptify-copy-sources-'))
  };
  await mkdir(current, { recursive: true });
  await writeFile(path.join(current, 'sentinel.txt'), 'keep me\n', 'utf8');
  paths.readmeSource = path.join(installRoot, 'missing-README.md');

  await assert.rejects(() => copyResources(paths));

  assert.equal(await readFile(path.join(current, 'sentinel.txt'), 'utf8'), 'keep me\n');
  assert.equal((await readdir(installRoot)).some((entry) => entry.startsWith('.staging-')), false);
});

test('copyResources replaces current after staging succeeds', async () => {
  const installRoot = await mkdtemp(path.join(os.tmpdir(), 'promptify-copy-ok-'));
  const current = path.join(installRoot, 'current');
  const paths = {
    installRoot,
    current,
    ...(await createResourceSources('promptify-copy-ok-sources-'))
  };
  await mkdir(current, { recursive: true });
  await writeFile(path.join(current, 'old.txt'), 'old\n', 'utf8');

  await copyResources(paths);

  assert.equal(await readFile(path.join(current, 'README.md'), 'utf8'), '# Promptify\n');
  await assert.rejects(() => readFile(path.join(current, 'old.txt'), 'utf8'));
});
