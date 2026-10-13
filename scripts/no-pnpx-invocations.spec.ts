import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

// `pnpx` es `pnpm dlx`: descarga la última versión publicada en vez de usar la fijada en el lockfile.
const DOWNLOADS_PACKAGE = /\bpnpx\b|\bpnpm\s+dlx\b/;

const ROOT = join(__dirname, '..');

interface DeclaredCommand {
	source: string;
	command: string;
}

interface NxTarget {
	options?: { command?: string; commands?: (string | { command: string })[] };
}

function read(path: string): string {
	return readFileSync(join(ROOT, path), 'utf8');
}

function packageScripts(path: string): DeclaredCommand[] {
	const { scripts = {} } = JSON.parse(read(path)) as { scripts?: Record<string, string> };
	return Object.entries(scripts).map(([name, command]) => ({ source: `${path} › ${name}`, command }));
}

function nxTargetCommands(path: string): DeclaredCommand[] {
	const { targets = {} } = JSON.parse(read(path)) as { targets?: Record<string, NxTarget> };
	return Object.entries(targets).flatMap(([name, { options }]) =>
		[options?.command, ...(options?.commands ?? [])]
			.map((entry) => (typeof entry === 'object' ? entry.command : entry))
			.filter((command) => command !== undefined)
			.map((command) => ({ source: `${path} › ${name}`, command })),
	);
}

/** Líneas no comentadas de los archivos regulares de `dir`, que puede contener scripts de shell o YAML. */
function shellLines(dir: string): DeclaredCommand[] {
	return readdirSync(join(ROOT, dir))
		.map((file) => `${dir}/${file}`)
		.filter((path) => statSync(join(ROOT, path)).isFile())
		.flatMap((path) =>
			read(path)
				.split(/\r?\n/)
				.filter((line) => !line.trim().startsWith('#'))
				.map((command) => ({ source: path, command })),
		);
}

const declaredCommands: DeclaredCommand[] = [
	...packageScripts('package.json'),
	...packageScripts('cms/package.json'),
	...nxTargetCommands('project.json'),
	...nxTargetCommands('cms/project.json'),
	...shellLines('.github/workflows'),
	...shellLines('.github/actions/setup-workspace'),
	...shellLines('.husky'),
];

describe('comandos declarados en el repo', () => {
	it('should collect the commands of every source', () => {
		const sources = new Set(declaredCommands.map(({ source }) => source));

		expect(sources).toContain('package.json › preinstall');
		expect(sources).toContain('cms/project.json › typegen');
		expect(sources).toContain('.github/workflows/ci.yml');
		expect(sources).toContain('.github/actions/setup-workspace/action.yml');
		expect(sources).toContain('.husky/commit-msg');
	});

	it('should run installed binaries instead of downloading them with pnpx', () => {
		const offenders = declaredCommands.filter(({ command }) => DOWNLOADS_PACKAGE.test(command));

		expect(offenders).toEqual([]);
	});
});
