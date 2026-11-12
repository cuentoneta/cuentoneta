import type { ApplicationConfig } from '@angular/core';
import { mergeApplicationConfig } from '@angular/core';
import { appConfig } from './app.config';
import { withAppShell, provideServerRendering, withRoutes } from '@angular/ssr';
import { serverRoutes } from './app.routes.server';
import { App } from './app';

// TODO(#2656): volver al tope por defecto (1 MiB) cuando el listado de obras deje de acercarse a él.
// En bytes. Pasado el tope, el SSR descarta la respuesta de la API y la página sale con 503.
export const SSR_MAX_RESPONSE_BODY_SIZE = 4 * 1024 * 1024;

const serverConfig: ApplicationConfig = {
	providers: [
		provideServerRendering(
			{ maxResponseBodySize: SSR_MAX_RESPONSE_BODY_SIZE },
			withRoutes(serverRoutes),
			withAppShell(App),
		),
	],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
