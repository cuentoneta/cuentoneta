import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, relative } from 'node:path';

import { EXIT_CODES, type OpsTask } from '../ops/registry';
import { assertMetafile, parseBundleStatsArgs, renderSummary, summarizeInitialBundle } from './bundle-stats.helpers';

const root = join(import.meta.dirname, '..', '..');

// El build va a un directorio propio y no a `dist/`: sin el `postbuild` de `pnpm build`, dejaría ahí un
// server que apunta al index equivocado. Se invoca el bin de Nx con el mismo `node`, no `pnpm`: en
// Windows `pnpm` es un `.cmd` que `execFileSync` no ejecuta sin shell.
function buildWithStats(outputPath: string): boolean {
	const nx = createRequire(import.meta.url).resolve('nx/bin/nx.js');
	const args = ['run', '@cuentoneta/app:build:production', '--statsJson', `--outputPath=${relative(root, outputPath)}`];
	try {
		execFileSync(process.execPath, [nx, ...args], { cwd: root, stdio: 'inherit' });
		return true;
	} catch {
		console.error('El build de producción falló; su salida está arriba.');
		return false;
	}
}

export const task: OpsTask = {
	run: async ({ argv }) => {
		const { skipBuild, top } = parseBundleStatsArgs(argv);
		const outputPath = join(root, 'tmp', 'bundle-stats');
		const statsPath = join(outputPath, 'browser-stats.json');
		if (!skipBuild && !buildWithStats(outputPath)) return EXIT_CODES.failure;
		if (!existsSync(statsPath)) {
			console.error(`No existe ${statsPath}.${skipBuild ? ' Corré la tarea sin --skip-build.' : ''}`);
			return EXIT_CODES.failure;
		}
		const metafile: unknown = JSON.parse(readFileSync(statsPath, 'utf8'));
		assertMetafile(metafile);
		console.info(renderSummary(summarizeInitialBundle(metafile, top)));
	},
};
