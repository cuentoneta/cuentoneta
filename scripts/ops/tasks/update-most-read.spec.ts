import { onoffLiteraryWorkNavigationTeasersWithAuthorsMock } from '@mocks/onoff-literary-work-teasers.mock';
import { clearAllMocks, type Mock } from '@test-utils';
import { environment } from '@api/_helpers/environment';
import { fetchClarityData } from '@api/_helpers/clarity-connector';
import { InMemoryContentRepository } from '@api/modules/content/content.repository.mock';
import { runMostReadUpdate } from './update-most-read';

/* eslint-disable no-restricted-syntax -- vi.mock/vi.fn: mock de módulo de un servicio externo sin punto de inyección */
vi.mock('@api/_helpers/clarity-connector', () => ({ fetchClarityData: vi.fn() }));
/* eslint-enable no-restricted-syntax */

const [first, second, third] = onoffLiteraryWorkNavigationTeasersWithAuthorsMock;

function popularPages(...slugs: string[]) {
	return [
		{
			metricName: 'PopularPages' as const,
			information: slugs.map((slug) => ({ url: `${environment.basePath}/literary-work/${slug}`, visitsCount: '1' })),
		},
	];
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

	it('should write the ranking deduplicated and in Clarity order when applying', async () => {
		(fetchClarityData as Mock).mockResolvedValue(popularPages(second.slug, first.slug, second.slug));
		const content = repository();

		const slugs = await runMostReadUpdate(true, content);

		expect(slugs).toEqual([second.slug, first.slug]);
		expect((await content.fetchRotatingContent())?.mostRead.map(({ slug }) => slug)).toEqual([second.slug, first.slug]);
	});

	it('should report the ranking without writing it in dry-run', async () => {
		(fetchClarityData as Mock).mockResolvedValue(popularPages(second.slug, first.slug));
		const content = repository();

		const slugs = await runMostReadUpdate(false, content);

		expect(slugs).toEqual([second.slug, first.slug]);
		expect((await content.fetchRotatingContent())?.mostRead.map(({ slug }) => slug)).toEqual([third.slug]);
	});

	it('should report what was persisted and not what was requested', async () => {
		(fetchClarityData as Mock).mockResolvedValue(popularPages(second.slug, 'sin-obra', first.slug));

		const slugs = await runMostReadUpdate(true, repository());

		expect(slugs).toEqual([second.slug, first.slug]);
	});

	it('should fail when no Clarity slug resolves to a work', async () => {
		(fetchClarityData as Mock).mockResolvedValue(popularPages('sin-obra'));

		await expect(runMostReadUpdate(true, repository())).rejects.toThrow('resolvió');
	});

	it('should fail when Clarity reports no read work', async () => {
		(fetchClarityData as Mock).mockResolvedValue(popularPages());

		await expect(runMostReadUpdate(true, repository())).rejects.toThrow('ninguna obra');
	});

	it('should fail when Clarity returns no popular pages', async () => {
		(fetchClarityData as Mock).mockResolvedValue([]);

		await expect(runMostReadUpdate(true, repository())).rejects.toThrow('Could not fetch metrics.');
	});

	it('should fail before writing when the Sanity token is missing', async () => {
		environment.sanity.token = '';

		await expect(runMostReadUpdate(true, repository())).rejects.toThrow('SANITY_STUDIO_TOKEN');
		expect(fetchClarityData).not.toHaveBeenCalled();
	});

	it('should fail when the Sanity project id is missing', async () => {
		environment.sanity.projectId = '';

		await expect(runMostReadUpdate(false, repository())).rejects.toThrow('SANITY_STUDIO_PROJECT_ID');
		expect(fetchClarityData).not.toHaveBeenCalled();
	});

	it('should fail when the Clarity token is missing', async () => {
		environment.clarity.token = '';

		await expect(runMostReadUpdate(false, repository())).rejects.toThrow('CLARITY_TOKEN');
		expect(fetchClarityData).not.toHaveBeenCalled();
	});
});
