import { Location } from '@angular/common';

import { type Story } from '@models/story.model';
import { type JsonLdSchema } from '../../providers/schema-org.service';

const SCHEMA_CONTEXT = 'https://schema.org';
const PUBLISHER_NAME = 'La Cuentoneta';

function buildAuthorPerson(story: Story, baseUrl: string): JsonLdSchema {
	const person: JsonLdSchema = {
		'@type': 'Person',
		name: story.author.name,
		url: `${baseUrl}/author/${story.author.slug}`,
	};
	if (story.author.imageUrl) {
		person['image'] = story.author.imageUrl;
	}
	const sameAs = story.author.resources.map((resource) => resource.url).filter((url) => url.length > 0);
	if (sameAs.length > 0) {
		person['sameAs'] = sameAs;
	}
	return person;
}

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
		'@context': SCHEMA_CONTEXT,
		'@type': 'Article',
		headline: story.title,
		inLanguage: 'es-AR',
		datePublished: story.publishedAt,
		dateModified: story.updatedAt,
		author: buildAuthorPerson(story, baseUrl),
		publisher: {
			'@type': 'Organization',
			name: PUBLISHER_NAME,
			url: baseUrl,
			logo: `${baseUrl}/assets/svg/logo.svg`,
		},
		mainEntityOfPage: `${baseUrl}/story/${story.slug}`,
	};
}
