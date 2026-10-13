import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

// `pnpx` es `pnpm dlx`: descarga la última versión publicada en vez de usar la fijada en el lockfile.
// Las flags globales de pnpm pueden ir antes de `dlx`, pero no un separador de comandos.
const DOWNLOADS_PACKAGE = /\bpnpx\b|\bpnpm\b[^\n;&|]*\sdlx\b/;

const ROOT = join(__dirname, '..');

interface DeclaredCommand {
	source: string;
	command: string;
}

interface NxCommandOptions {
	command?: string;
	commands?: (string | { command: string })[];
}

interface NxTarget {
	command?: string;
	options?: NxCommandOptions;
	configurations?: Record<string, NxCommandOptions>;
}

function read(path: string): string {
	return readFileSync(join(ROOT, path), 'utf8');
}

function packageScripts(path: string): DeclaredCommand[] {
	const { scripts = {} } = JSON.parse(read(path)) as { scripts?: Record<string, string> };
	return Object.entries(scripts).map(([name, command]) => ({ source: `${path} › ${name}`, command }));
}

function commandsOf(options: NxCommandOptions | undefined): string[] {
	return [options?.command, ...(options?.commands ?? [])]
		.map((entry) => (typeof entry === 'object' ? entry.command : entry))
		.filter((command) => command !== undefined);
}

function nxTargetCommands(path: string): DeclaredCommand[] {
	const { targets = {} } = JSON.parse(read(path)) as { targets?: Record<string, NxTarget> };
	return Object.entries(targets).flatMap(([name, target]) =>
		[target.command, ...commandsOf(target.options), ...Object.values(target.configurations ?? {}).flatMap(commandsOf)]
			.filter((command) => command !== undefined)
			.map((command) => ({ source: `${path} › ${name}`, command })),
	);
}

function vercelCommands(): DeclaredCommand[] {
	const config = JSON.parse(read('vercel.json')) as Record<string, unknown>;
	return Object.entries(config)
		.filter((entry): entry is [string, string] => entry[0].endsWith('Command') && typeof entry[1] === 'string')
		.map(([name, command]) => ({ source: `vercel.json › ${name}`, command }));
}

/** Líneas no comentadas de los archivos de `dir`, que puede contener scripts de shell o YAML. */
function shellLines(dir: string, recursive: boolean): DeclaredCommand[] {
	return readdirSync(join(ROOT, dir), { recursive, encoding: 'utf8' })
		.map((file) => `${dir}/${file.replaceAll('\\', '/')}`)
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
	...vercelCommands(),
	...shellLines('.github/workflows', true),
	...shellLines('.github/actions', true),
	// Sin recursión: `.husky/_` lo genera husky al instalar y no son hooks declarados en el repo.
	...shellLines('.husky', false),
];

describe('comandos declarados en el repo', () => {
	it('should collect the commands of every source', () => {
		const sources = new Set(declaredCommands.map(({ source }) => source));

		expect(sources).toContain('package.json › preinstall');
		expect(sources).toContain('project.json › eslint:lint');
		expect(sources).toContain('cms/project.json › typegen');
		expect(sources).toContain('vercel.json › installCommand');
		expect(sources).toContain('.github/workflows/ci.yml');
		expect(sources).toContain('.github/actions/setup-workspace/action.yml');
		expect(sources).toContain('.husky/commit-msg');
	});

	it.each(['pnpx only-allow pnpm', 'pnpm dlx sanity', 'pnpm -C cms dlx sanity', 'pnpm --silent dlx sanity'])(
		'should detect a package download in %s',
		(command) => {
			expect(command).toMatch(DOWNLOADS_PACKAGE);
		},
	);

	it.each(['pnpm exec sanity typegen generate', 'npx only-allow@1.2.2 pnpm', 'pnpm install && echo dlx'])(
		'should not flag the installed binary in %s',
		(command) => {
			expect(command).not.toMatch(DOWNLOADS_PACKAGE);
		},
	);

	it('should run installed binaries instead of downloading them with pnpx', () => {
		const offenders = declaredCommands.filter(({ command }) => DOWNLOADS_PACKAGE.test(command));

		expect(offenders).toEqual([]);
	});
});
