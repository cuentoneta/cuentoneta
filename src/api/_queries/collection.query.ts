import { defineQuery } from 'groq';

// `collectionBySlugQuery` y `collectionsQuery` proyectan exactamente lo mismo y el literal se repite
// a propósito: `defineQuery` parsea el string de la llamada para generar el tipo, así que una
// constante concatenada o un template interpolado dejarían de emitir tipos. Lo que impide que las dos
// se desincronicen es el tipo: el privado que las mapea se tipa contra la variante por slug y recibe
// también los ítems del listado, así que un campo **perdido** en el listado rompe el typecheck. Un
// campo agregado de más no lo rompe —la asignación no es de literal fresco, así que las propiedades
// excedentes pasan—, pero tampoco cambia lo que el mapeo produce.
//
// `description` va sin `coalesce` a string vacío: su destino es un `SanitizedHtml`, cuya factory
// rechaza el contenido vacío. La ausencia se representa `null` y el repository decide qué hacer.
//
// `literaryWorks` no se acota. Es una precondición de la invariante `count` del agregado, que la
// factory deriva de las obras que transporta: si la query acotara el listado, el total pasaría a ser
// silenciosamente el tamaño de la página. Por lo mismo `count` no se proyecta acá — sería un segundo
// origen de verdad para un dato que el dominio ya deriva.

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

// El listado completo es deliberadamente pesado: proyecta todas las obras de todas las colecciones.
// Existe así porque la vista de colecciones muestra cada colección con sus obras, y servirla con el
// listado de teasers más una llamada por colección cambia una respuesta grande por un N+1 de red,
// peor en el tiempo hasta la página renderizada y todavía peor serializado en SSR. El consumidor que
// solo necesita las tarjetas tiene `collectionTeasersQuery`, que es un endpoint distinto y no un
// parámetro de este. El costo se acota con caché de borde, no achicando la respuesta.
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
}`);

// El teaser no transporta obras, así que no dereferencia `literaryWorks[]->` y su `count` sale de
// contar referencias sin resolverlas — el agregado no puede derivarlo porque no las lleva.
//
// `literaryWorkCoverImages` sí dereferencia, pero solo la portada de las tres primeras obras: sin eso
// la rama `sample` de `imagery` no se puede construir y las colecciones sin imagen destacada —la
// mitad de los casos, porque el campo es opcional— quedarían sin portada.
export const collectionTeasersQuery = defineQuery(`
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
