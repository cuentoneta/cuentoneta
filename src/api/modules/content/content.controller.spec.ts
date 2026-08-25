import { Hono } from 'hono';
import { setSystemTime, useFakeTimers, useRealTimers } from '@test-utils';
import { buildWeekSlug } from '@utils/week-slug.utils';
import type { LandingPageContent } from '@models/landing-page-content.model';
import { createContentController } from './content.controller';
import { MalformedLandingPageError } from './content.errors';
import { InMemoryContentRepository } from './content.repository.mock';
import type { ContentRepository } from './content.repository';

const CURRENT_DATE = new Date(2025, 10, 14);
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
