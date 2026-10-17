import { type EnvironmentProviders, inject, provideAppInitializer } from '@angular/core';
import { Meta } from '@angular/platform-browser';

import { buildCanonicalUrl } from '@app-utils/build-canonical-url.util';

const DEFAULT_OG_IMAGE_PATH = 'assets/img/og-default.jpg';
const DEFAULT_OG_IMAGE_ALT = 'Logo de La Cuentoneta';

/**
 * Declara la imagen por defecto en `og:image` y su `og:image:alt`, con la URL absoluta del host que
 * sirve el build: cada preview y staging exponen su propio archivo y no el de producción.
 */
export function applyDefaultOgImage(meta: Meta, website?: string): void {
	meta.updateTag({ property: 'og:image', content: buildCanonicalUrl(DEFAULT_OG_IMAGE_PATH, website) });
	meta.updateTag({ property: 'og:image:alt', content: DEFAULT_OG_IMAGE_ALT });
}

/** Declara la imagen por defecto al bootstrap (SSR incluido), para las rutas que no fijan una propia. */
export function provideDefaultOgImageInitializer(): EnvironmentProviders {
	return provideAppInitializer(() => applyDefaultOgImage(inject(Meta)));
}
