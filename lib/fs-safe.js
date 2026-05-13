import { access, cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const beginMarker = '# BEGIN PROMPTIFY MANAGED BLOCK';
const endMarker = '# END PROMPTIFY MANAGED BLOCK';
const managedBlockPattern = new RegExp(`${beginMarker}[\\s\\S]*?${endMarker}\\n?`);

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

  if (managedBlockPattern.test(original)) {
    return original.replace(managedBlockPattern, block);
  }

  return `${original.replace(/\n?$/, '\n')}${block}`;
}

export function removeManagedBlock(original) {
  return original.replace(managedBlockPattern, '');
}
