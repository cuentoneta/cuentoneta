import { Routes } from '@angular/router';

// Guards
import { redirectQueryParamsBasedStoryUrlsGuard } from './guards/redirect-query-params-based-story-urls.guard';
import { redirectQueryParamsBasedStorylistUrlsGuard } from './guards/redirect-query-params-based-storylist-urls.guard';

export enum AppRoutes {
	Home = 'home',
	Story = 'story',
	StoryList = 'storylist',
	About = 'about',
	Dmca = 'dmca',
}

export const appRoutes: Routes = [
	{
		path: AppRoutes.Home,
		loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
	},
	{
		path: `${AppRoutes.Story}/:slug/:list`,
		loadComponent: () => import('./pages/story/story.component').then((m) => m.StoryComponent),
	},
	{
		path: `${AppRoutes.Story}`, // Ruta definida por cuestiones de retrocompatibilidad. Redirecciona de '/story' con queryParams a params
		loadComponent: () => import('./pages/story/story.component').then((m) => m.StoryComponent),
		canActivate: [redirectQueryParamsBasedStoryUrlsGuard],
	},
	{
		path: `${AppRoutes.StoryList}/:slug`,
		loadComponent: () => import('./pages/storylist/storylist.component').then((m) => m.StorylistComponent),
	},
	{
		path: `${AppRoutes.StoryList}`,
		loadComponent: () => import('./pages/storylist/storylist.component').then((m) => m.StorylistComponent),
		canActivate: [redirectQueryParamsBasedStorylistUrlsGuard],
	},
	{
		path: AppRoutes.About,
		loadComponent: () => import('./pages/about/about.component').then((m) => m.AboutComponent),
	},
	{
		path: AppRoutes.Dmca,
		loadComponent: () => import('./pages/dmca/dmca.component').then((m) => m.DmcaComponent),
	},
	{
		path: '',
		redirectTo: AppRoutes.Home,
		pathMatch: 'full',
	},
];
