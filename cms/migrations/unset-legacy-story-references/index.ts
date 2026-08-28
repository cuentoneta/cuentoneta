import { at, defineMigration, unset } from 'sanity/migrate';

// Cada entrada es un campo de referencia que se quitó del schema del Studio, de la proyección GROQ y
// del puerto del backend, y que aun así puede seguir presente en un documento: quitar un campo del
// schema no borra el dato.
const LEGACY_REFERENCE_FIELDS: Readonly<Record<string, readonly string[]>> = Object.freeze({
	landingPage: ['cards', 'latestReads'],
	rotatingContent: ['mostRead'],
});

const DOCUMENT_TYPES = Object.keys(LEGACY_REFERENCE_FIELDS);

interface LegacyReferenceDocument {
	_id: string;
	_type: string;
}

/**
 * Da de baja los campos que todavía referencian los tipos de contenido retirados.
 *
 * **Es el paso previo que habilita la purga, no una limpieza posterior.** El content lake rechaza
 * borrar un documento que conserva una referencia fuerte entrante, así que mientras estos campos
 * apunten a los documentos viejos, ninguna migración puede borrarlos.
 *
 * Corre con el runner recorriendo también los borradores —de ahí la ausencia de `filter`—: una landing
 * en borrador conserva sus referencias igual que la publicada, y dejarla afuera bloquearía la purga.
 *
 * Es idempotente: solo emite mutación por los campos que el documento efectivamente trae, así que una
 * segunda corrida no produce ninguna.
 *
 * **Invalida para siempre la reversión del relinkeo de la landing**, que aborta cuando el campo de
 * origen ya no está poblado. A partir de esta corrida, el plan de recuperación es el export previo.
 */
export default defineMigration({
	title: 'Dar de baja los campos de referencia a los tipos de contenido retirados',
	documentTypes: DOCUMENT_TYPES,
	migrate: {
		document(doc: LegacyReferenceDocument) {
			// Se pregunta por propiedad propia: un `_type` que colisione con una heredada devolvería una
			// función en vez de undefined, y el operador de fallback no la atraparía.
			const fields = Object.hasOwn(LEGACY_REFERENCE_FIELDS, doc._type) ? LEGACY_REFERENCE_FIELDS[doc._type] : [];
			return fields.filter((field) => field in doc).map((field) => at(field, unset()));
		},
	},
});
