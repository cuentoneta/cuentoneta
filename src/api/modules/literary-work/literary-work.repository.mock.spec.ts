import { onoffLiteraryWorksMock } from '@mocks/onoff-literary-works.mock';
import { onoffLiteraryWorkTeasersMock } from '@mocks/onoff-literary-work-teasers.mock';
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
	const [firstTeaser] = onoffLiteraryWorkTeasersMock;
	const [authorOfFirst] = firstTeaser.authors;
	const repository = new InMemoryLiteraryWorkRepository([], onoffLiteraryWorkTeasersMock);

	it('devuelve los teasers de las obras del autor, sin nada que reportar', async () => {
		const { literaryWorks, malformed } = await repository.fetchByAuthorSlug(authorOfFirst.slug);

		expect(literaryWorks.length).toBeGreaterThan(0);
		literaryWorks.forEach(({ authors }) => {
			expect(authors.some(({ slug }) => slug === authorOfFirst.slug)).toBe(true);
		});
		expect(malformed).toEqual([]);
	});

	it('devuelve un listado vacío para un autor sin obras', async () => {
		const { literaryWorks } = await repository.fetchByAuthorSlug('sin-obras');

		expect(literaryWorks).toEqual([]);
	});

	it('devuelve un listado vacío sin teasers cargados', async () => {
		const { literaryWorks } = await new InMemoryLiteraryWorkRepository().fetchByAuthorSlug(authorOfFirst.slug);

		expect(literaryWorks).toEqual([]);
	});
});
