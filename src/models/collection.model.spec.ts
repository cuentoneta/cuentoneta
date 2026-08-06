import { createCollection, type CollectionImagery } from './collection.model';
import { createSanitizedHtml } from './sanitized-html.model';
import { onoffLiteraryWorkTeasersMock } from '@mocks/onoff-literary-work-teasers.mock';
import { onoffTagsMock } from '@mocks/onoff-tags.mock';

const representative: CollectionImagery = { kind: 'representative', image: 'https://cdn/portada.webp' };

function buildOptions(overrides: Partial<Parameters<typeof createCollection>[0]> = {}) {
	return {
		_id: 'collection-1',
		slug: 'la-coleccion',
		title: 'La colección',
		description: createSanitizedHtml('<p>Una colección.</p>'),
		imagery: representative,
		tags: onoffTagsMock.slice(0, 2),
		config: { showAuthors: true },
		mediaSources: [],
		literaryWorks: onoffLiteraryWorkTeasersMock.slice(0, 3),
		...overrides,
	};
}

describe('createCollection', () => {
	it('builds a frozen aggregate with a branded slug', () => {
		const collection = createCollection(buildOptions());

		expect(collection.slug).toBe('la-coleccion');
		expect(collection.title).toBe('La colección');
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
		expect(() => createCollection(buildOptions({ slug: 'La Colección' }))).toThrow(/Slug inválido/);
	});

	it('preserves both branches of imagery untouched', () => {
		const sample: CollectionImagery = {
			kind: 'sample',
			images: ['https://cdn/a.webp', 'https://cdn/b.webp', 'https://cdn/c.webp'],
		};

		expect(createCollection(buildOptions()).imagery).toEqual(representative);
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
