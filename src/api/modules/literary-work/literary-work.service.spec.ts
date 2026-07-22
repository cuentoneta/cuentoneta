import { getLiteraryWorkBySlug } from './literary-work.service';
import { LiteraryWorkNotFoundError, LiteraryWorkSectionNotFoundError } from './literary-work.errors';
import { InMemoryLiteraryWorkRepository } from './literary-work.repository.mock';
import { rawAnonymousLiteraryWork, rawLiteraryWork } from '../../_mocks/literary-work-raw.mock';

describe('getLiteraryWorkBySlug', () => {
	const repository = new InMemoryLiteraryWorkRepository([rawLiteraryWork, rawAnonymousLiteraryWork]);

	it('returns the mapped aggregate for an existing slug', async () => {
		const work = await getLiteraryWorkBySlug('la-vigilia-de-onoff', undefined, repository);

		expect(work.slug).toBe('la-vigilia-de-onoff');
		expect(work.authors).toHaveLength(1);
		expect(work.content[0].bodyHtml.length).toBeGreaterThan(0);
	});

	it('throws LiteraryWorkNotFoundError for an unknown slug', async () => {
		await expect(getLiteraryWorkBySlug('no-existe', undefined, repository)).rejects.toThrow(LiteraryWorkNotFoundError);
	});

	it('projects a single section keeping the whole-work metadata', async () => {
		const work = await getLiteraryWorkBySlug('la-vigilia-de-onoff', 1, repository);

		expect(work.content).toHaveLength(1);
		expect(work.content[0].position).toBe(1);
		expect(work.sectionCount).toBe(2);
		expect(work.totalReadingTime).toBeGreaterThanOrEqual(2);
	});

	it('throws LiteraryWorkSectionNotFoundError when the section is out of range', async () => {
		await expect(getLiteraryWorkBySlug('la-vigilia-de-onoff', 99, repository)).rejects.toThrow(
			LiteraryWorkSectionNotFoundError,
		);
	});

	it('honors readingTimeOverride through the full mapping', async () => {
		const work = await getLiteraryWorkBySlug('cantar-anonimo', undefined, repository);

		expect(work.totalReadingTime).toBe(40);
	});
});
