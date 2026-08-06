import { defineQuery } from 'groq';

// Dos queries para dos vistas: la colección por slug transporta sus obras, el listado no. Esa es la
// diferencia entre el agregado y su teaser, y por eso el listado no es el mismo dato acotado sino
// otra proyección.
//
// `description` va sin `coalesce` a string vacío: su destino es un `SanitizedHtml`, cuya factory
// rechaza el contenido vacío. La ausencia se representa `null` y el repository decide qué hacer.
//
// En la query por slug `literaryWorks` no se acota. Es una precondición de la invariante `count` del
// agregado, que la factory deriva de las obras que transporta: si se acotara, el total pasaría a ser
// silenciosamente el tamaño de la página. Por lo mismo `count` no se proyecta ahí — sería un segundo
// origen de verdad para un dato que el dominio ya deriva. En el listado sí se proyecta, porque el
// teaser no lleva obras de las que derivarlo.

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
            'epigraphs': coalesce(epigraphs[]{ text, reference }, []),
            body,
            readingTime
        }
    }, [])
}[0]`);

// El listado no dereferencia `literaryWorks[]->`: sirve la vista de teaser, que muestra la colección
// sin transportar sus obras. `count` sale de contar referencias sin resolverlas, que es lo que el
// agregado no puede derivar cuando no las lleva.
//
// `literaryWorkCoverImages` sí dereferencia, pero solo la portada de las tres primeras obras: sin eso
// la rama `sample` de `imagery` no se puede construir y las colecciones sin imagen destacada —la
// mitad de los casos, porque el campo es opcional— quedarían sin portada.
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
