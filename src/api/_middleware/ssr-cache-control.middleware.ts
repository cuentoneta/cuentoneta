import { createMiddleware } from 'hono/factory';
import { SLUG_PATTERN } from '@schemas/common.schemas';
import { applyReadCacheHeaders, literaryWorkCacheTag } from '../_helpers/cache-control';
import { environment } from '../_helpers/environment';

// Angular SSR embebe este marcador SOLO en HTML server-rendered real. El fallback CSR
// degradado (`index.csr.html`) responde con el MISMO `200 text/html` y sin ningún header
// distintivo, así que la única señal fiable está en el body. Cachear ese fallback serviría
// una página vacía durante todo el TTL (con `s-maxage=1año`, hasta un año). Ver #1856 / PR #1730.
const SSR_MARKER = 'ng-server-context="ssr"';

// El middleware se monta en `/read/*`, así que el path siempre arranca con este prefijo.
const READ_PATH_PREFIX = '/read/';

function readSlugFromPath(path: string): string {
	return path.slice(READ_PATH_PREFIX.length).split('/')[0];
}

/**
 * Emite los headers de caché de borde para las respuestas SSR válidas de `/read/*`.
 *
 * Guarda anti-CSR: bufferiza e inspecciona el body (`c.res.clone().text()`) para confirmar que
 * es SSR real antes de cachear. Esto sacrifica el streaming del primer byte —acotado a `/read/*`
 * y aceptable por la inmutabilidad del contenido de una obra—, pero es la única forma correcta de
 * distinguir el SSR real del fallback CSR degradado. No cachea en no-producción (coherente con
 * `noindexNonProduction`), ni respuestas no-200 (404/500), ni el fallback CSR.
 *
 * La cache key del CDN de Vercel incluye el query string, así que `?section=N` cachea por variante;
 * el tag por slug (`applyReadCacheHeaders`) agrupa todas esas variantes para una purga única.
 */
export const ssrCacheControl = createMiddleware(async (c, next) => {
	await next();

	if (!environment.production) {
		return;
	}

	if (c.res.status !== 200) {
		return;
	}

	const html = await c.res.clone().text();
	if (!html.includes(SSR_MARKER)) {
		return;
	}

	// Validar el slug del path con la misma fuente que el controller (`SLUG_PATTERN`) antes de
	// armar el `Vercel-Cache-Tag`: un segmento con una coma partiría el tag en dos (la coma es el
	// delimitador del header). Paridad defensiva con el resto del ACL, aunque llegar acá exige que
	// Angular haya servido un 200 SSR real para ese path.
	const slug = readSlugFromPath(c.req.path);
	if (!SLUG_PATTERN.test(slug)) {
		return;
	}

	applyReadCacheHeaders(c, literaryWorkCacheTag(slug));
});
