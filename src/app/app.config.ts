import { APP_ID, ApplicationConfig, LOCALE_ID, inject, provideAppInitializer } from '@angular/core';
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
import { DatePipe, registerLocaleData } from '@angular/common';

// Providers
import { ThemeService } from './providers/theme.service';
import { provideAnimations } from '@angular/platform-browser/animations';

registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
	providers: [
		DatePipe,
		{ provide: APP_ID, useValue: 'serverApp' },
		provideAppInitializer(() => {
			const initializerFn = (
				(themeService: ThemeService) => () =>
					themeService.addThemeColorTag()
			)(inject(ThemeService));
			return initializerFn();
		}),
		{ provide: LOCALE_ID, useValue: 'es-419' },
		provideClientHydration(),
		provideAnimations(),
		provideRouter(
			appRoutes,
			withEnabledBlockingInitialNavigation(),
			withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
			withViewTransitions(),
		),
		provideHttpClient(withFetch()),
	],
};
