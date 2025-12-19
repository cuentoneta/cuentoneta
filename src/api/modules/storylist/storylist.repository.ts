// Sanity
import { client } from '../../_helpers/sanity-connector';

// Queries
import { storylistNavigationTeasersQuery, storylistQuery, storylistTeasersQuery } from '../../_queries/storylist.query';
import {
	mapAuthorTeaser,
	mapBlockContentToTextParagraphs,
	mapStorylist,
	mapStorylistTeasers,
	mapTags,
	urlFor,
} from '../../_utils/functions';
import { Storylist, StorylistPublicationsNavigationTeasers, StorylistTeaser } from '@models/storylist.model';

export async function fetchAllStorylistTeasers(): Promise<StorylistTeaser[]> {
	const result = await client.fetch(storylistTeasersQuery);
	return mapStorylistTeasers(result);
}

export async function fetchStorylistBySlug(slug: string): Promise<Storylist> {
	const result = await client.fetch(storylistQuery, { slug });

	if (!result) {
		throw new Error(`Storylist with slug ${slug} not found`);
	}

	return mapStorylist(result);
}

type FetchStorylistNavigationTeasersByStorylistSlugParams = {
	slug: string;
	start: number;
	end: number;
};
export async function fetchStorylistNavigationTeaserByStorylistSlug(
	params: FetchStorylistNavigationTeasersByStorylistSlugParams,
): Promise<StorylistPublicationsNavigationTeasers> {
	const result = await client.fetch(storylistNavigationTeasersQuery, params);

	if (!result) {
		throw new Error(`Storylist with slug ${params.slug} not found`);
	}

	return {
		...result,
		config: {
			...result.config,
			showAuthors: result.config?.showAuthors ?? false,
		},
		description: mapBlockContentToTextParagraphs(result.description),
		tags: mapTags(result.tags),
		featuredImage: urlFor(result.featuredImage),
		publications: result.publications.map((p) => ({
			...p,
			story: { ...p.story, author: mapAuthorTeaser(p.story.author), paragraphs: [], media: [] },
		})),
	};
}
