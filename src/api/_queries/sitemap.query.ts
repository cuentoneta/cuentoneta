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
 *
 * Cada filtro descarta los slugs que el dominio no puede construir, porque su página nunca se sirve.
 * GROQ no tiene expresiones regulares, así que la poda es gruesa —mayúsculas, guiones al borde o
 * dobles— y deja pasar caracteres fuera del alfabeto: la regla completa la aplica el repository.
 */
import { defineQuery } from 'groq';

export const sitemapSlugsQuery = defineQuery(`{
	"literaryWorks": *[_type == "literaryWork" && !(_id in path('drafts.**')) && defined(slug.current) && slug.current == lower(slug.current) && count(string::split(slug.current, "-")[@ == ""]) == 0] | order(_id asc) { "slug": slug.current, "lastmod": coalesce(publishedAt, _createdAt) },
	"authors": *[_type == "author" && !(_id in path('drafts.**')) && defined(slug.current) && slug.current == lower(slug.current) && count(string::split(slug.current, "-")[@ == ""]) == 0]{ "slug": slug.current, "lastmod": _createdAt },
	"collections": *[_type == "collection" && !(_id in path('drafts.**')) && defined(slug.current) && slug.current == lower(slug.current) && count(string::split(slug.current, "-")[@ == ""]) == 0] | order(_id asc) { "slug": slug.current, "lastmod": _createdAt }
}`);
