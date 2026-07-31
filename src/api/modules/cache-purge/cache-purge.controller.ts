import { SIGNATURE_HEADER_NAME, isValidSignature } from '@sanity/webhook';
import { Hono } from 'hono';

import { slugSchema } from '@schemas/common.schemas';
import { environment } from '../../_helpers/environment';
import { VercelCachePurgeRepository, type CachePurgeRepository } from './cache-purge.repository';
import { purgeLiteraryWorkCache } from './cache-purge.service';

function parseJsonBody(raw: string): unknown {
	try {
		return JSON.parse(raw);
	} catch {
		// Cuerpo no-JSON: se trata como payload inválido (400) tras validar el shape.
		return null;
	}
}

/**
 * Webhook que Sanity dispara al publicar una obra, para purgar su caché de borde. La firma
 * HMAC del request se valida contra el cuerpo CRUDO (no un JSON re-serializado, que puede diferir
 * en la codificación) y ANTES de parsear el shape: verificar la autenticidad es una responsabilidad
 * de seguridad anterior a confiar en el contenido. Firma inválida/ausente → 401; shape inválido → 400.
 */
export function createCachePurgeController(repository: CachePurgeRepository = new VercelCachePurgeRepository()) {
	const controller = new Hono();

	controller.post('/', async (c) => {
		const signature = c.req.header(SIGNATURE_HEADER_NAME);
		// El body se lee entero para validar la firma HMAC sobre el crudo. No se acota el tamaño en la
		// app: el despliegue es Vercel, cuyo límite de payload de plataforma (~4.5 MB) rechaza el body
		// antes de que la función lo vea, así que un cliente no autenticado no puede forzar buffering
		// arbitrario. Sanity envía webhooks de unos pocos KB.
		const rawBody = await c.req.text();

		if (!signature || !(await isValidSignature(rawBody, signature, environment.sanityWebhookSecret))) {
			return c.json({ error: 'Invalid webhook signature' }, 401);
		}

		const payload = slugSchema.safeParse(parseJsonBody(rawBody));
		if (!payload.success) {
			return c.json({ error: 'Invalid webhook payload' }, 400);
		}

		await purgeLiteraryWorkCache(payload.data.slug, repository);
		return c.body(null, 204);
	});

	return controller;
}

const cachePurgeController = createCachePurgeController();
export default cachePurgeController;
