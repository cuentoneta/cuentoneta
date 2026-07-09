/**
 * Lógica pura de completitud de fichas para datos estructurados (SEO/AEO).
 * Separada del I/O de Sanity para poder testearla sin red.
 *
 * Cada campo se define como una regla `{ gap, missing }` — agregar un campo
 * es una fila en la tabla, no un nuevo `if`.
 */
export const BIOGRAPHY_MIN_CHARS = 80;

export type AuthorGap = 'slug' | 'image' | 'sameAs' | 'nationality' | 'biography' | 'bornOn' | 'diedOn';

export type StoryGap = 'title' | 'slug' | 'author' | 'publishedAt' | 'originalPublication' | 'review';

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

interface FieldRule<TGap extends string, TInput> {
	gap: TGap;
	/** true ⇒ el campo falta / debilita structured data. */
	missing: (input: TInput) => boolean;
	/** false ⇒ no entra al score (p. ej. diedOn en autores vivos). Default true. */
	core?: boolean;
}

const hasNonEmptyUrl = (urls: Array<string | null> | null): boolean =>
	(urls ?? []).some((u) => typeof u === 'string' && u.trim().length > 0);

const AUTHOR_RULES: readonly FieldRule<AuthorGap, AuthorAuditInput>[] = Object.freeze([
	{ gap: 'slug', missing: (i) => !i.slug?.trim() },
	{ gap: 'image', missing: (i) => !i.hasImage },
	{ gap: 'sameAs', missing: (i) => !hasNonEmptyUrl(i.resourceUrls) },
	{ gap: 'nationality', missing: (i) => !i.hasNationality },
	{ gap: 'biography', missing: (i) => (i.biographyText ?? '').trim().length < BIOGRAPHY_MIN_CHARS },
	{ gap: 'bornOn', missing: (i) => !i.bornOn?.trim() },
	{ gap: 'diedOn', missing: (i) => !i.diedOn?.trim(), core: false },
]);

const STORY_RULES: readonly FieldRule<StoryGap, StoryAuditInput>[] = Object.freeze([
	{ gap: 'title', missing: (i) => !i.title?.trim() },
	{ gap: 'slug', missing: (i) => !i.slug?.trim() },
	{ gap: 'author', missing: (i) => !i.hasAuthor },
	{ gap: 'publishedAt', missing: (i) => !i.hasPublishedAt },
	{ gap: 'originalPublication', missing: (i) => !i.originalPublication?.trim() },
	{ gap: 'review', missing: (i) => !(i.reviewText ?? '').trim() },
]);

export const AUTHOR_CORE_GAPS: readonly AuthorGap[] = Object.freeze(
	AUTHOR_RULES.filter((r) => r.core !== false).map((r) => r.gap),
);

export const STORY_GAPS: readonly StoryGap[] = Object.freeze(STORY_RULES.map((r) => r.gap));

const collectGaps = <TGap extends string, TInput>(rules: readonly FieldRule<TGap, TInput>[], input: TInput): TGap[] =>
	rules.filter((r) => r.missing(input)).map((r) => r.gap);

const coreGapsOf = <TGap extends string, TInput>(
	rules: readonly FieldRule<TGap, TInput>[],
	gaps: readonly TGap[],
): TGap[] => {
	const core = new Set(rules.filter((r) => r.core !== false).map((r) => r.gap));
	return gaps.filter((g) => core.has(g));
};

export function evaluateAuthor(input: AuthorAuditInput): AuthorAuditResult {
	const gaps = collectGaps(AUTHOR_RULES, input);
	const coreGaps = coreGapsOf(AUTHOR_RULES, gaps);
	return {
		name: input.name,
		slug: input.slug,
		gaps,
		coreGaps,
		incompleteness: coreGaps.length / AUTHOR_CORE_GAPS.length,
	};
}

export function evaluateStory(input: StoryAuditInput): StoryAuditResult {
	const gaps = collectGaps(STORY_RULES, input);
	return {
		title: input.title,
		slug: input.slug,
		gaps,
		usesCreatedAtFallback: !input.hasPublishedAt,
		incompleteness: gaps.length / STORY_GAPS.length,
	};
}

/** Cuenta cuántos ítems reportan cada gap (una pasada sobre flatMap). */
export function groupByGap<T extends string>(
	items: Array<{ gaps: readonly T[] }>,
	allGaps: readonly T[],
): Record<T, number> {
	const counts = Object.fromEntries(allGaps.map((g) => [g, 0])) as Record<T, number>;
	for (const gap of items.flatMap((item) => item.gaps)) {
		if (gap in counts) counts[gap] += 1;
	}
	return counts;
}
