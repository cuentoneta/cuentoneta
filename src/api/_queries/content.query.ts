import { defineQuery } from 'groq';

// Los campos de obra y colección conviven con los de historia y storylist: el Studio ya declara los dos
// juegos y la aplicación migra sus lectores de a uno. Los viejos se retiran cuando ninguno los lea.
//
// La vista de navegación de una obra —la que pintan las tarjetas de la página de inicio— va sin
// extracto: ninguno de sus consumidores muestra cuerpo. Cada aparición repite el literal porque
// `defineQuery` lo exige; lo que impide que se desincronicen es el mapeo del repository, tipado contra
// la unión de todas ellas.

export const rotatingContentQuery = defineQuery(`
*[_type == 'rotatingContent' && _id == 'rotatingContent'][0]{
    _id,
    name,
    'mostReadLiteraryWorks': coalesce(mostReadLiteraryWorks[]->{
        _id,
        'slug': slug.current,
        title,
        coverImage,
        totalReadingTime,
        'sectionCount': count(content),
        'tags': coalesce(tags[] -> {
            title,
            'slug': slug.current,
            description
        }, []),
        'mediaSources': coalesce(mediaSources[]{ _type, title }, []),
        'authors': coalesce(authors[]->{
            _id,
            'slug': slug.current,
            name,
            image,
            nationality->,
            bornOn,
            bornOnYear,
            diedOn,
            diedOnYear
        }, [])
    },[]),
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
    'collections': coalesce(collections,[]),
    'latestLiteraryWorks': coalesce(latestLiteraryWorks,[]),
    'highlightedAuthors': coalesce(highlightedAuthors,[]),
} | order(config desc, _createdAt desc)[0]
`);

export const landingPageContentQuery = defineQuery(`
*[_type == 'landingPage' && !(_id in path('drafts.**')) && slug.current == $slug][0]{
    _id,
    'slug': slug.current,
    config,
    'collections': coalesce(collections[]->{
        _id,
        'slug': slug.current,
        title,
        description,
        featuredImage,
        'config': { 'showAuthors': coalesce(config.showAuthors, false) },
        'tags': coalesce(tags[] -> {
            title,
            'slug': slug.current,
            description
        }, []),
        'mediaSources': coalesce(mediaSources[]{
            ...,
            _type == 'spaceRecording' => {
                'audioUrl': audioFile.asset->url
            }
        }, []),
        'count': coalesce(count(literaryWorks), 0),
        'literaryWorkCoverImages': coalesce(literaryWorks[0...3]->coverImage, [])
    },[]),
    'latestLiteraryWorks': coalesce(latestLiteraryWorks[]->{
        _id,
        'slug': slug.current,
        title,
        coverImage,
        totalReadingTime,
        'sectionCount': count(content),
        'tags': coalesce(tags[] -> {
            title,
            'slug': slug.current,
            description
        }, []),
        'mediaSources': coalesce(mediaSources[]{ _type, title }, []),
        'authors': coalesce(authors[]->{
            _id,
            'slug': slug.current,
            name,
            image,
            nationality->,
            bornOn,
            bornOnYear,
            diedOn,
            diedOnYear
        }, [])
    },[]),
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
    'highlightedAuthors': coalesce(highlightedAuthors[]->{
        'author': {
            _id,
            'slug': slug.current,
            name,
            image,
            nationality->,
            bornOn,
            bornOnYear,
            diedOn,
            diedOnYear,
            'resources': []
        },
        'tags': coalesce(tags[]->{
            title,
            'slug': slug.current,
            description
        }, []),
        'storyCount': count(array::unique(*[
            !(_id in path('drafts.**')) &&
            _type in ['story', 'literaryWork'] &&
            references(^._id)
        ].slug.current))
    },[]),
}`);
