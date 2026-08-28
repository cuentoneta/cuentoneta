import { createMiddleware } from 'hono/factory';
import { applyReadCacheHeaders, isReadCacheEnabled } from '../_helpers/cache-control';

// Angular SSR embebe este marcador SOLO en HTML server-rendered real. El fallback CSR
// degradado (`index.csr.html`) responde con el MISMO `200 text/html` y sin ningún header
// distintivo, así que la única señal fiable está en el body. Ya pasó en producción que Angular
// deopteara a CSR sin avisar; cachear ese fallback serviría una página vacía durante todo el TTL.
//
// El valor `ssr` depende de que la ruta siga declarada como `RenderMode.Server` en
// `app.routes.server.ts`: con `Prerender` Angular emite `ssg` y el cacheo dejaría de aplicarse en
// silencio. Lo ata un test del spec.
const SSR_MARKER = 'ng-server-context="ssr"';

/**
 * Emite los headers de caché de borde para las respuestas SSR válidas de `/literary-work/*`.
 *
 * Guarda anti-CSR: bufferiza e inspecciona el body (`c.res.clone().text()`) para confirmar que
 * es SSR real antes de cachear. Esto sacrifica el streaming del primer byte —acotado a `/literary-work/*`
 * y aceptable por la inmutabilidad del contenido de una obra—, pero es la única forma correcta de
 * distinguir el SSR real del fallback CSR degradado. No cachea respuestas no-200 (404/500) ni el
 * fallback CSR.
 *
 * La cache key del CDN de Vercel incluye el query string, así que una página con variantes por query
 * cachea por variante.
 */
export const ssrCacheControl = createMiddleware(async (c, next) => {
	await next();

	// Antes del `clone()`: sin caché habilitada, bufferizar el HTML entero es trabajo puro a pérdida.
	if (!isReadCacheEnabled() || c.res.status !== 200) {
		return;
	}

	// La caché es secundaria: si leer la copia del body falla, se sirve sin cachear. Sin este catch
	// el throw subiría al `onError` global y convertiría en 500 una página que renderizó bien.
	let html: string;
	try {
		html = await c.res.clone().text();
	} catch {
		return;
	}

	if (!html.includes(SSR_MARKER)) {
		return;
	}

	applyReadCacheHeaders(c);
});
