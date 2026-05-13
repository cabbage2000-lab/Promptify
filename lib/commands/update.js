import { copyResources } from '../resources.js';
import { doctorCommand } from './doctor.js';

export async function updateCommand(args, io, context) {
  await copyResources(context.paths);
  io.stdout('更新完成：Promptify 资源已刷新。');
  return doctorCommand(io, context);
}
