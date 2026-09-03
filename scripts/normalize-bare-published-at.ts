/**
 * Remediación de las fechas de publicación que quedaron cargadas sin hora.
 *
 * El schema declara `publishedAt` como `datetime`, pero lo almacenado no siempre lo cumple: hay
 * documentos con la fecha sin componente horario (`"2022-01-23"`). El value object del dominio exige
 * el instante completo y rechaza esa forma, así que la página de la obra responde con un error de
 * servidor en vez de su contenido.
 *
 * Es remediación recurrente y no migración: `Rule.required()` y el tipo declarado validan la
 * **edición** en el Studio, no lo ya almacenado, así que un documento escrito por script vuelve a
 * aparecer con esa forma. La detecta el barrido `field-shape-sweep`.
 *
 * Uso:
 *   pnpm normalize:bare-published-at                 # corrida en seco: reporta qué se completaría
 *   pnpm normalize:bare-published-at --no-dry-run    # persiste
 */
import { client } from '../src/api/_helpers/sanity-connector';
import { environment } from '../src/api/_helpers/environment';
import {
	formatPublishedAtNormalizationReport,
	PUBLISHED_AT_NORMALIZATION_PAGE_SIZE,
	runPublishedAtNormalization,
	type PublishedAtCandidate,
	type PublishedAtCandidatePageFetcher,
} from './normalize-bare-published-at.helpers';

const APPLY = process.argv.includes('--no-dry-run');

// El connector sirve de la CDN en producción: una remediación tiene que leer el estado real,
// no uno cacheado.
const sanityClient = client.withConfig({ useCdn: false });

const CANDIDATES_QUERY = `*[_type == 'literaryWork' && _id > $cursor && defined(publishedAt) && !(publishedAt match "*T*")] | order(_id asc) [0...$pageSize] { _id, publishedAt }`;

const fetcher: PublishedAtCandidatePageFetcher = {
	fetchPage: (cursor, pageSize) =>
		sanityClient.fetch<readonly PublishedAtCandidate[]>(CANDIDATES_QUERY, { cursor, pageSize }),
};

async function run(): Promise<void> {
	console.log(
		`Normalización de fechas de publicación — proyecto ${environment.sanity.projectId}, dataset ${environment.sanity.dataset}, ` +
			`modo ${APPLY ? 'APLICAR' : 'seco'}`,
	);

	if (APPLY && !environment.sanity.token) {
		console.error('Falta el token de escritura de Sanity (SANITY_STUDIO_TOKEN): no se intenta escribir.');
		process.exitCode = 1;
		return;
	}

	const report = await runPublishedAtNormalization({
		fetcher,
		writer: sanityClient,
		apply: APPLY,
		pageSize: PUBLISHED_AT_NORMALIZATION_PAGE_SIZE,
	});

	console.log(formatPublishedAtNormalizationReport(report, { apply: APPLY }).join('\n'));

	if (report.failed.length > 0) {
		process.exitCode = 1;
	}
}

run().catch((error: unknown) => {
	console.error(error);
	process.exitCode = 1;
});
