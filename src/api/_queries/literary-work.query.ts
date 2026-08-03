import { defineQuery } from 'groq';

// Proyección de metadata compartida por la query full y la de sección: todo salvo el array `content`.
// Se repite en ambas (defineQuery necesita literales para el typegen), no se concatena.
//
// `editorialNote` va sin `coalesce` a diferencia del resto: su destino en el dominio es un
// `SanitizedHtml`, cuya factory rechaza el contenido vacío, así que un default de string vacío haría
// lanzar el mapeo de toda obra sin nota. La ausencia se representa como `null` y el repository la
// traduce a campo ausente.

export const literaryWorkBySlugQuery = defineQuery(`
*[_type == 'literaryWork' && slug.current == $slug && !(_id in path('drafts.**'))]
{
    _id,
    'slug': slug.current,
    title,
    coverImage,
    editorialNote,
    'badLanguage': coalesce(badLanguage, false),
    'originalPublication': coalesce(originalPublication, ''),
    'publishedAt': coalesce(publishedAt, _createdAt),
    totalReadingTime,
    'sectionCount': count(content),
    'tags': coalesce(tags[] -> {
        title,
        'slug': slug.current,
        shortDescription
    }, []),
    'mediaSources': coalesce(mediaSources[]{
        ...,
        _type == 'spaceRecording' => {
            'audioUrl': audioFile.asset->url
        }
    }, []),
    'resources': coalesce(resources[]{
        title,
        url,
        resourceType->{
            'slug': slug.current,
            title,
            shortDescription
        }
    }, []),
    'authors': coalesce(authors[]-> {
        _id,
        'slug': slug.current,
        name,
        image,
        nationality->,
        biography,
        bornOn,
        bornOnYear,
        diedOn,
        diedOnYear,
        'resources': coalesce(resources[]{
            title,
            url,
            resourceType->{
                'slug': slug.current,
                title,
                shortDescription
            }
        }, []),
        'tags': []
    }, []),
    'content': coalesce(content[]{
        _key,
        title,
        'epigraphs': coalesce(epigraphs[]{ text, reference }, []),
        body,
        readingTime
    }, [])
}[0]`);

// Obtención parcial: metadata total (incluido totalReadingTime y sectionCount) + el body de una sola
// sección vía el slice `content[$section...$sectionEnd]` (0-based, fin exclusivo — `$sectionEnd` va
// como parámetro porque el typegen no infiere aritmética en el rango). Habilita ?section=N sin
// transportar todos los bodies. `section` es un array de 0 o 1 elementos (vacío si N está fuera de rango).
export const literaryWorkSectionBySlugQuery = defineQuery(`
*[_type == 'literaryWork' && slug.current == $slug && !(_id in path('drafts.**'))]
{
    _id,
    'slug': slug.current,
    title,
    coverImage,
    editorialNote,
    'badLanguage': coalesce(badLanguage, false),
    'originalPublication': coalesce(originalPublication, ''),
    'publishedAt': coalesce(publishedAt, _createdAt),
    totalReadingTime,
    'sectionCount': count(content),
    'tags': coalesce(tags[] -> {
        title,
        'slug': slug.current,
        shortDescription
    }, []),
    'mediaSources': coalesce(mediaSources[]{
        ...,
        _type == 'spaceRecording' => {
            'audioUrl': audioFile.asset->url
        }
    }, []),
    'resources': coalesce(resources[]{
        title,
        url,
        resourceType->{
            'slug': slug.current,
            title,
            shortDescription
        }
    }, []),
    'authors': coalesce(authors[]-> {
        _id,
        'slug': slug.current,
        name,
        image,
        nationality->,
        biography,
        bornOn,
        bornOnYear,
        diedOn,
        diedOnYear,
        'resources': coalesce(resources[]{
            title,
            url,
            resourceType->{
                'slug': slug.current,
                title,
                shortDescription
            }
        }, []),
        'tags': []
    }, []),
    'section': content[$section...$sectionEnd]{
        _key,
        title,
        'epigraphs': coalesce(epigraphs[]{ text, reference }, []),
        body,
        readingTime
    }
}[0]`);

// Candidatas del backfill de reading time: obras a las que les falta el total o el reading time de
// alguna sección. La proyección trae **todas** las secciones, no solo las incompletas, porque el
// total se resuelve sumando el conjunto completo. Pagina por `_id` (cursor estable) y no por offset,
// que puede saltear documentos si el orden cambia entre páginas. Vive acá y no junto al script para
// entrar en el scan de typegen (`cms/sanity.cli.ts` → `../src/api/**/*`): así el shape del resultado
// lo declara Sanity y un rename de schema rompe el typecheck en vez de aparecer en runtime.
export const readingTimeBackfillCandidatesQuery = defineQuery(`
*[_type == 'literaryWork' && !(_id in path('drafts.**')) && _id > $cursor
  && (!defined(totalReadingTime) || count(content[!defined(readingTime)]) > 0)]
| order(_id asc) [0...$pageSize] {
    _id,
    'slug': slug.current,
    totalReadingTime,
    'content': coalesce(content[]{ _key, body, readingTime }, [])
}`);
