/**
 * Regenera las fixtures raw del corpus de Onoff (`pnpm corpus:generate`) evaluando la query GROQ real
 * sobre los documentos escritos a mano, para que el raw commiteado sea lo que la query devuelve y no lo
 * que alguien creyó que devolvía.
 *
 * El trabajo está partido en módulos porque cada etapa falla distinto y se prueba distinto:
 *
 * - **loader** — levanta el bundler que hace legible el corpus. Falla por entorno, no por contenido.
 * - **helpers** — la guarda previa sobre el dataset. Corta antes de escribir nada.
 * - **table** — qué piezas escritas a mano tiene que seguir importando lo generado. Conoce el corpus.
 * - **emitter** — cómo se escribe el módulo. No conoce el corpus: recibe un valor y una tabla.
 *
 * El corte entre `table` y `emitter` es el que más importa: la primera decide **qué** se sustituye y la
 * segunda **cómo** se emite. Juntas, cualquier cambio de política de sustitución obligaría a tocar el
 * emisor, que es la pieza que no debería saber que existe un corpus.
 *
 * Este archivo es el único que orquesta: declara los targets, evalúa y escribe.
 */
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

// El slug sale del documento y no de un literal propio: es el parámetro de entrada de la query, no una de
// las capas que los cruces comparan, así que atarlo al documento no debilita ninguna aserción y elimina la
// deriva de que la semana se mueva en un lado y no en el otro.
//
// Emite el resultado entero de la query y no solo su sub-proyección `campaigns`; el porqué, en el README
// del corpus.
function landingPageTarget(queries: Record<string, string>, slug: string): Target {
	return {
		file: join('src/mocks/onoff/landing-page', 'landing-page.raw.mock.ts'),
		exportName: 'onoffRawLandingPageMock',
		typeImport: 'LandingPageContentQueryResult',
		typeAnnotation: 'NonNullable<LandingPageContentQueryResult>',
		query: queryNamed(queries, 'landingPageContentQuery'),
		params: { slug },
	};
}

// El listado completo de obras del autor del corpus. El slug va atado al documento del autor, igual
// que el de la landing: es un parámetro de la query y no una capa que los cruces comparen.
function literaryWorksByAuthorTarget(queries: Record<string, string>, authorSlug: string): Target {
	return {
		file: join('src/mocks/onoff/literary-work', 'literary-works-by-author.raw.mock.ts'),
		exportName: 'onoffRawLiteraryWorksByAuthorMock',
		typeImport: 'LiteraryWorksByAuthorSlugQueryResult',
		typeAnnotation: 'LiteraryWorksByAuthorSlugQueryResult',
		query: queryNamed(queries, 'literaryWorksByAuthorSlugQuery'),
		params: { slug: authorSlug },
	};
}

function targetsFor(queries: Record<string, string>, landingPageSlug: string, authorSlug: string): Target[] {
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
		landingPageTarget(queries, landingPageSlug),
		literaryWorksByAuthorTarget(queries, authorSlug),
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
	const { onoffLandingPageDocument } = (await load('/src/mocks/onoff/landing-page/onoff.landing-page.document.ts')) as {
		onoffLandingPageDocument: { slug: { current: string } };
	};
	const { rawOnoffAuthor } = (await load('/src/mocks/onoff-raw-author.mock.ts')) as {
		rawOnoffAuthor: { slug: string };
	};
	const targets = targetsFor(
		{ ...collectionQueries, ...literaryWorkQueries, ...contentQueries },
		onoffLandingPageDocument.slug.current,
		rawOnoffAuthor.slug,
	);

	for (const target of targets) {
		const value = await evaluateTarget(target, onoffDatasetMock);
		await writeTarget(target, value, load);
		console.log(`✓ ${target.file}`);
	}
});
