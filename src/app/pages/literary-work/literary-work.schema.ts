import { Location } from '@angular/common';
import type { Article, BreadcrumbList, WithContext } from 'schema-dts';

import type { LiteraryWork } from '@models/literary-work.model';
import { resolveSearchImage } from '@utils/sanity-image.utils';
import { buildBreadcrumbSchema, buildPersonSchema } from '@utils/schema-org.builders';

/**
 * Construye el JSON-LD `Article` (+ un `Person` por autor) de una obra.
 *
 * Multi-autor: `LiteraryWork` modela 1..N autores, así que `author` es un arreglo de `Person`.
 * Omite `dateModified`: `LiteraryWork` no expone `updatedAt`. Declara `image` solo con una portada
 * raster que alcance el mínimo que Google exige a la imagen de un `Article`; si no, la omite.
 */
export function buildLiteraryWorkArticleSchema(literaryWork: LiteraryWork, websiteUrl: string): WithContext<Article> {
	const baseUrl = Location.stripTrailingSlash(websiteUrl);
	const image = articleImageUrl(literaryWork.coverImage);
	return {
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: literaryWork.title,
		inLanguage: 'es-AR',
		datePublished: literaryWork.publishedAt,
		...(image ? { image } : {}),
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

function articleImageUrl(coverImage: string): string | undefined {
	// Google ignora la imagen de un `Article` por debajo de este área (ancho × alto, en píxeles). Una
	// portada de la que no se conocen las dimensiones no se declara: no se puede afirmar que lo alcanza.
	const articleImageMinPixelArea = 50_000;
	const image = resolveSearchImage(coverImage);
	const meetsMinimum = (image?.pixelArea ?? 0) >= articleImageMinPixelArea;
	return meetsMinimum ? image?.url : undefined;
}

// El rastro es plano —Inicio → obra— y no incluye el catálogo: la página no declara pertenecer a él,
// igual que el resto de las páginas del sitio.

export function buildLiteraryWorkBreadcrumb(
	literaryWork: LiteraryWork,
	websiteUrl: string,
): WithContext<BreadcrumbList> {
	const baseUrl = Location.stripTrailingSlash(websiteUrl);
	return buildBreadcrumbSchema([
		{ name: 'Inicio', url: `${baseUrl}/` },
		{ name: literaryWork.title, url: `${baseUrl}/literary-work/${literaryWork.slug}` },
	]);
}
