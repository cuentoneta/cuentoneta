// Repository
import * as contentRepository from './content.repository';

// Modelos
import { LandingPageContent, RotatingContent } from '@models/landing-page-content.model';

// Utils
import { addWeeks, getWeek, getYear } from 'date-fns';
import { mapLandingPageContent, mapStoryNavigationTeaserWithAuthor } from '../../_utils/functions';
import slugify from 'slugify';
import { landingPageContentReferences } from './content.repository';

export async function fetchLandingPageContent(): Promise<LandingPageContent> {
	const weekOfYear = getWeek(new Date());
	const year = getYear(new Date());

	const slug = `${weekOfYear.toString().padStart(2, '0')}-${year}`;
	const landingPageResult = await contentRepository.fetchLandingPageContent(slug);
	const rotatingContentResult = await contentRepository.fetchRotatingContent();

	if (!landingPageResult || !rotatingContentResult) {
		throw new Error('Landing page content not found');
	}

	return {
		...mapLandingPageContent({ ...landingPageResult, ...rotatingContentResult }),
	};
}

export async function fetchRotatingContent(): Promise<RotatingContent> {
	const result = await contentRepository.fetchRotatingContent();

	if (!result) {
		throw new Error('Rotating content not found');
	}

	return { ...result, mostRead: mapStoryNavigationTeaserWithAuthor(result.mostRead) };
}

export async function addNextWeeksLandingPageContent(weeksInTheFuture: number = 4) {
	// Obtiene información para generar slug de la configuración contenido de landing page activo (MM-YYYY)
	const currentDate = new Date();
	const currentWeekOfYear = getWeek(currentDate);
	const year = getYear(currentDate);
	const currentLandingPageSlug = `${currentWeekOfYear.toString().padStart(2, '0')}-${year}`;

	// Obtiene los nombres de los documentos de contenido de la landing page, obteniendo en formato MM-YYYY las próximas 'weeksIntheFuture' semanas
	const slugs = Array.from({ length: weeksInTheFuture }, () => '').map((_, index) => {
		const date = addWeeks(currentDate, index + 1); // Se obtiene una semana futura en base a correr la fecha actual una semana
		const weekOfYear = getWeek(date);
		const year = getYear(date);
		return `${weekOfYear.toString().padStart(2, '0')}-${year}`;
	});

	const result = await contentRepository.fetchLandingPageList(slugs);

	if (!result) {
		throw new Error(`Could not retrieve the landing page configs for the [${slugs.join(', ')}] slugs not found.`);
	}

	if (result.length >= weeksInTheFuture) {
		// En caso que el resultado de la query arroje que existan las próximas N semanas ya cargadas,
		// procedemos a retornar una lista vacía y no hacer agregados
		return [];
	}

	const currentLandingPage = await contentRepository.landingPageContentReferences(currentLandingPageSlug);

	if (!currentLandingPage) {
		throw new Error(`Landing page for the '${currentLandingPageSlug}' slug content not found`);
	}

	const notLoadedWeeks = slugs.filter((t) => !result.find((r) => r.config === t));

	const landingPageObjects = notLoadedWeeks.map((weekYear) => ({
		...currentLandingPage,
		config: weekYear,
		slug: {
			_type: 'slug',
			current: slugify(weekYear),
		},
	}));

	return await contentRepository.createLandingPages(landingPageObjects);
}
