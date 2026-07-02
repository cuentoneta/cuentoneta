import { Routes } from '@angular/router';

import { storyResolver } from './pages/story/story.resolver';

export const AppRoutes = Object.freeze({
	Home: 'home',
	Story: 'story',
	StoryList: 'storylist',
	Author: 'author',
	Authors: 'authors',
	About: 'about',
	Dmca: 'dmca',
} as const);
export type AppRoutes = (typeof AppRoutes)[keyof typeof AppRoutes];

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
		path: AppRoutes.Story,
		loadComponent: () => import('./pages/stories/stories.component'),
	},
	{
		path: `${AppRoutes.Story}/:slug`,
		loadComponent: () => import('./pages/story/story.component'),
		resolve: { story: storyResolver },
	},
	{
		path: `${AppRoutes.StoryList}/:slug`,
		loadComponent: () => import('./pages/storylist/storylist.component'),
	},
	{
		path: `${AppRoutes.StoryList}`,
		loadComponent: () => import('./pages/storylist/storylist.component'),
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
