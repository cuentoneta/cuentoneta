import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: Array<ServerRoute> = [
	{
		path: 'home',
		renderMode: RenderMode.Prerender,
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
	{
		path: '**',
		renderMode: RenderMode.Prerender,
	},
];
