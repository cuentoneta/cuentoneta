import { type EnvironmentProviders, inject, provideAppInitializer } from '@angular/core';
import { Meta } from '@angular/platform-browser';

import { buildCanonicalUrl } from '@app-utils/build-canonical-url.util';

const DEFAULT_IMAGE_PATH = 'assets/img/og-default.jpg';
const DEFAULT_IMAGE_ALT = 'Logo de La Cuentoneta';

/**
 * Declara la imagen por defecto en `og:image`, `og:image:alt` y `twitter:image`, con la URL absoluta del
 * host que sirve el build: cada preview y staging exponen su propio archivo y no el de producción.
 */
export function applyDefaultImage(meta: Meta, website?: string): void {
	const url = buildCanonicalUrl(DEFAULT_IMAGE_PATH, website);
	meta.updateTag({ property: 'og:image', content: url });
	meta.updateTag({ property: 'og:image:alt', content: DEFAULT_IMAGE_ALT });
	meta.updateTag({ name: 'twitter:image', content: url });
}

/** Declara la imagen por defecto al bootstrap (SSR incluido), para las rutas que no fijan una propia. */
export function provideDefaultImageInitializer(): EnvironmentProviders {
	return provideAppInitializer(() => applyDefaultImage(inject(Meta)));
}
