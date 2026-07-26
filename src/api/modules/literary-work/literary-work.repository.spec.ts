import type { SanityClient } from '@sanity/client';
import { clearAllMocks, fn, type Mock } from '@test-utils';
import { SanityLiteraryWorkRepository } from './literary-work.repository';
import { LiteraryWorkSectionNotFoundError } from './literary-work.errors';
import { rawLiteraryWork, rawUnmaterializedLiteraryWork } from '../../_mocks/literary-work-raw.mock';

interface SpyClient {
	client: SanityClient;
	fetch: Mock;
	patch: Mock;
	setIfMissing: Mock;
	commit: Mock;
}

// Spy inyectado por el seam del constructor: implementa solo `fetch` y la cadena `patch → setIfMissing
// → commit` que el repository ejerce; el resto del contrato de SanityClient no interviene.
function createSpyClient(): SpyClient {
	const commit = fn(() => Promise.resolve({}));
	const setIfMissing = fn(() => ({ commit }));
	const patch = fn(() => ({ setIfMissing }));
	const fetch = fn();
	const client = { fetch, patch } as unknown as SanityClient;
	return { client, fetch, patch, setIfMissing, commit };
}

const sectionReadingTimeKey = (key: string) => `content[_key=="${key}"].readingTime`;

describe('SanityLiteraryWorkRepository', () => {
	// Cada test crea su spy fresco con createSpyClient(), así que no hay estado compartido; el reset
	// es higiene alineada con la convención del repo (testing.md).
	beforeEach(clearAllMocks);

	describe('fetchBySlug — materialización write-on-read', () => {
		it('persists the missing reading times (setIfMissing) and serves the computed values', async () => {
			const spy = createSpyClient();
			spy.fetch.mockResolvedValue(rawUnmaterializedLiteraryWork);
			const repository = new SanityLiteraryWorkRepository(spy.client, true);

			const work = await repository.fetchBySlug('sin-materializar');

			expect(spy.patch).toHaveBeenCalledWith('literaryWork_3');
			const attributes = spy.setIfMissing.mock.calls[0][0] as Record<string, number>;
			expect(Object.keys(attributes)).toContain('totalReadingTime');
			expect(Object.keys(attributes)).toContain(sectionReadingTimeKey('section-1'));
			expect(Object.keys(attributes)).toContain(sectionReadingTimeKey('section-2'));
			expect(spy.commit).toHaveBeenCalledTimes(1);
			expect(work?.totalReadingTime).toBe(work?.content.reduce((sum: number, s) => sum + s.readingTime, 0));
		});

		it('does not write when the reading times are already persisted', async () => {
			const spy = createSpyClient();
			spy.fetch.mockResolvedValue(rawLiteraryWork);
			const repository = new SanityLiteraryWorkRepository(spy.client, true);

			await repository.fetchBySlug('la-vigilia-de-onoff');

			expect(spy.patch).not.toHaveBeenCalled();
		});

		it('degrades to compute-without-persist when there is no write token', async () => {
			const spy = createSpyClient();
			spy.fetch.mockResolvedValue(rawUnmaterializedLiteraryWork);
			const repository = new SanityLiteraryWorkRepository(spy.client, false);

			const work = await repository.fetchBySlug('sin-materializar');

			expect(spy.patch).not.toHaveBeenCalled();
			expect(work?.content.every((section) => section.readingTime >= 1)).toBe(true);
		});

		it('skips the write (without throwing) when a section _key is unsafe to interpolate', async () => {
			const broken = {
				...rawUnmaterializedLiteraryWork,
				content: [{ ...rawUnmaterializedLiteraryWork.content[0], _key: 'bad key!' }],
			};
			const spy = createSpyClient();
			spy.fetch.mockResolvedValue(broken);
			const repository = new SanityLiteraryWorkRepository(spy.client, true);

			const work = await repository.fetchBySlug('sin-materializar');

			expect(spy.patch).not.toHaveBeenCalled();
			expect(work).not.toBeNull();
		});

		it('returns null for an unknown slug', async () => {
			const spy = createSpyClient();
			spy.fetch.mockResolvedValue(null);
			const repository = new SanityLiteraryWorkRepository(spy.client, true);

			expect(await repository.fetchBySlug('no-existe')).toBeNull();
		});
	});

	describe('fetchSectionBySlug — proyección parcial', () => {
		it('projects the requested section with whole-work metadata in a single query', async () => {
			const spy = createSpyClient();
			spy.fetch.mockResolvedValue({ ...rawLiteraryWork, section: [rawLiteraryWork.content[1]] });
			const repository = new SanityLiteraryWorkRepository(spy.client, true);

			const work = await repository.fetchSectionBySlug('la-vigilia-de-onoff', 1);

			expect(work?.content).toHaveLength(1);
			expect(work?.content[0].position).toBe(1);
			expect(work?.sectionCount).toBe(2);
			expect(work?.totalReadingTime).toBe(2);
			expect(spy.fetch).toHaveBeenCalledTimes(1);
		});

		it('falls back to a full fetch to materialize on cold-start (no persisted total)', async () => {
			const coldSection = { ...rawUnmaterializedLiteraryWork, section: [rawUnmaterializedLiteraryWork.content[1]] };
			const spy = createSpyClient();
			spy.fetch.mockResolvedValueOnce(coldSection).mockResolvedValueOnce(rawUnmaterializedLiteraryWork);
			const repository = new SanityLiteraryWorkRepository(spy.client, true);

			const work = await repository.fetchSectionBySlug('sin-materializar', 1);

			expect(spy.fetch).toHaveBeenCalledTimes(2);
			expect(work?.content).toHaveLength(1);
			expect(work?.content[0].position).toBe(1);
		});

		it('throws LiteraryWorkSectionNotFoundError when the section is out of range', async () => {
			const spy = createSpyClient();
			spy.fetch.mockResolvedValue({ ...rawLiteraryWork, section: [] });
			const repository = new SanityLiteraryWorkRepository(spy.client, true);

			await expect(repository.fetchSectionBySlug('la-vigilia-de-onoff', 99)).rejects.toThrow(
				LiteraryWorkSectionNotFoundError,
			);
		});

		it('returns null for an unknown slug', async () => {
			const spy = createSpyClient();
			spy.fetch.mockResolvedValue(null);
			const repository = new SanityLiteraryWorkRepository(spy.client, true);

			expect(await repository.fetchSectionBySlug('no-existe', 0)).toBeNull();
		});
	});
});
