import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { appConfig } from './app.config';
import { provideServerRouting, withAppShell, provideServerRendering } from '@angular/ssr';
import { serverRoutes } from './app.routes.server';
import { AppComponent } from './app.component';

const serverConfig: ApplicationConfig = {
	providers: [provideServerRendering(), provideServerRouting(serverRoutes, withAppShell(AppComponent))],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
