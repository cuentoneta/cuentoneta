import express from 'express';
import { client } from './_helpers/sanity-connector';
import { mapAuthorForStory, urlFor } from './_utils/functions';
import { mapMediaSources } from './_utils/media-sources.functions';
import { authorForStoryCard } from './_queries/author.query'

async function fetchPreview(req: express.Request, res: express.Response) {
	const { slug } = req.query;

	const query = `*[_type == 'storylist' && slug.current == '${slug}'][0]
                    { 
                        _id,
                        'slug': slug.current,
                        title,
                        description,
                        language,
                        displayDates,
                        editionPrefix,
                        comingNextLabel,
                        'tags': tags[] -> {
                            title, 
                            'slug': slug.current, 
                            description, 
                            'icon': {'name': icon.name, 'provider': icon.provider, 'svg': icon.svg}
                        },
                        featuredImage,
                        'gridConfig': { 
                            'gridTemplateColumns': previewGridConfig.gridTemplateColumns,
                            'titlePlacement': previewGridConfig.titlePlacement,
                            'cardsPlacement': previewGridConfig.cardsPlacement[]
                                {
                                    'order': order,
                                    'slug': publication.story->slug.current,
                                    'startCol': startCol,
                                    'image': image,
                                    'imageSlug': imageSlug.current,
                                    'endCol': endCol,
                                    'startRow': startRow,
                                    'endRow': endRow,
                                    'publication': {
                                        'publishingOrder': publication.publishingOrder,
                                        'publishingDate': publication.publishingDate,
                                        'published': publication.published,
                                        'story': publication.story->{
                                            _id,
                                            'slug': slug.current,
                                            title,
                                            badLanguage,
                                            categories,
                                            body[0...3],
                                            review,
                                            approximateReadingTime,
                                            language,
                                            mediaSources,
                                        	${authorForStoryCard}
                                        }
                                    }
                                }
                        },
                        'count': count(*[ _type == 'publication' && storylist._ref == ^._id ])
                    }`;

	const result = await client.fetch(query, {});

	if (!result) {
		res.json(null);
	}

	const previewImages = result.gridConfig.cardsPlacement?.filter((config: any) => !!config.imageSlug) ?? [];

	const storylist = {
		...result,
		// Elimina elementos publication traídos en la consulta a Sanity del objeto grid config
		gridConfig: {
			...result.gridConfig,
			cardsPlacement: result.gridConfig.cardsPlacement.map((placement: any) => {
				const { publication, image, ...other } = placement;
				return other;
			}),
		},
		featuredImage: !result.featuredImage ? undefined : urlFor(result.featuredImage).url(),
		images:
			previewImages.length === 0
				? []
				: previewImages.map((card: any) => ({
						slug: card.imageSlug,
						url: urlFor(card.image).url(),
					})),

		// Toma las publicaciones que fueron traídas en la consulta a Sanity y las mapea a una colección de publicaciones
		publications: result.gridConfig.cardsPlacement
			.filter((cardPlacement: any) => !!cardPlacement.publication && !!cardPlacement.publication.story)
			.map((cardPlacement: any) => cardPlacement.publication)
			.map((publication: any) => {
				const { review, body, author, ...story } = publication.story;
				return {
					...publication,
					story: {
						...story,
						summary: review,
						paragraphs: body,
						author: mapAuthorForStory(author),
					},
				};
			}),
	};

	res.json(storylist);
}
async function fetchStorylist(req: any, res: any) {
	const { slug, amount, ordering = 'asc' } = req.query;
	const limit = parseInt(amount as string) - 1;

	const query = `*[_type == 'storylist' && slug.current == '${slug}'][0]
                    { 
                        _id,
                        'slug': slug.current,
                        title,
                        description,
                        language,
                        displayDates,
                        editionPrefix,
                        comingNextLabel,
                        featuredImage,
                        'tags': tags[] -> {
                            title, 
                            'slug': slug.current, 
                            description, 
                            'icon': {'name': icon.name, 'provider': icon.provider, 'svg': icon.svg}
                        },
                        'gridConfig': {
                            'gridTemplateColumns': gridConfig.gridTemplateColumns,
                            'titlePlacement': gridConfig.titlePlacement,
                            'cardsPlacement': gridConfig.cardsPlacement[]
                            {
                                'order': order,
                                'slug': publication.story->slug.current,
                                'startCol': startCol,
                                'image': image,
                                'imageSlug': imageSlug.current,
                                'endCol': endCol,
                                'startRow': startRow,
                                'endRow': endRow,
                                'publication': {
                                     'publishingOrder': publication.publishingOrder,
                                     'publishingDate': publication.publishingDate,
                                     'published': publication.published,
                                     'story': publication.story->{
                                        _id,
                                        'slug': slug.current,
                                        title,
                                        categories,
                                        body[0...3],
                                        review,
                                        approximateReadingTime,
                                        language,
                                        mediaSources,
                                        ${authorForStoryCard}
                                    }
                                }
                          	}
                        },
                        'count': count(*[ _type == 'publication' && storylist._ref == ^._id ])
                    }`;

	const result = await client.fetch(query, {});

	if (!result) {
		res.json(null);
		return;
	}

	const storylistImages = result.gridConfig.cardsPlacement?.filter((config: any) => !!config.imageSlug) ?? [];

	const rawPublications = result.gridConfig.cardsPlacement
		.filter((cardPlacement: any) => !!cardPlacement.publication && !!cardPlacement.publication.story)
		.map((cardPlacement: any) => cardPlacement.publication);
	const publications = [];

	// Toma las publicaciones que fueron traídas en la consulta a Sanity y las mapea a una colección de publicaciones
	for (const publication of rawPublications) {
		const { review, body, author, mediaSources, ...story } = publication.story;
		publications.push({
			...publication,
			story: {
				...story,
				media: mediaSources ? await mapMediaSources(mediaSources) : undefined,
				summary: review,
				paragraphs: body,
				author: mapAuthorForStory(author),
			},
		});
	}

	const storylist = {
		...result,
		featuredImage: !result.featuredImage ? undefined : urlFor(result.featuredImage).url(),
		images:
			storylistImages.length === 0
				? []
				: storylistImages.map((card: any) => ({
						slug: card.imageSlug,
						url: urlFor(card.image).url(),
					})),
		publications: publications,
	};

	res.json(storylist);
}

export { fetchPreview, fetchStorylist };
