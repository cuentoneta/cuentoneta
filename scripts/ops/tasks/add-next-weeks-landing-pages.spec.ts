import { addWeeks } from 'date-fns';
import { buildWeekSlug } from '@utils/week-slug.utils';
import { environment } from '@api/_helpers/environment';
import { InMemoryContentRepository } from '@api/modules/content/content.repository.mock';
import { parseWeeks, runAddNextWeeksLandingPages } from './add-next-weeks-landing-pages';

const latestReferences = {
	_type: 'landingPage' as const,
	campaigns: [],
	collections: [],
	latestLiteraryWorks: [],
	highlightedAuthors: [],
};

function nextWeekSlugs(weeks: number): string[] {
	return Array.from({ length: weeks }, (_, index) => buildWeekSlug(addWeeks(new Date(), index + 1)));
}

describe('parseWeeks', () => {
	it('should default to one week', () => {
		expect(parseWeeks([])).toBe(1);
	});

	it('should read the --weeks flag', () => {
		expect(parseWeeks(['--weeks=6'])).toBe(6);
	});

	it.each(['--weeks=0', '--weeks=abc', '--weeks=2.5', '--weeks=', '--weeks=-1', '--weeks=27'])(
		'should reject %s',
		(arg) => {
			expect(() => parseWeeks([arg])).toThrow('--weeks');
		},
	);

	it.each([['--weeks', '6'], ['--week=6'], ['6']])('should reject the unknown argument %j', (...argv) => {
		expect(() => parseWeeks(argv)).toThrow('Argumento desconocido');
	});

	it('should accept the upper bound', () => {
		expect(parseWeeks(['--weeks=26'])).toBe(26);
	});
});

describe('runAddNextWeeksLandingPages', () => {
	const originalToken = environment.sanity.token;
	const originalProjectId = environment.sanity.projectId;

	beforeEach(() => {
		environment.sanity.token = 'token';
		environment.sanity.projectId = 'project';
	});

	afterEach(() => {
		environment.sanity.token = originalToken;
		environment.sanity.projectId = originalProjectId;
	});

	function existing(weeks: number) {
		return nextWeekSlugs(weeks).map((slug) => ({
			slug,
			content: { _id: `landing-page-${slug}`, config: slug } as never,
		}));
	}

	it('should create only next week by default', async () => {
		const repository = new InMemoryContentRepository({ latestReferences });

		const slugs = await runAddNextWeeksLandingPages(parseWeeks([]), repository);

		expect(slugs).toEqual(nextWeekSlugs(1));
		expect(repository.createdLandingPages.map(({ config }) => config)).toEqual(nextWeekSlugs(1));
	});

	it('should create nothing by default when next week already exists', async () => {
		const repository = new InMemoryContentRepository({ latestReferences, landingPages: existing(1) });

		const slugs = await runAddNextWeeksLandingPages(parseWeeks([]), repository);

		expect(slugs).toEqual([]);
		expect(repository.createdLandingPages).toEqual([]);
	});

	it('should create only the weeks that are missing when asked for more than one', async () => {
		const repository = new InMemoryContentRepository({ latestReferences, landingPages: existing(1) });

		const slugs = await runAddNextWeeksLandingPages(parseWeeks(['--weeks=4']), repository);

		expect(slugs).toEqual(nextWeekSlugs(4).slice(1));
	});

	it('should fail when the Sanity project id is missing', async () => {
		environment.sanity.projectId = '';

		await expect(
			runAddNextWeeksLandingPages(parseWeeks([]), new InMemoryContentRepository({ latestReferences })),
		).rejects.toThrow('SANITY_STUDIO_PROJECT_ID');
	});

	it('should fail before writing when the Sanity token is missing', async () => {
		environment.sanity.token = '';
		const repository = new InMemoryContentRepository({ latestReferences });

		await expect(runAddNextWeeksLandingPages(parseWeeks([]), repository)).rejects.toThrow('SANITY_STUDIO_TOKEN');
		expect(repository.createdLandingPages).toEqual([]);
	});

	it('should propagate the failure when there is no landing page to copy from', async () => {
		await expect(runAddNextWeeksLandingPages(parseWeeks([]), new InMemoryContentRepository())).rejects.toThrow(
			'Latest landing page',
		);
	});
});
