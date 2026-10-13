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
 * Las páginas que listan obras —autor y colección— no cambian cuando se crea su documento sino cuando
 * se publica una de sus obras: por eso proyectan la fecha de la más reciente, o `null` si no listan
 * ninguna. Cuentan las mismas obras que la página muestra —publicadas y de tipo `literaryWork`—, y la
 * fecha de cada una es la misma que su propio `lastmod`. El piso de esa fecha no lo decide la query:
 * lo aplica el service con `resolveLastmod`.
 *
 * Cada filtro descarta los slugs que el dominio no puede construir, porque su página nunca se sirve.
 * GROQ no tiene expresiones regulares, así que la poda es gruesa —mayúsculas, guiones al borde o
 * dobles— y deja pasar caracteres fuera del alfabeto: la regla completa la aplica el repository.
 */
import { defineQuery } from 'groq';

export const sitemapSlugsQuery = defineQuery(`{
	"literaryWorks": *[_type == "literaryWork" && !(_id in path('drafts.**')) && defined(slug.current) && slug.current == lower(slug.current) && count(string::split(slug.current, "-")[@ == ""]) == 0] | order(_id asc) { "slug": slug.current, "lastmod": coalesce(publishedAt, _createdAt) },
	"authors": *[_type == "author" && !(_id in path('drafts.**')) && defined(slug.current) && slug.current == lower(slug.current) && count(string::split(slug.current, "-")[@ == ""]) == 0] | order(_id asc) {
		"slug": slug.current,
		"latestLiteraryWorkAt": *[_type == "literaryWork" && !(_id in path('drafts.**')) && ^._id in authors[]._ref]{ "date": coalesce(publishedAt, _createdAt) } | order(date desc)[0].date
	},
	"collections": *[_type == "collection" && !(_id in path('drafts.**')) && defined(slug.current) && slug.current == lower(slug.current) && count(string::split(slug.current, "-")[@ == ""]) == 0] | order(_id asc) {
		"slug": slug.current,
		"latestLiteraryWorkAt": *[_type == "literaryWork" && !(_id in path('drafts.**')) && _id in ^.literaryWorks[]._ref]{ "date": coalesce(publishedAt, _createdAt) } | order(date desc)[0].date
	}
}`);
