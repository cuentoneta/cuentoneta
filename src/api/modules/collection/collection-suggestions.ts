import type { CollectionTeaser } from '@models/collection.model';
import type { Tag } from '@models/tag.model';

interface ScoredCollection {
	readonly collection: CollectionTeaser;
	readonly sharedTags: number;
	readonly sizeDistance: number;
}

/**
 * Ordena el catálogo como lista de sugerencias para una colección de referencia, que queda fuera del
 * resultado.
 *
 * La cercanía se mide por tags compartidos —por slug, sin contar repetidos—: cuantos más comparten,
 * antes aparecen. A igual cantidad de tags gana la colección de tamaño más parecido, y a igual tamaño
 * se conserva el orden del catálogo, que ya viene por título. Las colecciones sin tags en común no se
 * descartan: completan la lista, y el resultado trae menos de `limit` solo si no hay candidatas
 * suficientes.
 */
export function rankSuggestedCollections(
	target: CollectionTeaser,
	candidates: readonly CollectionTeaser[],
	limit: number,
): readonly CollectionTeaser[] {
	const targetTagSlugs = new Set(target.tags.map((tag) => tag.slug));
	const scored: ScoredCollection[] = [];

	for (const candidate of candidates) {
		if (candidate.slug !== target.slug) {
			scored.push({
				collection: candidate,
				sharedTags: countSharedTags(candidate.tags, targetTagSlugs),
				sizeDistance: Math.abs(candidate.count - target.count),
			});
		}
	}

	scored.sort((a, b) => b.sharedTags - a.sharedTags || a.sizeDistance - b.sizeDistance);

	return scored.slice(0, limit).map(({ collection }) => collection);
}

function countSharedTags(tags: readonly Tag[], targetTagSlugs: ReadonlySet<string>): number {
	const shared = new Set<string>();
	for (const tag of tags) {
		if (targetTagSlugs.has(tag.slug)) {
			shared.add(tag.slug);
		}
	}
	return shared.size;
}
