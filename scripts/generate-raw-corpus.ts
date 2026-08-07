import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { evaluate, parse } from 'groq-js';
import { format, resolveConfig } from 'prettier';
import { assertEveryReferenceResolves } from './generate-raw-corpus.helpers';
import { buildSubstitutionTable, emitModule } from './generate-raw-corpus.emitter';
import { collectSubstitutions, type LoadModule } from './generate-raw-corpus.table';
import { withCorpus } from './generate-raw-corpus.loader';

type Target = {
	file: string;
	exportName: string;
	typeImport: string;
	typeAnnotation: string;
	query: string;
	params?: Record<string, unknown>;
};

const BANNER = [
	'// Este archivo lo escribe `pnpm corpus:generate` evaluando la query GROQ real sobre los documentos del',
	'// corpus. No se edita a mano: cualquier cambio se pierde en la próxima corrida.',
].join('\n');

const LITERARY_WORK_SLUGS = [
	'geometria',
	'los-peldanos',
	'las-escaleras',
	'el-odio',
	'el-tratado-de-los-placeres',
	'las-dos-antorchas',
	'neron',
	'el-palacio-de-las-nueve-fronteras',
];

const COLLECTION_SLUGS = ['geometrias-del-desvelo', 'inventario-de-las-pasiones'];

function camelCase(slug: string): string {
	return slug.replace(/-([a-z0-9])/g, (_, char: string) => char.toUpperCase());
}

/**
 * El nombre de export se toma del archivo que ya existe, no se deriva del slug: el corpus tiene al menos
 * un caso donde no coinciden (`el-palacio-de-las-nueve-fronteras` exporta `palacioNueveFronteras…`), y
 * regenerar con otro nombre rompería en silencio a los agregadores que lo importan.
 */
async function exportNameOf(file: string, fallback: string): Promise<string> {
	const source = await readFile(file, 'utf8').catch(() => '');
	return /export const (\w+)\s*:/.exec(source)?.[1] ?? fallback;
}

async function bySlugTarget(
	slug: string,
	directory: string,
	suffix: string,
	typeImport: string,
	query: string,
): Promise<Target> {
	const file = join(directory, `${slug}.${suffix}.raw.mock.ts`);
	const fallback = `${camelCase(slug)}Raw${suffix === 'literary-work' ? 'LiteraryWork' : 'Collection'}`;

	return {
		file,
		exportName: await exportNameOf(file, fallback),
		typeImport,
		typeAnnotation: `NonNullable<${typeImport}>`,
		query,
		params: { slug },
	};
}

async function targetsFor(queries: Record<string, string>): Promise<Target[]> {
	const works = LITERARY_WORK_SLUGS.map((slug) =>
		bySlugTarget(
			slug,
			'src/mocks/onoff/literary-work',
			'literary-work',
			'LiteraryWorkBySlugQueryResult',
			queries['literaryWorkBySlugQuery'] ?? '',
		),
	);

	const collections = COLLECTION_SLUGS.map((slug) =>
		bySlugTarget(
			slug,
			'src/mocks/onoff/collection',
			'collection',
			'CollectionBySlugQueryResult',
			queries['collectionBySlugQuery'] ?? '',
		),
	);

	return [
		...(await Promise.all([...works, ...collections])),
		{
			file: join('src/mocks/onoff/collection', 'collection-teasers.raw.mock.ts'),
			exportName: 'onoffRawCollectionTeasersMock',
			typeImport: 'CollectionsQueryResult',
			typeAnnotation: 'CollectionsQueryResult',
			query: queries['collectionsQuery'] ?? '',
		},
	];
}

async function evaluateTarget(target: Target, dataset: Record<string, unknown>[]): Promise<unknown> {
	const result = await (await evaluate(parse(target.query), { dataset, params: target.params ?? {} })).get();

	if (result === null || (Array.isArray(result) && result.length === 0)) {
		throw new Error(
			`La query de "${target.file}" no devolvió nada (params: ${JSON.stringify(target.params ?? {})}). ` +
				'El documento que la alimenta no está en el corpus, o su slug no coincide.',
		);
	}
	return result;
}

async function writeTarget(target: Target, value: unknown, load: LoadModule): Promise<void> {
	const entries = await collectSubstitutions(load, dirname(target.file));
	const source = emitModule({
		banner: BANNER,
		exportName: target.exportName,
		typeImport: target.typeImport,
		typeAnnotation: target.typeAnnotation,
		typeSpecifier: '@sanity-types',
		value,
		table: buildSubstitutionTable(entries),
	});

	// Se formatea con la config del repo para que `pretty-quick`, que corre en `pre-commit`, no reescriba
	// lo que el generador acaba de escribir.
	const config = await resolveConfig(target.file);
	await writeFile(target.file, await format(source, { ...config, filepath: target.file }), 'utf8');
}

await withCorpus(async (load) => {
	const { onoffDatasetMock } = await load<{ onoffDatasetMock: Record<string, unknown>[] }>(
		'/src/mocks/onoff-documents.mock.ts',
	);
	assertEveryReferenceResolves(onoffDatasetMock);

	const collectionQueries = await load<Record<string, string>>('/src/api/_queries/collection.query.ts');
	const literaryWorkQueries = await load<Record<string, string>>('/src/api/_queries/literary-work.query.ts');
	const targets = await targetsFor({ ...collectionQueries, ...literaryWorkQueries });

	for (const target of targets) {
		const value = await evaluateTarget(target, onoffDatasetMock);
		await writeTarget(target, value, load);
		console.log(`✓ ${target.file}`);
	}
});
