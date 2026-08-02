import type { StoryBySlugQueryResult } from '@sanity-types';

// El shape que devuelve la proyección `tags[] -> { … }`, idéntica en las siete queries que la usan.
export type RawTag = NonNullable<StoryBySlugQueryResult>['tags'][number];

function createRawTag({
	title,
	slug,
	shortDescription,
	iconName,
}: {
	title: string;
	slug: string;
	shortDescription: string;
	iconName: string;
}): RawTag {
	return { title, slug, shortDescription, icon: { _type: 'iconPicker', provider: 'mdi', name: iconName } };
}

// Tipo literario de la obra.
export const cuentoRawTag = createRawTag({
	title: 'Cuento',
	slug: 'cuento',
	shortDescription: 'Relato breve de ficción.',
	iconName: 'book-open-variant',
});
export const novelaRawTag = createRawTag({
	title: 'Novela',
	slug: 'novela',
	shortDescription: 'Narrativa extensa de ficción.',
	iconName: 'book',
});
export const ensayoRawTag = createRawTag({
	title: 'Ensayo',
	slug: 'ensayo',
	shortDescription: 'Prosa reflexiva que argumenta en torno a un tema.',
	iconName: 'fountain-pen-tip',
});
export const teatroRawTag = createRawTag({
	title: 'Teatro',
	slug: 'teatro',
	shortDescription: 'Obra escrita para ser representada en escena.',
	iconName: 'drama-masks',
});

// Género de la obra.
export const dramaPsicologicoRawTag = createRawTag({
	title: 'Drama psicológico',
	slug: 'drama-psicologico',
	shortDescription: 'Conflicto centrado en la vida interior de los personajes.',
	iconName: 'head-cog',
});
export const metaficcionRawTag = createRawTag({
	title: 'Metaficción',
	slug: 'metaficcion',
	shortDescription: 'Obras que se vuelven sobre su propia escritura y la exhiben como tema.',
	iconName: 'mirror',
});
export const absurdoRawTag = createRawTag({
	title: 'Absurdo',
	slug: 'absurdo',
	shortDescription: 'Rutinas y gestos cotidianos llevados hasta perder todo sentido.',
	iconName: 'emoticon-confused',
});
export const surrealismoRawTag = createRawTag({
	title: 'Surrealismo',
	slug: 'surrealismo',
	shortDescription: 'Imágenes oníricas que desbordan la lógica cotidiana.',
	iconName: 'weather-night',
});
export const alegoriaRawTag = createRawTag({
	title: 'Alegoría',
	slug: 'alegoria',
	shortDescription: 'Relato cuyo sentido literal remite a otro figurado.',
	iconName: 'shape-outline',
});
export const filosoficoRawTag = createRawTag({
	title: 'Filosófico',
	slug: 'filosofico',
	shortDescription: 'Ficción organizada en torno a una pregunta o una idea abstracta.',
	iconName: 'thought-bubble',
});
export const experimentalRawTag = createRawTag({
	title: 'Experimental',
	slug: 'experimental',
	shortDescription: 'Obras que anteponen el procedimiento formal a la trama.',
	iconName: 'flask-outline',
});
export const tragediaRawTag = createRawTag({
	title: 'Tragedia',
	slug: 'tragedia',
	shortDescription: 'Pieza dramática de desenlace adverso.',
	iconName: 'theater',
});
export const dramaHistoricoRawTag = createRawTag({
	title: 'Drama histórico',
	slug: 'drama-historico',
	shortDescription: 'Ficción dramática ambientada en hechos o figuras del pasado.',
	iconName: 'castle',
});

// Curaduría de la colección: no describe la obra sino cómo se armó la lista que la contiene.
export const colaborativaRawTag = createRawTag({
	title: 'Colaborativa',
	slug: 'colaborativa',
	shortDescription: 'Lista de textos generada colaborativamente por la comunidad.',
	iconName: 'account-group',
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

// El icon picker sin provider ni name: ejercita la normalización del ACL sin hand-authorear un literal.
export const rawTagWithoutIconMetadata: RawTag = { ...cuentoRawTag, icon: { _type: 'iconPicker' } };
