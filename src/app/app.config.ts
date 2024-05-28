import { APP_ID, APP_INITIALIZER, ApplicationConfig, LOCALE_ID } from '@angular/core';
import {
	provideRouter,
	withEnabledBlockingInitialNavigation,
	withInMemoryScrolling,
	withViewTransitions,
} from '@angular/router';
import { appRoutes } from './app.routes';

import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import localeEs from '@angular/common/locales/es-419';
import { registerLocaleData } from '@angular/common';

// Providers
import { ThemeService } from './providers/theme.service';

registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
	providers: [
		{ provide: APP_ID, useValue: 'serverApp' },
		{
			provide: APP_INITIALIZER,
			useFactory: (themeService: ThemeService) => () => themeService.addThemeColorTag(),
			deps: [ThemeService],
			multi: true,
		},
		{ provide: LOCALE_ID, useValue: 'es-419' },
		provideClientHydration(),
		provideRouter(
			appRoutes,
			withEnabledBlockingInitialNavigation(),
			withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
			withViewTransitions(),
		),
		provideHttpClient(withFetch()),
	],
};
