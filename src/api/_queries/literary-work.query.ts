import { defineQuery } from 'groq';

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
    readingTimeOverride,
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
        chapterTitle,
        'epigraphs': coalesce(epigraphs[]{ text, reference }, []),
        body
    }, [])
}[0]`);
