import { createIfNotExists, defineMigration } from 'sanity/migrate';

import { buildCollectionDocument, type StorylistDocument } from '../storylist-to-collection/build-collection-document';

/**
 * Crea una colección **en borrador** por cada storylist en borrador que esté completa.
 *
 * **Nada se publica.** El identificador derivado conserva el prefijo de path del origen, así que una
 * storylist inédita produce una colección inédita, y las queries del sitio excluyen borradores: nada de
 * esto llega a una página.
 *
 * **Una storylist con versión publicada y borrador produce el borrador de su misma colección**, porque
 * ambos identificadores derivan del mismo uuid. No nace una colección distinta ni se toca la publicada.
 * En el Studio esos borradores aparecen como cambios sin publicar que nadie hizo: es esperado.
 *
 * **Los borradores incompletos se excluyen en el filtro, no en el código.** Uno a medio escribir es un
 * estado legítimo, no un error del dataset, así que no corresponde ni abortar la corrida entera ni
 * saltearlo desde el mapeo: la exclusión declarativa queda a la vista en el diff y el censo dice qué
 * quedó afuera. El armado sigue lanzando como defensa en profundidad.
 *
 * **El filtro admite exactamente lo que el destino declara requerido**, y el destino son dos capas: el
 * schema del Studio exige título, slug y descripción; la factory del dominio exige además al menos una
 * obra. Sin esa última condición la migración escribiría un documento que el dominio nunca puede
 * construir, y la falla aparecería al mapear en vez de acá. No es una lista de casos observados: si
 * alguna de las dos capas cambia lo que exige, el filtro cambia con ella.
 */
export default defineMigration({
	title: 'Crear una colección en borrador por cada storylist en borrador',
	documentTypes: ['storylist'],
	filter:
		"_id in path('drafts.**') && defined(title) && defined(slug.current) && count(description) > 0 && count(stories) > 0",
	migrate: {
		document(doc: StorylistDocument) {
			return [createIfNotExists(buildCollectionDocument(doc))];
		},
	},
});
