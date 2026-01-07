/**
 * Consulta GROQ para la generación del sitemap
 * Obtiene los slugs y fechas de actualización de todos los tipos de contenido
 */
import { defineQuery } from 'groq';

export const sitemapSlugsQuery = defineQuery(`{
	"stories": *[_type == "story" && !(_id in path('drafts.**'))]{ "slug": slug.current, "lastmod": _updatedAt },
	"authors": *[_type == "author" && !(_id in path('drafts.**'))]{ "slug": slug.current, "lastmod": _updatedAt },
	"storylists": *[_type == "storylist" && !(_id in path('drafts.**'))]{ "slug": slug.current, "lastmod": _updatedAt }
}`);
