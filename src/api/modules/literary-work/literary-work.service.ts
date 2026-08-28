import type { LiteraryWork, LiteraryWorkTeaser } from '@models/literary-work.model';
import type { RotatingContent } from '@models/landing-page-content.model';
import { LiteraryWorkNotFoundError } from './literary-work.errors';
import type { LiteraryWorkRepository, LiteraryWorkTeaserFilter } from './literary-work.repository';
import { SanityLiteraryWorkRepository } from './literary-work.repository.sanity';
import type { ContentRepository } from '../content/content.repository';
import { SanityContentRepository } from '../content/content.repository.sanity';
import { getRotatingContent } from '../content/content.service';
import { fetchClarityData } from '../../_helpers/clarity-connector';
import { environment } from '../../_helpers/environment';

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

// Sirve el catálogo de obras que satisfacen el filtro, como teasers.
export async function getLiteraryWorkTeasers(
	filter: LiteraryWorkTeaserFilter,
	repository: LiteraryWorkRepository = new SanityLiteraryWorkRepository(),
): Promise<readonly LiteraryWorkTeaser[]> {
	const { literaryWorks, malformed } = await repository.fetchTeasers(filter);
	// Descartar es una política de listado y no de traducción, por eso se decide acá: una obra que el
	// CMS dejó inconsistente no debe llevarse puestas a las demás. El registro en el servidor es lo
	// único que distingue este caso del filtro que legítimamente no tiene resultados.
	for (const error of malformed) {
		console.warn(`[LiteraryWork] Obra descartada del listado de teasers: "${error.slug}"`, error.cause);
	}
	return literaryWorks;
}

// Clarity reporta la URL visitada, no el slug: puede traer querystring de campaña, un ancla a una
// sección o una barra final, y ninguna de las tres formas resuelve contra `slug.current`. Sin
// normalizar, la obra más leída desaparece del ranking justo cuando llega tráfico de campaña.
function slugFromReadingUrl(url: string, prefixes: readonly string[]): string | undefined {
	const prefix = prefixes.find((candidate) => url.startsWith(candidate));
	if (prefix === undefined) {
		return undefined;
	}
	const [path] = url.slice(prefix.length).split(/[?#]/);
	const slug = path.replace(/\/+$/, '');
	return slug === '' ? undefined : slug;
}

// La métrica registra la URL que el lector visitó, no la que el servidor sirvió. El prefijo de
// lectura anterior ya no se mira porque `src/server.ts` lo redirige con 301, así que la visita se
// reporta contra la ruta de destino.
export async function updateMostReadLiteraryWorks(
	contentRepository: ContentRepository = new SanityContentRepository(),
): Promise<RotatingContent> {
	const popularPagesMetrics = (await fetchClarityData()).find((metric) => metric.metricName === 'PopularPages');
	if (!popularPagesMetrics) {
		throw new Error('Could not fetch metrics.');
	}

	const readingPathPrefixes = [`${environment.basePath}/literary-work/`];
	// El `Set` conserva el orden de inserción, que es el de Clarity: la deduplicación no reordena, y el
	// orden **es** el ranking.
	const rankedSlugs = [
		...new Set(
			popularPagesMetrics.information.flatMap((entry) => slugFromReadingUrl(entry.url, readingPathPrefixes) ?? []),
		),
	];

	await contentRepository.updateMostReadLiteraryWorks(rankedSlugs);

	return await getRotatingContent(contentRepository);
}
