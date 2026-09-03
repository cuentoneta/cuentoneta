/**
 * Remediación de los recursos sin URL de autores y obras literarias.
 *
 * Un recurso web sin enlace no significa nada: la URL es su razón de ser. El schema lo declara con
 * `Rule.required()`, pero esa regla valida la **edición** en el Studio y no lo ya almacenado, así que
 * quedan documentos —anteriores a la regla, o escritos por script— con el hueco abierto.
 *
 * Es remediación recurrente y no migración: el caso puede reaparecer por la misma vía que lo produjo.
 * La detecta el barrido `required-fields-sweep`. Transporta el mapa curado a mano de artículos de
 * Wikipedia por autor, verificado contra la API de MediaWiki: ese dato viaja con el script,
 * no se regenera.
 *
 * Uso:
 *   pnpm sanitize:resources-without-url                 # corrida en seco: reporta qué se sanearía
 *   pnpm sanitize:resources-without-url --no-dry-run    # persiste
 */
import { client } from '../src/api/_helpers/sanity-connector';
import { environment } from '../src/api/_helpers/environment';
import {
	formatResourceSanitizationReport,
	RESOURCE_SANITIZATION_PAGE_SIZE,
	runResourceSanitization,
	schemelessUrls,
	type ResourceCandidatePageFetcher,
	type SanitizeCandidate,
} from './sanitize-resources-without-url.helpers';

const APPLY = process.argv.includes('--no-dry-run');

// El connector sirve de la CDN en producción: una remediación tiene que leer el estado real,
// no uno cacheado.
const sanityClient = client.withConfig({ useCdn: false });

const CANDIDATES_QUERY = `*[_type in ['author', 'literaryWork'] && _id > $cursor && defined(resources) && (count(resources[!defined(url) || url == '']) > 0 || count(resources[url in $schemelessUrls]) > 0)] | order(_id asc) [0...$pageSize] { _id, _type, 'slug': slug.current, resources[] { _key, url, title } }`;

const fetcher: ResourceCandidatePageFetcher = {
	fetchPage: (cursor, pageSize) =>
		sanityClient.fetch<readonly SanitizeCandidate[]>(CANDIDATES_QUERY, {
			cursor,
			pageSize,
			schemelessUrls: schemelessUrls(),
		}),
};

async function run(): Promise<void> {
	console.log(
		`Saneamiento de recursos sin URL — proyecto ${environment.sanity.projectId}, dataset ${environment.sanity.dataset}, ` +
			`modo ${APPLY ? 'APLICAR' : 'seco'}`,
	);

	if (APPLY && !environment.sanity.token) {
		console.error('Falta el token de escritura de Sanity (SANITY_STUDIO_TOKEN): no se intenta escribir.');
		process.exitCode = 1;
		return;
	}

	const report = await runResourceSanitization({
		fetcher,
		writer: sanityClient,
		apply: APPLY,
		pageSize: RESOURCE_SANITIZATION_PAGE_SIZE,
	});

	console.log(formatResourceSanitizationReport(report, { apply: APPLY }).join('\n'));

	if (report.failed.length > 0) {
		process.exitCode = 1;
	}
}

run().catch((error: unknown) => {
	console.error(error);
	process.exitCode = 1;
});
