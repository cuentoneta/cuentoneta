import { writeFile } from 'node:fs/promises';
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

/**
 * El nombre de export se declara acá y no se lee del archivo generado —que sería tomar el nombre del
 * artefacto que se está por sobrescribir— ni se deriva del slug: `el-palacio-de-las-nueve-fronteras`
 * exporta `palacioNueveFronterasRawLiteraryWork`, y renombrarlo en silencio rompería a los agregadores.
 */
const LITERARY_WORK_EXPORTS: Record<string, string> = {
	geometria: 'geometriaRawLiteraryWork',
	'los-peldanos': 'losPeldanosRawLiteraryWork',
	'las-escaleras': 'lasEscalerasRawLiteraryWork',
	'el-odio': 'elOdioRawLiteraryWork',
	'el-tratado-de-los-placeres': 'elTratadoDeLosPlaceresRawLiteraryWork',
	'las-dos-antorchas': 'lasDosAntorchasRawLiteraryWork',
	neron: 'neronRawLiteraryWork',
	'el-palacio-de-las-nueve-fronteras': 'palacioNueveFronterasRawLiteraryWork',
};

const COLLECTION_EXPORTS: Record<string, string> = {
	'geometrias-del-desvelo': 'geometriasDelDesveloRawCollection',
	'inventario-de-las-pasiones': 'inventarioDeLasPasionesRawCollection',
};

// El slug de la landing es su semana ISO, y tiene que seguir al `slug.current` del documento: si dejan de
// coincidir, `evaluateTarget` corta con el mensaje de query sin resultado en vez de generar algo vacío.
const LANDING_PAGE_SLUG = '1974-24';

function queryNamed(queries: Record<string, string>, name: string): string {
	const query = queries[name];
	if (typeof query !== 'string' || query.length === 0) {
		throw new Error(
			`El módulo de queries no exporta "${name}". Si se renombró, actualizá el generador: sin esto el ` +
				'error aparecería recién al parsear un string vacío, tres capas más abajo.',
		);
	}
	return query;
}

function targetsFor(queries: Record<string, string>): Target[] {
	const bySlug = (
		exports: Record<string, string>,
		directory: string,
		suffix: string,
		typeImport: string,
		queryName: string,
	) =>
		Object.entries(exports).map(([slug, exportName]) => ({
			file: join(directory, `${slug}.${suffix}.raw.mock.ts`),
			exportName,
			typeImport,
			typeAnnotation: `NonNullable<${typeImport}>`,
			query: queryNamed(queries, queryName),
			params: { slug },
		}));

	return [
		...bySlug(
			LITERARY_WORK_EXPORTS,
			'src/mocks/onoff/literary-work',
			'literary-work',
			'LiteraryWorkBySlugQueryResult',
			'literaryWorkBySlugQuery',
		),
		...bySlug(
			COLLECTION_EXPORTS,
			'src/mocks/onoff/collection',
			'collection',
			'CollectionBySlugQueryResult',
			'collectionBySlugQuery',
		),
		{
			file: join('src/mocks/onoff/collection', 'collection-teasers.raw.mock.ts'),
			exportName: 'onoffRawCollectionTeasersMock',
			typeImport: 'CollectionsQueryResult',
			typeAnnotation: 'CollectionsQueryResult',
			query: queryNamed(queries, 'collectionsQuery'),
		},
		// Se emite el resultado entero de la query y no solo su sub-proyección `campaigns`, que es lo único
		// que el corpus consume hoy: un archivo generado afirma "esto es lo que la query devuelve", y recortar
		// obligaría al gate de frescura a replicar el mismo recorte para poder comparar, con lo que la
		// transformación quedaría afirmada por sí misma. De paso, `cards` y `latestReads` quedan afirmados
		// como vacíos por la query real.
		{
			file: join('src/mocks/onoff/landing-page', 'landing-page.raw.mock.ts'),
			exportName: 'onoffRawLandingPageMock',
			typeImport: 'LandingPageContentQueryResult',
			typeAnnotation: 'NonNullable<LandingPageContentQueryResult>',
			query: queryNamed(queries, 'landingPageContentQuery'),
			params: { slug: LANDING_PAGE_SLUG },
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
	const { onoffDatasetMock } = (await load('/src/mocks/onoff-documents.mock.ts')) as {
		onoffDatasetMock: Record<string, unknown>[];
	};
	assertEveryReferenceResolves(onoffDatasetMock);

	const collectionQueries = (await load('/src/api/_queries/collection.query.ts')) as Record<string, string>;
	const literaryWorkQueries = (await load('/src/api/_queries/literary-work.query.ts')) as Record<string, string>;
	const contentQueries = (await load('/src/api/_queries/content.query.ts')) as Record<string, string>;
	const targets = targetsFor({ ...collectionQueries, ...literaryWorkQueries, ...contentQueries });

	for (const target of targets) {
		const value = await evaluateTarget(target, onoffDatasetMock);
		await writeTarget(target, value, load);
		console.log(`✓ ${target.file}`);
	}
});
