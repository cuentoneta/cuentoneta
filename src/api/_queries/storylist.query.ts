import { defineQuery } from 'groq';

export const storylistTeasersQuery = defineQuery(`
*[_type == 'storylist' && !(_id in path('drafts.**'))]{ 
    _id,
    'slug': slug.current,
    title,
    description,
    language,
    displayDates,
    editionPrefix,
    comingNextLabel,
    featuredImage,
    'tags': coalesce(tags[] -> {
        title, 
        'slug': slug.current, 
        shortDescription,
        description, 
        icon
    }, []),
    'publications': [],
    'count': coalesce(count(publications), 0)
    }
`);

export const storylistQuery = defineQuery(`
*[_type == 'storylist' && slug.current == $slug && !(_id in path('drafts.**'))][0]
{ 
    _id,
    'slug': slug.current,
    title,
    description,
    language,
    displayDates,
    editionPrefix,
    comingNextLabel,
    featuredImage,
    'tags': coalesce(tags[] -> {
        title, 
        'slug': slug.current, 
        shortDescription,
        description, 
        icon
    }, []),
    'publications': coalesce(publications[]{
        publishingOrder,
        publishingDate,
        published,
        'story': story->{
            _id,
            'slug': slug.current,
            title,
            language,
            badLanguage,
            'body': coalesce(body[0...3], []),
            originalPublication,
            approximateReadingTime,
            'resources': [],
            'mediaSources': coalesce(mediaSources[], []),
            'author': author->{ 
                _id,
                slug,
                name,
                image,
                nationality->,
                'biography': [],
                'resources': [],
            }
        }
    }, []),
    'count': coalesce(count(publications), 0)
    }
`);
