import { Location } from '@angular/common';
import { type Article, type BreadcrumbList, type WithContext } from 'schema-dts';

import { type LiteraryWork } from '@models/literary-work.model';
import { buildBreadcrumbSchema, buildPersonSchema } from '@utils/schema-org.builders';

/**
 * Construye el JSON-LD `Article` (+ un `Person` por autor) de una obra en `/read`.
 *
 * Multi-autor: `LiteraryWork` modela 1..N autores, así que `author` es un arreglo de `Person`.
 * Omite `dateModified`: a diferencia de `Story`, `LiteraryWork` no expone `updatedAt`. Sin `image`
 * todavía (igual que la página de cuento): una imagen raster requiere que `/api/og` emita PNG.
 *
 * // TODO: Agregar campos faltantes en schema como parte de la implementación del issue #1471
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

/** Construye el `BreadcrumbList` de una obra en `/read`: Inicio → obra (no hay ruta índice `/read`). */
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
