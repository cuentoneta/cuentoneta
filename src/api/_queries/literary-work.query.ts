import { defineQuery } from 'groq';

// Proyección de metadata compartida por la query full y la de sección: todo salvo el array `content`.
// Se repite en ambas (defineQuery necesita literales para el typegen), no se concatena.

export const literaryWorkBySlugQuery = defineQuery(`
*[_type == 'literaryWork' && slug.current == $slug && !(_id in path('drafts.**'))]
{
    _id,
    'slug': slug.current,
    title,
    coverImage,
    'badLanguage': coalesce(badLanguage, false),
    'originalPublication': coalesce(originalPublication, ''),
    'publishedAt': coalesce(publishedAt, _createdAt),
    totalReadingTime,
    'sectionCount': count(content),
    'tags': coalesce(tags[] -> {
        title,
        'slug': slug.current,
        shortDescription,
        description,
        icon
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
            shortDescription,
            description,
            icon
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
                shortDescription,
                description,
                icon
            }
        }, []),
        'tags': []
    }, []),
    'content': coalesce(content[]{
        _key,
        chapterTitle,
        'epigraphs': coalesce(epigraphs[]{ text, reference }, []),
        body,
        readingTime
    }, [])
}[0]`);

// Obtención parcial: metadata total (incluido totalReadingTime y sectionCount) + el body de una sola
// sección (la de índice $section, 0-based). Habilita ?section=N sin transportar todos los bodies.
export const literaryWorkSectionBySlugQuery = defineQuery(`
*[_type == 'literaryWork' && slug.current == $slug && !(_id in path('drafts.**'))]
{
    _id,
    'slug': slug.current,
    title,
    coverImage,
    'badLanguage': coalesce(badLanguage, false),
    'originalPublication': coalesce(originalPublication, ''),
    'publishedAt': coalesce(publishedAt, _createdAt),
    totalReadingTime,
    'sectionCount': count(content),
    'tags': coalesce(tags[] -> {
        title,
        'slug': slug.current,
        shortDescription,
        description,
        icon
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
            shortDescription,
            description,
            icon
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
                shortDescription,
                description,
                icon
            }
        }, []),
        'tags': []
    }, []),
    'section': content[$section]{
        _key,
        chapterTitle,
        'epigraphs': coalesce(epigraphs[]{ text, reference }, []),
        body,
        readingTime
    }
}[0]`);
