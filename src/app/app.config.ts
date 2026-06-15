import { APP_ID, ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withViewTransitions, withComponentInputBinding } from '@angular/router';
import { appRoutes } from './app.routes';

import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import localeEs from '@angular/common/locales/es-419';
import { DatePipe, registerLocaleData } from '@angular/common';

import { provideAnimations } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

// API providers (patrón provideX con makeEnvironmentProviders)
import { provideAuthor } from './providers/author.provider';
import { provideContent } from './providers/content.provider';
import { provideContributor } from './providers/contributor.provider';
import { provideStory } from './providers/story.provider';
import { provideStorylist } from './providers/storylist.provider';
import { providePushNotifications } from './providers/push-notifications.provider';

registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
	providers: [
		DatePipe,
		{ provide: APP_ID, useValue: 'serverApp' },
		{ provide: LOCALE_ID, useValue: 'es-419' },
		provideClientHydration(),
		provideAnimations(),
		provideAnimationsAsync(),
		provideRouter(
			appRoutes,
			withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
			withViewTransitions(),
			withComponentInputBinding(),
		),
		provideHttpClient(withFetch()),
		provideAuthor(),
		provideContent(),
		provideContributor(),
		provideStory(),
		provideStorylist(),
		providePushNotifications(),
	],
};
