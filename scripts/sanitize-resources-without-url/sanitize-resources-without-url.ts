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
 *   pnpm ops sanitize:resources-without-url                 # corrida en seco: reporta qué se sanearía
 *   pnpm ops sanitize:resources-without-url --no-dry-run    # persiste
 */
import { client } from '../../src/api/_helpers/sanity-connector';
import { environment } from '../../src/api/_helpers/environment';
import {
	formatResourceSanitizationReport,
	RESOURCE_SANITIZATION_PAGE_SIZE,
	runResourceSanitization,
	schemelessUrls,
	type ResourceCandidatePageFetcher,
	type SanitizeCandidate,
} from './sanitize-resources-without-url.helpers';
import type { OpsTask } from '../ops/registry';

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

export const task: OpsTask = {
	run: async ({ apply }) => {
		console.log(
			`Saneamiento de recursos sin URL — proyecto ${environment.sanity.projectId}, dataset ${environment.sanity.dataset}, ` +
				`modo ${apply ? 'APLICAR' : 'seco'}`,
		);

		if (apply && !environment.sanity.token) {
			throw new Error('Falta el token de escritura de Sanity (SANITY_STUDIO_TOKEN): no se intenta escribir.');
		}

		const report = await runResourceSanitization({
			fetcher,
			writer: sanityClient,
			apply,
			pageSize: RESOURCE_SANITIZATION_PAGE_SIZE,
		});

		console.log(formatResourceSanitizationReport(report, { apply }).join('\n'));

		if (report.failed.length > 0) {
			throw new Error(`Falló el saneamiento de recursos en ${report.failed.length} documentos.`);
		}
	},
};
