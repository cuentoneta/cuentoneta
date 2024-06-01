export const storyPreviewCommonFields: string = `
    'slug': slug.current,
    title,
    language,
    badLanguage,
    categories,
    body[0...3],
    approximateReadingTime,
    mediaSources
`;

export const storyCommonFields: string = `
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
    mediaSources
`;
