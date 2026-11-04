import { onoffLiteraryWorksMock } from '@mocks/onoff-literary-works.mock';
import { onoffLiteraryWorkTeasersMock } from '@mocks/onoff-literary-work-teasers.mock';
import { onoffCollectionsMock } from '@mocks/onoff-collections.mock';
import type { LiteraryWorkSuggestionCandidate } from './literary-work.repository';
import { InMemoryLiteraryWorkRepository } from './literary-work.repository.mock';

const selectAll = (candidates: readonly LiteraryWorkSuggestionCandidate[]): readonly string[] =>
	candidates.map(({ slug }) => slug);

describe('InMemoryLiteraryWorkRepository.fetchBySlug', () => {
	const [firstLiteraryWork] = onoffLiteraryWorksMock;
	const repository = new InMemoryLiteraryWorkRepository(onoffLiteraryWorksMock, [], []);

	it.each(onoffLiteraryWorksMock)('devuelve el agregado de dominio almacenado para "$slug"', async (literaryWork) => {
		expect(await repository.fetchBySlug(literaryWork.slug)).toBe(literaryWork);
	});

	it('devuelve null para un slug desconocido', async () => {
		expect(await repository.fetchBySlug('no-existe')).toBeNull();
	});

	it('devuelve null cuando no hay obras cargadas', async () => {
		expect(await new InMemoryLiteraryWorkRepository([], [], []).fetchBySlug(firstLiteraryWork.slug)).toBeNull();
	});
});

describe('InMemoryLiteraryWorkRepository.fetchTeasers', () => {
	const [firstTeaser] = onoffLiteraryWorkTeasersMock;
	const [authorOfFirst] = firstTeaser.authors;
	const repository = new InMemoryLiteraryWorkRepository([], onoffLiteraryWorkTeasersMock, []);

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
		const { literaryWorks } = await new InMemoryLiteraryWorkRepository([], [], []).fetchTeasers({
			author: authorOfFirst.slug,
		});

		expect(literaryWorks).toEqual([]);
	});
});

describe('InMemoryLiteraryWorkRepository.fetchSuggestions', () => {
	const [firstTeaser] = onoffLiteraryWorkTeasersMock;
	const [authorOfFirst] = firstTeaser.authors;
	const [collection] = onoffCollectionsMock;
	const repository = new InMemoryLiteraryWorkRepository([], onoffLiteraryWorkTeasersMock, onoffCollectionsMock);

	it('devuelve las obras del autor, encabezadas por su nombre', async () => {
		const { title, literaryWorks, malformed } = await repository.fetchSuggestions(
			{ author: authorOfFirst.slug },
			selectAll,
			onoffLiteraryWorkTeasersMock.length,
		);

		expect(title).toBe(authorOfFirst.name);
		expect(literaryWorks).toHaveLength(
			onoffLiteraryWorkTeasersMock.filter(({ authors }) => authors.some(({ slug }) => slug === authorOfFirst.slug))
				.length,
		);
		expect(malformed).toEqual([]);
	});

	it('devuelve las obras de la colección, encabezadas por su título', async () => {
		const { title, literaryWorks } = await repository.fetchSuggestions(
			{ collection: collection.slug },
			selectAll,
			collection.literaryWorks.length,
		);

		expect(title).toBe(collection.title);
		expect(literaryWorks).toEqual(collection.literaryWorks);
	});

	it('devuelve un listado vacío y sin encabezado para un ámbito desconocido', async () => {
		await expect(repository.fetchSuggestions({ author: 'sin-obras' }, selectAll, 3)).resolves.toEqual({
			title: '',
			literaryWorks: [],
			malformed: [],
		});
		await expect(repository.fetchSuggestions({ collection: 'sin-obras' }, selectAll, 3)).resolves.toEqual({
			title: '',
			literaryWorks: [],
			malformed: [],
		});
	});
});
