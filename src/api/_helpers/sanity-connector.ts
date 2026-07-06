import { createClient, SanityClient } from '@sanity/client';

let instance: SanityClient | undefined;

function buildClient(): SanityClient {
	return createClient({
		projectId: process.env['SANITY_STUDIO_PROJECT_ID'] as string,
		dataset: process.env['SANITY_STUDIO_DATASET'] as string,
		token: process.env['SANITY_STUDIO_TOKEN'] as string,
		apiVersion: '2021-10-21', // use current UTC date - see "specifying API version"!
		useCdn: process.env['APP_ENV'] === 'production', // `false` para datos frescos
	});
}

/**
 * Devuelve el cliente Sanity con inicialización diferida (primer uso), no al evaluar el módulo,
 * leyendo `process.env` fresco en ese momento. Motivo: en Cloudflare Workers las env vars llegan
 * por request (el worker las copia a process.env antes de atender); en Node/Vercel ya están al
 * importar. Se prefiere una función explícita a un cliente exportado (o un Proxy lazy) porque el
 * cliente real es introspeccionado por libs como `@sanity/image-url` (que hace `"config" in client`).
 */
export function getClient(): SanityClient {
	return (instance ??= buildClient());
}
