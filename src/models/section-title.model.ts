import slugify from 'slugify';
import { createSlug, type Slug } from './slug.model';

export interface SectionTitle {
	readonly value: string;
	toAnchor(): Slug;
}

export function createSectionTitle(value: string): SectionTitle {
	if (value.trim() === '') {
		throw new Error('SectionTitle inválido: título vacío');
	}
	return Object.freeze({
		value,
		toAnchor: () => createSlug(slugify(value, { lower: true, strict: true })),
	});
}
