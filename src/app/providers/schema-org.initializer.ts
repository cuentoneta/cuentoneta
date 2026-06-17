import { type EnvironmentProviders, inject, provideAppInitializer } from '@angular/core';
import { Location } from '@angular/common';

import { SchemaOrgService, type JsonLdSchema } from './schema-org.service';
import { environment } from '../environments/environment';

const SCHEMA_CONTEXT = 'https://schema.org';
const ORGANIZATION_NAME = 'La Cuentoneta';
const ORGANIZATION_DESCRIPTION =
	'Proyecto abierto, comunitario y sin fines de lucro que fomenta y hace accesible la lectura digital, ' +
	'publicando relatos breves en storylists temáticas.';

// URLs canónicas de los perfiles, alineadas con las que renderiza el footer (footer.component.ts).
const SOCIAL_PROFILES = [
	'https://twitter.com/cuentoneta',
	'https://www.instagram.com/cuentoneta',
	'https://www.facebook.com/cuentoneta',
];

/** Construye el JSON-LD de la entidad `Organization` del sitio. */
export function buildOrganizationSchema(websiteUrl: string): JsonLdSchema {
	// `environment.website` llega con barra final en producción (`https://host/`) y como `/` en dev;
	// `Location.stripTrailingSlash` la recorta para no generar dobles slashes al concatenar.
	const baseUrl = Location.stripTrailingSlash(websiteUrl);
	return {
		'@context': SCHEMA_CONTEXT,
		'@type': 'Organization',
		name: ORGANIZATION_NAME,
		url: baseUrl,
		logo: `${baseUrl}/assets/svg/logo.svg`,
		description: ORGANIZATION_DESCRIPTION,
		sameAs: SOCIAL_PROFILES,
	};
}

/** Construye el JSON-LD de la entidad `WebSite` del sitio. */
export function buildWebSiteSchema(websiteUrl: string): JsonLdSchema {
	return {
		'@context': SCHEMA_CONTEXT,
		'@type': 'WebSite',
		name: ORGANIZATION_NAME,
		url: Location.stripTrailingSlash(websiteUrl),
		inLanguage: 'es-AR',
	};
}

/** Emite los bloques sitewide de `Organization` y `WebSite` en el `<head>` a partir de la URL del sitio. */
export function applySiteSchema(schemaOrg: SchemaOrgService, websiteUrl: string): void {
	schemaOrg.setJsonLd('organization', buildOrganizationSchema(websiteUrl));
	schemaOrg.setJsonLd('website', buildWebSiteSchema(websiteUrl));
}

/**
 * Emite el JSON-LD sitewide de `Organization` y `WebSite` al bootstrap (SSR incluido),
 * para que esté presente en todas las rutas y los answer engines reconozcan la entidad.
 */
export function provideSchemaOrgInitializer(): EnvironmentProviders {
	return provideAppInitializer(() => applySiteSchema(inject(SchemaOrgService), environment.website));
}
