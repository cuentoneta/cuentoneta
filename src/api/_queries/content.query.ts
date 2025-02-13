import { defineQuery } from 'groq';

export const landingPageContentQuery = defineQuery(`
*[_type == 'landingPage' && !(_id in path('drafts.**'))][0]{
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
        'count': coalesce(count(publications), 0)
    },[]),
    'campaigns': coalesce(campaigns[]->{
        'title': coalesce(title, ''),
        'slug': coalesce(slug.current, ''),
        'description': coalesce(description, []),
        'url': coalesce(url, ''),
        'contents': {
            'xs': {
                'title': coalesce(contents.xs.title, []),
                'subtitle': coalesce(contents.xs.subtitle, []),
                'image': contents.xs.image
            },
            'md': {
                'title': coalesce(contents.md.title, []),
                'subtitle': coalesce(contents.md.subtitle, []),
                'image': contents.md.image
            }
        }
    },[]),
    'mostRead': coalesce(mostRead[]->{
        'slug': slug.current,
        title,
        language,
        badLanguage,
        'body': coalesce(body[0...3], []),
        originalPublication,
        approximateReadingTime,
        'resources': [],
        'mediaSources': coalesce(mediaSources[], []),
        'author': author-> { 
            slug,
            name,
            image,
            nationality->,
            'biography': [],
            'resources': [],
        }
    },[]),
}`);
