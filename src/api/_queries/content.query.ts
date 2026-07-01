import { defineQuery } from 'groq';

export const rotatingContentQuery = defineQuery(`
*[_type == 'rotatingContent' && _id == 'rotatingContent'][0]{
    _id,
    name,
    'mostRead': coalesce(mostRead[]->{
        _id,
        'slug': slug.current,
        title,
        badLanguage,
        'body': [],
        originalPublication,
        approximateReadingTime,
        coverImage,
        'resources': [],
        'mediaSources': coalesce(mediaSources[], []),
        'author': author-> {
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
    },[])
}`);

export const landingPageListQuery = defineQuery(`
*[_type == 'landingPage' && !(_id in path('drafts.**')) && slug.current in $slugs]{
		_id,
		'slug': slug.current,
		config,
}`);

export const latestLandingPageReferencesQuery = defineQuery(`
*[_type == 'landingPage' && !(_id in path('drafts.**'))]{
    _id,
    _type,
    'slug': slug.current,
    config,
    'cards': coalesce(cards[],[]),
    'campaigns': coalesce(campaigns[],[]),
    'latestReads': coalesce(latestReads,[]),
} | order(_createdAt desc)[0]
`);

export const landingPageContentQuery = defineQuery(`
*[_type == 'landingPage' && !(_id in path('drafts.**')) && slug.current == $slug][0]{
    _id,
    'slug': slug.current,
    config,
    'cards': coalesce(cards[]->{
        _id,
        title,
        'slug': slug.current,
        description,
        featuredImage,
        'tags': coalesce(tags[] -> {
            title,
            'slug': slug.current,
            shortDescription,
            description,
            icon,
            backgroundColor,
            textColor
        }, []),
        'storyCoverImages': coalesce(stories[]->coverImage, []),
        'count': coalesce(count(stories), 0),
				config,
				'tabs': [],
	      'mediaSources': coalesce(mediaSources[], []),
    },[]),
    'campaigns': coalesce(campaigns[]->{
        _id,
        'title': coalesce(title, ''),
        'slug': coalesce(slug.current, ''),
        'description': coalesce(description, []),
        'url': coalesce(url, ''),
        'contents': {
            'xs': {
                'title': coalesce(contents.xs.title, []),
                'subtitle': coalesce(contents.xs.subtitle, []),
                'image': contents.xs.image
            },
            'md': {
                'title': coalesce(contents.md.title, []),
                'subtitle': coalesce(contents.md.subtitle, []),
                'image': contents.md.image
            }
        }
    },[]),
    'latestReads': coalesce(latestReads[]->{
        _id,
        'slug': slug.current,
        title,
        badLanguage,
        'body': [],
        originalPublication,
        approximateReadingTime,
        coverImage,
        'resources': [],
        'mediaSources': coalesce(mediaSources[], []),
        'author': author-> { 
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
    },[]),
}`);
