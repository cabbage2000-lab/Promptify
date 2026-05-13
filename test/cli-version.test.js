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
