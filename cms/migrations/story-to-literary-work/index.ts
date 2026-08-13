import { createIfNotExists, defineMigration } from 'sanity/migrate';

import { buildLiteraryWorkDocument, type StoryDocument } from './build-literary-work-document';

/**
 * Crea una obra en Markdown por cada cuento publicado, con su contenido convertido desde Portable Text.
 *
 * **No modifica la story de origen.** Itera `story` pero emite la mutación sobre otro documento: el
 * cuento queda intacto y la obra nace al lado. La baja del schema `story` es un trabajo aparte, y
 * hasta entonces conviven — por eso la migración es reversible borrando solo lo que creó.
 *
 * **Idempotencia por `createIfNotExists`.** El `_id` de la obra se deriva del de su story, así que
 * repetir la corrida es un no-op: no duplica ni pisa lo que alguien haya editado a mano después de
 * migrar. Se descarta `createOrReplace` justamente por eso — refrescaría el contenido a costa de
 * perder correcciones editoriales posteriores.
 *
 * **Se detiene ante lo que no puede traducir.** Tanto el conversor como el armado del documento
 * lanzan en vez de degradar: una obra a medias fallaría recién al leerse, cuando el repository
 * construya el agregado con sus factories, lejos de donde se puede corregir.
 */
export default defineMigration({
	title: 'Crear una obra en Markdown por cada cuento publicado',
	documentTypes: ['story'],
	// El runner recorre también los borradores, que no tienen por qué estar completos ni publicados.
	filter: "!(_id in path('drafts.**'))",
	migrate: {
		document(doc: StoryDocument) {
			return [createIfNotExists(buildLiteraryWorkDocument(doc))];
		},
	},
});
