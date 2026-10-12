export type Slug = string & { readonly __brand: 'Slug' };

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * El formato que el dominio sabe construir, para que una frontera lo verifique sin depender de que
 * `createSlug` lance. Acepta cualquier valor porque las fronteras lo aplican sobre datos sin tipar.
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
