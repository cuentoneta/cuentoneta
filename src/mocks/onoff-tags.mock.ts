import type { Tag } from '@models/tag.model';
import type { TextBlockContent } from '@models/block-content.model';
import type { LiteraryWorkBySlugQueryResult } from '@sanity-types';

// Vista cruda del tag, tal como la proyectan las queries que lo dereferencian.
export type RawTag = NonNullable<LiteraryWorkBySlugQueryResult>['tags'][number];

// El documento `tag` no acompañó la migración de LiteraryWork a Markdown: su `description` sigue
// siendo blockContent, así que el fixture crudo la escribe como Portable Text. Es lo único que varía
// entre los tags del corpus, y se deriva del texto corto.
function createRawTag(title: string, slug: string, shortDescription: string): RawTag {
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
		icon: { _type: 'iconPicker', provider: '', name: '' },
	};
}

// Espeja `mapTags` del ACL: la descripción se acota a sus bloques de texto y el icono se normaliza.
// No se importa el mapper real porque arrastra el conector de Sanity a todo spec que toque el corpus.
function toDomainTag(raw: RawTag): Tag {
	return {
		title: raw.title,
		slug: raw.slug,
		shortDescription: raw.shortDescription,
		// El cast lo hace también `mapBlockContentToTextParagraphs`: el tipo generado declara `children`
		// opcional y el bloque de dominio lo exige, y filtrar por `_type` no lo estrecha.
		description: raw.description.filter((block) => block._type === 'block') as TextBlockContent[],
		icon: { provider: raw.icon.provider ?? '', name: raw.icon.name ?? '' },
	};
}

// Cada tag nace crudo y su vista de dominio se deriva de ese mismo objeto, para que el corpus
// ejercite el mapeo en vez de declarar las dos formas por separado. Cada obra declara su selección
// en el fixture crudo, y la vista de dominio la deriva con este helper.
export function toDomainTags(raw: readonly RawTag[]): Tag[] {
	return raw.map(toDomainTag);
}

// Tipo literario de la obra. Va primero en `tags` de cada Story: los componentes que muestran un único tag
// —el hero de la página de story, entre otros— toman `tags[0]` y lo presentan como etiqueta principal.
export const rawCuentoTag = createRawTag('Cuento', 'cuento', 'Relato breve de ficción.');
export const cuentoTagMock = toDomainTag(rawCuentoTag);
export const rawNovelaTag = createRawTag('Novela', 'novela', 'Narrativa extensa de ficción.');
export const novelaTagMock = toDomainTag(rawNovelaTag);
export const rawEnsayoTag = createRawTag('Ensayo', 'ensayo', 'Prosa reflexiva que argumenta en torno a un tema.');
export const ensayoTagMock = toDomainTag(rawEnsayoTag);
export const rawTeatroTag = createRawTag('Teatro', 'teatro', 'Obra escrita para ser representada en escena.');
export const teatroTagMock = toDomainTag(rawTeatroTag);

// Género de la obra. Acompañan al tipo literario como tags adicionales.
export const rawDramaPsicologicoTag = createRawTag(
	'Drama psicológico',
	'drama-psicologico',
	'Conflicto centrado en la vida interior de los personajes.',
);
export const dramaPsicologicoTagMock = toDomainTag(rawDramaPsicologicoTag);
export const rawMetaficcionTag = createRawTag(
	'Metaficción',
	'metaficcion',
	'Obras que se vuelven sobre su propia escritura y la exhiben como tema.',
);
export const metaficcionTagMock = toDomainTag(rawMetaficcionTag);
export const rawAbsurdoTag = createRawTag(
	'Absurdo',
	'absurdo',
	'Rutinas y gestos cotidianos llevados hasta perder todo sentido.',
);
export const absurdoTagMock = toDomainTag(rawAbsurdoTag);
export const rawSurrealismoTag = createRawTag(
	'Surrealismo',
	'surrealismo',
	'Imágenes oníricas que desbordan la lógica cotidiana.',
);
export const surrealismoTagMock = toDomainTag(rawSurrealismoTag);
export const rawAlegoriaTag = createRawTag(
	'Alegoría',
	'alegoria',
	'Relato cuyo sentido literal remite a otro figurado.',
);
export const alegoriaTagMock = toDomainTag(rawAlegoriaTag);
export const rawFilosoficoTag = createRawTag(
	'Filosófico',
	'filosofico',
	'Ficción organizada en torno a una pregunta o una idea abstracta.',
);
export const filosoficoTagMock = toDomainTag(rawFilosoficoTag);
export const rawExperimentalTag = createRawTag(
	'Experimental',
	'experimental',
	'Obras que anteponen el procedimiento formal a la trama.',
);
export const experimentalTagMock = toDomainTag(rawExperimentalTag);
export const rawTragediaTag = createRawTag('Tragedia', 'tragedia', 'Pieza dramática de desenlace adverso.');
export const tragediaTagMock = toDomainTag(rawTragediaTag);
export const rawDramaHistoricoTag = createRawTag(
	'Drama histórico',
	'drama-historico',
	'Ficción dramática ambientada en hechos o figuras del pasado.',
);
export const dramaHistoricoTagMock = toDomainTag(rawDramaHistoricoTag);
