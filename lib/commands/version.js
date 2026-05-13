import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export async function versionCommand(io) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
  io.stdout(`promptify ${pkg.version}`);
  return 0;
}
