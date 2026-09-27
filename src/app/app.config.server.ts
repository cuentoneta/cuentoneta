import type { ApplicationConfig } from '@angular/core';
import { mergeApplicationConfig } from '@angular/core';
import { appConfig } from './app.config';
import { withAppShell, provideServerRendering, withRoutes } from '@angular/ssr';
import { serverRoutes } from './app.routes.server';
import { App } from './app';

const serverConfig: ApplicationConfig = {
	providers: [provideServerRendering(withRoutes(serverRoutes), withAppShell(App))],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
