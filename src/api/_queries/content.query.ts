import { defineQuery } from 'groq';

export const landingPageContentQuery = defineQuery(`*[_type == 'landingPage']{
    'cards': coalesce(cards[]->{
        title,
        'slug': slug.current,
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
        'count': count(publications)
    },[]),
    'campaigns': coalesce(campaigns[]->{
        title,
        'slug': slug.current,
        description,
        url,
        contents
    },[]),
}`);
