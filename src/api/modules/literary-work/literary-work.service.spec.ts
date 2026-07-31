import { onoffLiteraryWorksMock } from '@mocks/onoff-literary-works.mock';
import { getLiteraryWorkBySlug } from './literary-work.service';
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
