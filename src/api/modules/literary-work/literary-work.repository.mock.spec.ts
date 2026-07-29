import { onoffLiteraryWorksMock } from '@mocks/onoff-literary-works.mock';
import { InMemoryLiteraryWorkRepository } from './literary-work.repository.mock';

describe('InMemoryLiteraryWorkRepository.fetchBySlug', () => {
	const [work] = onoffLiteraryWorksMock;
	const repository = new InMemoryLiteraryWorkRepository(onoffLiteraryWorksMock);

	it('devuelve el agregado de dominio almacenado para un slug existente', async () => {
		expect(await repository.fetchBySlug(work.slug)).toBe(work);
	});

	it('devuelve null para un slug desconocido', async () => {
		expect(await repository.fetchBySlug('no-existe')).toBeNull();
	});

	it('devuelve null cuando no hay obras cargadas', async () => {
		expect(await new InMemoryLiteraryWorkRepository().fetchBySlug(work.slug)).toBeNull();
	});
});
