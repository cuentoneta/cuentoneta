/**
 * Consultas que resuelven el slug viejo de una obra o de una colección al slug vigente de su documento
 * migrado: `$legacySlug` es el slug de la ruta vieja y `$migratedIdPrefix` el prefijo de procedencia del
 * tipo (`MIGRATED_ID_PREFIX`). Devuelven `null` si ningún documento migrado proviene de un origen con ese
 * slug.
 *
 * El origen se busca por slug sin filtrar por `_type`, porque los tipos de origen ya no están en el schema
 * y el typegen tiparía ese filtro como vacío. No hace falta: anteponerle el prefijo al `_id` de cualquier
 * otro documento con el mismo slug —incluido el propio migrado— no nombra ningún documento.
 *
 * El orden por identificador vuelve determinista la elección si dos orígenes comparten slug.
 */
import { defineQuery } from 'groq';

export const migratedLiteraryWorkSlugQuery = defineQuery(
	`*[_type == "literaryWork" && _id in *[!(_id in path('drafts.**')) && slug.current == $legacySlug]{ "migratedId": $migratedIdPrefix + _id }.migratedId] | order(_id asc)[0].slug.current`,
);

export const migratedCollectionSlugQuery = defineQuery(
	`*[_type == "collection" && _id in *[!(_id in path('drafts.**')) && slug.current == $legacySlug]{ "migratedId": $migratedIdPrefix + _id }.migratedId] | order(_id asc)[0].slug.current`,
);
