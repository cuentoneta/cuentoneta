import { Location } from '@angular/common';
import { type Article, type BreadcrumbList, type WithContext } from 'schema-dts';

import { type LiteraryWork } from '@models/literary-work.model';
import { buildBreadcrumbSchema, buildPersonSchema } from '@utils/schema-org.builders';

/**
 * Construye el JSON-LD `Article` (+ un `Person` por autor) de una obra.
 *
 * Multi-autor: `LiteraryWork` modela 1..N autores, así que `author` es un arreglo de `Person`.
 * Omite `dateModified`: `LiteraryWork` no expone `updatedAt`. Sin `image` todavía: una imagen raster
 * requiere que `/api/og` emita PNG.
 */
export function buildLiteraryWorkArticleSchema(literaryWork: LiteraryWork, websiteUrl: string): WithContext<Article> {
	const baseUrl = Location.stripTrailingSlash(websiteUrl);
	return {
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: literaryWork.title,
		inLanguage: 'es-AR',
		datePublished: literaryWork.publishedAt,
		author: literaryWork.authors.map((author) => buildPersonSchema(author, `${baseUrl}/author/${author.slug}`)),
		publisher: {
			'@type': 'Organization',
			name: 'La Cuentoneta',
			url: baseUrl,
			logo: `${baseUrl}/assets/svg/logo.svg`,
		},
		mainEntityOfPage: `${baseUrl}/literary-work/${literaryWork.slug}`,
	};
}

// El rastro es plano —Inicio → obra— y no incluye el catálogo: la página no declara pertenecer a él,
// igual que el resto de las páginas del sitio.

export function buildLiteraryWorkBreadcrumb(
	literaryWork: LiteraryWork,
	websiteUrl: string,
): WithContext<BreadcrumbList> {
	const baseUrl = Location.stripTrailingSlash(websiteUrl);
	return buildBreadcrumbSchema([
		{ name: 'Inicio', url: `${baseUrl}/home` },
		{ name: literaryWork.title, url: `${baseUrl}/literary-work/${literaryWork.slug}` },
	]);
}
