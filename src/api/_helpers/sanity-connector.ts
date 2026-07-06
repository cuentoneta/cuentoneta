import { createClient, SanityClient } from '@sanity/client';

// El cliente se construye de forma diferida (primer acceso), no al evaluar el módulo, y lee
// `process.env` fresco en ese momento. Motivo: en Cloudflare Workers las env vars llegan por
// request —el worker las copia a process.env antes de atender— y no están al importar (el objeto
// `environment` se captura al evaluar el módulo, cuando aún están vacías). En Node/Vercel ya
// están presentes, así que el comportamiento es idéntico.
function buildClient(): SanityClient {
	return createClient({
		projectId: process.env['SANITY_STUDIO_PROJECT_ID'] as string,
		dataset: process.env['SANITY_STUDIO_DATASET'] as string,
		token: process.env['SANITY_STUDIO_TOKEN'] as string,
		apiVersion: '2021-10-21', // use current UTC date - see "specifying API version"!
		// `APP_ENV` es un flag propio de la app (host-agnóstico), seteado explícitamente por
		// entorno: en Cloudflare vía `[env.<name>.vars]` de wrangler; reemplaza a `VERCEL_TARGET_ENV`.
		useCdn: process.env['APP_ENV'] === 'production', // `false` para datos frescos
	});
}

let instance: SanityClient | undefined;

// Proxy: inicializa el client real en el primer acceso, sin tocar a los consumidores
// (siguen usando `client.fetch(...)`). Las funciones se bindean al client real para
// preservar el `this`.
export const client: SanityClient = new Proxy({} as SanityClient, {
	get(_target, property) {
		instance ??= buildClient();
		const value = Reflect.get(instance, property, instance);
		return typeof value === 'function' ? value.bind(instance) : value;
	},
});
