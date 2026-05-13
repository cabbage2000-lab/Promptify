import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { createPaths } from '../lib/paths.js';

test('createPaths resolves promptify install layout', () => {
  const paths = createPaths({ homeDir: '/tmp/home', packageRoot: '/tmp/pkg' });

  assert.equal(paths.installRoot, path.join('/tmp/home', '.promptify'));
  assert.equal(paths.current, path.join('/tmp/home', '.promptify', 'current'));
  assert.equal(paths.backups, path.join('/tmp/home', '.promptify', 'backups'));
  assert.equal(paths.manifest, path.join('/tmp/home', '.promptify', 'manifest.json'));
  assert.equal(paths.sharedSource, path.join('/tmp/pkg', 'shared'));
  assert.equal(paths.adaptersSource, path.join('/tmp/pkg', 'adapters'));
  assert.equal(paths.readmeSource, path.join('/tmp/pkg', 'README.md'));
});
