import { addWeeks, getWeek, getWeekYear } from 'date-fns';
import {
	clearAllMocks,
	runOnlyPendingTimers,
	setSystemTime,
	useFakeTimers,
	useRealTimers,
	type Mock,
} from '@test-utils';
import * as contentRepository from './content.repository';
import * as contentService from './content.service';
import { LandingPageContentQueryResult } from '../../sanity/types.js';

/* eslint-disable no-restricted-syntax -- vi.mock/vi.fn: mock de módulo del repository; se migra a inyección de dependencias en #1503 */
vi.mock('./content.repository', () => ({
	fetchLandingPagesList: vi.fn(),
	fetchLandingPageContent: vi.fn(),
	createLandingPages: vi.fn(),
	fetchLatestLandingPageReferences: vi.fn(),
	fetchRotatingContent: vi.fn(),
}));
/* eslint-enable no-restricted-syntax */

describe('ContentService', () => {
	beforeEach(() => {
		clearAllMocks();
		useFakeTimers();
	});

	afterEach(() => {
		runOnlyPendingTimers();
		useRealTimers();
	});

	describe('addNextWeeksLandingPageContent', () => {
		const currentDate = new Date('2025-11-14');
		const buildSlug = (date: Date) => `${getWeekYear(date)}-${getWeek(date).toString().padStart(2, '0')}`;
		const currentSlug = buildSlug(currentDate);

		const mockLandingPage = {
			_id: 'landing-page-current',
			campaigns: [{ _id: 'campaign-1' }, { _id: 'campaign-2' }],
			cards: [{ _id: 'card-1' }],
			latestReads: [{ _id: 'story-1' }, { _id: 'story-2' }],
		};

		beforeEach(() => {
			setSystemTime(currentDate);
		});

		it('should create missing weeks landing pages when they do not exist', async () => {
			const weeksInTheFuture = 4;

			// Mock repository responses
			(contentRepository.fetchLandingPagesList as Mock).mockResolvedValue([]);
			(contentRepository.fetchLatestLandingPageReferences as Mock).mockResolvedValue(mockLandingPage);
			(contentRepository.createLandingPages as Mock).mockResolvedValue([
				{ _id: 'created-1' },
				{ _id: 'created-2' },
				{ _id: 'created-3' },
				{ _id: 'created-4' },
			]);

			const result = await contentService.addNextWeeksLandingPageContent(weeksInTheFuture);

			// Verify all weeks were created
			expect(result).toHaveLength(4);
			expect(contentRepository.fetchLandingPagesList).toHaveBeenCalledWith(
				expect.arrayContaining([
					expect.stringMatching(/^2025-\d{2}$/),
					expect.stringMatching(/^2025-\d{2}$/),
					expect.stringMatching(/^2025-\d{2}$/),
					expect.stringMatching(/^2025-\d{2}$/),
				]),
			);
			// Regresión #1749: la base a clonar debe pedirse acotada a la semana actual (antes se
			// invocaba sin argumentos y terminaba clonando el último stub futuro autogenerado).
			expect(contentRepository.fetchLatestLandingPageReferences).toHaveBeenCalledWith(currentSlug);
		});

		it('should clone the base returned by the repository verbatim, without leaking its _id', async () => {
			const weeksInTheFuture = 2;

			(contentRepository.fetchLandingPagesList as Mock).mockResolvedValue([]);
			(contentRepository.fetchLatestLandingPageReferences as Mock).mockResolvedValue(mockLandingPage);
			(contentRepository.createLandingPages as Mock).mockResolvedValue([{ _id: 'created-1' }, { _id: 'created-2' }]);

			await contentService.addNextWeeksLandingPageContent(weeksInTheFuture);

			// El filtrado de "última semana no futura" vive en la query GROQ (config <= $currentSlug); el
			// service solo pasa la semana actual y clona la base tal cual la recibe, sin selección propia.
			expect(contentRepository.fetchLatestLandingPageReferences).toHaveBeenCalledWith(currentSlug);

			const createdObjects = (contentRepository.createLandingPages as Mock).mock.calls[0][0] as Array<
				Record<string, unknown>
			>;
			createdObjects.forEach((obj) => {
				expect(obj.campaigns).toEqual(mockLandingPage.campaigns);
				expect(obj.cards).toEqual(mockLandingPage.cards);
				expect(obj.latestReads).toEqual(mockLandingPage.latestReads);
				expect(obj).not.toHaveProperty('_id');
			});
		});

		it('should return an empty array when all weeks already exist', async () => {
			const weeksInTheFuture = 4;
			const futureWeeks = Array.from({ length: weeksInTheFuture }, (_, index) => ({
				_id: `landing-page-${index}`,
				config: buildSlug(addWeeks(currentDate, index + 1)),
			}));

			(contentRepository.fetchLandingPagesList as Mock).mockResolvedValue(futureWeeks);

			const result = await contentService.addNextWeeksLandingPageContent(weeksInTheFuture);

			expect(result).toEqual([]);
			expect(contentRepository.createLandingPages).not.toHaveBeenCalled();
		});

		it('should throw an error when current landing page is not found', async () => {
			const weeksInTheFuture = 4;

			(contentRepository.fetchLandingPagesList as Mock).mockResolvedValue([]);
			(contentRepository.fetchLatestLandingPageReferences as Mock).mockResolvedValue(null);

			await expect(contentService.addNextWeeksLandingPageContent(weeksInTheFuture)).rejects.toThrow(
				`Latest landing page for the '${currentSlug}' slug content not found`,
			);
		});

		it('should throw an error when landing page list query fails', async () => {
			const weeksInTheFuture = 4;

			(contentRepository.fetchLandingPagesList as Mock).mockResolvedValue(null);

			await expect(contentService.addNextWeeksLandingPageContent(weeksInTheFuture)).rejects.toThrow(
				'Could not retrieve the landing page configs',
			);
		});

		it('should create only missing weeks when some already exist', async () => {
			const weeksInTheFuture = 4;
			const existingWeek = Array.from({ length: 2 }, (_, index) => ({
				_id: `landing-page-${index}`,
				config: buildSlug(addWeeks(currentDate, index + 1)),
			}));

			(contentRepository.fetchLandingPagesList as Mock).mockResolvedValue(existingWeek);
			(contentRepository.fetchLatestLandingPageReferences as Mock).mockResolvedValue(mockLandingPage);
			(contentRepository.createLandingPages as Mock).mockResolvedValue([{ _id: 'created-3' }, { _id: 'created-4' }]);

			const result = await contentService.addNextWeeksLandingPageContent(weeksInTheFuture);

			// Should create only the 2 missing weeks
			expect(result).toHaveLength(2);
			expect(contentRepository.createLandingPages).toHaveBeenCalled();

			// Verify that the created objects have the correct structure
			const callArgs = (contentRepository.createLandingPages as Mock).mock.calls[0][0];
			expect(callArgs).toHaveLength(2);
			callArgs.forEach((obj: LandingPageContentQueryResult) => {
				expect(obj).toHaveProperty('config');
				expect(obj).toHaveProperty('slug');
				expect(obj).toHaveProperty('campaigns');
				expect(obj).toHaveProperty('cards');
				expect(obj).toHaveProperty('latestReads');
			});
		});

		it('should call createLandingPages with Promise.all for parallel execution', async () => {
			const weeksInTheFuture = 3;

			(contentRepository.fetchLandingPagesList as Mock).mockResolvedValue([]);
			(contentRepository.fetchLatestLandingPageReferences as Mock).mockResolvedValue(mockLandingPage);
			(contentRepository.createLandingPages as Mock).mockResolvedValue([
				{ _id: 'created-1' },
				{ _id: 'created-2' },
				{ _id: 'created-3' },
			]);

			await contentService.addNextWeeksLandingPageContent(weeksInTheFuture);

			// Verify that createLandingPages was called (which internally uses Promise.all)
			expect(contentRepository.createLandingPages).toHaveBeenCalled();
			const passedObjects = (contentRepository.createLandingPages as Mock).mock.calls[0][0];
			expect(Array.isArray(passedObjects)).toBe(true);
			expect(passedObjects.length).toBe(weeksInTheFuture);
		});
	});
});
