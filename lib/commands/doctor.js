import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { getClaudeCodePluginStatus } from '../claude-code-plugin.js';
import { getCodexSkillStatus } from '../codex-skill.js';
import { pathExists } from '../fs-safe.js';

const expectedTemplates = ['task.md', 'bugfix.md', 'feature.md', 'refactor.md', 'test.md', 'review.md', 'docs.md', 'plan.md'];
const requiredTemplateBlocks = ['目标：', '模式：', '上下文：', '要求：'];

export async function runDoctor({ current, homeDir, manifest }) {
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

  if (homeDir && (await shouldCheckClaudePlugin(manifest))) {
    const claudePlugin = await getClaudeCodePluginStatus({ homeDir });
    add('claude plugin registration', claudePlugin.ok, claudePlugin.message);
  }

  if (homeDir && (await shouldCheckInstalledHost(manifest, 'codex'))) {
    const codexSkill = await getCodexSkillStatus({ homeDir });
    add('codex skill registration', codexSkill.ok, codexSkill.message);
  }

  for (const template of expectedTemplates) {
    const templatePath = path.join(current, 'shared/templates', template);
    let templateText = '';
    try {
      templateText = await readFile(templatePath, 'utf8');
    } catch {
      templateText = '';
    }
    add(
      `template ${template}`,
      requiredTemplateBlocks.every((item) => templateText.includes(item)),
      path.join('shared/templates', template)
    );
  }

  return { ok: checks.every((check) => check.ok), checks };
}

export async function doctorCommand(io, context) {
  const result = await runDoctor({ ...context.paths, homeDir: context.homeDir });
  for (const check of result.checks) {
    io.stdout(`${check.ok ? 'OK' : 'FAIL'} ${check.name}: ${check.message}`);
  }
  return result.ok ? 0 : 1;
}

async function shouldCheckClaudePlugin(manifest) {
  return shouldCheckInstalledHost(manifest, 'claude-code');
}

async function shouldCheckInstalledHost(manifest, hostId) {
  if (!manifest) {
    return false;
  }

  try {
    const parsed = JSON.parse(await readFile(manifest, 'utf8'));
    return parsed.hosts?.includes(hostId) ?? false;
  } catch {
    return false;
  }
}
