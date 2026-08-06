import { createCollection, type CollectionImagery } from './collection.model';
import { geometriasDelDesveloCollectionMock } from '@mocks/onoff-collections.mock';
import { onoffLiteraryWorkTeasersMock } from '@mocks/onoff-literary-work-teasers.mock';

// "Geometrías del desvelo" del canon de Onoff: la colección con portada editorial propia. Se
// descompone en las opciones que la construyeron, en vez de inventar una colección de prueba.
const canon = geometriasDelDesveloCollectionMock;

function buildOptions(overrides: Partial<Parameters<typeof createCollection>[0]> = {}) {
	return {
		_id: canon._id,
		slug: canon.slug,
		title: canon.title,
		description: canon.description,
		imagery: canon.imagery,
		tags: canon.tags,
		config: canon.config,
		mediaSources: canon.mediaSources,
		literaryWorks: canon.literaryWorks,
		...overrides,
	};
}

describe('createCollection', () => {
	it('builds a frozen aggregate with a branded slug', () => {
		const collection = createCollection(buildOptions());

		expect(collection.slug).toBe('geometrias-del-desvelo');
		expect(collection.title).toBe('Geometrías del desvelo');
		expect(Object.isFrozen(collection)).toBe(true);
	});

	// Derivarlo es lo que vuelve imposible que discrepe del número real de obras.
	it('derives count from the works it carries', () => {
		expect(createCollection(buildOptions()).count).toBe(3);
		expect(createCollection(buildOptions({ literaryWorks: onoffLiteraryWorkTeasersMock.slice(0, 1) })).count).toBe(1);
	});

	it('rejects a collection without a title', () => {
		expect(() => createCollection(buildOptions({ title: '' }))).toThrow(/título vacío/);
		expect(() => createCollection(buildOptions({ title: '   ' }))).toThrow(/título vacío/);
	});

	// Una colección vacía no es un estado válido: es un dato incompleto que fallaría al renderizarse.
	it('rejects a collection without literary works', () => {
		expect(() => createCollection(buildOptions({ literaryWorks: [] }))).toThrow(/sin obras literarias/);
	});

	// El formato del slug lo valida el value object, no la factory.
	it('delegates slug validation to the value object', () => {
		expect(() => createCollection(buildOptions({ slug: 'Geometrías Del Desvelo' }))).toThrow(/Slug inválido/);
	});

	it('preserves both branches of imagery untouched', () => {
		const [first, second, third] = canon.literaryWorks.map((work) => work.coverImage);
		const sample: CollectionImagery = { kind: 'sample', images: [first ?? '', second ?? '', third ?? ''] };

		expect(createCollection(buildOptions()).imagery).toEqual(canon.imagery);
		expect(createCollection(buildOptions({ imagery: sample })).imagery).toEqual(sample);
	});

	// Normalizar el opcional del schema es trabajo del mapper, no de la factory.
	it('preserves showAuthors as received', () => {
		expect(createCollection(buildOptions()).config.showAuthors).toBe(true);
		expect(createCollection(buildOptions({ config: { showAuthors: false } })).config.showAuthors).toBe(false);
	});

	it('passes through tags, media sources and description without copying', () => {
		const options = buildOptions();
		const collection = createCollection(options);

		expect(collection.tags).toBe(options.tags);
		expect(collection.mediaSources).toBe(options.mediaSources);
		expect(collection.description).toBe(options.description);
	});
});
