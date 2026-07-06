// [SPIKE cloudflare-migration] Entry para Cloudflare Workers (platform=neutral).
// Monta /api (Hono), puentea env→process.env para el backend lazy, sirve SSR + assets,
// y despacha los crons vía Cron Triggers. Sin APIs Node (nada de @hono/node-server ni fs).
import { AngularAppEngine } from '@angular/ssr';
import { Hono, type ExecutionContext } from 'hono';
import apiRoutes from './api/routes';
import { getAllowedHosts } from './api/_helpers/environment';

interface Env {
	// Binding de Workers Assets: sirve el output estático (dist browser + prerender).
	ASSETS: { fetch(request: Request): Promise<Response> };
	SANITY_STUDIO_PROJECT_ID?: string;
	SANITY_STUDIO_DATASET?: string;
	SANITY_STUDIO_TOKEN?: string;
	APP_ENV?: string;
	SITE_URL?: string;
}

// Tipo mínimo del evento de Cron Trigger (evita depender de @cloudflare/workers-types en el spike;
// ExecutionContext se toma de Hono).
interface ScheduledEvent {
	cron: string;
	scheduledTime: number;
}

// En Workers las env vars llegan por request (no al evaluar el módulo). El código de backend
// se inicializa lazy y las lee de process.env, así que las copiamos acá al entrar.
const BRIDGED_ENV_KEYS = [
	'SANITY_STUDIO_PROJECT_ID',
	'SANITY_STUDIO_DATASET',
	'SANITY_STUDIO_TOKEN',
	'APP_ENV',
	'SITE_URL',
] as const;

// Mapa Cron Trigger → endpoint. Reemplaza los `crons` de vercel.json.
const CRON_ROUTES: Record<string, string> = {
	'15 3 * * *': '/api/story/update-most-read',
	'30 3 * * 0': '/api/content/add-next-weeks-landing-page-content',
};

// Engine SSR con construcción diferida (primera request, ya con process.env poblado por el bridge):
// getAllowedHosts() lee APP_ENV en ese momento. trustProxyHeaders: Cloudflare agrega headers de
// proxy; honrarlos evita el deopt a CSR (mismo motivo que en server.ts para Vercel).
let angularApp: AngularAppEngine | undefined;
function getAngularApp(): AngularAppEngine {
	return (angularApp ??= new AngularAppEngine({ allowedHosts: getAllowedHosts(), trustProxyHeaders: true }));
}

// --- ISR (Fase 5, prototipo): cache del HTML SSR en el edge (Cache API) + cache-tags + purga. ---
// `caches.default` funciona en `wrangler dev` y en dominios custom; en `*.workers.dev` el CDN no
// cachea (la versión real necesita dominio custom). La purga por tag real usa la purge API de
// Cloudflare o un índice tag→URL en KV; acá se prototipa purga por URL.
declare const caches: {
	default: {
		match(request: Request): Promise<Response | undefined>;
		put(request: Request, response: Response): Promise<void>;
		delete(request: Request): Promise<boolean>;
	};
};

const ISR_TTL_SECONDS = 3600;

// Clave de cache = origen + pathname (ignora query, p. ej. cache-busters).
function isrCacheKey(request: Request): Request {
	const url = new URL(request.url);
	return new Request(`${url.origin}${url.pathname}`, { method: 'GET' });
}

// Tags para invalidación selectiva. Prototipo: por ruta + slug (`route:story`, `story:el-fin`).
// La versión real taggea por doc de Sanity que compone la página (requiere que el render los reporte).
function buildCacheTags(request: Request): string[] {
	const segments = new URL(request.url).pathname.split('/').filter(Boolean);
	if (segments.length === 0) {
		return ['route:home'];
	}
	const [route, slug] = segments;
	const tags = [`route:${route}`];
	if (slug) {
		tags.push(`${route}:${slug}`);
	}
	return tags;
}

async function serveWithIsr(request: Request, ctx: ExecutionContext): Promise<Response> {
	const cache = caches.default;
	const cacheKey = isrCacheKey(request);
	const hit = await cache.match(cacheKey);
	if (hit) {
		const headers = new Headers(hit.headers);
		headers.set('X-ISR-Cache', 'HIT');
		return new Response(hit.body, { status: hit.status, headers });
	}
	const rendered = await getAngularApp().handle(request);
	if (!rendered) {
		return new Response('Not found', { status: 404 });
	}
	if (rendered.status !== 200) {
		return rendered;
	}
	const headers = new Headers(rendered.headers);
	headers.set('Cache-Control', `s-maxage=${ISR_TTL_SECONDS}, stale-while-revalidate=86400`);
	headers.set('Cache-Tag', buildCacheTags(request).join(','));
	headers.set('X-ISR-Cache', 'MISS');
	const response = new Response(rendered.body, { status: 200, headers });
	ctx.waitUntil(cache.put(cacheKey, response.clone()));
	return response;
}

const app = new Hono<{ Bindings: Env }>();

app.use('*', async (c, next) => {
	// `c.env?` porque el dispatch in-process (abajo) invoca app.fetch sin env; process.env ya
	// quedó poblado por la request externa (misma config para todo el isolate).
	for (const key of BRIDGED_ENV_KEYS) {
		const value = c.env?.[key];
		if (value !== undefined) {
			process.env[key] = value;
		}
	}
	await next();
});

// API (Hono) — mismos handlers que el server Node.
app.route('/api', apiRoutes);

// Purga ISR (prototipo): borra una URL del cache. La versión real se dispara por webhook de Sanity
// y purga por cache-tag (Cloudflare purge API / índice tag→URL en KV).
app.post('/__isr/purge', async (c) => {
	const target = c.req.query('url');
	if (!target) {
		return c.json({ error: 'query param `url` requerido' }, 400);
	}
	const deleted = await caches.default.delete(isrCacheKey(new Request(target)));
	return c.json({ purged: target, deleted });
});

// Assets estáticos → binding; el resto → SSR (con ISR para GET) vía el engine de Angular.
app.use('*', async (c) => {
	const assetResponse = await c.env.ASSETS.fetch(c.req.raw);
	if (assetResponse.status !== 404) {
		return assetResponse;
	}
	// ISR cachea solo GET; otros métodos renderizan sin cachear.
	if (c.req.method !== 'GET') {
		const rendered = await getAngularApp().handle(c.req.raw);
		return rendered ?? c.notFound();
	}
	return serveWithIsr(c.req.raw, c.executionCtx);
});

// P2 (requerido en CF): durante el SSR, Angular HttpClient fetchea /api por HTTP. En el edge de
// Cloudflare un Worker NO puede subrequest a su propia URL pública (falla/loop), así que el fetch
// same-origin no resuelve y el SSR sale sin datos (validado: local ok, edge no). Se despachan las
// requests /api/* al app Hono EN PROCESO (mismo isolate), sin red. El resto usa el fetch nativo
// (p. ej. las llamadas a Sanity, cuyo host no es /api).
const nativeFetch = globalThis.fetch;
globalThis.fetch = (input, init) => {
	const url = input instanceof Request ? input.url : input.toString();
	try {
		if (new URL(url, 'http://workers.internal').pathname.startsWith('/api/')) {
			const request = input instanceof Request ? input : new Request(new URL(url, 'http://workers.internal'), init);
			return Promise.resolve(app.fetch(request));
		}
	} catch {
		// URL no parseable → fetch nativo
	}
	return nativeFetch(input, init);
};

export default {
	fetch(request: Request, env: Env, ctx: ExecutionContext): Response | Promise<Response> {
		return app.fetch(request, env, ctx);
	},
	// Cron Triggers: despacha el endpoint correspondiente por el mismo pipeline Hono (el
	// middleware puentea las env vars). Los endpoints de cron son GET.
	async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
		const path = CRON_ROUTES[event.cron];
		if (!path) {
			return;
		}
		await app.fetch(new Request(`https://cron.internal${path}`), env, ctx);
	},
};
