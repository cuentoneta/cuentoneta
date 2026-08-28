/**
 * Consulta GROQ para la generación del sitemap
 *
 * El orden por identificador no es cosmético: dos documentos publicados pueden compartir slug, y es lo
 * que hace que el sitemap conserve la misma entrada que la página sirve, en vez de la que el dataset
 * devuelva primero.
 *
 * El `lastmod` deriva de una fecha de origen y no de `_updatedAt`, porque ese campo de sistema se
 * mueve con cualquier escritura —backfills, migraciones, copias de dataset— y aplana el historial
 * de todo el corpus a la vez. Un `lastmod` que no se actualiza cuando debería cuesta mucho menos
 * que uno que se actualiza cuando no debería: el segundo destruye la confianza en la señal.
 */
import { defineQuery } from 'groq';

export const sitemapSlugsQuery = defineQuery(`{
	"literaryWorks": *[_type == "literaryWork" && !(_id in path('drafts.**'))] | order(_id asc) { "slug": slug.current, "lastmod": coalesce(publishedAt, _createdAt) },
	"authors": *[_type == "author" && !(_id in path('drafts.**'))]{ "slug": slug.current, "lastmod": _createdAt },
	"collections": *[_type == "collection" && !(_id in path('drafts.**'))] | order(_id asc) { "slug": slug.current, "lastmod": _createdAt }
}`);
