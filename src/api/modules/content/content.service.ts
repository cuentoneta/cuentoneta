// Repository
import {
	createLandingPages,
	fetchAndMapLandingPageContent,
	fetchLandingPagesList,
	fetchLatestLandingPageReferences,
	fetchRotatingContent,
} from './content.repository';

// Modelos
import { LandingPageContent, RotatingContent } from '@models/landing-page-content.model';

// Utils
import { addWeeks, getISOWeek, getISOWeekYear } from 'date-fns';
import slugify from 'slugify';

// Formato YYYY-WW con numeración ISO-8601 (lunes = día 1; la semana 1 es la que contiene el primer
// jueves del año). El orden lexicográfico sigue coincidiendo con el cronológico: getISOWeekYear
// etiqueta la semana con su año ISO, no con el calendario, así que el cruce dic/ene no rompe el orden.
function buildWeekSlug(date: Date): string {
	return `${getISOWeekYear(date)}-${getISOWeek(date).toString().padStart(2, '0')}`;
}

export async function getLandingPageContent(): Promise<LandingPageContent> {
	return fetchAndMapLandingPageContent(buildWeekSlug(new Date()));
}

export async function getRotatingContent(): Promise<RotatingContent> {
	return await fetchRotatingContent();
}

export async function addNextWeeksLandingPageContent(weeksInTheFuture: number = 4) {
	const currentDate = new Date();
	const currentLandingPageSlug = buildWeekSlug(currentDate);

	const slugs = Array.from({ length: weeksInTheFuture }, (_, index) => buildWeekSlug(addWeeks(currentDate, index + 1)));

	const existingLandingPagesList = await fetchLandingPagesList(slugs);

	if (!existingLandingPagesList) {
		throw new Error(`Could not retrieve the landing page configs for the [${slugs.join(', ')}] slugs not found.`);
	}

	if (existingLandingPagesList.length >= weeksInTheFuture) {
		// En caso que el resultado de la query arroje que existan las próximas N semanas ya cargadas,
		// procedemos a retornar una lista vacía y no hacer agregados
		return [];
	}

	const latestLandingPageConfig = await fetchLatestLandingPageReferences(currentLandingPageSlug);

	if (!latestLandingPageConfig) {
		throw new Error(`Latest landing page for the '${currentLandingPageSlug}' slug content not found`);
	}

	const notLoadedWeeks = slugs.filter((t) => !existingLandingPagesList.find((r) => r.config === t));

	const landingPageObjects = notLoadedWeeks.map((weekYear) => {
		const config = { ...latestLandingPageConfig };
		delete (config as { _id?: string })._id;
		return {
			...config,
			config: weekYear,
			slug: {
				_type: 'slug',
				current: slugify(weekYear),
			},
		};
	});

	return await createLandingPages(landingPageObjects);
}
