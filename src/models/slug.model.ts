export type Slug = string & { readonly __brand: 'Slug' };

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function createSlug(value: string): Slug {
	if (!SLUG_PATTERN.test(value)) {
		throw new Error(`Slug inválido: "${value}"`);
	}
	return value as Slug;
}
