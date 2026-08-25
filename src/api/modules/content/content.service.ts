import type { LandingPageContent, RotatingContent } from '@models/landing-page-content.model';
import { addWeeks } from 'date-fns';
import slugify from 'slugify';
import { buildWeekSlug } from '@utils/week-slug.utils';
import { LandingPageNotFoundError, RotatingContentNotFoundError } from './content.errors';
import type { ContentRepository, LandingPageCreatePayload } from './content.repository';
import { SanityContentRepository } from './content.repository.sanity';

// El repository es stateless, así que instanciarlo por llamada (default) no comparte estado.

export async function getLandingPageContent(
	repository: ContentRepository = new SanityContentRepository(),
): Promise<LandingPageContent> {
	const slug = buildWeekSlug(new Date());
	const landingPageContent = await repository.fetchLandingPageContent(slug);
	if (!landingPageContent) {
		throw new LandingPageNotFoundError(slug);
	}
	return landingPageContent;
}

export async function getRotatingContent(
	repository: ContentRepository = new SanityContentRepository(),
): Promise<RotatingContent> {
	const rotatingContent = await repository.fetchRotatingContent();
	if (!rotatingContent) {
		throw new RotatingContentNotFoundError();
	}
	return rotatingContent;
}

export async function addNextWeeksLandingPageContent(
	weeksInTheFuture: number = 4,
	repository: ContentRepository = new SanityContentRepository(),
) {
	const currentDate = new Date();
	const currentLandingPageSlug = buildWeekSlug(currentDate);

	const slugs = Array.from({ length: weeksInTheFuture }, (_, index) => buildWeekSlug(addWeeks(currentDate, index + 1)));

	const existingLandingPagesList = await repository.fetchLandingPagesList(slugs);

	if (!existingLandingPagesList) {
		throw new Error(`Could not retrieve the landing page configs for the [${slugs.join(', ')}] slugs not found.`);
	}

	if (existingLandingPagesList.length >= weeksInTheFuture) {
		// En caso que el resultado de la query arroje que existan las próximas N semanas ya cargadas,
		// procedemos a retornar una lista vacía y no hacer agregados
		return [];
	}

	const latestLandingPageConfig = await repository.fetchLatestLandingPageReferences(currentLandingPageSlug);

	if (!latestLandingPageConfig) {
		throw new Error(`Latest landing page for the '${currentLandingPageSlug}' slug content not found`);
	}

	const notLoadedWeeks = slugs.filter((t) => !existingLandingPagesList.find((r) => r.config === t));

	const landingPageObjects: LandingPageCreatePayload[] = notLoadedWeeks.map((weekYear) => ({
		...latestLandingPageConfig,
		config: weekYear,
		slug: {
			_type: 'slug',
			current: slugify(weekYear),
		},
	}));

	return await repository.createLandingPages(landingPageObjects);
}
