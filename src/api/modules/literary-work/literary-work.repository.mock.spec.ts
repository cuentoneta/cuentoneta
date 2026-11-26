import { onoffLiteraryWorksMock } from '@mocks/onoff-literary-works.mock';
import { onoffLiteraryWorkTeasersMock } from '@mocks/onoff-literary-work-teasers.mock';
import { onoffLiteraryWorkCatalogEntriesMock } from '@mocks/onoff-literary-work-catalog-entries.mock';
import { InMemoryLiteraryWorkRepository } from './literary-work.repository.mock';

describe('InMemoryLiteraryWorkRepository.fetchBySlug', () => {
	const [firstLiteraryWork] = onoffLiteraryWorksMock;
	const repository = new InMemoryLiteraryWorkRepository({ literaryWorks: onoffLiteraryWorksMock });

	it.each(onoffLiteraryWorksMock)('devuelve el agregado de dominio almacenado para "$slug"', async (literaryWork) => {
		expect(await repository.fetchBySlug(literaryWork.slug)).toBe(literaryWork);
	});

	it('devuelve null para un slug desconocido', async () => {
		expect(await repository.fetchBySlug('no-existe')).toBeNull();
	});

	it('devuelve null cuando no hay obras cargadas', async () => {
		expect(await new InMemoryLiteraryWorkRepository().fetchBySlug(firstLiteraryWork.slug)).toBeNull();
	});
});

describe('InMemoryLiteraryWorkRepository.fetchTeasers', () => {
	const [firstTeaser] = onoffLiteraryWorkTeasersMock;
	const [authorOfFirst] = firstTeaser.authors;
	const repository = new InMemoryLiteraryWorkRepository({ teasers: onoffLiteraryWorkTeasersMock });

	it('devuelve el catálogo entero sin filtro, sin nada que reportar', async () => {
		const { teasers, malformed } = await repository.fetchTeasers({});

		expect(teasers).toHaveLength(onoffLiteraryWorkTeasersMock.length);
		expect(malformed).toEqual([]);
	});

	it('devuelve solo los teasers de las obras del autor filtrado', async () => {
		const { teasers, malformed } = await repository.fetchTeasers({ author: authorOfFirst.slug });

		expect(teasers.length).toBeGreaterThan(0);
		teasers.forEach(({ authors }) => {
			expect(authors.some(({ slug }) => slug === authorOfFirst.slug)).toBe(true);
		});
		expect(malformed).toEqual([]);
	});

	it('devuelve un listado vacío para un autor sin obras', async () => {
		const { teasers } = await repository.fetchTeasers({ author: 'sin-obras' });

		expect(teasers).toEqual([]);
	});

	it('devuelve un listado vacío sin teasers cargados', async () => {
		const { teasers } = await new InMemoryLiteraryWorkRepository().fetchTeasers({ author: authorOfFirst.slug });

		expect(teasers).toEqual([]);
	});
});

describe('InMemoryLiteraryWorkRepository.fetchCatalogEntries', () => {
	it('devuelve las entradas ordenadas por slug aunque se almacenen en otro orden, sin nada que reportar', async () => {
		const repository = new InMemoryLiteraryWorkRepository({
			catalogEntries: [...onoffLiteraryWorkCatalogEntriesMock].reverse(),
		});

		const { catalogEntries, malformed } = await repository.fetchCatalogEntries();

		expect(catalogEntries).toEqual(onoffLiteraryWorkCatalogEntriesMock);
		expect(malformed).toEqual([]);
	});

	// La entrada no transporta `_id`, así que el desempate de la query no es reproducible: el doble
	// conserva el orden de almacenamiento entre slugs iguales.
	it('conserva el orden de almacenamiento entre entradas de mismo slug', async () => {
		const [first] = onoffLiteraryWorkCatalogEntriesMock;
		const copy = { ...first, title: `${first.title} (copia)` };
		const repository = new InMemoryLiteraryWorkRepository({ catalogEntries: [copy, first] });

		const { catalogEntries } = await repository.fetchCatalogEntries();

		expect(catalogEntries).toEqual([copy, first]);
	});

	it('devuelve un listado vacío sin entradas cargadas', async () => {
		expect(await new InMemoryLiteraryWorkRepository().fetchCatalogEntries()).toEqual({
			catalogEntries: [],
			malformed: [],
		});
	});
});
