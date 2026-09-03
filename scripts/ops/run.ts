import { dispatch } from './dispatch';
import { OPS_TASKS } from './registry';

process.exitCode = await dispatch(OPS_TASKS, process.argv.slice(2), { log: console.log, error: console.error });
