import { Routes } from '@angular/router';

// Guards
import { redirectQueryParamsBasedStoryUrlsGuard } from './guards/redirect-query-params-based-story-urls.guard';
import { redirectQueryParamsBasedStorylistUrlsGuard } from './guards/redirect-query-params-based-storylist-urls.guard';
import { redirectParamsForStorylistInStoryRouteGuard } from './guards/redirect-params-for-storylist-in-story-route.guard';

export enum AppRoutes {
	Home = 'home',
	Story = 'story',
	StoryList = 'storylist',
	Author = 'author',
	Authors = 'authors',
	About = 'about',
	Dmca = 'dmca',
}

export const appRoutes: Routes = [
	{
		path: AppRoutes.Home,
		loadComponent: () => import('./pages/home/home.component'),
	},
	{
		path: AppRoutes.Authors,
		loadComponent: () => import('./pages/authors/authors.component'),
	},
	{
		path: `${AppRoutes.Author}/:slug`,
		loadComponent: () => import('./pages/author/author.component'),
	},
	{
		path: `${AppRoutes.Story}/:slug`,
		loadComponent: () => import('./pages/story/story.component'),
	},
	{
		path: `${AppRoutes.Story}/:slug/:list`,
		loadComponent: () => import('./pages/story/story.component'),
		canActivate: [redirectParamsForStorylistInStoryRouteGuard],
	},
	{
		path: `${AppRoutes.Story}`, // Ruta definida por cuestiones de retrocompatibilidad. Redirecciona de '/story' con queryParams a params
		loadComponent: () => import('./pages/story/story.component'),
		canActivate: [redirectQueryParamsBasedStoryUrlsGuard],
	},
	{
		path: `${AppRoutes.StoryList}/:slug`,
		loadComponent: () => import('./pages/storylist/storylist.component'),
	},
	{
		path: `${AppRoutes.StoryList}`,
		loadComponent: () => import('./pages/storylist/storylist.component'),
		canActivate: [redirectQueryParamsBasedStorylistUrlsGuard],
	},
	{
		path: AppRoutes.About,
		loadComponent: () => import('./pages/about/about.component'),
	},
	{
		path: AppRoutes.Dmca,
		loadComponent: () => import('./pages/dmca/dmca.component'),
	},
	{
		path: '',
		redirectTo: AppRoutes.Home,
		pathMatch: 'full',
	},
];
