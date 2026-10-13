// Forma mínima del metafile de esbuild que el builder de Angular escribe como `browser-stats.json`.
export type Metafile = {
	readonly outputs: Readonly<Record<string, MetafileOutput>>;
};

type MetafileOutput = {
	readonly bytes: number;
	readonly entryPoint?: string;
	readonly imports: readonly { readonly path: string; readonly kind: string }[];
	readonly inputs: Readonly<Record<string, { readonly bytesInOutput: number }>>;
};

export type SizedEntry = { readonly name: string; readonly bytes: number };

export type InitialBundleSummary = {
	readonly chunks: readonly SizedEntry[];
	readonly totalBytes: number;
	readonly packages: readonly SizedEntry[];
	readonly modules: readonly SizedEntry[];
};

// Lo que el navegador descarga antes de arrancar: los puntos de entrada y lo que importan de forma
// estática, transitivamente. esbuild marca con `entryPoint` también a cada chunk que nace de un
// `import()`, así que las entradas reales son las que ningún `import()` alcanza.
export function collectInitialChunks(metafile: Metafile): string[] {
	const lazy = new Set(
		Object.values(metafile.outputs).flatMap((output) =>
			output.imports.filter((i) => i.kind === 'dynamic-import').map((i) => i.path),
		),
	);
	const pending = Object.keys(metafile.outputs).filter(
		(path) => metafile.outputs[path]?.entryPoint !== undefined && !lazy.has(path),
	);
	const initial = new Set<string>();
	while (pending.length > 0) {
		const path = pending.pop();
		const output = path === undefined ? undefined : metafile.outputs[path];
		if (path === undefined || output === undefined || initial.has(path)) continue;
		initial.add(path);
		pending.push(...output.imports.filter((i) => i.kind === 'import-statement').map((i) => i.path));
	}
	return [...initial];
}

// Agrupa por paquete de npm; un archivo propio del repo es su propio grupo. Contempla el layout de
// pnpm (`node_modules/.pnpm/<id>/node_modules/<paquete>`) y los paquetes con scope.
export function packageOf(modulePath: string): string {
	const marker = 'node_modules/';
	const index = modulePath.lastIndexOf(marker);
	if (index === -1) return modulePath;
	const [first = '', second = ''] = modulePath.slice(index + marker.length).split('/');
	return first.startsWith('@') ? `${first}/${second}` : first;
}

function sortedTop(sizes: ReadonlyMap<string, number>, top: number): SizedEntry[] {
	return [...sizes]
		.map(([name, bytes]) => ({ name, bytes }))
		.sort((a, b) => b.bytes - a.bytes)
		.slice(0, top);
}

export function summarizeInitialBundle(metafile: Metafile, top: number): InitialBundleSummary {
	const chunks = collectInitialChunks(metafile).map((name) => ({ name, bytes: metafile.outputs[name]?.bytes ?? 0 }));
	const packages = new Map<string, number>();
	const modules = new Map<string, number>();
	for (const chunk of chunks) {
		for (const [path, { bytesInOutput }] of Object.entries(metafile.outputs[chunk.name]?.inputs ?? {})) {
			modules.set(path, (modules.get(path) ?? 0) + bytesInOutput);
			packages.set(packageOf(path), (packages.get(packageOf(path)) ?? 0) + bytesInOutput);
		}
	}
	return {
		chunks: [...chunks].sort((a, b) => b.bytes - a.bytes),
		totalBytes: chunks.reduce((sum, chunk) => sum + chunk.bytes, 0),
		packages: sortedTop(packages, top),
		modules: sortedTop(modules, top),
	};
}

const formatKiB = (bytes: number): string => `${(bytes / 1024).toFixed(1)} KiB`;

// Sin el prefijo del store de pnpm, que repite versiones y hashes en cada fila.
export function shortModulePath(modulePath: string): string {
	const marker = 'node_modules/';
	const index = modulePath.lastIndexOf(marker);
	return index === -1 ? modulePath : modulePath.slice(index + marker.length);
}

function table(title: string, entries: readonly SizedEntry[]): string[] {
	return [
		`### ${title}`,
		'',
		'| | Tamaño |',
		'| --- | --- |',
		...entries.map((e) => `| \`${e.name}\` | ${formatKiB(e.bytes)} |`),
		'',
	];
}

export function renderSummary(summary: InitialBundleSummary): string {
	return [
		`## Bundle inicial del navegador: ${formatKiB(summary.totalBytes)} (sin comprimir)`,
		'',
		...table('Chunks iniciales', summary.chunks),
		'> Los tamaños por paquete y por módulo son los que esbuild atribuye antes de la optimización final de',
		'> chunks: sirven para ordenar, pero su suma supera el tamaño real de los chunks.',
		'',
		...table('Paquetes más pesados', summary.packages),
		...table(
			'Módulos más pesados',
			summary.modules.map((m) => ({ ...m, name: shortModulePath(m.name) })),
		),
	].join('\n');
}
