import slugify from 'slugify';
import { createSlug, type Slug } from './slug.model';

export interface ChapterTitle {
	readonly value: string;
	toAnchor(): Slug;
}

export function createChapterTitle(value: string): ChapterTitle {
	if (value.trim() === '') {
		throw new Error('ChapterTitle inválido: título vacío');
	}
	return Object.freeze({
		value,
		toAnchor: () => createSlug(slugify(value, { lower: true, strict: true })),
	});
}
