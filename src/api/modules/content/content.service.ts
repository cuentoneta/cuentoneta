// Conector de Sanity
import { client } from '../../_helpers/sanity-connector';

// Modelos
import { LandingPageContent, RotatingContent } from '@models/landing-page-content.model';

// Queries
import { landingPageContentQuery, landingPageListQuery, rotatingContentQuery } from '../../_queries/content.query';

// Utils
import { addWeeks, getWeek, getYear } from 'date-fns';
import { mapLandingPageContent, mapStoryNavigationTeaserWithAuthor } from '../../_utils/functions';
import slugify from 'slugify';

export async function fetchLandingPageContent(): Promise<LandingPageContent> {
	const weekOfYear = getWeek(new Date());
	const year = getYear(new Date());

	const slug = `${weekOfYear.toString().padStart(2, '0')}-${year}`;
	const landingPageResult = await client.fetch(landingPageContentQuery, { slug });
	const rotatingContentResult = await client.fetch(rotatingContentQuery);

	if (!landingPageResult || !rotatingContentResult) {
		throw new Error('Landing page content not found');
	}

	return {
		...mapLandingPageContent({ ...landingPageResult, ...rotatingContentResult }),
	};
}

export async function fetchRotatingContent(): Promise<RotatingContent> {
	const result = await client.fetch(rotatingContentQuery);

	if (!result) {
		throw new Error('Rotating content not found');
	}

	return { ...result, mostRead: mapStoryNavigationTeaserWithAuthor(result.mostRead) };
}

// export async function addNextWeeksLandingPageContent(weeksInTheFuture: number = 4): Promise<LandingPageContent[]> {
export async function addNextWeeksLandingPageContent(weeksInTheFuture: number = 4): Promise<any> {
	// Obtiene información para generar slug de la configuración contenido de landing page activo (MM-YYYY)
	const currentDate = new Date();
	const currentWeekOfYear = getWeek(currentDate);
	const year = getYear(currentDate);
	const currentLandingPageSlug = `${currentWeekOfYear.toString().padStart(2, '0')}-${year}`;

	// Obtiene los nombres de los documentos de contenido de la landing page, obteniendo en formato MM-YYYY las próximas 'weeksIntheFuture' semanas
	const slugs = Array.from({ length: weeksInTheFuture }, (_) => '').map((w, index) => {
		const date = addWeeks(currentDate, index + 1); // Se obtiene una semana futura en base a correr la fecha actual una semana
		const weekOfYear = getWeek(date);
		const year = getYear(date);
		return `${weekOfYear.toString().padStart(2, '0')}-${year}`;
	});

	const result = await client.fetch(landingPageListQuery, { slugs });

	if (!result) {
		throw new Error(`Could not retrieve the landing page configs for the [${slugs.join(', ')}] slugs not found.`);
	}

	if (result.length >= weeksInTheFuture) {
		// En caso que el resultado de la query arroje que existan las próximas N semanas ya cargadas,
		// procedemos a retornar una lista vacía y no hacer agregados
		return [];
	}

	const currentLandingPage = await client.fetch(landingPageContentQuery, { slug: currentLandingPageSlug });

	if (!currentLandingPage) {
		throw new Error(`Landing page for the '${currentLandingPageSlug}' slug content not found`);
	}

	const notLoadedWeeks = slugs.filter((t) => !result.find((r) => r.slug === t));

	const createdConfigs = await Promise.all(
		notLoadedWeeks.map((weekYear) => {
			const object = {
				_type: 'landingPage',
				config: weekYear,
				slug: {
					_type: 'slug',
					current: slugify(weekYear),
				},
				campaigns: currentLandingPage.campaigns.map((c) => ({ _key: c._id, _type: 'campaign', _ref: c._id })),
				cards: currentLandingPage.cards.map((c) => ({ _key: c._id, _type: 'storylist', _ref: c._id })),
				latestReads: currentLandingPage.latestReads.map((c) => ({ _key: c._id, _type: 'story', _ref: c._id })),
			};

			return client.create(object);
		}),
	);

	return createdConfigs;
}
