import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import type { Substitution } from './generate-raw-corpus.emitter';

export type LoadModule = <M>(path: string) => Promise<M>;

type Entry = { value: unknown; substitution: Substitution };

const CORPUS_ROOT = 'src/mocks';

// Los `.md` y los módulos de epígrafe viven junto a la obra; las etiquetas y el autor, en los agregadores
// de `src/mocks`. El specifier se calcula relativo al directorio del archivo que se va a escribir.
function specifierFor(fromDirectory: string, target: string): string {
	const path = relative(fromDirectory, target).split('\\').join('/');
	return path.startsWith('.') ? path : `./${path}`;
}

async function proseEntries(directory: string, fromDirectory: string): Promise<Entry[]> {
	const files = (await readdir(directory)).filter((file) => file.endsWith('.md'));

	return Promise.all(
		files.map(async (file) => ({
			value: await readFile(join(directory, file), 'utf8'),
			substitution: {
				binding: bindingForProse(file),
				specifier: `${specifierFor(fromDirectory, join(directory, file))}?raw`,
				kind: 'default' as const,
			},
		})),
	);
}

// `geometria.editorial-note.md` → `geometriaEditorialNoteMd`; `geometria.md` → `geometriaMdBody`, que es
// la convención que las fixtures a mano ya usaban.
function bindingForProse(file: string): string {
	const stem = file.replace(/\.md$/, '');
	const camel = stem.replace(/[-.]([a-z0-9])/g, (_, char: string) => char.toUpperCase());
	return stem.includes('.') ? `${camel}Md` : `${camel}MdBody`;
}

async function namedExportEntries(
	load: LoadModule,
	modulePath: string,
	fromDirectory: string,
	keep: (binding: string) => boolean,
): Promise<Entry[]> {
	const loaded = await load<Record<string, unknown>>(`/${modulePath}`);
	const specifier = specifierFor(fromDirectory, modulePath.replace(/\.ts$/, ''));

	return Object.entries(loaded)
		.filter(([binding]) => keep(binding))
		.map(([binding, value]) => ({ value, substitution: { binding, specifier, kind: 'named' as const } }));
}

/**
 * Reúne las piezas del corpus que se escriben a mano y que el archivo generado tiene que seguir
 * importando: la prosa de cada obra, los títulos y epígrafes de sección, las etiquetas y el autor.
 */
export async function collectSubstitutions(load: LoadModule, fromDirectory: string): Promise<Entry[]> {
	const literaryWorkDirectory = join(CORPUS_ROOT, 'onoff/literary-work');
	const epigraphFiles = (await readdir(literaryWorkDirectory)).filter((file) => file.endsWith('.epigraph.ts'));

	const epigraphs = await Promise.all(
		epigraphFiles.map((file) => namedExportEntries(load, join(literaryWorkDirectory, file), fromDirectory, () => true)),
	);

	return [
		...(await proseEntries(literaryWorkDirectory, fromDirectory)),
		...epigraphs.flat(),
		...(await namedExportEntries(load, join(CORPUS_ROOT, 'onoff-raw-tags.mock.ts'), fromDirectory, (binding) =>
			binding.endsWith('RawTag'),
		)),
		...(await namedExportEntries(
			load,
			join(CORPUS_ROOT, 'onoff-raw-author.mock.ts'),
			fromDirectory,
			(binding) => binding === 'rawOnoffAuthor',
		)),
	];
}
