import { defineQuery } from 'groq';

// La colección con todas sus obras, para la página de detalle.
//
// De cada obra se proyecta la sección de apertura, que es lo que el teaser transporta, pero sin sus
// epígrafes: la tarjeta muestra el cuerpo y nada más los lee. Traerlos sería payload y saneado por
// obra que nadie consume.
//
// `literaryWorks` no se acota a propósito: el agregado deriva su total de las obras que transporta,
// así que un slice lo volvería, en silencio, el tamaño de la página. Por lo mismo no se proyecta un
// `count`, que sería un segundo origen de verdad.
export const collectionBySlugQuery = defineQuery(`
*[_type == 'collection' && slug.current == $slug && !(_id in path('drafts.**'))]
{
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
    'literaryWorks': coalesce(literaryWorks[]->{
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
        'mediaSources': coalesce(mediaSources[]{
            ...,
            _type == 'spaceRecording' => {
                'audioUrl': audioFile.asset->url
            }
        }, []),
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
        }, []),
        'teaserSection': content[0...1]{
            _key,
            title,
            body,
            readingTime
        }
    }, [])
}[0]`);

// El catálogo como teasers: cada colección sin sus obras.
//
// `count` cuenta referencias sin resolverlas, porque el teaser no lleva obras de las que derivarlo.
// Lo único que dereferencia es la portada de las tres primeras: sin ellas la rama `sample` de
// `imagery` no se puede construir, y es la mitad de los casos porque la imagen destacada es opcional.
export const collectionsQuery = defineQuery(`
*[_type == 'collection' && !(_id in path('drafts.**'))]
| order(title asc)
{
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
}`);
