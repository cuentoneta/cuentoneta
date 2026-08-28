import type { LiteraryWorkBySlugQueryResult } from '@sanity-types';

// El shape que devuelve la proyección `tags[] -> { … }`, idéntica en todas las queries que la usan.
export type RawTag = NonNullable<LiteraryWorkBySlugQueryResult>['tags'][number];

// Tipo literario de la obra.
export const cuentoRawTag: RawTag = {
	title: 'Cuento',
	slug: 'cuento',
	description: 'Relato breve de ficción.',
};
export const novelaRawTag: RawTag = {
	title: 'Novela',
	slug: 'novela',
	description: 'Narrativa extensa de ficción.',
};
export const ensayoRawTag: RawTag = {
	title: 'Ensayo',
	slug: 'ensayo',
	description: 'Prosa reflexiva que argumenta en torno a un tema.',
};
export const teatroRawTag: RawTag = {
	title: 'Teatro',
	slug: 'teatro',
	description: 'Obra escrita para ser representada en escena.',
};

// Género de la obra.
export const dramaPsicologicoRawTag: RawTag = {
	title: 'Drama psicológico',
	slug: 'drama-psicologico',
	description: 'Conflicto centrado en la vida interior de los personajes.',
};
export const metaficcionRawTag: RawTag = {
	title: 'Metaficción',
	slug: 'metaficcion',
	description: 'Obras que se vuelven sobre su propia escritura y la exhiben como tema.',
};
export const absurdoRawTag: RawTag = {
	title: 'Absurdo',
	slug: 'absurdo',
	description: 'Rutinas y gestos cotidianos llevados hasta perder todo sentido.',
};
export const surrealismoRawTag: RawTag = {
	title: 'Surrealismo',
	slug: 'surrealismo',
	description: 'Imágenes oníricas que desbordan la lógica cotidiana.',
};
export const alegoriaRawTag: RawTag = {
	title: 'Alegoría',
	slug: 'alegoria',
	description: 'Relato cuyo sentido literal remite a otro figurado.',
};
export const filosoficoRawTag: RawTag = {
	title: 'Filosófico',
	slug: 'filosofico',
	description: 'Ficción organizada en torno a una pregunta o una idea abstracta.',
};
export const experimentalRawTag: RawTag = {
	title: 'Experimental',
	slug: 'experimental',
	description: 'Obras que anteponen el procedimiento formal a la trama.',
};
export const tragediaRawTag: RawTag = {
	title: 'Tragedia',
	slug: 'tragedia',
	description: 'Pieza dramática de desenlace adverso.',
};
export const dramaHistoricoRawTag: RawTag = {
	title: 'Drama histórico',
	slug: 'drama-historico',
	description: 'Ficción dramática ambientada en hechos o figuras del pasado.',
};

// Curaduría de la colección: no describe la obra sino cómo se armó la lista que la contiene.
export const colaborativaRawTag: RawTag = {
	title: 'Colaborativa',
	slug: 'colaborativa',
	description: 'Lista de textos generada colaborativamente por la comunidad.',
};

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
