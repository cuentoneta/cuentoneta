export const authorThumbnailFields = ['slug', 'name', 'image', 'nationality->'];

export const authorForStoryCard = `'author': author-> { ${authorThumbnailFields.join(',')} }`;
