import { onoffLiteraryWorksMock } from '@mocks/onoff-literary-works.mock';
import { onoffLiteraryWorkTeasersMock } from '@mocks/onoff-literary-work-teasers.mock';
import { onoffCollectionsMock } from '@mocks/onoff-collections.mock';
import { InMemoryLiteraryWorkRepository } from './literary-work.repository.mock';

describe('InMemoryLiteraryWorkRepository.fetchBySlug', () => {
	const [firstLiteraryWork] = onoffLiteraryWorksMock;
	const repository = new InMemoryLiteraryWorkRepository(onoffLiteraryWorksMock);

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
	const repository = new InMemoryLiteraryWorkRepository([], onoffLiteraryWorkTeasersMock);

	it('devuelve el catálogo entero sin filtro, sin nada que reportar', async () => {
		const { literaryWorks, malformed } = await repository.fetchTeasers({});

		expect(literaryWorks).toHaveLength(onoffLiteraryWorkTeasersMock.length);
		expect(malformed).toEqual([]);
	});

	it('devuelve solo los teasers de las obras del autor filtrado', async () => {
		const { literaryWorks, malformed } = await repository.fetchTeasers({ author: authorOfFirst.slug });

		expect(literaryWorks.length).toBeGreaterThan(0);
		literaryWorks.forEach(({ authors }) => {
			expect(authors.some(({ slug }) => slug === authorOfFirst.slug)).toBe(true);
		});
		expect(malformed).toEqual([]);
	});

	it('devuelve un listado vacío para un autor sin obras', async () => {
		const { literaryWorks } = await repository.fetchTeasers({ author: 'sin-obras' });

		expect(literaryWorks).toEqual([]);
	});

	it('devuelve un listado vacío sin teasers cargados', async () => {
		const { literaryWorks } = await new InMemoryLiteraryWorkRepository().fetchTeasers({ author: authorOfFirst.slug });

		expect(literaryWorks).toEqual([]);
	});
});

describe('InMemoryLiteraryWorkRepository.fetchSuggestions', () => {
	const [firstTeaser] = onoffLiteraryWorkTeasersMock;
	const [authorOfFirst] = firstTeaser.authors;
	const [collection] = onoffCollectionsMock;
	const repository = new InMemoryLiteraryWorkRepository([], onoffLiteraryWorkTeasersMock, onoffCollectionsMock);

	it('devuelve las obras del autor, encabezadas por su nombre', async () => {
		const { title, literaryWorks, malformed } = await repository.fetchSuggestions({ author: authorOfFirst.slug });

		expect(title).toBe(authorOfFirst.name);
		expect(literaryWorks.length).toBeGreaterThan(0);
		literaryWorks.forEach(({ authors }) => {
			expect(authors.some(({ slug }) => slug === authorOfFirst.slug)).toBe(true);
		});
		expect(malformed).toEqual([]);
	});

	// El doble sirve el ámbito de colección con las colecciones cargadas, que es lo que el adaptador de
	// Sanity lee del documento: su título y sus obras.
	it('devuelve las obras de la colección, encabezadas por su título', async () => {
		const { title, literaryWorks } = await repository.fetchSuggestions({ collection: collection.slug });

		expect(title).toBe(collection.title);
		expect(literaryWorks).toEqual(collection.literaryWorks);
	});

	it('devuelve un listado vacío y sin encabezado para un ámbito sin obras', async () => {
		await expect(repository.fetchSuggestions({ author: 'sin-obras' })).resolves.toEqual({
			title: '',
			literaryWorks: [],
			malformed: [],
		});
		await expect(repository.fetchSuggestions({ collection: 'sin-obras' })).resolves.toEqual({
			title: '',
			literaryWorks: [],
			malformed: [],
		});
	});

	it('devuelve un listado vacío sin teasers ni colecciones cargadas', async () => {
		const empty = new InMemoryLiteraryWorkRepository();

		await expect(empty.fetchSuggestions({ author: authorOfFirst.slug })).resolves.toEqual({
			title: '',
			literaryWorks: [],
			malformed: [],
		});
	});
});
