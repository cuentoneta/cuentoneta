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

describe('InMemoryLiteraryWorkRepository.fetchIdsBySlugs', () => {
	const [firstLiteraryWork] = onoffLiteraryWorksMock;
	const repository = new InMemoryLiteraryWorkRepository(onoffLiteraryWorksMock);

	it('devuelve el identificador de cada obra conocida', async () => {
		const slugs = onoffLiteraryWorksMock.map(({ slug }) => slug);

		expect(await repository.fetchIdsBySlugs(slugs)).toEqual(
			onoffLiteraryWorksMock.map(({ _id, slug }) => ({ _id, slug })),
		);
	});

	// Un slug que no resuelve simplemente no vuelve: no hay obra a la que referenciar.
	it('descarta los slugs desconocidos en vez de devolverlos sin identificador', async () => {
		const identities = await repository.fetchIdsBySlugs([firstLiteraryWork.slug, 'no-existe']);

		expect(identities).toEqual([{ _id: firstLiteraryWork._id, slug: firstLiteraryWork.slug }]);
	});

	it('devuelve un listado vacío sin obras cargadas', async () => {
		expect(await new InMemoryLiteraryWorkRepository().fetchIdsBySlugs([firstLiteraryWork.slug])).toEqual([]);
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
