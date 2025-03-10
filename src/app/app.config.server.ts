import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';
import { provideServerRoutesConfig, provideServerRouting, withAppShell } from '@angular/ssr';
import { serverRoutes } from './app.routes.server';
import { AppComponent } from './app.component';

const serverConfig: ApplicationConfig = {
	providers: [provideServerRendering(), provideServerRouting(serverRoutes, withAppShell(AppComponent))],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
