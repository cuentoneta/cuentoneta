import { defineQuery } from 'groq';

export const storylistTeasersQuery = defineQuery(`
*[_type == 'storylist' && !(_id in path('drafts.**'))]{
    _id,
    'slug': slug.current,
    title,
    description,
    featuredImage,
    'tags': coalesce(tags[] -> {
        title,
        'slug': slug.current,
        description
    }, []),
    'storyCoverImages': coalesce(stories[]->coverImage, []),
    'count': coalesce(count(stories), 0),
    config,
    'tabs': [],
		'mediaSources': coalesce(mediaSources[], []),
    }
`);

export const storylistQuery = defineQuery(`
*[_type == 'storylist' && slug.current == $slug && !(_id in path('drafts.**'))][0]
{
    _id,
    'slug': slug.current,
    title,
    description,
    featuredImage,
    'storyCoverImages': coalesce(stories[0...3]->coverImage, []),
    'tags': coalesce(tags[] -> {
        title,
        'slug': slug.current,
        description
    }, []),
    'stories': coalesce(stories[]->{
        _id,
        'slug': slug.current,
        title,
        badLanguage,
        'body': coalesce(body[0...3], []),
        originalPublication,
        approximateReadingTime,
        coverImage,
        'resources': [],
        'mediaSources': coalesce(mediaSources[], []),
        'author': author->{
            _id,
            'slug': slug.current,
            name,
            image,
            nationality->,
						bornOn,
						bornOnYear,
						diedOn,
						diedOnYear,
            'resources': [],
        }
    }, []),
    'count': coalesce(count(stories), 0),
    config,
    'tabs': coalesce(tabs[], []),
		'mediaSources': coalesce(mediaSources[]{
			...,
			_type == 'spaceRecording' => {
				'audioUrl': audioFile.asset->url
			}
		}, []),
    }
`);
