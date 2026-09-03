import { defineQuery } from 'groq';

// La vista de navegación de una obra: lo que las tarjetas de la página de inicio pintan. Sin extracto
// —ningún consumidor de estos slots muestra cuerpo— y con `mediaSources` en su forma de teaser, que
// solo lleva la plataforma y el título y no resuelve la carga con la que se reproduce el recurso.
//
// Cada aparición de abajo repite el literal porque `defineQuery` lo exige: el typegen parsea el string
// de la llamada, así que una constante compartida dejaría de emitir tipos. Lo que impide que se
// desincronicen es el mapper del repository, tipado contra la unión de todas ellas.

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
    },[])
}`);

export const landingPageListQuery = defineQuery(`
*[_type == 'landingPage' && !(_id in path('drafts.**')) && slug.current in $slugs]{
		_id,
		'slug': slug.current,
		config,
}`);

// Las referencias crudas de la última semana cargada, que la generación de semanas futuras copia
// hacia adelante.
export const latestLandingPageReferencesQuery = defineQuery(`
*[_type == 'landingPage' && !(_id in path('drafts.**')) && config <= $currentSlug]{
    _id,
    _type,
    'slug': slug.current,
    config,
    'campaigns': coalesce(campaigns[],[]),
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
