import { randomUUID } from 'node:crypto';
import { client } from '../src/api/_helpers/sanity-connector';

interface StoryProjection {
	authorRef?: string;
	tagRefs: Array<string | null>;
}

interface AuthorProjection {
	_id: string;
	tagRefs: Array<string | null>;
}

const runReconciliation = async () => {
	const stories: StoryProjection[] = await client.fetch(`*[_type == 'story' && !(_id in path('drafts.**'))] {
      'authorRef': author._ref,
      'tagRefs': tags[]._ref
    }`);

	const authors: AuthorProjection[] = await client.fetch(`*[_type == 'author' && !(_id in path('drafts.**'))] {
      _id,
      'tagRefs': coalesce(tags[]._ref, [])
    }`);

	const authorsById = new Map(authors.map((a) => [a._id, a]));

	const authorTagsFromStories = new Map<string, Set<string>>();

	for (const story of stories) {
		const authorRef = story.authorRef;
		if (!authorRef) continue;

		const tagRefs = story.tagRefs.filter((ref): ref is string => ref !== null);
		if (tagRefs.length === 0) continue;

		const tagSet = authorTagsFromStories.get(authorRef);
		if (tagSet) {
			for (const ref of tagRefs) {
				tagSet.add(ref);
			}
		} else {
			authorTagsFromStories.set(authorRef, new Set(tagRefs));
		}
	}

	const transaction = [...authorTagsFromStories].reduce((tx, [authorRef, derivedRefs]) => {
		const existingRefs = new Set(
			(authorsById.get(authorRef)?.tagRefs ?? []).filter((ref): ref is string => ref !== null),
		);

		const allTags = [...existingRefs];
		let added = 0;
		for (const ref of derivedRefs) {
			if (!existingRefs.has(ref)) {
				allTags.push(ref);
				added++;
			}
		}

		return added === 0
			? tx
			: tx.patch(authorRef, (patch) =>
					patch.set({ tags: allTags.map((ref) => ({ _key: randomUUID(), _ref: ref, _type: 'reference' as const })) }),
				);
	}, client.transaction());

	await transaction.commit();
};

runReconciliation().catch((err) => {
	console.error('Reconciliation failed:', err);
	process.exit(1);
});
