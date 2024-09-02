import { defineQuery } from 'groq';

// @sanity-typegen-ignore
export const storylistTeasersQuery = defineQuery(`*[_type == 'storylist']{ 
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
        description, 
        icon
    }, []),
    'count': count(*[ _type == 'publication' && storylist._ref == ^._id ])
    }
`);

// @sanity-typegen-ignore
export const storylistQuery = defineQuery(`*[_type == 'storylist' && slug.current == $slug][0]
{ 
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
        description, 
        icon
    }, []),
    'publications': coalesce(publications[]{
        publishingOrder,
        publishingDate,
        published,
        'story': story->{
            'slug': slug.current,
            title,
            language,
            badLanguage,
            'categories': coalesce(categories[], []),
            body[0...3],
            originalPublication,
            approximateReadingTime,
            'mediaSources': coalesce(mediaSources[], []),
            'author': author-> { slug, name, image, nationality-> }
        }
    }, []),
    'count': count(*[ _type == 'publication' && storylist._ref == ^._id ])
    }
`);
