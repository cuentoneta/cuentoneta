import { type Catalog, createCatalog } from '@models/catalog.model';
import type { LiteraryWork, LiteraryWorkCatalogEntry, LiteraryWorkTeaser } from '@models/literary-work.model';
import type { RotatingContent } from '@models/landing-page-content.model';
import { LiteraryWorkNotFoundError, type MalformedLiteraryWorkError } from './literary-work.errors';
import type { LiteraryWorkRepository, LiteraryWorkTeaserFilter } from './literary-work.repository';
import { SanityLiteraryWorkRepository } from './literary-work.repository.sanity';
import type { ContentRepository } from '../content/content.repository';
import { SanityContentRepository } from '../content/content.repository.sanity';
import { getRotatingContent } from '../content/content.service';
import { fetchClarityData } from '../../_helpers/clarity-connector';
import { ClarityResponseError } from '../../_helpers/clarity-connector.errors';
import { environment } from '../../_helpers/environment';
import { getPopularPagesMetric } from '../../_utils/clarity.utils';

// El repository es stateless, así que instanciarlo por llamada (default) no comparte estado.
export async function getLiteraryWorkBySlug(
	slug: string,
	repository: LiteraryWorkRepository = new SanityLiteraryWorkRepository(),
): Promise<LiteraryWork> {
	const literaryWork = await repository.fetchBySlug(slug);
	if (!literaryWork) {
		throw new LiteraryWorkNotFoundError(slug);
	}
	return literaryWork;
}

// Descartar es una política del consumidor y no de traducción, por eso se decide acá: una obra que
// el CMS dejó inconsistente no debe llevarse puestas a las demás. El registro en el servidor es lo
// único que distingue este caso del filtro que legítimamente no tiene resultados, y la consecuencia la
// nombra cada caso de uso, porque es quien sabe qué se perdió.
function reportDiscarded(malformed: readonly MalformedLiteraryWorkError[], consequence: string): void {
	malformed.forEach((error) =>
		console.warn(`[LiteraryWork] Obra mal formada ${consequence}: "${error.slug}"`, error.cause),
	);
}

// Los avances para las selecciones y para las listas dentro de un destino.
export async function getLiteraryWorkTeasers(
	filter: LiteraryWorkTeaserFilter & { readonly author: string },
	repository: LiteraryWorkRepository = new SanityLiteraryWorkRepository(),
): Promise<readonly LiteraryWorkTeaser[]> {
	const { teasers, malformed } = await repository.fetchTeasers(filter);
	reportDiscarded(malformed, 'descartada de los avances');
	return teasers;
}

// El catálogo para la superficie `/literary-work`: excluye lo mal formado y entrega en el orden del
// repository, sin reordenar.
export async function getLiteraryWorkCatalog(
	repository: LiteraryWorkRepository = new SanityLiteraryWorkRepository(),
): Promise<Catalog<LiteraryWorkCatalogEntry>> {
	const { catalogEntries, malformed } = await repository.fetchCatalogEntries();
	reportDiscarded(malformed, 'excluida del catálogo');
	return createCatalog(catalogEntries, catalogEntries.length);
}

// Clarity reporta la URL visitada, no el slug: puede traer querystring de campaña, un ancla a una
// sección o una barra final, y ninguna de las tres formas resuelve contra `slug.current`. Sin
// normalizar, la obra más leída desaparece del ranking justo cuando llega tráfico de campaña.
function slugFromReadingUrl(url: string, prefix: string): string | undefined {
	if (!url.startsWith(prefix)) {
		return undefined;
	}
	const [path] = url.slice(prefix.length).split(/[?#]/);
	const slug = path.replace(/\/+$/, '');
	return slug === '' ? undefined : slug;
}

// La métrica registra la URL que el lector visitó, no la que el servidor sirvió, así que el prefijo
// de lectura anterior siguió aportando mientras quedó tráfico suyo dentro de la ventana. Ya no se
// mira porque el 301 de `src/server.ts` lleva desplegado más que esos tres días: lo que llegue hoy
// bajo el prefijo viejo rankearía una ruta que el servidor ya no sirve.
export async function updateMostReadLiteraryWorks(
	contentRepository: ContentRepository = new SanityContentRepository(),
): Promise<RotatingContent> {
	const popularPagesMetric = getPopularPagesMetric(await fetchClarityData());
	if (!popularPagesMetric) {
		throw new ClarityResponseError('the PopularPages metric is missing');
	}

	const readingPathPrefix = `${environment.basePath}/literary-work/`;
	// El `Set` conserva el orden de inserción, que es el de Clarity: la deduplicación no reordena, y el
	// orden **es** el ranking.
	const rankedSlugs = [
		...new Set(
			popularPagesMetric.information.flatMap((entry) => slugFromReadingUrl(entry.url, readingPathPrefix) ?? []),
		),
	];

	await contentRepository.updateMostReadLiteraryWorks(rankedSlugs);

	return await getRotatingContent(contentRepository);
}
