import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { getHosts } from '../lib/hosts/index.js';

test('getHosts returns selected host modules in requested order', () => {
  const hosts = getHosts(['claude-code', 'codex']);

  assert.equal(hosts.length, 2);
  assert.deepEqual(hosts.map((host) => host.id), ['claude-code', 'codex']);
  assert.deepEqual(hosts.map((host) => host.label), ['Claude Code', 'Codex']);
});

test('getHosts throws Chinese error for unknown host', () => {
  assert.throws(() => getHosts(['unknown']), /未知宿主：unknown/);
});

test('claude-code default config path uses home .claude promptify file', () => {
  const [host] = getHosts(['claude-code']);

  assert.equal(
    host.defaultConfigPath('/tmp/home'),
    path.join('/tmp/home', '.claude', 'CLAUDE.md')
  );
});

test('codex default config path uses home .codex agents file', () => {
  const [host] = getHosts(['codex']);

  assert.equal(host.defaultConfigPath('/tmp/home'), path.join('/tmp/home', '.codex', 'AGENTS.md'));
});

test('claude-code install plan references adapter and shared paths without markers', async () => {
  const [host] = getHosts(['claude-code']);
  const installPath = '/tmp/promptify/current';
  const configPath = path.join('/tmp/home', '.claude', 'CLAUDE.md');
  const plan = await host.planInstall({
    installPath,
    configPath
  });

  assert.equal(plan.host, 'claude-code');
  assert.equal(plan.configPath, configPath);
  assert.ok(plan.content.includes(path.join(installPath, 'adapters', 'claude-code')));
  assert.ok(plan.content.includes(path.join(installPath, 'shared')));
  assert.doesNotMatch(plan.content, /BEGIN/);
  assert.doesNotMatch(plan.content, /END/);
});

test('codex install plan references skill, instructions, and shared paths without markers', async () => {
  const [host] = getHosts(['codex']);
  const installPath = '/tmp/promptify/current';
  const configPath = path.join('/tmp/home', '.codex', 'AGENTS.md');
  const plan = await host.planInstall({
    installPath,
    configPath
  });

  assert.equal(plan.host, 'codex');
  assert.equal(plan.configPath, configPath);
  assert.ok(
    plan.content.includes(path.join(installPath, 'adapters', 'codex', 'skills', 'promptify', 'SKILL.md'))
  );
  assert.ok(
    plan.content.includes(path.join(installPath, 'adapters', 'codex', 'instructions', 'promptify.md'))
  );
  assert.ok(plan.content.includes(path.join(installPath, 'shared')));
  assert.doesNotMatch(plan.content, /BEGIN/);
  assert.doesNotMatch(plan.content, /END/);
});
