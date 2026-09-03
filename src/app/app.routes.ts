import type { Routes } from '@angular/router';

export const AppRoutes = Object.freeze({
	Home: 'home',
	Author: 'author',
	Authors: 'authors',
	About: 'about',
	Dmca: 'dmca',
	Collection: 'collection',
	LiteraryWork: 'literary-work',
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
		path: `${AppRoutes.LiteraryWork}/:slug`,
		loadComponent: () => import('./pages/literary-work/literary-work.page'),
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
