import groq from 'groq';

export const storiesByAuthorSlugQuery = groq`*[_type == 'story' && author->slug.current == $slug][$start...$end]
{
    'slug': slug.current,
    title,
    language,
    badLanguage,
    categories,
    body[0...3],
    originalPublication,
    approximateReadingTime,
    mediaSources[]{ 
        _id,
        _type,
        title, 
        icon
        },
    resources[]{ 
        title, 
        url, 
        resourceType->{ 
            title, 
            description, 
            'icon': { 
                'name': icon.name, 
                'svg': icon.svg, 
                'provider': icon.provider 
                } 
            } 
        },
}|order(title asc)`;

export const storyBySlugQuery = groq`*[_type == 'story' && slug.current == $slug]
{
  'slug': slug.current,
  title, 
  language,
  badLanguage,
  epigraphs,
  categories,
  body,
  review,
  originalPublication,
  approximateReadingTime,
  mediaSources,
  resources[]{
        title, 
        url, 
        resourceType->{ 
            title, 
            description, 
            'icon': {
                'name': icon.name, 
                'svg': icon.svg, 
                'provider': icon.provider 
                } 
            } 
  },
  'author': author-> {
      slug,
      name,
      image,
      nationality->,
      biography,
      resources[]{ 
        title, 
        url, 
        resourceType->{ 
            title, 
            description, 
            'icon': { 
                'name': icon.name, 
                'svg': icon.svg, 
                'provider': icon.provider 
                } 
            } 
        }
      }
}[0]`;
