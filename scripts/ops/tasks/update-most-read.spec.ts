import { onoffLiteraryWorkNavigationTeasersWithAuthorsMock } from '@mocks/onoff-literary-work-teasers.mock';
import { clearAllMocks, type Mock } from '@test-utils';
import { environment } from '@api/_helpers/environment';
import { fetchPopularPagesMetric } from '@api/_helpers/clarity-connector';
import { ClarityRequestError, ClarityResponseError } from '@api/_helpers/clarity-connector.errors';
import { InMemoryContentRepository } from '@api/modules/content/content.repository.mock';
import { runMostReadUpdate } from './update-most-read';

/* eslint-disable no-restricted-syntax -- vi.mock/vi.fn: mock de módulo de un servicio externo sin punto de inyección */
vi.mock('@api/_helpers/clarity-connector', () => ({ fetchPopularPagesMetric: vi.fn() }));
/* eslint-enable no-restricted-syntax */

const [first, second, third] = onoffLiteraryWorkNavigationTeasersWithAuthorsMock;

function popularPages(...slugs: string[]) {
	return {
		metricName: 'PopularPages' as const,
		information: slugs.map((slug) => ({ url: `${environment.basePath}/literary-work/${slug}`, visitsCount: '1' })),
	};
}

describe('runMostReadUpdate', () => {
	const originalSanityToken = environment.sanity.token;
	const originalClarityToken = environment.clarity.token;
	const originalProjectId = environment.sanity.projectId;

	function repository() {
		return new InMemoryContentRepository({
			rotatingContent: { _id: 'rotatingContent', name: 'Lo más leído', mostRead: [third] },
			literaryWorks: onoffLiteraryWorkNavigationTeasersWithAuthorsMock,
		});
	}

	beforeEach(() => {
		environment.sanity.token = 'sanity';
		environment.clarity.token = 'clarity';
		environment.sanity.projectId = 'project';
	});

	afterEach(() => {
		environment.sanity.token = originalSanityToken;
		environment.clarity.token = originalClarityToken;
		environment.sanity.projectId = originalProjectId;
		clearAllMocks();
	});

	it('should write the ranking deduplicated and in Clarity order', async () => {
		(fetchPopularPagesMetric as Mock).mockResolvedValue(popularPages(second.slug, first.slug, second.slug));
		const content = repository();

		const slugs = await runMostReadUpdate(content);

		expect(slugs).toEqual([second.slug, first.slug]);
		expect((await content.fetchRotatingContent())?.mostRead.map(({ slug }) => slug)).toEqual([second.slug, first.slug]);
	});

	it('should report what was persisted and not what was requested', async () => {
		(fetchPopularPagesMetric as Mock).mockResolvedValue(popularPages(second.slug, 'sin-obra', first.slug));

		const slugs = await runMostReadUpdate(repository());

		expect(slugs).toEqual([second.slug, first.slug]);
	});

	it('should fail when no Clarity slug resolves to a work', async () => {
		(fetchPopularPagesMetric as Mock).mockResolvedValue(popularPages('sin-obra'));

		await expect(runMostReadUpdate(repository())).rejects.toThrow('ranking quedó vacío');
	});

	it('should fail with a typed error when Clarity reports no popular pages', async () => {
		(fetchPopularPagesMetric as Mock).mockResolvedValue(undefined);

		await expect(runMostReadUpdate(repository())).rejects.toThrow(ClarityResponseError);
	});

	it('should propagate a provider failure', async () => {
		(fetchPopularPagesMetric as Mock).mockRejectedValue(new ClarityRequestError(401));

		await expect(runMostReadUpdate(repository())).rejects.toThrow(ClarityRequestError);
	});

	it('should fail before reaching Clarity when the Sanity token is missing', async () => {
		environment.sanity.token = '';

		await expect(runMostReadUpdate(repository())).rejects.toThrow('SANITY_STUDIO_TOKEN');
		expect(fetchPopularPagesMetric).not.toHaveBeenCalled();
	});

	it('should fail when the Sanity project id is missing', async () => {
		environment.sanity.projectId = '';

		await expect(runMostReadUpdate(repository())).rejects.toThrow('SANITY_STUDIO_PROJECT_ID');
		expect(fetchPopularPagesMetric).not.toHaveBeenCalled();
	});

	it('should fail when the Clarity token is missing', async () => {
		environment.clarity.token = '';

		await expect(runMostReadUpdate(repository())).rejects.toThrow('CLARITY_TOKEN');
		expect(fetchPopularPagesMetric).not.toHaveBeenCalled();
	});
});
