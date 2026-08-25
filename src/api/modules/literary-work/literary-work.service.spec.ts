import { restoreAllMocks, spyOn } from '@test-utils';
import { onoffLiteraryWorksMock } from '@mocks/onoff-literary-works.mock';
import { onoffLiteraryWorkTeasersMock } from '@mocks/onoff-literary-work-teasers.mock';
import { getLiteraryWorkBySlug, getLiteraryWorksByAuthorSlug } from './literary-work.service';
import { LiteraryWorkNotFoundError, MalformedLiteraryWorkError } from './literary-work.errors';
import { InMemoryLiteraryWorkRepository } from './literary-work.repository.mock';
import type { LiteraryWorkRepository, LiteraryWorkTeaserListing } from './literary-work.repository';

describe('getLiteraryWorkBySlug', () => {
	const repository = new InMemoryLiteraryWorkRepository(onoffLiteraryWorksMock);

	it.each(onoffLiteraryWorksMock)('devuelve el agregado de dominio para "$slug"', async (literaryWork) => {
		expect(await getLiteraryWorkBySlug(literaryWork.slug, repository)).toBe(literaryWork);
	});

	it('lanza LiteraryWorkNotFoundError para un slug desconocido', async () => {
		await expect(getLiteraryWorkBySlug('no-existe', repository)).rejects.toThrow(LiteraryWorkNotFoundError);
	});
});

// Devuelve un listado canned con `malformed` poblado: el doble en memoria traduce de verdad y nunca
// produce esa rama, así que la política de descarte solo se puede ejercitar con un stub.
class StubLiteraryWorkRepository implements LiteraryWorkRepository {
	constructor(private readonly listing: LiteraryWorkTeaserListing) {}

	public async fetchBySlug(): Promise<never> {
		throw new Error('No participa de estos casos.');
	}

	public async fetchByAuthorSlug(): Promise<LiteraryWorkTeaserListing> {
		return this.listing;
	}
}

describe('getLiteraryWorksByAuthorSlug', () => {
	const [firstTeaser] = onoffLiteraryWorkTeasersMock;
	const [author] = firstTeaser.authors;
	const repository = new InMemoryLiteraryWorkRepository([], onoffLiteraryWorkTeasersMock);

	afterEach(() => restoreAllMocks());

	it('devuelve los teasers de las obras del autor', async () => {
		const literaryWorks = await getLiteraryWorksByAuthorSlug(author.slug, repository);

		expect(literaryWorks.length).toBeGreaterThan(0);
		literaryWorks.forEach(({ authors }) => {
			expect(authors.some(({ slug }) => slug === author.slug)).toBe(true);
		});
	});

	it('devuelve un listado vacío para un autor sin obras, sin convertirlo en error', async () => {
		expect(await getLiteraryWorksByAuthorSlug('sin-obras', repository)).toEqual([]);
	});

	// El caso que impide "simplificar" la tolerancia sin ver lo que saca: una obra que el CMS dejó
	// inconsistente no debe llevarse puestas a las demás en un bloque accesorio.
	it('devuelve las obras sanas y registra la descartada', async () => {
		const warn = spyOn(console, 'warn').mockImplementation(() => undefined);
		const malformed = new MalformedLiteraryWorkError('una-obra-rota', { cause: new Error('sin extracto') });
		const stub = new StubLiteraryWorkRepository({ literaryWorks: [firstTeaser], malformed: [malformed] });

		const literaryWorks = await getLiteraryWorksByAuthorSlug(author.slug, stub);

		expect(literaryWorks).toEqual([firstTeaser]);
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('una-obra-rota'), malformed.cause);
	});

	// La política es por obra y no cambia con la cantidad: distinguir "todas rotas" de "algunas rotas"
	// introduciría un umbral que nadie puede nombrar, y el bloque ya sabe no dibujarse ante lista vacía.
	it('devuelve un listado vacío cuando todas las obras están mal curadas', async () => {
		spyOn(console, 'warn').mockImplementation(() => undefined);
		const stub = new StubLiteraryWorkRepository({
			literaryWorks: [],
			malformed: [new MalformedLiteraryWorkError('una'), new MalformedLiteraryWorkError('otra')],
		});

		expect(await getLiteraryWorksByAuthorSlug(author.slug, stub)).toEqual([]);
	});
});
