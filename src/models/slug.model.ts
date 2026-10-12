export type Slug = string & { readonly __brand: 'Slug' };

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * El formato que toda frontera exige a un slug: el Studio al guardarlo, el API al recibirlo y el sitemap
 * al publicarlo. Acepta cualquier valor para que esas fronteras lo usen sobre datos sin tipar.
 */
export function isSlug(value: unknown): value is Slug {
	return typeof value === 'string' && SLUG_PATTERN.test(value);
}

export function createSlug(value: string): Slug {
	if (!isSlug(value)) {
		throw new Error(`Slug inválido: "${value}"`);
	}
	return value as Slug;
}
