import { onoffLiteraryWorksMock } from '@mocks/onoff-literary-works.mock';
import {
	onoffLiteraryWorkNavigationTeasersWithAuthorsMock,
	onoffLiteraryWorkTeasersMock,
} from '@mocks/onoff-literary-work-teasers.mock';
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

describe('InMemoryLiteraryWorkRepository.fetchCatalog', () => {
	const repository = new InMemoryLiteraryWorkRepository([], onoffLiteraryWorkTeasersMock);

	// La proyección del doble tiene que dar la misma vista que el corpus de dominio, que se deriva de
	// las obras completas: si divergiera, los specs de service afirmarían sobre un shape falso.
	it('proyecta la vista de navegación desde los teasers almacenados, sin nada que reportar', async () => {
		const { literaryWorks, malformed } = await repository.fetchCatalog();

		expect(literaryWorks).toEqual(onoffLiteraryWorkNavigationTeasersWithAuthorsMock);
		expect(malformed).toEqual([]);
	});

	it('devuelve un listado vacío sin teasers cargados', async () => {
		const { literaryWorks } = await new InMemoryLiteraryWorkRepository().fetchCatalog();

		expect(literaryWorks).toEqual([]);
	});
});
