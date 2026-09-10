import type { ApplicationConfig } from '@angular/core';
import { APP_ID, LOCALE_ID } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withViewTransitions, withComponentInputBinding } from '@angular/router';
import { appRoutes } from './app.routes';

import { provideHttpClient } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import localeEs from '@angular/common/locales/es-419';
import { DatePipe, registerLocaleData } from '@angular/common';

// Layout
import { provideLayout } from './providers/layout.provider';

// Imágenes
import { provideSanityImageLoader } from './providers/sanity-image-loader';

// SEO providers
import { provideSchemaOrgInitializer } from './providers/schema-org.initializer';

registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
	providers: [
		DatePipe,
		{ provide: APP_ID, useValue: 'serverApp' },
		{ provide: LOCALE_ID, useValue: 'es-419' },
		provideClientHydration(),
		provideRouter(
			appRoutes,
			withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
			withViewTransitions(),
			withComponentInputBinding(),
		),
		provideHttpClient(),

		// Layout
		provideLayout(),

		// Imágenes
		provideSanityImageLoader(),

		// SEO providers
		provideSchemaOrgInitializer(),
	],
};
