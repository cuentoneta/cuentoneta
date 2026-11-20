import type { LiteraryWork, LiteraryWorkTeaser } from '@models/literary-work.model';
import type { ReadingSuggestions, ReadingSuggestionsScope } from '@models/reading-suggestions.model';
import type { RotatingContent } from '@models/landing-page-content.model';
import type { Tag } from '@models/tag.model';
import { LiteraryWorkNotFoundError } from './literary-work.errors';
import type {
	LiteraryWorkRepository,
	LiteraryWorkSuggestionCandidate,
	LiteraryWorkTeaserFilter,
} from './literary-work.repository';
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

/**
 * Sirve las sugerencias de lectura al pie de una obra: las hermanas del ámbito con el que se llegó a
 * ella, ya elegidas y recortadas a `limit`.
 *
 * La obra que se lee entra como referencia —se descarta del resultado y presta sus tags para medir
 * afinidad—, no como recurso: quien la lee ya la tiene.
 */
export async function getReadingSuggestions(
	currentWorkSlug: string,
	scope: ReadingSuggestionsScope,
	limit: number,
	repository: LiteraryWorkRepository = new SanityLiteraryWorkRepository(),
): Promise<ReadingSuggestions> {
	// El repository traduce solo las obras que elige el criterio, así que el extracto de las descartadas
	// no se sanea y el bloque no recibe candidatas que no va a mostrar.
	const { title, literaryWorks, malformed } = await repository.fetchSuggestions(
		scope,
		(candidates) => rankSuggestions(candidates, currentWorkSlug),
		limit,
	);
	// La misma política de listado que el catálogo: la obra que el CMS dejó inconsistente se descarta
	// del bloque accesorio en vez de tumbarlo, y queda registrada en el servidor.
	for (const error of malformed) {
		console.warn(`[LiteraryWork] Obra descartada de las sugerencias de lectura: "${error.slug}"`, error.cause);
	}
	return { title, suggestions: literaryWorks };
}

interface ScoredCandidate {
	readonly candidate: LiteraryWorkSuggestionCandidate;
	readonly sharedTags: number;
}

// El criterio editorial del bloque: primero lo que más se parece a la obra que se lee, y el empate
// rota para que un ámbito prolífico no ofrezca siempre las mismas.
function rankSuggestions(
	candidates: readonly LiteraryWorkSuggestionCandidate[],
	currentWorkSlug: string,
): readonly string[] {
	const reference = candidates.find((candidate) => candidate.slug === currentWorkSlug);
	const referenceTagSlugs = new Set(reference?.tags.map((tag) => tag.slug));

	const scored: ScoredCandidate[] = [];
	for (const candidate of candidates) {
		if (candidate.slug !== currentWorkSlug) {
			scored.push({ candidate, sharedTags: countSharedTags(candidate.tags, referenceTagSlugs) });
		}
	}

	// `sort` es estable: los empates quedan en el orden del ámbito, que es el que la rotación conserva.
	scored.sort((a, b) => b.sharedTags - a.sharedTags);

	return rotateTied(scored, currentWorkSlug).map(({ candidate }) => candidate.slug);
}

// Rota cada tramo de afinidad empatada sin moverlo de lugar: el conjunto ofrecido sigue siendo el de
// las obras más cercanas, y el punto de arranque dentro del tramo lo fija la obra que se lee.
function rotateTied(scored: readonly ScoredCandidate[], currentWorkSlug: string): readonly ScoredCandidate[] {
	const hash = hashOf(currentWorkSlug);
	const rotated: ScoredCandidate[] = [];
	for (let start = 0; start < scored.length;) {
		let end = start;
		while (end < scored.length && scored[end].sharedTags === scored[start].sharedTags) {
			end++;
		}
		const tie = scored.slice(start, end);
		const offset = hash % tie.length;
		rotated.push(...tie.slice(offset), ...tie.slice(0, offset));
		start = end;
	}
	return rotated;
}

// FNV-1a de 32 bits sobre el slug: el punto de arranque tiene que ser el mismo en cada pedido —la
// respuesta se cachea en el borde—, así que sale de un hash y no del azar por pedido.
function hashOf(value: string): number {
	let hash = 0x811c9dc5;
	for (let index = 0; index < value.length; index++) {
		hash = Math.imul(hash ^ value.charCodeAt(index), 0x01000193);
	}
	return hash >>> 0;
}

// Un tag repetido en el documento de una obra cuenta una vez: sin el dedupe, esa obra ganaría
// afinidad por una duplicación de curaduría.
function countSharedTags(tags: readonly Tag[], referenceTagSlugs: ReadonlySet<string>): number {
	const shared = new Set<string>();
	for (const tag of tags) {
		if (referenceTagSlugs.has(tag.slug)) {
			shared.add(tag.slug);
		}
	}
	return shared.size;
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
