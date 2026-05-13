import path from 'node:path';

export const codexHost = {
  id: 'codex',
  label: 'Codex',
  defaultConfigPath(homeDir) {
    return path.join(homeDir, '.codex', 'AGENTS.md');
  },
  async planInstall({ installPath, configPath }) {
    return {
      host: 'codex',
      configPath,
      content: [
        '# Promptify for Codex',
        '',
        `Adapter skill: ${path.join(installPath, 'adapters', 'codex', 'skills', 'promptify', 'SKILL.md')}`,
        `Fallback instructions: ${path.join(installPath, 'adapters', 'codex', 'instructions', 'promptify.md')}`,
        `Shared rules: ${path.join(installPath, 'shared')}`,
        ''
      ].join('\n')
    };
  }
};
