import type { SanityClient } from '@sanity/client';
import { fn } from '@test-utils';
import { stubSanityClient } from '@testing/sanity-client.stub';
import {
	onoffRawHighlightedAuthorsMock,
	onoffRawLandingPageMock,
	onoffRawRotatingContentMock,
	overflowingRawHighlightedAuthors,
	untaggedRawHighlightedAuthor,
} from '@mocks/onoff-raw-landing-page.mock';
import { onoffRawNavTeasersMock } from '@mocks/onoff-raw-stories.mock';
import { mapAuthorTeaser } from '../../_utils/functions';
import { landingPageContentQuery, rotatingContentQuery } from '../../_queries/content.query';
import { MalformedLandingPageError } from './content.errors';
import { SanityContentRepository } from './content.repository.sanity';

const LANDING_SLUG = onoffRawLandingPageMock.slug;

// El slot de obras sale del corpus; el de historias se arma acá con los teasers de navegación del
// canon, porque el documento del corpus ya no declara el campo en baja y este spec necesita las dos
// listas pobladas para poder distinguirlas.
const rawRotatingContent = {
	...onoffRawRotatingContentMock,
	mostRead: onoffRawNavTeasersMock.slice(0, 2),
};

function repoWith(landingPage: unknown, rotatingContent: unknown = rawRotatingContent) {
	const { client, fetch } = stubSanityClient([[rotatingContentQuery, rotatingContent]], landingPage);
	return { repository: new SanityContentRepository(client), fetch };
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
			'cards',
			'collections',
			'config',
			'highlightedAuthors',
			'latestLiteraryWorks',
			'latestReads',
			'mostRead',
			'mostReadLiteraryWorks',
		]);
	});

	it('keeps the identity of the landing page, not of the rotating content', async () => {
		const result = await repoReturning(onoffRawLandingPageMock).fetchLandingPageContent(LANDING_SLUG);

		expect(result?._id).toBe(onoffRawLandingPageMock._id);
		expect(result?._id).not.toBe(rawRotatingContent._id);
	});

	it('preserves the config the query returned', async () => {
		const result = await repoReturning(onoffRawLandingPageMock).fetchLandingPageContent(LANDING_SLUG);

		expect(result?.config).toBe(onoffRawLandingPageMock.config);
	});

	it('maps every campaign the query returned, in order', async () => {
		const expected = onoffRawLandingPageMock.campaigns.map(({ slug }) => slug);

		const result = await repoReturning(onoffRawLandingPageMock).fetchLandingPageContent(LANDING_SLUG);

		expect(expected.length).toBeGreaterThan(0);
		expect(result?.campaigns.map(({ slug }) => slug)).toEqual(expected);
	});

	// Los dos slots salen de documentos distintos: cruzarlos es el defecto que ninguna aserción sobre un
	// solo slot detectaría.
	it('feeds the most read slot from the rotating content, not from the landing page', async () => {
		const result = await repoReturning(onoffRawLandingPageMock).fetchLandingPageContent(LANDING_SLUG);

		expect(result?.mostRead.map(({ slug }) => slug)).toEqual(rawRotatingContent.mostRead.map(({ slug }) => slug));
	});

	// La rotación es un documento aparte y puede faltar sin que la landing deje de servirse: lo que se
	// vacía es el slot, no la página.
	it('serves an empty most read slot when the rotating content is missing', async () => {
		const result = await repoReturning(onoffRawLandingPageMock, null).fetchLandingPageContent(LANDING_SLUG);

		expect(result?.mostRead).toEqual([]);
	});

	it('returns null when the week has no landing page', async () => {
		expect(await repoReturning(null).fetchLandingPageContent(LANDING_SLUG)).toBeNull();
	});

	// El mapeo del teaser de navegación es la única fuente de la lista vacía de etiquetas: el crudo no la
	// trae.
	it('sets tags to [] from the mapper, not from the raw spread', async () => {
		const result = await repoReturning(onoffRawLandingPageMock).fetchLandingPageContent(LANDING_SLUG);

		result?.latestReads.forEach((story) => expect(story.tags).toEqual([]));
	});

	it('maps every collection the query returned, in order', async () => {
		const expected = onoffRawLandingPageMock.collections.map(({ slug }) => slug);

		const result = await repoReturning(onoffRawLandingPageMock).fetchLandingPageContent(LANDING_SLUG);

		expect(expected.length).toBeGreaterThan(0);
		expect(result?.collections.map(({ slug }) => slug)).toEqual(expected);
	});

	// La vista de navegación de obra no declara extracto, y el teaser sí: si alguna vez volviera a
	// mapearse como teaser, el slot cargaría el cuerpo de cada obra destacada sin que nadie lo pinte.
	it('serves the navigation view of each highlighted work, without an excerpt', async () => {
		const result = await repoReturning(onoffRawLandingPageMock).fetchLandingPageContent(LANDING_SLUG);

		const [work] = result?.latestLiteraryWorks ?? [];
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

	it('wraps a malformed collection instead of letting the factory error escape', async () => {
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

	// La proyección devuelve la lista vacía tanto para la obra sin autores como para la que los perdió, y
	// la tarjeta de la home muestra al primero sin preguntar: sin este rechazo, una obra mal curada tumba
	// el render de la página entera en vez de fallar donde se puede corregir.
	it('rejects a highlighted work with no authors', async () => {
		const [work, ...rest] = onoffRawLandingPageMock.latestLiteraryWorks;
		const broken = { ...onoffRawLandingPageMock, latestLiteraryWorks: [{ ...work, authors: [] }, ...rest] };

		await expect(repoReturning(broken).fetchLandingPageContent(LANDING_SLUG)).rejects.toThrow(
			MalformedLandingPageError,
		);
	});

	// El guard existe para nombrar la semana culpable; el error de la obra viaja como causa.
	it('names the week in the error and keeps the offending work as its cause', async () => {
		const [work, ...rest] = onoffRawLandingPageMock.latestLiteraryWorks;
		const broken = { ...onoffRawLandingPageMock, latestLiteraryWorks: [{ ...work, authors: [] }, ...rest] };

		const error = await repoReturning(broken)
			.fetchLandingPageContent(LANDING_SLUG)
			.then(() => undefined)
			.catch((caught: MalformedLandingPageError) => caught);

		expect(error?.message).toContain(LANDING_SLUG);
		expect((error?.cause as Error).message).toContain(work.slug);
	});
});

describe('SanityContentRepository highlighted authors', () => {
	const [canonical] = onoffRawHighlightedAuthorsMock;

	async function highlightedAuthorsOf(highlightedAuthors: typeof onoffRawHighlightedAuthorsMock) {
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

	// El adaptador no recorta: cuántos destacados se muestran lo decide la pantalla, y cuántos se pueden
	// cargar lo hace cumplir el Studio sobre un campo que nació con esa regla.
	it('maps every entry the document carries, without capping the list', async () => {
		const result = await highlightedAuthorsOf(overflowingRawHighlightedAuthors);

		expect(result.map(({ author }) => author._id)).toEqual(
			overflowingRawHighlightedAuthors.map(({ author }) => author._id),
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

describe('SanityContentRepository.fetchLatestLandingPageReferences', () => {
	const raw = {
		_id: 'landing-page-1974-24',
		_type: 'landingPage',
		slug: '1974-24',
		config: '1974-24',
		campaigns: [{ _key: 'campaign-1', _type: 'reference', _ref: 'campaign-1' }],
		cards: [{ _key: 'card-1', _type: 'reference', _ref: 'card-1' }],
		latestReads: [],
		highlightedAuthors: [],
	};

	// La semana nueva es un documento nuevo: si la identidad de la base viajara, el clon la pisaría.
	it('drops the identity of the week it clones', async () => {
		const references = await repoReturning(raw).fetchLatestLandingPageReferences('1974-24');

		expect(references).not.toHaveProperty('_id');
		expect(references).not.toHaveProperty('slug');
		expect(references).not.toHaveProperty('config');
	});

	it('carries every reference list the clone needs', async () => {
		const references = await repoReturning(raw).fetchLatestLandingPageReferences('1974-24');

		expect(references?.campaigns).toEqual(raw.campaigns);
		expect(references?.cards).toEqual(raw.cards);
	});

	it('returns null when there is no earlier week to clone', async () => {
		expect(await repoReturning(null).fetchLatestLandingPageReferences('1974-24')).toBeNull();
	});
});

describe('SanityContentRepository.updateMostReadLiteraryWorks', () => {
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
