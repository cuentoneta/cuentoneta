import { RenderMode, ServerRoute } from '@angular/ssr';
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
		path: AppRoutes.Story,
		renderMode: RenderMode.Prerender,
	},
	{
		path: `${AppRoutes.Story}/:slug`,
		renderMode: RenderMode.Server,
	},
	{
		path: `${AppRoutes.StoryList}`,
		renderMode: RenderMode.Server,
	},
	{
		path: `${AppRoutes.StoryList}/:slug`,
		renderMode: RenderMode.Server,
	},
	{
		path: '**',
		renderMode: RenderMode.Prerender,
	},
];
