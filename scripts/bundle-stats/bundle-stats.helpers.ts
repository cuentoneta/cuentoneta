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

export type BundleStatsArgs = { readonly skipBuild: boolean; readonly top: number };

const SKIP_BUILD_FLAG = '--skip-build';
const TOP_FLAG = '--top=';
const DEFAULT_TOP = 15;

export function parseBundleStatsArgs(argv: readonly string[]): BundleStatsArgs {
	const unknown = argv.find((arg) => arg !== SKIP_BUILD_FLAG && !arg.startsWith(TOP_FLAG));
	if (unknown !== undefined) {
		throw new Error(`Argumento desconocido: ${unknown}`);
	}
	const raw = argv.find((arg) => arg.startsWith(TOP_FLAG))?.slice(TOP_FLAG.length);
	if (raw !== undefined && !/^[1-9]\d{0,2}$/.test(raw)) {
		throw new Error(`--top debe ser un entero entre 1 y 999, recibió "${raw}".`);
	}
	return { skipBuild: argv.includes(SKIP_BUILD_FLAG), top: raw === undefined ? DEFAULT_TOP : Number(raw) };
}

// El JSON lo escribe la propia toolchain, así que alcanza con fallar en el borde si cambió de forma,
// en vez de un TypeError lejos de la lectura.
export function assertMetafile(value: unknown): asserts value is Metafile {
	const outputs = (value as { outputs?: unknown } | null)?.outputs;
	const valid =
		typeof outputs === 'object' &&
		outputs !== null &&
		Object.values(outputs).every((output) => Array.isArray(output?.imports) && typeof output?.inputs === 'object');
	if (!valid) {
		throw new Error('browser-stats.json no tiene la forma de un metafile de esbuild (outputs con imports e inputs).');
	}
}

// Lo que el navegador descarga antes de arrancar: los puntos de entrada y lo que importan de forma
// estática, transitivamente. esbuild marca con `entryPoint` también a cada chunk que nace de un
// `import()`, así que las entradas reales son las que ningún `import()` alcanza. Los assets que pide
// el CSS (`url-token`) quedan afuera, igual que en el "Initial total" del builder.
export function collectInitialChunks(metafile: Metafile): string[] {
	const outputs = Object.entries(metafile.outputs);
	const lazy = new Set(
		outputs.flatMap(([, output]) => output.imports.filter((i) => i.kind === 'dynamic-import').map((i) => i.path)),
	);
	const pending = outputs
		.filter(([path, output]) => output.entryPoint !== undefined && !lazy.has(path))
		.map(([path]) => path);
	const initial = new Set<string>();
	for (let path = pending.pop(); path !== undefined; path = pending.pop()) {
		const output = metafile.outputs[path];
		if (output === undefined || initial.has(path)) continue;
		initial.add(path);
		pending.push(...output.imports.filter((i) => i.kind === 'import-statement').map((i) => i.path));
	}
	return [...initial];
}

// Sin el prefijo del store de pnpm (`node_modules/.pnpm/<id>/node_modules/`), que repite versiones y
// hashes en cada fila.
export function shortModulePath(modulePath: string): string {
	const marker = 'node_modules/';
	const index = modulePath.lastIndexOf(marker);
	return index === -1 ? modulePath : modulePath.slice(index + marker.length);
}

// Agrupa por paquete de npm, con o sin scope; un archivo propio del repo es su propio grupo.
export function packageOf(modulePath: string): string {
	if (!modulePath.includes('node_modules/')) return modulePath;
	const [first = '', second = ''] = shortModulePath(modulePath).split('/');
	return first.startsWith('@') ? `${first}/${second}` : first;
}

function sortedTop(sizes: ReadonlyMap<string, number>, top: number): SizedEntry[] {
	return [...sizes]
		.map(([name, bytes]) => ({ name, bytes }))
		.sort((a, b) => b.bytes - a.bytes)
		.slice(0, top);
}

// `top` recorta paquetes y módulos, no chunks: los iniciales son pocos y todos suman al total. Los
// bytes por paquete y por módulo no suman al total (ver la nota de `renderSummary`).
export function summarizeInitialBundle(metafile: Metafile, top: number): InitialBundleSummary {
	const chunks = collectInitialChunks(metafile).map((name) => ({ name, bytes: metafile.outputs[name]?.bytes ?? 0 }));
	const packages = new Map<string, number>();
	const modules = new Map<string, number>();
	for (const chunk of chunks) {
		for (const [path, { bytesInOutput }] of Object.entries(metafile.outputs[chunk.name]?.inputs ?? {})) {
			const pkg = packageOf(path);
			modules.set(path, (modules.get(path) ?? 0) + bytesInOutput);
			packages.set(pkg, (packages.get(pkg) ?? 0) + bytesInOutput);
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
