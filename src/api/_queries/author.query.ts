import { resourcesSubQuery } from './resources.query';

export const authorForStoryCard = "'author': author-> { name, slug, image, nationality-> }";

export const authorForStory = `'author': author-> { name, slug, image, biography, nationality->, ${resourcesSubQuery}}`;
