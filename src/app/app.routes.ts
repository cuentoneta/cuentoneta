import { Routes } from '@angular/router';

export const AppRoutes = Object.freeze({
	Home: 'home',
	Story: 'story',
	Author: 'author',
	Authors: 'authors',
	About: 'about',
	Dmca: 'dmca',
	Collection: 'collection',
	LiteraryWork: 'literary-work',
	Read: 'read',
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
		loadComponent: () => import('./pages/author/author.page'),
	},
	{
		path: AppRoutes.Story,
		loadComponent: () => import('./pages/stories/stories.component'),
	},
	{
		path: `${AppRoutes.Story}/:slug`,
		loadComponent: () => import('./pages/story/story.component'),
	},
	{
		path: `${AppRoutes.Read}/:slug`,
		loadComponent: () => import('./pages/read/read.page'),
	},
	{
		path: `${AppRoutes.Collection}/:slug`,
		loadComponent: () => import('./pages/collection/collection.page'),
	},
	{
		path: AppRoutes.Collection,
		loadComponent: () => import('./pages/collections/collections.page'),
	},
	{
		path: AppRoutes.LiteraryWork,
		loadComponent: () => import('./pages/literary-works/literary-works.page'),
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
