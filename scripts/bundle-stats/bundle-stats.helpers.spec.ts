import {
	collectInitialChunks,
	type Metafile,
	packageOf,
	renderSummary,
	shortModulePath,
	summarizeInitialBundle,
} from './bundle-stats.helpers';

const pnpm = (pkg: string, file: string) =>
	`node_modules/.pnpm/${pkg.replace('/', '+')}@1.0.0/node_modules/${pkg}/${file}`;

// main importa estático a `shared` y lazy a `page`, que a su vez importa estático a `page-dep`.
const metafile: Metafile = {
	outputs: {
		'main.js': {
			bytes: 300,
			entryPoint: 'src/main.ts',
			imports: [
				{ path: 'shared.js', kind: 'import-statement' },
				{ path: 'page.js', kind: 'dynamic-import' },
			],
			inputs: { [pnpm('@angular/core', 'core.mjs')]: { bytesInOutput: 200 }, 'src/main.ts': { bytesInOutput: 50 } },
		},
		'shared.js': {
			bytes: 100,
			imports: [],
			inputs: { [pnpm('rxjs', 'index.js')]: { bytesInOutput: 90 } },
		},
		'styles.css': {
			bytes: 40,
			entryPoint: 'src/styles.css',
			imports: [],
			inputs: { 'src/styles.css': { bytesInOutput: 40 } },
		},
		'page.js': {
			bytes: 500,
			entryPoint: 'src/app/pages/home.page.ts',
			imports: [{ path: 'page-dep.js', kind: 'import-statement' }],
			inputs: { [pnpm('zod', 'index.js')]: { bytesInOutput: 480 } },
		},
		'page-dep.js': { bytes: 70, imports: [], inputs: {} },
	},
};

describe('collectInitialChunks', () => {
	it('incluye las entradas reales y lo que importan de forma estática', () => {
		expect(collectInitialChunks(metafile).sort()).toEqual(['main.js', 'shared.js', 'styles.css']);
	});

	it('excluye los chunks que nacen de un import(), aunque esbuild los marque como entrada', () => {
		expect(collectInitialChunks(metafile)).not.toContain('page.js');
		expect(collectInitialChunks(metafile)).not.toContain('page-dep.js');
	});
});

describe('packageOf', () => {
	it('agrupa por paquete en el layout de pnpm, con y sin scope', () => {
		expect(packageOf(pnpm('@angular/core', 'fesm2022/core.mjs'))).toBe('@angular/core');
		expect(packageOf(pnpm('rxjs', 'dist/esm/index.js'))).toBe('rxjs');
	});

	it('deja como grupo propio un archivo del repo', () => {
		expect(packageOf('src/styles.css')).toBe('src/styles.css');
	});
});

describe('shortModulePath', () => {
	it('quita el prefijo del store de pnpm', () => {
		expect(shortModulePath(pnpm('@angular/core', 'fesm2022/core.mjs'))).toBe('@angular/core/fesm2022/core.mjs');
	});
});

describe('summarizeInitialBundle', () => {
	it('suma solo los chunks iniciales y ordena de mayor a menor', () => {
		const summary = summarizeInitialBundle(metafile, 10);

		expect(summary.totalBytes).toBe(440);
		expect(summary.chunks.map((c) => c.name)).toEqual(['main.js', 'shared.js', 'styles.css']);
		expect(summary.packages[0]).toEqual({ name: '@angular/core', bytes: 200 });
		expect(summary.packages.map((p) => p.name)).not.toContain('zod');
	});

	it('recorta paquetes y módulos al top pedido', () => {
		const summary = summarizeInitialBundle(metafile, 2);

		expect(summary.packages).toHaveLength(2);
		expect(summary.modules).toHaveLength(2);
	});
});

describe('renderSummary', () => {
	it('encabeza con el total en KiB', () => {
		expect(renderSummary(summarizeInitialBundle(metafile, 5))).toContain('## Bundle inicial del navegador: 0.4 KiB');
	});
});
