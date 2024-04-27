import { resourcesSubQuery } from './resources.query';

export const authorThumbnailFields = ['slug', 'name', 'image', 'nationality->'];
export const authorDetailedFields = [...authorThumbnailFields, 'biography', resourcesSubQuery]

export const authorForStoryCard = `'author': author-> { ${authorThumbnailFields.join(',')} }`;
export const authorForStory = `'author': author-> { ${authorDetailedFields.join(',')} }`;
