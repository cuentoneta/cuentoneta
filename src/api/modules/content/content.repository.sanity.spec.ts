import type { SanityClient } from '@sanity/client';
import { fn } from '@test-utils';
import {
	onoffRawLandingPageMock,
	onoffRawRotatingContentMock,
	overflowingRawHighlightedAuthors,
	untaggedRawHighlightedAuthor,
} from '@mocks/onoff-raw-landing-page.mock';
import { mapAuthorTeaser } from '../../_utils/functions';
import { landingPageContentQuery, rotatingContentQuery } from '../../_queries/content.query';
import { MalformedLandingPageError } from './content.errors';
import { SanityContentRepository } from './content.repository.sanity';

const LANDING_SLUG = onoffRawLandingPageMock.slug;

// El repository consulta dos queries en la misma llamada, así que el doble del client despacha por la
// query recibida en vez de devolver un canned único: con un solo valor, el contenido rotativo llegaría
// con la forma de la landing y ninguna aserción sobre el resultado lo notaría.
function repoWith(landingPage: unknown, rotatingContent: unknown = onoffRawRotatingContentMock) {
	const fetch = fn((query: unknown) => Promise.resolve(query === rotatingContentQuery ? rotatingContent : landingPage));
	const repository = new SanityContentRepository({ fetch } as unknown as SanityClient);
	return { repository, fetch };
}

function repoReturning(landingPage: unknown, rotatingContent?: unknown): SanityContentRepository {
	return repoWith(landingPage, rotatingContent).repository;
}

describe('SanityContentRepository query selection', () => {
	it('asks for the landing page query, passing the week slug as a parameter', async () => {
		const { repository, fetch } = repoWith(onoffRawLandingPageMock);

		await repository.fetchLandingPageContent(LANDING_SLUG);

		expect(fetch).toHaveBeenCalledWith(landingPageContentQuery, { slug: LANDING_SLUG });
	});

	it('asks for the rotating content query as well, which the landing page does not project', async () => {
		const { repository, fetch } = repoWith(onoffRawLandingPageMock);

		await repository.fetchLandingPageContent(LANDING_SLUG);

		expect(fetch).toHaveBeenCalledWith(rotatingContentQuery);
	});
});

describe('SanityContentRepository.fetchLandingPageContent', () => {
	it('exposes exactly the domain contract, dropping the raw slug', async () => {
		const result = await repoReturning(onoffRawLandingPageMock).fetchLandingPageContent(LANDING_SLUG);

		expect(Object.keys(result ?? {}).sort()).toEqual([
			'_id',
			'campaigns',
			'collections',
			'config',
			'highlightedAuthors',
			'latestReads',
			'mostRead',
		]);
	});

	it('keeps the identity of the landing page, not of the rotating content', async () => {
		const result = await repoReturning(onoffRawLandingPageMock).fetchLandingPageContent(LANDING_SLUG);

		expect(result?._id).toBe(onoffRawLandingPageMock._id);
		expect(result?._id).not.toBe(onoffRawRotatingContentMock._id);
	});

	it('preserves the config the query returned', async () => {
		const result = await repoReturning(onoffRawLandingPageMock).fetchLandingPageContent(LANDING_SLUG);

		expect(result?.config).toBe(onoffRawLandingPageMock.config);
	});

	it('maps every collection the query returned, in order', async () => {
		const expected = onoffRawLandingPageMock.collections.map(({ slug }) => slug);

		const result = await repoReturning(onoffRawLandingPageMock).fetchLandingPageContent(LANDING_SLUG);

		expect(expected.length).toBeGreaterThan(0);
		expect(result?.collections.map(({ slug }) => slug)).toEqual(expected);
	});

	it('maps every campaign the query returned, in order', async () => {
		const expected = onoffRawLandingPageMock.campaigns.map(({ slug }) => slug);

		const result = await repoReturning(onoffRawLandingPageMock).fetchLandingPageContent(LANDING_SLUG);

		expect(expected.length).toBeGreaterThan(0);
		expect(result?.campaigns.map(({ slug }) => slug)).toEqual(expected);
	});

	// Los dos slots salen de documentos distintos: cruzarlos es el defecto que ninguna aserción sobre un
	// solo slot detectaría.
	it('feeds the latest reads from the landing page and the most read from the rotating content', async () => {
		const result = await repoReturning(onoffRawLandingPageMock).fetchLandingPageContent(LANDING_SLUG);

		expect(result?.latestReads.map(({ slug }) => slug)).toEqual(
			onoffRawLandingPageMock.latestLiteraryWorks.map(({ slug }) => slug),
		);
		expect(result?.mostRead.map(({ slug }) => slug)).toEqual(
			onoffRawRotatingContentMock.mostReadLiteraryWorks.map(({ slug }) => slug),
		);
	});

	// La vista de navegación no declara extracto, y el teaser de obra sí: si alguna vez volviera a
	// mapearse como teaser, el slot cargaría el cuerpo de cada obra destacada sin que nadie lo pinte.
	it('serves the navigation view of each highlighted work, without an excerpt', async () => {
		const result = await repoReturning(onoffRawLandingPageMock).fetchLandingPageContent(LANDING_SLUG);

		const [work] = result?.latestReads ?? [];
		expect(work).not.toHaveProperty('excerpt');
		expect(Object.keys(work).sort()).toEqual([
			'_id',
			'authors',
			'coverImage',
			'mediaSources',
			'sectionCount',
			'slug',
			'tags',
			'title',
			'totalReadingTime',
		]);
	});

	it('returns null when the week has no landing page', async () => {
		expect(await repoReturning(null).fetchLandingPageContent(LANDING_SLUG)).toBeNull();
	});

	// La rotación es un documento aparte y puede faltar sin que la landing deje de servirse: lo que se
	// vacía es el slot, no la página.
	it('serves an empty most read slot when the rotating content is missing', async () => {
		const result = await repoReturning(onoffRawLandingPageMock, null).fetchLandingPageContent(LANDING_SLUG);

		expect(result?.mostRead).toEqual([]);
		expect(result?.latestReads.length).toBeGreaterThan(0);
	});

	it('wraps a malformed landing page instead of letting the factory error escape', async () => {
		const [collection, ...rest] = onoffRawLandingPageMock.collections;
		const broken = { ...onoffRawLandingPageMock, collections: [{ ...collection, description: '' }, ...rest] };

		await expect(repoReturning(broken).fetchLandingPageContent(LANDING_SLUG)).rejects.toThrow(
			MalformedLandingPageError,
		);
	});

	// Sin el total no hay nada que mostrar en la tarjeta: es una obra que el backfill todavía no tocó.
	it('rejects a highlighted work with no total reading time', async () => {
		const [work, ...rest] = onoffRawLandingPageMock.latestLiteraryWorks;
		const broken = {
			...onoffRawLandingPageMock,
			latestLiteraryWorks: [{ ...work, totalReadingTime: null }, ...rest],
		};

		await expect(repoReturning(broken).fetchLandingPageContent(LANDING_SLUG)).rejects.toThrow(
			MalformedLandingPageError,
		);
	});
});

describe('SanityContentRepository highlighted authors', () => {
	const [canonical] = onoffRawLandingPageMock.highlightedAuthors;

	async function highlightedAuthorsOf(highlightedAuthors: typeof onoffRawLandingPageMock.highlightedAuthors) {
		const result = await repoReturning({ ...onoffRawLandingPageMock, highlightedAuthors }).fetchLandingPageContent(
			LANDING_SLUG,
		);
		return result?.highlightedAuthors ?? [];
	}

	it('maps every tag the author carries, in order', async () => {
		const expected = canonical.tags.map(({ slug }) => slug);

		expect(expected.length).toBeGreaterThan(0);
		expect((await highlightedAuthorsOf([canonical]))[0].tags.map(({ slug }) => slug)).toEqual(expected);
	});

	it('keeps the first six entries when the document carries more', async () => {
		const result = await highlightedAuthorsOf(overflowingRawHighlightedAuthors);

		expect(overflowingRawHighlightedAuthors.length).toBeGreaterThan(6);
		expect(result.map(({ author }) => author._id)).toEqual(
			overflowingRawHighlightedAuthors.slice(0, 6).map(({ author }) => author._id),
		);
	});

	it('produces an empty tag list for an author with no tags', async () => {
		expect((await highlightedAuthorsOf([untaggedRawHighlightedAuthor]))[0].tags).toEqual([]);
	});

	it('carries the count the query computed', async () => {
		expect((await highlightedAuthorsOf([canonical]))[0].storyCount).toBe(canonical.storyCount);
	});

	// El teaser entrega su lista de etiquetas vacía en toda vista del repositorio, así que las del
	// destacado viajan en el wrapper aunque salgan del mismo autor.
	it('maps the author as a teaser, whose own tag list stays empty', async () => {
		const [result] = await highlightedAuthorsOf([canonical]);

		expect(result.author).toEqual(mapAuthorTeaser(canonical.author));
		expect(result.author.tags).toEqual([]);
	});

	it('returns an empty array when the document has no highlighted authors', async () => {
		expect(await highlightedAuthorsOf([])).toEqual([]);
	});
});

describe('SanityContentRepository.fetchRotatingContent', () => {
	it('maps the rotating content to the navigation view of its works', async () => {
		const result = await repoReturning(onoffRawLandingPageMock).fetchRotatingContent();

		expect(result?.name).toBe(onoffRawRotatingContentMock.name);
		expect(result?.mostRead.map(({ slug }) => slug)).toEqual(
			onoffRawRotatingContentMock.mostReadLiteraryWorks.map(({ slug }) => slug),
		);
	});

	it('returns null when the singleton is not installed', async () => {
		expect(await repoReturning(onoffRawLandingPageMock, null).fetchRotatingContent()).toBeNull();
	});
});

describe('SanityContentRepository.updateMostReadLiteraryWorks', () => {
	// El campo que se parchea es el nuevo: escribir sobre el viejo dejaría al cron alimentando un slot
	// que el lector ya no consulta.
	it('patches the rotating content singleton with the given references', async () => {
		const commit = fn(() => Promise.resolve(undefined));
		const patch = fn(() => ({ commit }));
		const repository = new SanityContentRepository({ patch } as unknown as SanityClient);
		const references = [{ _key: 'work-1', _type: 'reference' as const, _ref: 'work-1' }];

		await repository.updateMostReadLiteraryWorks(references);

		expect(patch).toHaveBeenCalledWith('rotatingContent', { set: { mostReadLiteraryWorks: references } });
		expect(commit).toHaveBeenCalled();
	});
});
