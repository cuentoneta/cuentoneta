import { onoffLiteraryWorksMock } from '@mocks/onoff-literary-works.mock';
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

describe('InMemoryLiteraryWorkRepository.fetchByAuthorSlug', () => {
	const repository = new InMemoryLiteraryWorkRepository(onoffLiteraryWorksMock);

	// El corpus es todo de un mismo autor: la búsqueda por su slug tiene que devolverlo completo, y una
	// obra que no lo referencia —si algún día la hubiera— quedarse afuera.
	it('devuelve los teasers de las obras que referencian al autor', async () => {
		const [work] = onoffLiteraryWorksMock;
		const authorSlug = work.authors[0].slug;

		const teasers = await repository.fetchByAuthorSlug(authorSlug);

		expect(teasers.map(({ slug }) => slug)).toEqual(onoffLiteraryWorksMock.map(({ slug }) => slug));
		for (const [index, teaser] of teasers.entries()) {
			expect(teaser.totalReadingTime).toBe(onoffLiteraryWorksMock[index].totalReadingTime);
			// La vista angosta lo que transporta: sin biografía del autor y con extracto en lugar de
			// secciones.
			expect(teaser.authors[0]).not.toHaveProperty('biography');
			expect(teaser.excerpt.bodyHtml.length).toBeGreaterThan(0);
		}
	});

	it('devuelve una lista vacía para un autor sin obras cargadas', async () => {
		expect(await repository.fetchByAuthorSlug('autor-inexistente')).toEqual([]);
	});
});
