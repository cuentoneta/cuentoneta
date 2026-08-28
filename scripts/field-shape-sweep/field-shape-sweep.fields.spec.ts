import { FIELD_SHAPES, WATCHED_FIELDS } from './field-shape-sweep.fields';

describe('WATCHED_FIELDS', () => {
	// La tabla va a mano porque el schema versionado colapsa `datetime` a `string`. Sin este caso, una
	// entrada con un tipo mal escrito llegaría al constructor de queries y fallaría recién en la corrida.
	it('declara una forma conocida en cada entrada', () => {
		const shapes = Object.values(FIELD_SHAPES);

		WATCHED_FIELDS.forEach((field) => expect(shapes).toContain(field.shape));
	});

	it('no repite un campo', () => {
		const labels = WATCHED_FIELDS.map((field) => `${field.documentType}.${field.path}`);

		expect(new Set(labels).size).toBe(labels.length);
	});

	it('vigila la fecha de publicación de los dos tipos que la declaran', () => {
		const labels = WATCHED_FIELDS.map((field) => `${field.documentType}.${field.path}`);

		expect(labels).toEqual(expect.arrayContaining(['literaryWork.publishedAt', 'story.publishedAt']));
	});
});
