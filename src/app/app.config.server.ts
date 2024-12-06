import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';
import { provideServerRoutesConfig, RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: Array<ServerRoute> = [
	{
		path: '',
		renderMode: RenderMode.Server,
	},
	{
		path: 'home',
		renderMode: RenderMode.Server,
	},
	{
		path: 'about',
		renderMode: RenderMode.Prerender,
	},
	{
		path: 'dmca',
		renderMode: RenderMode.Prerender,
	},
	{
		path: 'author/:slug',
		renderMode: RenderMode.Server,
	},
	{
		path: 'story',
		renderMode: RenderMode.Server,
	},
	{
		path: 'story/:slug',
		renderMode: RenderMode.Server,
	},
	{
		path: 'story/:slug/:list',
		renderMode: RenderMode.Server,
	},
	{
		path: 'storylist',
		renderMode: RenderMode.Server,
	},
	{
		path: 'storylist/:slug',
		renderMode: RenderMode.Server,
	},
];

const serverConfig: ApplicationConfig = {
	providers: [provideServerRendering(), provideServerRoutesConfig(serverRoutes)],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
