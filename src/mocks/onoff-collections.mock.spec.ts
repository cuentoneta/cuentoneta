import {
	geometriasDelDesveloCollectionMock,
	inventarioDeLasPasionesCollectionMock,
	onoffCollectionsMock,
	onoffCollectionTeasersMock,
} from './onoff-collections.mock';

describe('onoff collections mock', () => {
	// Que la factory los construya sin lanzar es la prueba de que el contrato es satisfacible con
	// datos del canon, no solo que compila.
	it('builds every collection through the factory', () => {
		expect(onoffCollectionsMock).toHaveLength(2);
		onoffCollectionsMock.forEach((collection) => {
			expect(Object.isFrozen(collection)).toBe(true);
			expect(collection.count).toBe(collection.literaryWorks.length);
		});
	});

	// Las dos ramas de imagery existen en el corpus: sin una de las dos, el componente que las
	// discrimina quedaría con un camino sin fixture.
	it('covers both branches of imagery', () => {
		expect(geometriasDelDesveloCollectionMock.imagery.kind).toBe('representative');
		expect(inventarioDeLasPasionesCollectionMock.imagery.kind).toBe('sample');
	});

	it('derives the sample images from the works it carries', () => {
		const { imagery, literaryWorks } = inventarioDeLasPasionesCollectionMock;

		expect(imagery.kind === 'sample' && imagery.images).toEqual(literaryWorks.map((work) => work.coverImage));
	});

	// La prosa viene del canon en Markdown y atraviesa el mismo pipeline que el backend.
	it('renders the description as sanitized html', () => {
		onoffCollectionsMock.forEach((collection) => {
			expect(collection.description).toContain('<p>');
			expect(collection.description).not.toContain('_key');
		});
	});

	it('projects teasers that carry no works', () => {
		expect(onoffCollectionTeasersMock).toHaveLength(2);
		onoffCollectionTeasersMock.forEach((teaser, index) => {
			expect(teaser.literaryWorks).toEqual([]);
			expect(teaser.count).toBe(onoffCollectionsMock[index]?.count);
		});
	});
});
