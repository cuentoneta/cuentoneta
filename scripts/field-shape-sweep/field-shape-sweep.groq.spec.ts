import { FIELD_SHAPES, type WatchedField } from './field-shape-sweep.fields';
import { buildShapeCountQueries, buildShapeCountQuery } from './field-shape-sweep.groq';

const dateTimeField: WatchedField = {
	documentType: 'literaryWork',
	path: 'publishedAt',
	shape: FIELD_SHAPES.dateTime,
};

describe('buildShapeCountQuery', () => {
	it('cuenta el valor sin componente horario', () => {
		const { publishedQuery } = buildShapeCountQuery(dateTimeField);

		expect(publishedQuery).toContain('defined(publishedAt) && !(publishedAt match "*T*")');
		expect(publishedQuery).toContain('_type == "literaryWork"');
	});

	// El campo ausente lo cubre el barrido de campos requeridos: contarlo acá duplicaría el hallazgo en
	// dos reportes que se atienden distinto.
	it('no cuenta el documento que no trae el campo', () => {
		expect(buildShapeCountQuery(dateTimeField).publishedQuery).toContain('defined(publishedAt) &&');
	});

	// El borrador se separa por `_id` y no por perspectiva, que caería al publicado cuando no hay borrador.
	it('separa publicados de borradores por el identificador', () => {
		const { publishedQuery, draftsQuery } = buildShapeCountQuery(dateTimeField);

		expect(publishedQuery).toContain('!(_id in path("drafts.**"))');
		expect(draftsQuery).toContain('&& _id in path("drafts.**") &&');
	});

	it('etiqueta el campo por tipo y path', () => {
		expect(buildShapeCountQuery(dateTimeField).label).toBe('literaryWork.publishedAt');
	});

	// El tipo y el path se interpolan en el texto de la query: una entrada mal escrita tiene que fallar
	// acá y con su nombre a la vista, no producir una query que cuente cualquier otra cosa.
	it.each([
		{ ...dateTimeField, documentType: 'literary-work' },
		{ ...dateTimeField, path: 'published At' },
		{ ...dateTimeField, path: 'publishedAt"] || *[' },
	])('rechaza la entrada mal formada %p', (field) => {
		expect(() => buildShapeCountQuery(field)).toThrow('tabla de campos vigilados');
	});

	it('construye una consulta por campo', () => {
		expect(buildShapeCountQueries([dateTimeField, { ...dateTimeField, documentType: 'literaryWork' }])).toHaveLength(2);
	});
});
