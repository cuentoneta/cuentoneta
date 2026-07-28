import type { Tag } from '@models/tag.model';

// Arma el bloque de Portable Text de `description` a partir del texto corto, que es lo único que varía entre
// los tags del corpus.
function createTag(title: string, slug: string, shortDescription: string): Tag {
	return {
		title,
		slug,
		shortDescription,
		description: [
			{
				_type: 'block',
				style: 'normal',
				_key: `${slug}-desc`,
				markDefs: [],
				children: [{ _type: 'span', _key: `${slug}-desc-s`, text: shortDescription, marks: [] }],
			},
		],
	};
}

// Tipo literario de la obra. Va primero en `tags` de cada Story: los componentes que muestran un único tag
// —el hero de la página de story, entre otros— toman `tags[0]` y lo presentan como etiqueta principal.
export const cuentoTagMock = createTag('Cuento', 'cuento', 'Relato breve de ficción.');
export const novelaTagMock = createTag('Novela', 'novela', 'Narrativa extensa de ficción.');
export const ensayoTagMock = createTag('Ensayo', 'ensayo', 'Prosa reflexiva que argumenta en torno a un tema.');
export const teatroTagMock = createTag('Teatro', 'teatro', 'Obra escrita para ser representada en escena.');

// Género de la obra. Acompañan al tipo literario como tags adicionales.
export const dramaPsicologicoTagMock = createTag(
	'Drama psicológico',
	'drama-psicologico',
	'Conflicto centrado en la vida interior de los personajes.',
);
export const metaficcionTagMock = createTag(
	'Metaficción',
	'metaficcion',
	'Obras que se vuelven sobre su propia escritura y la exhiben como tema.',
);
export const absurdoTagMock = createTag(
	'Absurdo',
	'absurdo',
	'Rutinas y gestos cotidianos llevados hasta perder todo sentido.',
);
export const surrealismoTagMock = createTag(
	'Surrealismo',
	'surrealismo',
	'Imágenes oníricas que desbordan la lógica cotidiana.',
);
export const alegoriaTagMock = createTag('Alegoría', 'alegoria', 'Relato cuyo sentido literal remite a otro figurado.');
export const filosoficoTagMock = createTag(
	'Filosófico',
	'filosofico',
	'Ficción organizada en torno a una pregunta o una idea abstracta.',
);
export const experimentalTagMock = createTag(
	'Experimental',
	'experimental',
	'Obras que anteponen el procedimiento formal a la trama.',
);
export const tragediaTagMock = createTag('Tragedia', 'tragedia', 'Pieza dramática de desenlace adverso.');
export const dramaHistoricoTagMock = createTag(
	'Drama histórico',
	'drama-historico',
	'Ficción dramática ambientada en hechos o figuras del pasado.',
);
