import type { ServerRoute } from '@angular/ssr';
import { RenderMode } from '@angular/ssr';
import { AppRoutes } from './app.routes';

export const serverRoutes: Array<ServerRoute> = [
	{
		path: AppRoutes.Home,
		renderMode: RenderMode.Server,
	},
	{
		path: AppRoutes.Authors,
		renderMode: RenderMode.Prerender,
	},
	{
		path: AppRoutes.About,
		renderMode: RenderMode.Server,
	},
	{
		path: AppRoutes.Dmca,
		renderMode: RenderMode.Prerender,
	},
	{
		path: `${AppRoutes.Author}/:slug`,
		renderMode: RenderMode.Server,
	},
	{
		path: `${AppRoutes.LiteraryWork}/:slug`,
		renderMode: RenderMode.Server,
	},
	{
		path: `${AppRoutes.Collection}/:slug`,
		renderMode: RenderMode.Server,
	},
	{
		path: AppRoutes.Collection,
		renderMode: RenderMode.Server,
	},
	{
		path: AppRoutes.LiteraryWork,
		renderMode: RenderMode.Prerender,
	},
	{
		path: '**',
		renderMode: RenderMode.Prerender,
	},
];
