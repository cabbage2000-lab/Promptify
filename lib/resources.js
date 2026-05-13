import { access, cp, mkdir, mkdtemp, readdir, rename, rm } from 'node:fs/promises';
import path from 'node:path';

async function assertSourceExists(source) {
  await access(source);
}

async function removeStaleStagingDirs(installRoot) {
  try {
    const entries = await readdir(installRoot, { withFileTypes: true });
    await Promise.all(
      entries
        .filter((entry) => entry.isDirectory() && entry.name.startsWith('.staging-'))
        .map((entry) => rm(path.join(installRoot, entry.name), { recursive: true, force: true }))
    );
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

export async function copyResources(paths) {
  await Promise.all([
    assertSourceExists(paths.sharedSource),
    assertSourceExists(paths.adaptersSource),
    assertSourceExists(paths.readmeSource)
  ]);

  await mkdir(paths.installRoot, { recursive: true });
  await removeStaleStagingDirs(paths.installRoot);

  const staging = await mkdtemp(path.join(paths.installRoot, '.staging-'));
  try {
    await cp(paths.sharedSource, path.join(staging, 'shared'), { recursive: true });
    await cp(paths.adaptersSource, path.join(staging, 'adapters'), { recursive: true });
    await cp(paths.readmeSource, path.join(staging, 'README.md'));

    await rm(paths.current, { recursive: true, force: true });
    await rename(staging, paths.current);
  } catch (error) {
    await rm(staging, { recursive: true, force: true });
    throw error;
  }
}
