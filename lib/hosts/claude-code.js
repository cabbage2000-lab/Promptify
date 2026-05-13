import path from 'node:path';

export const claudeCodeHost = {
  id: 'claude-code',
  label: 'Claude Code',
  defaultConfigPath(homeDir) {
    return path.join(homeDir, '.claude', 'CLAUDE.md');
  },
  async planInstall({ installPath, configPath }) {
    return {
      host: 'claude-code',
      configPath,
      content: [
        '# Promptify for Claude Code',
        '',
        `Adapter commands: ${path.join(installPath, 'adapters', 'claude-code', 'commands')}`,
        `Adapter skill: ${path.join(installPath, 'adapters', 'claude-code', 'skills', 'promptify', 'SKILL.md')}`,
        `Shared rules: ${path.join(installPath, 'shared')}`,
        ''
      ].join('\n')
    };
  }
};
