import { addWeeks, getWeek, getYear } from 'date-fns';
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
		const currentWeek = getWeek(currentDate);
		const currentYear = getYear(currentDate);
		const currentSlug = `${currentWeek.toString().padStart(2, '0')}-${currentYear}`;

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
					expect.stringMatching(/^\d{2}-2025$/),
					expect.stringMatching(/^\d{2}-2025$/),
					expect.stringMatching(/^\d{2}-2025$/),
					expect.stringMatching(/^\d{2}-2025$/),
				]),
			);
		});

		it('should return an empty array when all weeks already exist', async () => {
			const weeksInTheFuture = 4;
			const futureWeeks = Array.from({ length: weeksInTheFuture }, (_, index) => {
				const date = addWeeks(currentDate, index + 1);
				const week = getWeek(date);
				const year = getYear(date);
				return { _id: `landing-page-${index}`, config: `${week.toString().padStart(2, '0')}-${year}` };
			});

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
			const existingWeek = Array.from({ length: 2 }, (_, index) => {
				const date = addWeeks(currentDate, index + 1);
				const week = getWeek(date);
				const year = getYear(date);
				return { _id: `landing-page-${index}`, config: `${week.toString().padStart(2, '0')}-${year}` };
			});

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
