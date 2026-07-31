import { z } from 'zod';

// Fuente única del formato de slug, compartida por el `slugSchema` de los controllers y por
// cualquier otro punto que derive un slug de input no confiable (p. ej. el middleware de caché,
// que arma un `Vercel-Cache-Tag` desde el path) — para que ambas validaciones no puedan divergir.
export const SLUG_PATTERN = /^[a-z0-9-]+$/i;

export const slugSchema = z.object({
	slug: z
		.string()
		.nonempty('slug cannot be empty')
		.regex(SLUG_PATTERN, `Slug must be a string with letters from a to z, numbers from 0 to 9 and '-'`),
});

export const basePaginationSchema = z.object({
	limit: z.string().regex(/^\d+$/, 'limit must be a positive integer').transform(Number),

	offset: z.string().regex(/^\d+$/, 'offset must be a positive integer').transform(Number),
});
