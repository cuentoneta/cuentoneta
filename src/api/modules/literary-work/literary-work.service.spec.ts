import { onoffLiteraryWorksMock } from '@mocks/onoff-literary-works.mock';
import { getLiteraryWorkBySlug, getLiteraryWorksByAuthorSlug } from './literary-work.service';
import { LiteraryWorkNotFoundError } from './literary-work.errors';
import { InMemoryLiteraryWorkRepository } from './literary-work.repository.mock';

describe('getLiteraryWorkBySlug', () => {
	const repository = new InMemoryLiteraryWorkRepository(onoffLiteraryWorksMock);

	it.each(onoffLiteraryWorksMock)('devuelve el agregado de dominio para "$slug"', async (literaryWork) => {
		expect(await getLiteraryWorkBySlug(literaryWork.slug, repository)).toBe(literaryWork);
	});

	it('lanza LiteraryWorkNotFoundError para un slug desconocido', async () => {
		await expect(getLiteraryWorkBySlug('no-existe', repository)).rejects.toThrow(LiteraryWorkNotFoundError);
	});
});

describe('getLiteraryWorksByAuthorSlug', () => {
	const repository = new InMemoryLiteraryWorkRepository(onoffLiteraryWorksMock);

	it('devuelve los teasers de las obras que referencian al autor', async () => {
		const [work] = onoffLiteraryWorksMock;

		const teasers = await getLiteraryWorksByAuthorSlug(work.authors[0].slug, repository);

		expect(teasers.map(({ slug }) => slug)).toEqual(onoffLiteraryWorksMock.map(({ slug }) => slug));
	});

	it('devuelve una lista vacía para un autor sin obras, sin lanzar', async () => {
		expect(await getLiteraryWorksByAuthorSlug('autor-inexistente', repository)).toEqual([]);
	});
});
