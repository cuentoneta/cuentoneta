/**
 * La única etapa que **conoce el corpus**: sabe dónde vive la prosa de cada obra, qué módulos aportan
 * títulos y epígrafes, y qué exports de los agregadores el archivo generado tiene que seguir importando
 * en vez de duplicar.
 *
 * Está separada del emisor a propósito. Acá se decide **qué** se sustituye —una decisión que cambia cada
 * vez que el corpus incorpora una pieza escrita a mano—; allá, **cómo** se emite, que no cambia nunca por
 * esa razón. Fundidas, el emisor pasaría a saber que existe un corpus y ya no podría probarse con un par
 * de entradas sintéticas.
 *
 * El recorrido del disco es real incluso en test: lo que se sustituye en un spec es el `load`, no el
 * sistema de archivos, así que las decisiones se ejercitan contra la estructura de directorios vigente.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import type { Substitution } from './generate-raw-corpus.emitter';

export type LoadModule = (path: string) => Promise<unknown>;

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
	keep: (binding: string, value: unknown) => boolean,
): Promise<Entry[]> {
	const loaded = (await load(`/${modulePath}`)) as Record<string, unknown>;
	const specifier = specifierFor(fromDirectory, modulePath.replace(/\.ts$/, ''));

	return Object.entries(loaded)
		.filter(([binding, value]) => keep(binding, value))
		.map(([binding, value]) => ({ value, substitution: { binding, specifier, kind: 'named' as const } }));
}

/**
 * Reúne las piezas del corpus que se escriben a mano y que el archivo generado tiene que seguir
 * importando: la prosa de cada obra, los títulos y epígrafes de sección, las etiquetas y el autor.
 */
export async function collectSubstitutions(load: LoadModule, fromDirectory: string): Promise<Entry[]> {
	const literaryWorkDirectory = join(CORPUS_ROOT, 'onoff/literary-work');
	const mediaDirectory = join(CORPUS_ROOT, 'onoff/media');

	// Los módulos neutrales de strings del corpus: títulos de sección y epígrafes junto a la obra,
	// descripciones de medios en su carpeta. Son piezas a mano que el generado tiene que seguir importando.
	const stringModules = [
		...(await readdir(literaryWorkDirectory))
			.filter((file) => file.endsWith('.epigraph.ts') || file.endsWith('.multi-section.ts'))
			.map((file) => join(literaryWorkDirectory, file)),
		...(await readdir(mediaDirectory))
			.filter((file) => file.endsWith('.media.ts'))
			.map((file) => join(mediaDirectory, file)),
	];

	// Solo los exports de texto entran a la sustitución. Un escalar numérico no identifica nada: el emisor
	// indexa por valor serializado, así que enrolar un `11` haría que cualquier `11` del corpus —el número
	// de secciones, un tiempo de lectura ajeno— se emitiera como esa constante, afirmando una relación que
	// no existe. El gate de frescura no lo vería: compara valores, y el binding vale lo mismo que el literal.
	const strings = await Promise.all(
		stringModules.map((file) => namedExportEntries(load, file, fromDirectory, (_, value) => typeof value === 'string')),
	);

	return [
		...(await proseEntries(literaryWorkDirectory, fromDirectory)),
		...(await proseEntries(join(CORPUS_ROOT, 'onoff/collection'), fromDirectory)),
		...strings.flat(),
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
