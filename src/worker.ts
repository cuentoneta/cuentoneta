// [SPIKE cloudflare-migration] Entry SSR neutral para Cloudflare Workers.
// Fase 1: monta /api (Hono) + puentea env→process.env para el cliente Sanity (lazy),
// de modo que el SSR renderice con datos reales. Sin APIs Node (nada de @hono/node-server ni fs).
import { AngularAppEngine } from '@angular/ssr';
import { Hono } from 'hono';
import apiRoutes from './api/routes';

interface Env {
	// Binding de Workers Assets: sirve el output estático (dist browser + prerender).
	ASSETS: { fetch(request: Request): Promise<Response> };
	SANITY_STUDIO_PROJECT_ID?: string;
	SANITY_STUDIO_DATASET?: string;
	SANITY_STUDIO_TOKEN?: string;
	APP_ENV?: string;
}

// En Workers las env vars llegan por request (no al evaluar el módulo). El código de backend
// se inicializa lazy y las lee de process.env, así que las copiamos acá al entrar.
const BRIDGED_ENV_KEYS = [
	'SANITY_STUDIO_PROJECT_ID',
	'SANITY_STUDIO_DATASET',
	'SANITY_STUDIO_TOKEN',
	'APP_ENV',
] as const;

// allowedHosts '*' y trustProxyHeaders son SOLO para el spike (dominio *.workers.dev):
// en prod real se usaría getAllowedHosts() como en server.ts.
const angularApp = new AngularAppEngine({ allowedHosts: ['*'], trustProxyHeaders: true });

const app = new Hono<{ Bindings: Env }>();

app.use('*', async (c, next) => {
	for (const key of BRIDGED_ENV_KEYS) {
		const value = c.env[key];
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

export default app;
