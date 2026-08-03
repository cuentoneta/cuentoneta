import { at, defineMigration, unset } from 'sanity/migrate';

// Cada entrada es una propiedad que su issue quitó del schema, de la proyección GROQ, del ACL y del
// modelo de dominio, pero que sigue presente en cada documento del dataset: quitar un campo del schema
// no borra el dato.
const ORPHAN_PROPERTIES: Readonly<Record<string, readonly string[]>> = Object.freeze({
	contentCampaign: ['description'],
	resourceType: ['description', 'icon'],
	tag: ['description', 'icon'],
});

const DOCUMENT_TYPES = Object.keys(ORPHAN_PROPERTIES);

/**
 * Purga las propiedades huérfanas que dejaron los cinco issues de eliminación de campos del epic de
 * migración a Markdown.
 *
 * Va como una sola migración y no cinco porque es el mismo `unset` sobre tres tipos de documento:
 * agruparlas evita repetir el dry-run y la corrida sobre producción.
 *
 * **Es destructiva y el dato no se recupera** salvo por el historial de Sanity. El contenido que borra
 * no era basura —las descripciones de `contentCampaign` son prosa editorial y las de `tag` y
 * `resourceType` documentan para quien edita qué significa cada tipo—, solo era contenido que ninguna
 * superficie renderiza. Por eso queda exportado en `ORPHAN_PROPERTIES_EXPORT.md`, al lado de esta
 * migración: el dato sale del dataset pero no del repositorio.
 *
 * Es idempotente: `unset` sobre una propiedad ausente no produce mutación.
 */
export default defineMigration({
	title: 'Purgar las propiedades huérfanas de contentCampaign, resourceType y tag',
	documentTypes: DOCUMENT_TYPES,
	migrate: {
		document(doc) {
			const properties = ORPHAN_PROPERTIES[doc._type] ?? [];
			return properties.filter((property) => property in doc).map((property) => at(property, unset()));
		},
	},
});
