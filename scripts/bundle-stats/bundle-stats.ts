import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { EXIT_CODES, type OpsTask } from '../ops/registry';
import { type Metafile, renderSummary, summarizeInitialBundle } from './bundle-stats.helpers';

const root = join(import.meta.dirname, '..', '..');
const statsPath = join(root, 'dist', 'cuentoneta', 'browser-stats.json');

function parseTop(argv: readonly string[]): number {
	const value = Number(argv.find((arg) => arg.startsWith('--top='))?.slice('--top='.length) ?? 15);
	return Number.isInteger(value) && value > 0 ? value : 15;
}

// Se invoca el bin de Nx con el mismo `node`, no `pnpm`: en Windows `pnpm` es un `.cmd` que
// `execFileSync` no ejecuta sin shell.
function buildWithStats(): void {
	execFileSync(
		process.execPath,
		[join(root, 'node_modules', 'nx', 'bin', 'nx.js'), 'run', '@cuentoneta/app:build:production', '--statsJson'],
		{ cwd: root, stdio: 'inherit' },
	);
}

export const task: OpsTask = {
	run: async ({ argv }) => {
		if (!argv.includes('--skip-build')) buildWithStats();
		if (!existsSync(statsPath)) {
			console.error(`No existe ${statsPath}: corré la tarea sin --skip-build.`);
			return EXIT_CODES.failure;
		}
		const metafile = JSON.parse(readFileSync(statsPath, 'utf8')) as Metafile;
		console.info(renderSummary(summarizeInitialBundle(metafile, parseTop(argv))));
	},
};
