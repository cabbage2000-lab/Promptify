import path from 'node:path';

export function createPaths({ homeDir, packageRoot }) {
  const installRoot = path.join(homeDir, '.promptify');

  return {
    installRoot,
    current: path.join(installRoot, 'current'),
    backups: path.join(installRoot, 'backups'),
    manifest: path.join(installRoot, 'manifest.json'),
    sharedSource: path.join(packageRoot, 'shared'),
    adaptersSource: path.join(packageRoot, 'adapters'),
    readmeSource: path.join(packageRoot, 'README.md')
  };
}
