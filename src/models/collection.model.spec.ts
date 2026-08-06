import { createCollection, createCollectionTeaser, type CollectionImagery } from './collection.model';
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

		expect(collection.slug).toBe(buildOptions().slug);
		expect(collection.title).toBe(buildOptions().title);
		expect(Object.isFrozen(collection)).toBe(true);
	});

	// Derivarlo descarta que discrepe del número real de obras que el agregado transporta.
	it('derives count from the works it carries', () => {
		expect(createCollection(buildOptions()).count).toBe(canon.literaryWorks.length);
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

	// Se afirma el discriminante y su payload contra valores independientes del objeto pasado: si la
	// factory normalizara, reordenara o colapsara la unión, comparar contra la misma referencia no lo
	// detectaría.
	it('preserves both branches of imagery untouched', () => {
		// Las tres primeras, no todas: con una cuarta obra en el canon el abanico no crecería y la
		// comparación fallaría sin que nada estuviera mal.
		const covers = canon.literaryWorks.slice(0, 3).map((work) => work.coverImage);
		const sample: CollectionImagery = { kind: 'sample', images: [covers[0] ?? '', covers[1] ?? '', covers[2] ?? ''] };

		const representative = createCollection(buildOptions()).imagery;
		expect(representative.kind).toBe('representative');
		expect(representative.kind === 'representative' && representative.image).toBe(
			'assets/img/mocks/collections/geometrias-del-desvelo.png',
		);

		const sampled = createCollection(buildOptions({ imagery: sample })).imagery;
		expect(sampled.kind).toBe('sample');
		expect(sampled.kind === 'sample' && sampled.images).toEqual(covers);
	});

	// El abanico llega desde GROQ, donde nada garantiza el largo que la tupla promete en compilación.
	it('rejects a sample of imagery without three covers', () => {
		const twoCovers = { kind: 'sample', images: ['a.png', 'b.png'] } as unknown as CollectionImagery;

		expect(() => createCollection(buildOptions({ imagery: twoCovers }))).toThrow(/abanico de portadas/);
	});

	// Normalizar el opcional del schema es trabajo del mapper, no de la factory.
	it('preserves showAuthors as received', () => {
		expect(createCollection(buildOptions()).config.showAuthors).toBe(true);
		expect(createCollection(buildOptions({ config: { showAuthors: false } })).config.showAuthors).toBe(false);
	});

	// Se afirma el contenido, no la identidad: que la factory copie o no los arrays es una decisión
	// libre, y fijarla con `toBe` rompería el test ante un cambio deseable.
	it('passes through tags, media sources and description', () => {
		const options = buildOptions();
		const collection = createCollection(options);

		expect(collection.tags).toEqual(options.tags);
		expect(collection.mediaSources).toEqual(options.mediaSources);
		expect(collection.description).toEqual(options.description);
	});
});

describe('createCollectionTeaser', () => {
	function buildTeaserOptions(overrides: Partial<Parameters<typeof createCollectionTeaser>[0]> = {}) {
		const { literaryWorks, ...shared } = buildOptions();
		return { ...shared, count: literaryWorks.length, ...overrides };
	}

	it('builds a frozen teaser with a branded slug', () => {
		const teaser = createCollectionTeaser(buildTeaserOptions());

		expect(teaser.slug).toBe(canon.slug);
		expect(teaser.count).toBe(canon.literaryWorks.length);
		expect(Object.isFrozen(teaser)).toBe(true);
	});

	// Lo que distingue al teaser del agregado: muestra la colección sin transportar sus obras.
	it('carries no literary works', () => {
		expect(createCollectionTeaser(buildTeaserOptions()).literaryWorks).toEqual([]);
	});

	// Es la invariante "al menos una obra" expresada sobre lo único que el teaser sí transporta.
	it('rejects a teaser without works', () => {
		expect(() => createCollectionTeaser(buildTeaserOptions({ count: 0 }))).toThrow(/sin obras literarias/);
	});

	it('rejects a teaser without a title', () => {
		expect(() => createCollectionTeaser(buildTeaserOptions({ title: '   ' }))).toThrow(/título vacío/);
	});

	it('rejects a sample of imagery without three covers', () => {
		const twoCovers = { kind: 'sample', images: ['a.png', 'b.png'] } as unknown as CollectionImagery;

		expect(() => createCollectionTeaser(buildTeaserOptions({ imagery: twoCovers }))).toThrow(/abanico de portadas/);
	});

	it('delegates slug validation to the value object', () => {
		expect(() => createCollectionTeaser(buildTeaserOptions({ slug: 'Geometrías Del Desvelo' }))).toThrow(
			/Slug inválido/,
		);
	});
});
