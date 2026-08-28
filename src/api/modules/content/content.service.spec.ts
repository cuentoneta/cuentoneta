import { addWeeks } from 'date-fns';
import { buildWeekSlug } from '@utils/week-slug.utils';
import { clearAllMocks, runOnlyPendingTimers, setSystemTime, useFakeTimers, useRealTimers } from '@test-utils';
import type { LandingPageContent } from '@models/landing-page-content.model';
import { LandingPageNotFoundError, RotatingContentNotFoundError } from './content.errors';
import type { LandingPageReferences } from './content.repository';
import { InMemoryContentRepository, type StoredLandingPage } from './content.repository.mock';
import { addNextWeeksLandingPageContent, getLandingPageContent, getRotatingContent } from './content.service';

// La base a clonar son las referencias de la última semana curada, sin resolver: el generador no lee
// contenido, lo reapunta. No lleva identidad — descartarla es responsabilidad del adaptador, que es
// donde el spec del repository la afirma.
const latestReferences: LandingPageReferences = {
	_type: 'landingPage',
	campaigns: [{ _key: 'campaign-1', _type: 'reference', _ref: 'campaign-1' }],
	collections: [{ _key: 'collection-1', _type: 'reference', _ref: 'collection-1' }],
	latestLiteraryWorks: [{ _key: 'work-1', _type: 'reference', _ref: 'work-1' }],
	highlightedAuthors: [{ _key: 'highlighted-1', _type: 'reference', _ref: 'author-1' }],
};

function emptyLandingPageContent(config: string): LandingPageContent {
	return {
		_id: `landing-page-${config}`,
		config,
		collections: [],
		campaigns: [],
		mostRead: [],
		latestReads: [],
		highlightedAuthors: [],
	};
}

function storedWeeks(slugs: readonly string[]): StoredLandingPage[] {
	return slugs.map((slug) => ({ slug, content: emptyLandingPageContent(slug) }));
}

beforeEach(() => {
	clearAllMocks();
	useFakeTimers();
});

afterEach(() => {
	runOnlyPendingTimers();
	useRealTimers();
});

describe('getLandingPageContent', () => {
	const currentDate = new Date(2025, 10, 14);
	const currentSlug = buildWeekSlug(currentDate);

	beforeEach(() => setSystemTime(currentDate));

	it('serves the landing page of the current ISO week', async () => {
		const repository = new InMemoryContentRepository({ landingPages: storedWeeks([currentSlug]) });

		expect((await getLandingPageContent(repository)).config).toBe(currentSlug);
	});

	// La semana sin curar es un 404 y no un 500: el documento todavía no existe, no está roto.
	it('throws LandingPageNotFoundError when the week has not been curated', async () => {
		await expect(getLandingPageContent(new InMemoryContentRepository())).rejects.toThrow(LandingPageNotFoundError);
	});
});

describe('getRotatingContent', () => {
	it('serves the stored rotating content', async () => {
		const rotatingContent = { _id: 'rotatingContent', name: 'Rotación', mostRead: [] };
		const repository = new InMemoryContentRepository({ rotatingContent });

		expect(await getRotatingContent(repository)).toEqual(rotatingContent);
	});

	it('throws RotatingContentNotFoundError when the singleton is not installed', async () => {
		await expect(getRotatingContent(new InMemoryContentRepository())).rejects.toThrow(RotatingContentNotFoundError);
	});
});

describe('addNextWeeksLandingPageContent', () => {
	const currentDate = new Date(2025, 10, 14);
	const currentSlug = buildWeekSlug(currentDate);

	beforeEach(() => setSystemTime(currentDate));

	function repositoryWith(existingSlugs: readonly string[] = []) {
		return new InMemoryContentRepository({ landingPages: storedWeeks(existingSlugs), latestReferences });
	}

	it('creates one landing page per missing week', async () => {
		const repository = repositoryWith();

		const result = await addNextWeeksLandingPageContent(4, repository);

		expect(result).toHaveLength(4);
		expect(repository.createdLandingPages.map(({ config }) => config)).toEqual([1, 2, 3, 4].map(weekAhead));
	});

	it('labels the week with its ISO week-year, not the calendar year, across the Dec/Jan boundary', async () => {
		// 2025-12-29 (lunes) es la semana ISO 01 de 2026: se etiqueta 2026, no 2025, preservando el orden
		// lexicográfico = cronológico en el cruce dic/ene.
		setSystemTime(new Date(2025, 11, 29));
		const repository = repositoryWith();

		await addNextWeeksLandingPageContent(4, repository);

		expect(repository.createdLandingPages[0].config).toBe('2026-02');
	});

	it('uses ISO-8601 week numbering (Monday-start), not the locale default', async () => {
		// 2026-07-05 es domingo: en ISO (lunes = día 1) pertenece a la semana 27; el default locale de
		// date-fns (domingo = día 1) lo pondría en la 28.
		setSystemTime(new Date(2026, 6, 5));
		const repository = repositoryWith();

		await addNextWeeksLandingPageContent(4, repository);

		expect(repository.createdLandingPages[0].config).toBe('2026-28');
	});

	it('generates contiguous ISO weeks with no gap when the cron runs on a Sunday', async () => {
		// Bajo ISO el domingo es el último día de su semana, así que la home pide esa misma semana ese
		// domingo y la siguiente de lunes a sábado: las dos tienen que quedar cubiertas.
		setSystemTime(new Date(2026, 5, 28)); // domingo, semana ISO 2026-26
		const repository = repositoryWith();

		await addNextWeeksLandingPageContent(4, repository);

		expect(repository.createdLandingPages.map(({ config }) => config)).toEqual([
			'2026-27',
			'2026-28',
			'2026-29',
			'2026-30',
		]);
		expect(repository.createdLandingPages.map(({ config }) => config)).toContain(buildWeekSlug(new Date(2026, 5, 29)));
	});

	it('clones the base verbatim', async () => {
		const repository = repositoryWith();

		await addNextWeeksLandingPageContent(2, repository);

		repository.createdLandingPages.forEach((created) => {
			expect(created.campaigns).toEqual(latestReferences.campaigns);
		});
	});

	// El clonado enumera los campos que copia, así que un campo nuevo que quede afuera no rompe nada:
	// el slot se vaciaría solo cada semana, sin emitir ningún error. Afirmar el conjunto exacto de
	// claves es lo que convierte esa omisión en un rojo, en las dos direcciones: un slot vigente que se
	// caiga y uno retirado que reaparezca fallan igual.
	it('creates each week with exactly the slots the base declares', async () => {
		const repository = repositoryWith();

		await addNextWeeksLandingPageContent(2, repository);

		repository.createdLandingPages.forEach((created) => {
			expect(Object.keys(created).sort()).toEqual([...Object.keys(latestReferences), 'config', 'slug'].sort());
		});
	});

	it('carries the collections, the highlighted works and the highlighted authors over to every cloned week', async () => {
		const repository = repositoryWith();

		await addNextWeeksLandingPageContent(3, repository);

		expect(repository.createdLandingPages).toHaveLength(3);
		repository.createdLandingPages.forEach((created) => {
			expect(created.collections).toEqual(latestReferences?.collections);
			expect(created.latestLiteraryWorks).toEqual(latestReferences?.latestLiteraryWorks);
			expect(created.highlightedAuthors).toEqual(latestReferences?.highlightedAuthors);
		});
	});

	it('names each cloned week by its own slug', async () => {
		const repository = repositoryWith();

		await addNextWeeksLandingPageContent(2, repository);

		expect(repository.createdLandingPages.map(({ slug }) => slug.current)).toEqual([1, 2].map(weekAhead));
	});

	it('creates nothing when every week already exists', async () => {
		const repository = repositoryWith([1, 2, 3, 4].map(weekAhead));

		expect(await addNextWeeksLandingPageContent(4, repository)).toEqual([]);
		expect(repository.createdLandingPages).toEqual([]);
	});

	it('creates only the missing weeks when some already exist', async () => {
		const repository = repositoryWith([1, 2].map(weekAhead));

		const result = await addNextWeeksLandingPageContent(4, repository);

		expect(result).toHaveLength(2);
		expect(repository.createdLandingPages.map(({ config }) => config)).toEqual([3, 4].map(weekAhead));
	});

	it('throws when there is no base week to clone', async () => {
		const repository = new InMemoryContentRepository({ latestReferences: null });

		await expect(addNextWeeksLandingPageContent(4, repository)).rejects.toThrow(
			`Latest landing page for the '${currentSlug}' slug content not found`,
		);
	});

	function weekAhead(weeks: number): string {
		return buildWeekSlug(addWeeks(currentDate, weeks));
	}
});
