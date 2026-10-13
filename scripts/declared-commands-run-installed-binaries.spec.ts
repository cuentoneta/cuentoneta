import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = join(__dirname, '..');

interface DeclaredCommand {
	source: string;
	command: string;
	/** Corre antes de que exista `node_modules`, así que no puede apoyarse en un binario instalado. */
	beforeInstall?: boolean;
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
	return Object.entries(scripts).map(([name, command]) => ({
		source: `${path} › ${name}`,
		command,
		beforeInstall: name === 'preinstall',
	}));
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
		.map(([name, command]) => ({
			source: `vercel.json › ${name}`,
			command,
			beforeInstall: name === 'installCommand',
		}));
}

/** Líneas de los archivos de `dir` sin sus comentarios `#`, para scripts de shell o YAML. */
function shellLines(dir: string, recursive: boolean): DeclaredCommand[] {
	return readdirSync(join(ROOT, dir), { recursive, encoding: 'utf8' })
		.map((file) => `${dir}/${file.replaceAll('\\', '/')}`)
		.filter((path) => statSync(join(ROOT, path)).isFile())
		.flatMap((path) =>
			read(path)
				.split(/\r?\n/)
				.map((line) => line.replace(/(^|\s)#.*$/, ''))
				.map((command) => ({ source: path, command })),
		);
}

/**
 * `npx` corre una versión determinada si el target la fija, o si lo expone una dependencia directa de la raíz
 * y el comando corre con `node_modules` ya instalado.
 */
function isPinnedOrInstalled(target: string, beforeInstall: boolean): boolean {
	const pinsVersion = /^@?[^@]+@\d\S*$/.test(target);
	return pinsVersion || (!beforeInstall && existsSync(join(ROOT, 'node_modules', '.bin', target)));
}

function runsLatestRelease({ command, beforeInstall = false }: Omit<DeclaredCommand, 'source'>): boolean {
	// `pnpx` es `pnpm dlx`: descarga siempre del registro, aunque el paquete esté instalado.
	// Las flags globales de pnpm pueden ir antes de `dlx`, pero no un separador de comandos.
	const pnpmDlx = /\bpnpx\b|\bpnpm\b[^\n;&|]*\sdlx\b/;
	// `npx` y `npm exec` usan el binario instalado si existe; si no, descargan la última versión publicada.
	const npxTarget = /\b(?:npx|npm\s+exec)\s+(?:-\S+\s+)*([^\s-]\S*)/g;

	const npxTargets = [...command.matchAll(npxTarget)].map(([, target]) => target);
	return pnpmDlx.test(command) || npxTargets.some((target) => !isPinnedOrInstalled(target, beforeInstall));
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

	it.each([
		'pnpx only-allow pnpm',
		'pnpm dlx sanity',
		'pnpm -C cms dlx sanity',
		'pnpm --silent dlx sanity',
		'npx only-allow-unknown pnpm',
		'npx --yes create-something',
		'npx only-allow-unknown@latest pnpm',
		'npm exec only-allow-unknown pnpm',
	])('should flag a registry download in %s', (command) => {
		expect(runsLatestRelease({ command })).toBe(true);
	});

	it.each([
		'pnpm exec sanity typegen generate',
		'npx nx typecheck',
		'npx only-allow@1.2.2 pnpm',
		'npx @scope/tool@2.0.0 run',
		'pnpm install && echo dlx',
	])('should not flag an installed or pinned binary in %s', (command) => {
		expect(runsLatestRelease({ command })).toBe(false);
	});

	it('should require a pinned version before node_modules exists, even for an installed binary', () => {
		expect(runsLatestRelease({ command: 'npx only-allow pnpm', beforeInstall: true })).toBe(true);
		expect(runsLatestRelease({ command: 'npx only-allow@1.2.2 pnpm', beforeInstall: true })).toBe(false);
	});

	it('should run installed or pinned binaries instead of downloading the latest release', () => {
		const offenders = declaredCommands.filter(runsLatestRelease);

		expect(offenders).toEqual([]);
	});
});
