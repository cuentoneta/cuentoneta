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
        }, []),
        // El cuerpo va recortado al primer bloque: la tarjeta lo pinta con line-clamp, así que traer la
        // sección entera transporta la obra completa de cada obra del listado para mostrar dos
        // renglones. El corte es una **heurística de doble salto de línea**, no una garantía de que el
        // fragmento sea un párrafo válido: GROQ parte texto, no conoce la gramática de Markdown. El
        // split va anidado porque el contenido puede llegar con CRLF —el corpus del repo lo hace en
        // Windows— y ahí un corte por doble LF a secas devolvería el cuerpo entero. Las barras van
        // dobles porque la query vive en un template literal: una barra sola la consumiría JavaScript
        // y GROQ recibiría un salto de línea real dentro de la cadena, que no parsea.
        //
        // Se toma el primer bloque **no vacío**: un cuerpo que arranca con un renglón en blanco es
        // contenido válido —nada en el schema lo impide— y con el índice pelado daría un extracto
        // vacío, que el mapper trataría como obra mal curada y tumbaría la colección entera.
        'excerpt': content[0...1]{
            _key,
            title,
            'body': string::split(string::split(body, "\\r\\n\\r\\n")[0], "\\n\\n")[@ != ""][0]
        },
        // El tiempo de lectura de la sección de apertura viaja como escalar y no dentro del extracto,
        // porque el extracto no puede sostenerlo: su cuerpo va recortado. Es el segundo eslabón de la
        // cadena con la que el repositorio resuelve el total de la obra.
        'openingReadingTime': content[0].readingTime,
        // Último recurso, y solo entonces: el cuerpo entero de la sección de apertura, para derivar un
        // tiempo de lectura cuando no hay ninguno persistido. Fuera de ese caso la proyección devuelve
        // null, así que no paga el payload que este recorte vino a eliminar.
        'readingTimeFallbackBody': select(coalesce(totalReadingTime, content[0].readingTime) == null => content[0].body)
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
