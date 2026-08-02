import type { StoryBySlugQueryResult } from '@sanity-types';

// El shape que devuelve la proyección `tags[] -> { … }`, idéntica en las siete queries que la usan.
export type RawTag = NonNullable<StoryBySlugQueryResult>['tags'][number];

function createRawTag({
	title,
	slug,
	shortDescription,
}: {
	title: string;
	slug: string;
	shortDescription: string;
}): RawTag {
	return { title, slug, shortDescription };
}

// Tipo literario de la obra.
export const cuentoRawTag = createRawTag({
	title: 'Cuento',
	slug: 'cuento',
	shortDescription: 'Relato breve de ficción.',
});
export const novelaRawTag = createRawTag({
	title: 'Novela',
	slug: 'novela',
	shortDescription: 'Narrativa extensa de ficción.',
});
export const ensayoRawTag = createRawTag({
	title: 'Ensayo',
	slug: 'ensayo',
	shortDescription: 'Prosa reflexiva que argumenta en torno a un tema.',
});
export const teatroRawTag = createRawTag({
	title: 'Teatro',
	slug: 'teatro',
	shortDescription: 'Obra escrita para ser representada en escena.',
});

// Género de la obra.
export const dramaPsicologicoRawTag = createRawTag({
	title: 'Drama psicológico',
	slug: 'drama-psicologico',
	shortDescription: 'Conflicto centrado en la vida interior de los personajes.',
});
export const metaficcionRawTag = createRawTag({
	title: 'Metaficción',
	slug: 'metaficcion',
	shortDescription: 'Obras que se vuelven sobre su propia escritura y la exhiben como tema.',
});
export const absurdoRawTag = createRawTag({
	title: 'Absurdo',
	slug: 'absurdo',
	shortDescription: 'Rutinas y gestos cotidianos llevados hasta perder todo sentido.',
});
export const surrealismoRawTag = createRawTag({
	title: 'Surrealismo',
	slug: 'surrealismo',
	shortDescription: 'Imágenes oníricas que desbordan la lógica cotidiana.',
});
export const alegoriaRawTag = createRawTag({
	title: 'Alegoría',
	slug: 'alegoria',
	shortDescription: 'Relato cuyo sentido literal remite a otro figurado.',
});
export const filosoficoRawTag = createRawTag({
	title: 'Filosófico',
	slug: 'filosofico',
	shortDescription: 'Ficción organizada en torno a una pregunta o una idea abstracta.',
});
export const experimentalRawTag = createRawTag({
	title: 'Experimental',
	slug: 'experimental',
	shortDescription: 'Obras que anteponen el procedimiento formal a la trama.',
});
export const tragediaRawTag = createRawTag({
	title: 'Tragedia',
	slug: 'tragedia',
	shortDescription: 'Pieza dramática de desenlace adverso.',
});
export const dramaHistoricoRawTag = createRawTag({
	title: 'Drama histórico',
	slug: 'drama-historico',
	shortDescription: 'Ficción dramática ambientada en hechos o figuras del pasado.',
});

// Curaduría de la colección: no describe la obra sino cómo se armó la lista que la contiene.
export const colaborativaRawTag = createRawTag({
	title: 'Colaborativa',
	slug: 'colaborativa',
	shortDescription: 'Lista de textos generada colaborativamente por la comunidad.',
});

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
