import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { doctorCommand } from './commands/doctor.js';
import { installCommand } from './commands/install.js';
import { uninstallCommand } from './commands/uninstall.js';
import { updateCommand } from './commands/update.js';
import { versionCommand } from './commands/version.js';
import { createPaths } from './paths.js';

export function parseArgs(argv) {
  const [command = 'help', ...rest] = argv;
  const flags = {};
  const values = [];

  for (let index = 0; index < rest.length; index += 1) {
    const item = rest[index];
    if (item.startsWith('--')) {
      const flag = item.slice(2);
      const equalsIndex = flag.indexOf('=');
      const key = equalsIndex === -1 ? flag : flag.slice(0, equalsIndex);
      const inlineValue = equalsIndex === -1 ? undefined : flag.slice(equalsIndex + 1);
      const next = rest[index + 1];
      const hasSeparateValue = inlineValue === undefined && next && !next.startsWith('--');
      const value = hasSeparateValue ? next : inlineValue ?? true;
      flags[key] = value;
      if (hasSeparateValue) {
        index += 1;
      }
    } else {
      values.push(item);
    }
  }

  return { command, flags, values };
}

export async function runCli(argv, io) {
  const args = parseArgs(argv);

  if (args.command === 'version') {
    return versionCommand(io);
  }

  if (args.command === 'help') {
    io.stdout('promptify install|update|uninstall|doctor|version');
    return 0;
  }

  const packageRoot = io.packageRoot ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const homeDir = io.homeDir ?? os.homedir();
  const context = {
    homeDir,
    packageRoot,
    paths: createPaths({ homeDir, packageRoot })
  };

  if (args.command === 'install') {
    return installCommand(args, io, context);
  }

  if (args.command === 'update') {
    return updateCommand(args, io, context);
  }

  if (args.command === 'uninstall') {
    return uninstallCommand(args, io, context);
  }

  if (args.command === 'doctor') {
    return doctorCommand(io, context);
  }

  io.stderr(`未知命令：${args.command}`);
  return 1;
}
