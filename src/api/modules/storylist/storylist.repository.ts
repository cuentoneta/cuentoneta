// Sanity
import { getClient } from '../../_helpers/sanity-connector';

// Modelos
import { Storylist, StorylistStoriesNavigationTeasers, StorylistTeaser } from '@models/storylist.model';
import { StoryTeaserWithAuthor } from '@models/story.model';

// Queries
import {
	storylistStoriesNavigationTeasersQuery,
	storylistQuery,
	storylistTeasersQuery,
} from '../../_queries/storylist.query';

// Utilidades
import { mapMediaSources, mapMediaSourcesTeasers } from '../../_utils/media-sources.functions';
import {
	mapAuthorTeaser,
	mapBlockContentToTextParagraphs,
	mapStoryTeaserWithAuthor,
	mapTags,
	urlFor,
} from '../../_utils/functions';
import { mapImagery } from '../../_utils/storylist-imagery.functions';

export async function fetchAllStorylistTeasers(): Promise<StorylistTeaser[]> {
	const result = await getClient().fetch(storylistTeasersQuery);

	return result.map((item) => {
		const { featuredImage, storyCoverImages, mediaSources, ...rest } = item;
		return {
			...rest,
			config: { ...item.config, showAuthors: item.config?.showAuthors ?? false },
			description: mapBlockContentToTextParagraphs(item.description),
			tags: mapTags(item.tags),
			stories: [],
			tabs: [],
			media: mapMediaSourcesTeasers(mediaSources),
			imagery: mapImagery({ featuredImage, storyCoverImages }),
		};
	});
}

export async function fetchStorylistBySlug(slug: string): Promise<Storylist> {
	const result = await getClient().fetch(storylistQuery, { slug });

	if (!result) {
		throw new Error(`Storylist with slug ${slug} not found`);
	}

	// Toma las publicaciones que fueron traídas en la consulta a Sanity y las mapea a una colección de publicaciones
	const stories: StoryTeaserWithAuthor[] = [];
	for (const { coverImage, ...story } of result.stories) {
		stories.push(
			mapStoryTeaserWithAuthor({
				...story,
				author: mapAuthorTeaser({ ...story.author }),
				coverImage: urlFor(coverImage),
				media: mapMediaSourcesTeasers(story.mediaSources),
				paragraphs: mapBlockContentToTextParagraphs(story.body),
				resources: [],
				tags: [],
			}),
		);
	}

	const { featuredImage, storyCoverImages, ...rest } = result;
	return {
		...rest,
		config: {
			...result.config,
			showAuthors: result.config?.showAuthors ?? false,
		},
		description: mapBlockContentToTextParagraphs(result.description),
		tags: mapTags(result.tags),
		imagery: mapImagery({ featuredImage, storyCoverImages }),
		stories,
		tabs: result.tabs.map((tab) => ({
			title: tab.title,
			slug: tab.slug.current,
			content: mapBlockContentToTextParagraphs(tab.content),
			icon: tab.icon ?? undefined,
		})),
		media: mapMediaSources(result.mediaSources),
	};
}

type FetchStorylistNavigationTeasersByStorylistSlugParams = {
	slug: string;
	start: number;
	end: number;
};
export async function fetchStorylistStoriesNavigationTeaserByStorylistSlug(
	params: FetchStorylistNavigationTeasersByStorylistSlugParams,
): Promise<StorylistStoriesNavigationTeasers> {
	const result = await getClient().fetch(storylistStoriesNavigationTeasersQuery, params);

	if (!result) {
		throw new Error(`Storylist with slug ${params.slug} not found`);
	}

	const { featuredImage, storyCoverImages, ...rest } = result;
	return {
		...rest,
		config: {
			...result.config,
			showAuthors: result.config?.showAuthors ?? false,
		},
		description: mapBlockContentToTextParagraphs(result.description),
		tags: mapTags(result.tags),
		imagery: mapImagery({ featuredImage, storyCoverImages }),
		stories: result.stories.map(({ coverImage, ...story }) => ({
			...story,
			author: mapAuthorTeaser(story.author),
			coverImage: urlFor(coverImage),
			paragraphs: [],
			media: [],
			tags: [],
		})),
		tabs: [],
		media: [],
	};
}
