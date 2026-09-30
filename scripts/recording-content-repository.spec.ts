import { onoffLiteraryWorkNavigationTeasersWithAuthorsMock } from '@mocks/onoff-literary-work-teasers.mock';
import { InMemoryContentRepository } from '../src/api/modules/content/content.repository.mock';
import type { LandingPageCreatePayload } from '../src/api/modules/content/content.repository';
import { RecordingContentRepository } from './recording-content-repository';

const payload = { config: '2026-40' } as LandingPageCreatePayload;
const rotatingContent = { _id: 'rotatingContent', name: 'Lo más leído', mostRead: [] };

describe('RecordingContentRepository', () => {
	describe('without apply', () => {
		it('should record the landing pages without creating them', async () => {
			const delegate = new InMemoryContentRepository();
			const repository = new RecordingContentRepository(delegate, false);

			await repository.createLandingPages([payload]);

			expect(repository.landingPages).toEqual([payload]);
			expect(delegate.createdLandingPages).toEqual([]);
		});

		it('should record the most-read slugs without writing the ranking', async () => {
			const delegate = new InMemoryContentRepository({ rotatingContent });
			const repository = new RecordingContentRepository(delegate, false);

			await repository.updateMostReadLiteraryWorks(['a', 'b']);

			expect(repository.mostReadSlugs).toEqual(['a', 'b']);
			expect(await delegate.fetchRotatingContent()).toBe(rotatingContent);
		});
	});

	describe('with apply', () => {
		it('should record and forward the landing pages', async () => {
			const delegate = new InMemoryContentRepository();
			const repository = new RecordingContentRepository(delegate, true);

			await repository.createLandingPages([payload]);

			expect(repository.landingPages).toEqual([payload]);
			expect(delegate.createdLandingPages).toEqual([payload]);
		});

		it('should record and forward the most-read slugs', async () => {
			const [first] = onoffLiteraryWorkNavigationTeasersWithAuthorsMock;
			const delegate = new InMemoryContentRepository({
				rotatingContent: { ...rotatingContent, mostRead: [first] },
			});
			const repository = new RecordingContentRepository(delegate, true);

			await repository.updateMostReadLiteraryWorks(['unknown']);

			expect(repository.mostReadSlugs).toEqual(['unknown']);
			expect((await delegate.fetchRotatingContent())?.mostRead).toEqual([]);
		});
	});

	it('should read through to the delegate', async () => {
		const repository = new RecordingContentRepository(new InMemoryContentRepository({ rotatingContent }), false);

		expect(await repository.fetchRotatingContent()).toBe(rotatingContent);
	});
});
