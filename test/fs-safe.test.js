import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  backupFile,
  pathExists,
  readJsonIfExists,
  removeManagedBlock,
  replaceManagedBlock,
  writeJsonFile
} from '../lib/fs-safe.js';

test('pathExists returns false for missing path', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'promptify-missing-'));
  const missing = path.join(dir, 'missing.txt');

  assert.equal(await pathExists(missing), false);
});

test('writeJsonFile writes formatted JSON and readJsonIfExists reads it', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'promptify-json-'));
  const file = path.join(dir, 'nested', 'manifest.json');

  await writeJsonFile(file, { ok: true });

  assert.equal(await readFile(file, 'utf8'), '{\n  "ok": true\n}\n');
  assert.deepEqual(await readJsonIfExists(file), { ok: true });
});

test('readJsonIfExists returns null for a missing path', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'promptify-json-missing-'));

  assert.equal(await readJsonIfExists(path.join(dir, 'missing.json')), null);
});

test('backupFile copies an existing file', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'promptify-backup-'));
  const source = path.join(dir, 'source.txt');
  const backup = path.join(dir, 'nested', 'backup.txt');
  await writeFile(source, 'hello', 'utf8');

  await backupFile(source, backup);

  assert.equal(await readFile(backup, 'utf8'), 'hello');
});

test('replaceManagedBlock preserves user content', () => {
  const original = 'user config\n';
  const next = replaceManagedBlock(original, 'managed\n');

  assert.equal(next.includes('user config'), true);
  assert.equal(next.includes('# BEGIN PROMPTIFY MANAGED BLOCK'), true);
  assert.equal(next.includes('managed'), true);
  assert.equal(next.includes('# END PROMPTIFY MANAGED BLOCK'), true);
});

test('replaceManagedBlock replaces only existing managed content', () => {
  const original = [
    'before',
    '# BEGIN PROMPTIFY MANAGED BLOCK',
    'old managed',
    '# END PROMPTIFY MANAGED BLOCK',
    'after',
    ''
  ].join('\n');

  assert.equal(
    replaceManagedBlock(original, 'new managed\n'),
    [
      'before',
      '# BEGIN PROMPTIFY MANAGED BLOCK',
      'new managed',
      '# END PROMPTIFY MANAGED BLOCK',
      'after',
      ''
    ].join('\n')
  );
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
