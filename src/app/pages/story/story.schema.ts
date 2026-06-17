import { Location } from '@angular/common';

import { type Story } from '@models/story.model';
import { buildBreadcrumbSchema, buildPersonSchema } from '@utils/schema-org.builders';
import { type JsonLdSchema } from '../../providers/schema-org.service';

const PUBLISHER_NAME = 'La Cuentoneta';

/**
 * Construye el JSON-LD `Article` (+ `Person` autor) de una página de cuento.
 *
 * Incluye señales E-E-A-T: autor (con perfil y `sameAs`), fecha de publicación y de modificación.
 * No incluye `image` todavía: una imagen raster por cuento requiere que `/api/og` emita PNG (las
 * redes y Google no aceptan SVG para `image`); queda como follow-up.
 */
export function buildStoryArticleSchema(story: Story, websiteUrl: string): JsonLdSchema {
	const baseUrl = Location.stripTrailingSlash(websiteUrl);
	return {
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: story.title,
		inLanguage: 'es-AR',
		datePublished: story.publishedAt,
		dateModified: story.updatedAt,
		author: buildPersonSchema(story.author, `${baseUrl}/author/${story.author.slug}`),
		publisher: {
			'@type': 'Organization',
			name: PUBLISHER_NAME,
			url: baseUrl,
			logo: `${baseUrl}/assets/svg/logo.svg`,
		},
		mainEntityOfPage: `${baseUrl}/story/${story.slug}`,
	};
}

/** Construye el `BreadcrumbList` de la página de un cuento: Inicio → Cuentos → cuento. */
export function buildStoryBreadcrumb(story: Story, websiteUrl: string): JsonLdSchema {
	const baseUrl = Location.stripTrailingSlash(websiteUrl);
	return buildBreadcrumbSchema([
		{ name: 'Inicio', url: `${baseUrl}/home` },
		{ name: 'Cuentos', url: `${baseUrl}/story` },
		{ name: story.title, url: `${baseUrl}/story/${story.slug}` },
	]);
}
