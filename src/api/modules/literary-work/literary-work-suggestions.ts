import type { LiteraryWorkTeaser } from '@models/literary-work.model';
import type { Tag } from '@models/tag.model';

interface ScoredLiteraryWork {
	readonly literaryWork: LiteraryWorkTeaser;
	readonly sharedTags: number;
}

/**
 * Ordena las obras de un ámbito como lista de sugerencias para la obra que se está leyendo, que queda
 * fuera del resultado.
 *
 * La cercanía se mide por tags compartidos —por slug, sin contar repetidos—: cuantas más comparte una
 * obra con la que se lee, antes aparece. Las obras sin tags en común no se descartan: completan la
 * lista, y el resultado trae menos de `limit` solo si el ámbito no tiene candidatas suficientes.
 *
 * A igual afinidad el orden rota según la obra que se lee, así que un ámbito prolífico no ofrece
 * siempre las mismas obras. La rotación es la misma para todos los pedidos de esa obra: el orden sigue
 * dependiendo del ámbito, del catálogo y de la obra que se lee, nunca del pedido.
 */
export function rankSuggestedLiteraryWorks(
	candidates: readonly LiteraryWorkTeaser[],
	currentWorkSlug: string,
	limit: number,
): readonly LiteraryWorkTeaser[] {
	const reference = candidates.find((candidate) => candidate.slug === currentWorkSlug);
	const referenceTagSlugs = new Set(reference?.tags.map((tag) => tag.slug));

	const scored: ScoredLiteraryWork[] = [];
	for (const candidate of candidates) {
		if (candidate.slug !== currentWorkSlug) {
			scored.push({ literaryWork: candidate, sharedTags: countSharedTags(candidate.tags, referenceTagSlugs) });
		}
	}

	// `sort` es estable: los empates quedan en el orden del ámbito, que es el que la rotación conserva.
	scored.sort((a, b) => b.sharedTags - a.sharedTags);

	return rotateTied(scored, currentWorkSlug)
		.slice(0, limit)
		.map(({ literaryWork }) => literaryWork);
}

// Rota cada tramo de afinidad empatada, sin moverlo de lugar: el conjunto que se ofrece sigue siendo el
// de las obras más cercanas, y el punto de arranque dentro del tramo lo fija la obra que se lee.
function rotateTied(scored: readonly ScoredLiteraryWork[], currentWorkSlug: string): readonly ScoredLiteraryWork[] {
	const hash = hashOf(currentWorkSlug);
	const rotated: ScoredLiteraryWork[] = [];
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

function countSharedTags(tags: readonly Tag[], referenceTagSlugs: ReadonlySet<string>): number {
	const shared = new Set<string>();
	for (const tag of tags) {
		if (referenceTagSlugs.has(tag.slug)) {
			shared.add(tag.slug);
		}
	}
	return shared.size;
}
