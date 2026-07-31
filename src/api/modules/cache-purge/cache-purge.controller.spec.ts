import { SIGNATURE_HEADER_NAME, encodeSignatureHeader } from '@sanity/webhook';
import { environment } from '../../_helpers/environment';
import { createCachePurgeController } from './cache-purge.controller';
import { SpyCachePurgeRepository } from './cache-purge.repository.mock';

describe('cachePurgeController', () => {
	const secret = 'test-webhook-secret';
	const originalSecret = environment.sanityWebhookSecret;

	beforeEach(() => {
		environment.sanityWebhookSecret = secret;
	});

	afterEach(() => {
		environment.sanityWebhookSecret = originalSecret;
	});

	async function signedRequest(body: string): Promise<Request> {
		const signature = await encodeSignatureHeader(body, Date.now(), secret);
		return new Request('http://localhost/', {
			method: 'POST',
			headers: { [SIGNATURE_HEADER_NAME]: signature, 'content-type': 'application/json' },
			body,
		});
	}

	it('purga el tag de la obra ante una firma válida', async () => {
		const repository = new SpyCachePurgeRepository();
		const controller = createCachePurgeController(repository);
		const body = JSON.stringify({ slug: 'la-obra' });

		const response = await controller.request(await signedRequest(body));

		expect(response.status).toBe(204);
		expect(repository.purgedTags).toEqual(['literary-work:la-obra']);
	});

	it('rechaza con 401 y no purga ante una firma inválida', async () => {
		const repository = new SpyCachePurgeRepository();
		const controller = createCachePurgeController(repository);
		const request = new Request('http://localhost/', {
			method: 'POST',
			headers: { [SIGNATURE_HEADER_NAME]: 't=9999999999,v1=firma-invalida', 'content-type': 'application/json' },
			body: JSON.stringify({ slug: 'la-obra' }),
		});

		const response = await controller.request(request);

		expect(response.status).toBe(401);
		expect(repository.purgedTags).toEqual([]);
	});

	it('rechaza con 401 cuando falta la firma', async () => {
		const repository = new SpyCachePurgeRepository();
		const controller = createCachePurgeController(repository);
		const request = new Request('http://localhost/', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ slug: 'la-obra' }),
		});

		const response = await controller.request(request);

		expect(response.status).toBe(401);
		expect(repository.purgedTags).toEqual([]);
	});

	it('rechaza con 400 un payload sin slug pese a firma válida', async () => {
		const repository = new SpyCachePurgeRepository();
		const controller = createCachePurgeController(repository);
		const body = JSON.stringify({ noSlug: true });

		const response = await controller.request(await signedRequest(body));

		expect(response.status).toBe(400);
		expect(repository.purgedTags).toEqual([]);
	});

	it('rechaza con 400 un cuerpo no-JSON pese a firma válida', async () => {
		const repository = new SpyCachePurgeRepository();
		const controller = createCachePurgeController(repository);
		const body = 'esto no es json';

		const response = await controller.request(await signedRequest(body));

		expect(response.status).toBe(400);
		expect(repository.purgedTags).toEqual([]);
	});

	it('es fail-closed: con el secreto vacío toda firma falla (401) y no purga', async () => {
		environment.sanityWebhookSecret = '';
		const repository = new SpyCachePurgeRepository();
		const controller = createCachePurgeController(repository);
		const body = JSON.stringify({ slug: 'la-obra' });
		// Firma computada con un secreto cualquiera: sin secreto configurado en el server, no valida.
		const signature = await encodeSignatureHeader(body, Date.now(), 'cualquier-secreto');
		const request = new Request('http://localhost/', {
			method: 'POST',
			headers: { [SIGNATURE_HEADER_NAME]: signature, 'content-type': 'application/json' },
			body,
		});

		const response = await controller.request(request);

		expect(response.status).toBe(401);
		expect(repository.purgedTags).toEqual([]);
	});
});
