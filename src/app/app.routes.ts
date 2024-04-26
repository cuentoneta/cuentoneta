import { Routes } from '@angular/router';

// Guards
import { redirectQueryParamsBasedStoryUrlsGuard } from './guards/redirect-query-params-based-story-urls.guard';
import { redirectQueryParamsBasedStorylistUrlsGuard } from './guards/redirect-query-params-based-storylist-urls.guard';

export const APP_ROUTE_TREE: { [key: string]: string } = {
	HOME: 'home',
	STORY: 'story',
	STORYLIST: 'storylist',
	AUTHOR: 'author',
};

export const appRoutes: Routes = [
	{
		path: APP_ROUTE_TREE['HOME'],
		loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
	},
	{
		path: `${APP_ROUTE_TREE['STORY']}/:slug/:list`,
		loadComponent: () => import('./pages/story/story.component').then((m) => m.StoryComponent),
	},
	{
		path: `${APP_ROUTE_TREE['STORY']}`, // Ruta definida por cuestiones de retrocompatibilidad. Redirecciona de '/story' con queryParams a params
		loadComponent: () => import('./pages/story/story.component').then((m) => m.StoryComponent),
		canActivate: [redirectQueryParamsBasedStoryUrlsGuard],
	},
	{
		path: `${APP_ROUTE_TREE['STORYLIST']}/:slug`,
		loadComponent: () => import('./pages/storylist/storylist.component').then((m) => m.StorylistComponent),
	},
	{
		path: `${APP_ROUTE_TREE['STORYLIST']}`,
		loadComponent: () => import('./pages/storylist/storylist.component').then((m) => m.StorylistComponent),
		canActivate: [redirectQueryParamsBasedStorylistUrlsGuard],
	},
	{
		path: `${APP_ROUTE_TREE['AUTHOR']}/:slug`,
		loadComponent: () => import('./pages/author/author.component').then((c) => c.AuthorComponent),
	},
	{
		path: 'about',
		loadComponent: () => import('./pages/about/about.component').then((m) => m.AboutComponent),
	},
	{
		path: 'dmca',
		loadComponent: () => import('./pages/dmca/dmca.component').then((m) => m.DmcaComponent),
	},
	{
		path: '',
		redirectTo: 'home',
		pathMatch: 'full',
	},
];
