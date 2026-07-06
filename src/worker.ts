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
] as const;

// Mapa Cron Trigger → endpoint. Reemplaza los `crons` de vercel.json.
const CRON_ROUTES: Record<string, string> = {
	'15 3 * * *': '/api/story/update-most-read',
	'30 3 * * 0': '/api/content/add-next-weeks-landing-page-content',
};

// trustProxyHeaders: Cloudflare agrega headers de proxy; honrarlos evita el deopt a CSR
// (mismo motivo que en server.ts para Vercel). allowedHosts reales vía getAllowedHosts().
const angularApp = new AngularAppEngine({ allowedHosts: getAllowedHosts(), trustProxyHeaders: true });

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

// Assets estáticos → binding; el resto → SSR vía el engine de Angular.
app.use('*', async (c) => {
	const assetResponse = await c.env.ASSETS.fetch(c.req.raw);
	if (assetResponse.status !== 404) {
		return assetResponse;
	}
	const rendered = await angularApp.handle(c.req.raw);
	return rendered ?? c.notFound();
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
