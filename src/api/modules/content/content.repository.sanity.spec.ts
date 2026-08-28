import type { SanityClient } from '@sanity/client';
import { fn } from '@test-utils';
import { stubSanityClient } from '@testing/sanity-client.stub';
import {
	onoffRawLandingPageMock,
	onoffRawRotatingContentMock,
	overflowingRawHighlightedAuthors,
	untaggedRawHighlightedAuthor,
} from '@mocks/onoff-raw-landing-page.mock';
import { mapAuthorTeaser } from '../../_utils/functions';
import { landingPageContentQuery, rotatingContentQuery } from '../../_queries/content.query';
import { literaryWorkTeasers } from '../../_queries/literary-work.query';
import { MalformedLandingPageError, MalformedRotatingContentError } from './content.errors';
import { SanityContentRepository } from './content.repository.sanity';

const LANDING_SLUG = onoffRawLandingPageMock.slug;

function repoWith(landingPage: unknown, rotatingContent: unknown = onoffRawRotatingContentMock) {
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

	// La proyección devuelve la lista vacía tanto para la obra sin autores como para la que los perdió,
	// y la tarjeta de la home muestra al primero sin preguntar: sin este rechazo, una obra mal curada
	// tumba el render de la página entera en vez de fallar donde se puede corregir.
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

	// El documento rotativo no es una landing: envolverlo en el error de la landing diría que está mal
	// la semana cuando la semana está bien.
	it('reports a malformed rotating content with its own error', async () => {
		const [work, ...rest] = onoffRawRotatingContentMock.mostReadLiteraryWorks;
		const broken = { ...onoffRawRotatingContentMock, mostReadLiteraryWorks: [{ ...work, authors: [] }, ...rest] };

		await expect(repoReturning(onoffRawLandingPageMock, broken).fetchRotatingContent()).rejects.toThrow(
			MalformedRotatingContentError,
		);
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
		latestReads: [{ _key: 'story-1', _type: 'reference', _ref: 'story-1' }],
		collections: [{ _key: 'collection-1', _type: 'reference', _ref: 'collection-1' }],
		latestLiteraryWorks: [],
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
		expect(references?.collections).toEqual(raw.collections);
	});

	// Los slots retirados siguen en el content lake: las semanas ya cargadas los declaran, y la query
	// dejó de proyectarlos. Que el adaptador enumere qué copia es lo único que impide que vuelvan a
	// propagarse si alguna vez se los volviera a proyectar.
	it('leaves behind the withdrawn slots, even when the stored week still declares them', async () => {
		const references = await repoReturning(raw).fetchLatestLandingPageReferences('1974-24');

		expect(references).not.toHaveProperty('cards');
		expect(references).not.toHaveProperty('latestReads');
	});

	it('returns null when there is no earlier week to clone', async () => {
		expect(await repoReturning(null).fetchLatestLandingPageReferences('1974-24')).toBeNull();
	});
});

describe('SanityContentRepository.updateMostReadLiteraryWorks', () => {
	// El content lake devuelve en orden de documento, así que el doble responde al revés del orden
	// pedido: una implementación que escribiera lo que la query devolvió no podría pasar.
	const storedOutOfOrder = [
		{ _id: 'work-tercera', slug: 'tercera' },
		{ _id: 'work-primera', slug: 'primera' },
	];

	function writerWith(found: unknown) {
		const commit = fn(() => Promise.resolve(undefined));
		const patch = fn(() => ({ commit }));
		const fetch = fn(() => Promise.resolve(found));
		const repository = new SanityContentRepository({ fetch, patch } as unknown as SanityClient);
		return { repository, fetch, patch, commit };
	}

	it('resolves the slugs and writes them in the order it received them', async () => {
		const { repository, patch, commit } = writerWith(storedOutOfOrder);

		await repository.updateMostReadLiteraryWorks(['primera', 'tercera']);

		expect(patch).toHaveBeenCalledWith('rotatingContent', {
			set: {
				mostReadLiteraryWorks: [
					{ _key: 'work-primera', _type: 'reference', _ref: 'work-primera' },
					{ _key: 'work-tercera', _type: 'reference', _ref: 'work-tercera' },
				],
			},
		});
		expect(commit).toHaveBeenCalled();
	});

	it('asks the content lake for the slugs it received', async () => {
		const { repository, fetch } = writerWith(storedOutOfOrder);

		await repository.updateMostReadLiteraryWorks(['primera', 'tercera']);

		expect(fetch).toHaveBeenCalledWith(literaryWorkTeasers, { author: null, slugs: ['primera', 'tercera'] });
	});

	// Una obra que no existe no tiene referencia que escribir: se descarta y las demás se conservan.
	it('drops a slug that does not resolve', async () => {
		const { repository, patch } = writerWith([{ _id: 'work-primera', slug: 'primera' }]);

		await repository.updateMostReadLiteraryWorks(['primera', 'inexistente']);

		expect(patch).toHaveBeenCalledWith('rotatingContent', {
			set: { mostReadLiteraryWorks: [{ _key: 'work-primera', _type: 'reference', _ref: 'work-primera' }] },
		});
	});

	it('does not touch the content lake with an empty batch', async () => {
		const { repository, fetch, patch } = writerWith([]);

		await repository.updateMostReadLiteraryWorks([]);

		expect(fetch).not.toHaveBeenCalled();
		expect(patch).not.toHaveBeenCalled();
	});
});
