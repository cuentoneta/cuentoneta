import {
	APP_ID,
	ApplicationConfig,
	LOCALE_ID,
	inject,
	provideAppInitializer,
	provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { appRoutes } from './app.routes';

import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import localeEs from '@angular/common/locales/es-419';
import { DatePipe, registerLocaleData } from '@angular/common';

// Providers
import { ThemeService } from './providers/theme.service';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideA11yTooltip } from '@a11y-ngx/tooltip';

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
		provideAnimationsAsync(),
		provideRouter(appRoutes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }), withViewTransitions()),
		provideHttpClient(withFetch()),
		provideZonelessChangeDetection(),
		provideA11yTooltip({
			offsetSize: 10,
			safeSpace: { top: 65, left: 50 },
		}),
	],
};
