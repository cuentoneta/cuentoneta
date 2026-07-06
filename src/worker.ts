// [SPIKE cloudflare-migration] Entry SSR neutral para Cloudflare Workers.
// Aísla el crux de viabilidad: ¿el bundle SSR de Angular compila (platform=neutral)
// y corre en el runtime de Workers? Sin APIs Node (nada de @hono/node-server ni fs).
import { AngularAppEngine } from '@angular/ssr';

interface Env {
	// Binding de Workers Assets: sirve el output estático (dist browser + prerender).
	ASSETS: { fetch(request: Request): Promise<Response> };
}

// allowedHosts '*' y trustProxyHeaders son SOLO para el spike (dominio *.workers.dev):
// en prod real se usaría getAllowedHosts() como en server.ts.
const angularApp = new AngularAppEngine({ allowedHosts: ['*'], trustProxyHeaders: true });

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		// 1) ¿es un asset estático? (JS/CSS/imágenes/HTML prerenderizado)
		const assetResponse = await env.ASSETS.fetch(request);
		if (assetResponse.status !== 404) {
			return assetResponse;
		}
		// 2) SSR de las rutas Server vía el engine de Angular.
		const rendered = await angularApp.handle(request);
		return rendered ?? new Response('Not found', { status: 404 });
	},
};
