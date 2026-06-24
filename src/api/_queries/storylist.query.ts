import { defineQuery } from 'groq';

export const storylistTeasersQuery = defineQuery(`
*[_type == 'storylist' && !(_id in path('drafts.**'))]{
    _id,
    'slug': slug.current,
    title,
    description,
    featuredImage,
    'coverImages': coalesce(stories[0...3]->author->image, []),
    'tags': coalesce(tags[] -> {
        title,
        'slug': slug.current,
        shortDescription,
        description,
        icon
    }, []),
    'stories': [],
    'count': coalesce(count(stories), 0),
    config,
    'tabs': [],
		'mediaSources': coalesce(mediaSources[], []),
    }
`);

export const storylistStoriesNavigationTeasersQuery = defineQuery(`
*[_type == 'storylist' && slug.current == $slug && !(_id in path('drafts.**'))][0]
{
		_id,
    'slug': slug.current,
    title,
    description,
    featuredImage,
    'tags': [],
    'stories': coalesce(stories[$start...$end]->{
    		_id,
        'slug': slug.current,
        title,
        badLanguage,
        'body': [],
        originalPublication,
        approximateReadingTime,
        'resources': [],
        'tags': [],
        'mediaSources': coalesce(mediaSources[], []),
        'author': author->{
            _id,
            'slug': slug.current,
            name,
            image,
            nationality->,
            'biography': [],
						bornOn,
						bornOnYear,
						diedOn,
						diedOnYear,
            'resources': [],
        }
    }, []),
    'count': coalesce(count(stories), 0),
    config,
    'tabs': [],
		'mediaSources': [],
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
    'tags': coalesce(tags[] -> {
        title,
        'slug': slug.current,
        shortDescription,
        description,
        icon
    }, []),
    'stories': coalesce(stories[]->{
        _id,
        'slug': slug.current,
        title,
        badLanguage,
        'body': coalesce(body[0...3], []),
        originalPublication,
        approximateReadingTime,
        'resources': [],
        'tags': [],
        'mediaSources': coalesce(mediaSources[], []),
        'author': author->{
            _id,
            'slug': slug.current,
            name,
            image,
            nationality->,
            'biography': [],
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
