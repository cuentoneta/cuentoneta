import { append, at, defineMigration, setIfMissing } from 'sanity/migrate';

/**
 * La narración real del cuento por el podcast Armario de Cuentos. Es contenido editorial genuino —no un
 * fixture inventado—, así que el mismo recurso vale para los tres datasets; además le da a la obra el
 * segundo formato de tipo distinto que los tests de extremo a extremo necesitan para afirmar el cambio
 * de formato, una propiedad que hasta esta curación ningún documento de ningún dataset cumplía.
 */
export const AUDIO_NARRATION = Object.freeze({
	_key: 'e2efixture0801',
	_type: 'spotifyPodcastEpisode',
	title: 'Narración del cuento en formato audio',
	description: 'Narración del cuento tomada del podcast *Armario de Cuentos*, disponible en Spotify.',
	url: 'https://open.spotify.com/episode/6VhnNw8hKIh0mQNskcFLAz',
});

const TARGET_SLUG = 'a-la-deriva';

interface MediaSource {
	_key: string;
	_type: string;
	url?: string;
}

interface LiteraryWorkDocument {
	_id: string;
	slug?: { current?: string };
	mediaSources?: MediaSource[];
}

/**
 * Agrega la narración en audio de "A la deriva" a sus recursos multimedia.
 *
 * Es idempotente **por URL**, no por clave: el dataset ya curado a mano lleva el mismo episodio y no debe
 * duplicarse, y la URL es la identidad real del recurso — una clave distinta con el mismo episodio sigue
 * siendo el mismo contenido dos veces.
 *
 * Recorre también los borradores: publicar uno creado antes de la corrida reemplaza al documento
 * publicado por su contenido, y dejarlo afuera perdería el recurso en esa publicación.
 */
export default defineMigration({
	title: 'Agregar la narración en audio de A la deriva a sus recursos multimedia',
	documentTypes: ['literaryWork'],
	filter: `slug.current == "${TARGET_SLUG}"`,
	migrate: {
		document(doc: LiteraryWorkDocument) {
			// El filtro es una optimización del runner, no la garantía: se revalida sobre el documento.
			if (doc.slug?.current !== TARGET_SLUG) {
				return [];
			}
			if ((doc.mediaSources ?? []).some((media) => media.url === AUDIO_NARRATION.url)) {
				return [];
			}
			return [at('mediaSources', setIfMissing([])), at('mediaSources', append([AUDIO_NARRATION]))];
		},
	},
});
