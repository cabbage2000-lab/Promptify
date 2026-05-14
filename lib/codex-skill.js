import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { pathExists } from './fs-safe.js';

const skillName = 'promptify';

export function getCodexSkillPath(homeDir) {
  return path.join(homeDir, '.codex', 'skills', skillName);
}

export async function registerCodexSkill({ homeDir, installPath }) {
  const skillPath = getCodexSkillPath(homeDir);
  await rm(skillPath, { recursive: true, force: true });
  await mkdir(path.dirname(skillPath), { recursive: true });
  await cp(path.join(installPath, 'adapters', 'codex', 'skills', skillName), skillPath, {
    recursive: true
  });
  return { skillPath, skillName };
}

export async function unregisterCodexSkill({ homeDir }) {
  const skillPath = getCodexSkillPath(homeDir);
  const existed = await pathExists(skillPath);
  await rm(skillPath, { recursive: true, force: true });
  return existed;
}

export async function getCodexSkillStatus({ homeDir }) {
  const skillPath = getCodexSkillPath(homeDir);
  const requiredFiles = ['SKILL.md'];
  for (const file of requiredFiles) {
    if (!(await pathExists(path.join(skillPath, file)))) {
      return { ok: false, message: skillPath };
    }
  }
  return { ok: true, message: skillPath };
}
