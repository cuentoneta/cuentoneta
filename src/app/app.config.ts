import { APP_ID, ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withViewTransitions, withComponentInputBinding } from '@angular/router';
import { appRoutes } from './app.routes';

import { provideHttpClient } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import localeEs from '@angular/common/locales/es-419';
import { DatePipe, registerLocaleData } from '@angular/common';

// API providers
import { provideCollectionApi } from './providers/collection.provider';
import { provideLiteraryWorkApi } from './providers/literary-work.provider';

// Layout
import { provideLayout } from './providers/layout.provider';

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

		// API providers
		provideCollectionApi(),
		provideLiteraryWorkApi(),
		provideLayout(),

		// SEO providers
		provideSchemaOrgInitializer(),
	],
};
