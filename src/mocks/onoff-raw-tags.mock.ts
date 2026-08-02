import type { StoryBySlugQueryResult } from '@sanity-types';

// El shape que devuelve la proyección `tags[] -> { … }`, idéntica en las siete queries que la usan.
type RawTag = NonNullable<StoryBySlugQueryResult>['tags'][number];

function createRawTag(title: string, slug: string, shortDescription: string, iconName: string): RawTag {
	return { title, slug, shortDescription, icon: { _type: 'iconPicker', provider: 'mdi', name: iconName } };
}

// Tipo literario de la obra.
export const cuentoRawTag = createRawTag('Cuento', 'cuento', 'Relato breve de ficción.', 'book-open-variant');
export const novelaRawTag = createRawTag('Novela', 'novela', 'Narrativa extensa de ficción.', 'book');
export const ensayoRawTag = createRawTag(
	'Ensayo',
	'ensayo',
	'Prosa reflexiva que argumenta en torno a un tema.',
	'fountain-pen-tip',
);
export const teatroRawTag = createRawTag(
	'Teatro',
	'teatro',
	'Obra escrita para ser representada en escena.',
	'drama-masks',
);

// Género de la obra.
export const dramaPsicologicoRawTag = createRawTag(
	'Drama psicológico',
	'drama-psicologico',
	'Conflicto centrado en la vida interior de los personajes.',
	'head-cog',
);
export const metaficcionRawTag = createRawTag(
	'Metaficción',
	'metaficcion',
	'Obras que se vuelven sobre su propia escritura y la exhiben como tema.',
	'mirror',
);
export const absurdoRawTag = createRawTag(
	'Absurdo',
	'absurdo',
	'Rutinas y gestos cotidianos llevados hasta perder todo sentido.',
	'emoticon-confused',
);
export const surrealismoRawTag = createRawTag(
	'Surrealismo',
	'surrealismo',
	'Imágenes oníricas que desbordan la lógica cotidiana.',
	'weather-night',
);
export const alegoriaRawTag = createRawTag(
	'Alegoría',
	'alegoria',
	'Relato cuyo sentido literal remite a otro figurado.',
	'shape-outline',
);
export const filosoficoRawTag = createRawTag(
	'Filosófico',
	'filosofico',
	'Ficción organizada en torno a una pregunta o una idea abstracta.',
	'thought-bubble',
);
export const experimentalRawTag = createRawTag(
	'Experimental',
	'experimental',
	'Obras que anteponen el procedimiento formal a la trama.',
	'flask-outline',
);
export const tragediaRawTag = createRawTag('Tragedia', 'tragedia', 'Pieza dramática de desenlace adverso.', 'theater');
export const dramaHistoricoRawTag = createRawTag(
	'Drama histórico',
	'drama-historico',
	'Ficción dramática ambientada en hechos o figuras del pasado.',
	'castle',
);

// Curaduría de la colección: no describe la obra sino cómo se armó la lista que la contiene.
export const colaborativaRawTag = createRawTag(
	'Colaborativa',
	'colaborativa',
	'Lista de textos generada colaborativamente por la comunidad.',
	'account-group',
);

export const onoffRawTagsMock: RawTag[] = [
	cuentoRawTag,
	novelaRawTag,
	ensayoRawTag,
	teatroRawTag,
	dramaPsicologicoRawTag,
	metaficcionRawTag,
	absurdoRawTag,
	surrealismoRawTag,
	alegoriaRawTag,
	filosoficoRawTag,
	experimentalRawTag,
	tragediaRawTag,
	dramaHistoricoRawTag,
	colaborativaRawTag,
];

// El icon picker sin provider ni name: ejercita la normalización del ACL sin hand-authorear un literal.
export const rawTagWithoutIconMetadata: RawTag = { ...cuentoRawTag, icon: { _type: 'iconPicker' } };
