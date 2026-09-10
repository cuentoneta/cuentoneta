import type { ReconcileAuthorTagsAuthorsQueryResult, ReconcileAuthorTagsWorksQueryResult } from '@sanity-types';

// El shape lo declara el typegen a partir de la propia query: un rename de schema rompe el typecheck.
export type LiteraryWorkTagProjection = ReconcileAuthorTagsWorksQueryResult[number];
export type AuthorTagProjection = ReconcileAuthorTagsAuthorsQueryResult[number];
export type ExistingTagReference = AuthorTagProjection['tags'][number];

export interface AuthorTagPatchPlan {
	readonly authorId: string;
	readonly kept: ReadonlyArray<ExistingTagReference>;
	readonly missing: ReadonlyArray<string>;
}

export function collectDerivedTags(works: ReadonlyArray<LiteraryWorkTagProjection>): Map<string, Set<string>> {
	const derived = new Map<string, Set<string>>();
	for (const work of works.filter((candidate) => candidate.tagRefs.length > 0)) {
		for (const authorRef of work.authorRefs) {
			const collected = derived.get(authorRef) ?? new Set<string>();
			for (const tagRef of work.tagRefs) {
				collected.add(tagRef);
			}
			derived.set(authorRef, collected);
		}
	}
	return derived;
}

export function planAuthorTagPatches(
	authors: ReadonlyArray<AuthorTagProjection>,
	derivedByAuthor: ReadonlyMap<string, ReadonlySet<string>>,
): AuthorTagPatchPlan[] {
	const none: ReadonlySet<string> = new Set();
	return authors
		.map((author) => toPatchPlan(author, derivedByAuthor.get(author._id) ?? none))
		.filter((plan) => plan.missing.length > 0);
}

function toPatchPlan(author: AuthorTagProjection, derived: ReadonlySet<string>): AuthorTagPatchPlan {
	const known = new Set(author.tags.map((tag) => tag._ref));
	return {
		authorId: author._id,
		kept: author.tags,
		missing: [...derived].filter((ref) => !known.has(ref)),
	};
}
