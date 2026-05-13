#!/usr/bin/env node
import { runCli } from '../lib/cli.js';

const code = await runCli(process.argv.slice(2), {
  stdout: (line) => console.log(line),
  stderr: (line) => console.error(line),
  cwd: process.cwd()
});

process.exitCode = code;
