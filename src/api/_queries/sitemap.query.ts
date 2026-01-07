/**
 * Consulta GROQ para la generación del sitemap
 * Obtiene los slugs de todos los tipos de contenido para la generación de URLs
 */
import { defineQuery } from 'groq';

export const sitemapSlugsQuery = defineQuery(`{
	"stories": *[_type == "story" && !(_id in path('drafts.**'))]{ "slug": slug.current },
	"authors": *[_type == "author" && !(_id in path('drafts.**'))]{ "slug": slug.current },
	"storylists": *[_type == "storylist" && !(_id in path('drafts.**'))]{ "slug": slug.current }
}`);
