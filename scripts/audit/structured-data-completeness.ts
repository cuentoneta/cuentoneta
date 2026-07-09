/**
 * Lógica pura de completitud de fichas para datos estructurados (SEO/AEO).
 * Separada del I/O de Sanity para poder testearla sin red.
 */
export const BIOGRAPHY_MIN_CHARS = 80;

export type AuthorGap = 'slug' | 'image' | 'sameAs' | 'nationality' | 'biography' | 'bornOn' | 'diedOn';

/** Gaps que alimentan Person / URL de perfil; `diedOn` es enriquecimiento opcional (autores vivos). */
export const AUTHOR_CORE_GAPS: readonly AuthorGap[] = Object.freeze([
	'slug',
	'image',
	'sameAs',
	'nationality',
	'biography',
	'bornOn',
] as const);

export type StoryGap = 'title' | 'slug' | 'author' | 'publishedAt' | 'originalPublication' | 'review';

export const STORY_GAPS: readonly StoryGap[] = Object.freeze([
	'title',
	'slug',
	'author',
	'publishedAt',
	'originalPublication',
	'review',
] as const);

export interface AuthorAuditInput {
	name: string;
	slug: string | null;
	hasImage: boolean;
	resourceUrls: Array<string | null> | null;
	hasNationality: boolean;
	biographyText: string | null;
	bornOn: string | null;
	diedOn: string | null;
}

export interface StoryAuditInput {
	title: string | null;
	slug: string | null;
	hasAuthor: boolean;
	hasPublishedAt: boolean;
	originalPublication: string | null;
	reviewText: string | null;
}

export interface AuthorAuditResult {
	name: string;
	slug: string | null;
	gaps: AuthorGap[];
	coreGaps: AuthorGap[];
	/** 0 = completa (core); 1 = todos los core faltan. */
	incompleteness: number;
}

export interface StoryAuditResult {
	title: string | null;
	slug: string | null;
	gaps: StoryGap[];
	usesCreatedAtFallback: boolean;
	incompleteness: number;
}

export function evaluateAuthor(input: AuthorAuditInput): AuthorAuditResult {
	const gaps: AuthorGap[] = [];
	if (!input.slug?.trim()) gaps.push('slug');
	if (!input.hasImage) gaps.push('image');
	const urls = (input.resourceUrls ?? []).filter((u): u is string => typeof u === 'string' && u.trim().length > 0);
	if (urls.length === 0) gaps.push('sameAs');
	if (!input.hasNationality) gaps.push('nationality');
	const bio = (input.biographyText ?? '').trim();
	if (bio.length < BIOGRAPHY_MIN_CHARS) gaps.push('biography');
	if (!input.bornOn?.trim()) gaps.push('bornOn');
	if (!input.diedOn?.trim()) gaps.push('diedOn');

	const coreGaps = gaps.filter((g): g is AuthorGap => (AUTHOR_CORE_GAPS as readonly string[]).includes(g));
	return {
		name: input.name,
		slug: input.slug,
		gaps,
		coreGaps,
		incompleteness: coreGaps.length / AUTHOR_CORE_GAPS.length,
	};
}

export function evaluateStory(input: StoryAuditInput): StoryAuditResult {
	const gaps: StoryGap[] = [];
	if (!input.title?.trim()) gaps.push('title');
	if (!input.slug?.trim()) gaps.push('slug');
	if (!input.hasAuthor) gaps.push('author');
	const usesCreatedAtFallback = !input.hasPublishedAt;
	if (usesCreatedAtFallback) gaps.push('publishedAt');
	if (!input.originalPublication?.trim()) gaps.push('originalPublication');
	const review = (input.reviewText ?? '').trim();
	if (review.length === 0) gaps.push('review');

	return {
		title: input.title,
		slug: input.slug,
		gaps,
		usesCreatedAtFallback,
		incompleteness: gaps.length / STORY_GAPS.length,
	};
}

export function groupByGap<T extends string>(items: Array<{ gaps: T[] }>, allGaps: readonly T[]): Record<T, number> {
	const counts = Object.fromEntries(allGaps.map((g) => [g, 0])) as Record<T, number>;
	for (const item of items) {
		for (const g of item.gaps) {
			if (g in counts) counts[g]++;
		}
	}
	return counts;
}
