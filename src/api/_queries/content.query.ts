import { defineQuery } from 'groq';

export const rotatingContentQuery = defineQuery(`
*[_type == 'rotatingContent' && _id == 'rotatingContent'][0]{
    _id,
    name,
    'mostRead': coalesce(mostRead[]->{
        _id,
        'slug': slug.current,
        title,
        'badLanguage': coalesce(badLanguage, false),
        'body': [],
        'originalPublication': coalesce(originalPublication, ''),
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
*[_type == 'landingPage' && !(_id in path('drafts.**')) && config <= $currentSlug]{
    _id,
    _type,
    'slug': slug.current,
    config,
    'cards': coalesce(cards[],[]),
    'campaigns': coalesce(campaigns[],[]),
    'latestReads': coalesce(latestReads,[]),
    'highlightedAuthors': coalesce(highlightedAuthors,[]),
} | order(config desc, _createdAt desc)[0]
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
            description
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
        'url': coalesce(url, ''),
        'contents': {
            'xs': {
                'image': contents.xs.image
            },
            'md': {
                'image': contents.md.image
            }
        }
    },[]),
    'latestReads': coalesce(latestReads[]->{
        _id,
        'slug': slug.current,
        title,
        'badLanguage': coalesce(badLanguage, false),
        'body': [],
        'originalPublication': coalesce(originalPublication, ''),
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
						bornOn,
						bornOnYear,
						diedOn,
						diedOnYear,
            'resources': [],
        }
    },[]),
    'highlightedAuthors': coalesce(highlightedAuthors[]{
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
            'tags': coalesce(tags[]->{
                title,
                'slug': slug.current,
                description
            }, [])
        },
        'additionalTags': coalesce(additionalTags[]->{
            title,
            'slug': slug.current,
            description
        }, []),
        'storyCount': count(*[
            !(_id in path('drafts.**')) &&
            ((_type == 'story' && author._ref == ^.author._ref) || (_type == 'literaryWork' && ^.author._ref in authors[]._ref))
        ])
    },[]),
}`);
