import { Hono } from 'hono';
import { setSystemTime, useFakeTimers, useRealTimers } from '@test-utils';
import { buildWeekSlug } from '@utils/week-slug.utils';
import type { LandingPageContent } from '@models/landing-page-content.model';
import { environment } from '../../_helpers/environment';
import { readCacheHeaders } from '../../_middleware/read-cache-headers.middleware';
import { createContentController } from './content.controller';
import { MalformedLandingPageError } from './content.errors';
import { InMemoryContentRepository } from './content.repository.mock';
import type { ContentRepository } from './content.repository';

// La semana sale de la fecha real y no de una literal: a estos casos no les importa cuál es, sino que
// la que el service pide sea la que está curada. El reloj se congela igual en ese instante, para que un
// caso que corra justo en el cruce de semana no cambie de respuesta a mitad de camino.
const CURRENT_DATE = new Date();
const CURRENT_SLUG = buildWeekSlug(CURRENT_DATE);

function appWith(repository: ContentRepository): Hono {
	const app = new Hono();
	app.route('/content', createContentController(repository));
	return app;
}

const curatedLandingPage: LandingPageContent = {
	_id: `landing-page-${CURRENT_SLUG}`,
	config: CURRENT_SLUG,
	collections: [],
	campaigns: [],
	mostRead: [],
	latestReads: [],
	highlightedAuthors: [],
};

beforeEach(() => {
	useFakeTimers();
	setSystemTime(CURRENT_DATE);
});

afterEach(() => useRealTimers());

describe('contentController', () => {
	it('serves the landing page of the current week', async () => {
		const app = appWith(
			new InMemoryContentRepository({ landingPages: [{ slug: CURRENT_SLUG, content: curatedLandingPage }] }),
		);

		const response = await app.request('/content/landing-page');

		expect(response.status).toBe(200);
		await expect(response.json()).resolves.toMatchObject({ config: CURRENT_SLUG });
	});

	it('answers 404 when the week has not been curated', async () => {
		const response = await appWith(new InMemoryContentRepository()).request('/content/landing-page');

		expect(response.status).toBe(404);
	});
});

describe('contentController with malformed data', () => {
	// La landing existe: lo que falla es su curaduría, no el pedido.
	class FailingContentRepository extends InMemoryContentRepository {
		public override async fetchLandingPageContent(): Promise<never> {
			throw new MalformedLandingPageError(CURRENT_SLUG);
		}
	}

	const failing = appWith(new FailingContentRepository());

	it('answers 500 with a stable code', async () => {
		const response = await failing.request('/content/landing-page');

		expect(response.status).toBe(500);
		await expect(response.json()).resolves.toEqual({ error: 'landing_page_malformed' });
	});

	// El mensaje del error nombra el documento culpable, que es información de la redacción.
	it('keeps the offending slug out of the response', async () => {
		const response = await failing.request('/content/landing-page');

		await expect(response.text()).resolves.not.toContain(CURRENT_SLUG);
	});
});

// La ruta que crea las landing pages de las próximas semanas comparte prefijo con las lecturas del
// módulo, así que hereda su middleware de caché. Servida desde el borde devolvería un 200 sin haber
// creado ningún documento, y la redacción se quedaría sin la semana siguiente sin ninguna señal.
describe('contentController — la escritura no es cacheable', () => {
	const originalProduction = environment.production;

	afterEach(() => {
		environment.production = originalProduction;
	});

	// El generador clona las referencias de la última semana curada, así que sin ellas la ruta responde
	// 500 — y una respuesta que no es 200 el middleware ya la saltea, con lo que el caso pasaría en vacío.
	const writableRepository = () =>
		new InMemoryContentRepository({
			latestReferences: {
				_type: 'landingPage',
				campaigns: [],
				collections: [],
				latestLiteraryWorks: [],
				highlightedAuthors: [],
			},
		});

	it('declares the weekly landing page creation as no-store', async () => {
		const response = await appWith(writableRepository()).request(
			'/content/add-next-weeks-landing-page-content?weeksInTheFuture=1',
		);

		expect(response.status).toBe(200);
		expect(response.headers.get('Cache-Control')).toBe('no-store');
	});

	// Y la composición con el middleware, que es lo que el `no-store` existe para lograr: montado
	// detrás de él y con la caché habilitada, la respuesta no recibe el TTL de borde.
	it('stays out of the edge cache when mounted behind the read cache middleware', async () => {
		environment.production = true;

		const app = new Hono();
		app.on('GET', ['/content', '/content/*'], readCacheHeaders);
		app.route('/content', createContentController(writableRepository()));

		const response = await app.request('/content/add-next-weeks-landing-page-content?weeksInTheFuture=1');

		// El 200 no es decoración: el middleware ya se saltea toda respuesta que no lo sea, así que sin
		// esta aserción el caso pasaría igual por la vía del error y no probaría el `no-store`.
		expect(response.status).toBe(200);
		expect(response.headers.get('Vercel-CDN-Cache-Control')).toBeNull();
	});
});
