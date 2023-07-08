import { Routes } from '@angular/router';

export const APP_ROUTE_TREE: { [key: string]: string } = {
    HOME: 'home',
    STORY: 'story',
    STORYLIST: 'storylist',
    'STORY-LIST': 'story-list', // Ruta definida por cuestiones de retrocompatibilidad. Redirecciona a /storylist - RO | 2023-06-21
};

export const appRoutes: Routes = [
    {
        path: APP_ROUTE_TREE['HOME'],
        loadComponent: () =>
            import('./pages/home/home.component').then((m) => m.HomeComponent),
    },
    {
        path: APP_ROUTE_TREE['STORY'],
        loadComponent: () =>
            import('./pages/story/story.component').then((m) => m.StoryComponent),
    },
    {
        path: APP_ROUTE_TREE['STORYLIST'],
        loadComponent: () =>
            import('./pages/storylist/storylist.component').then((m) => m.StorylistComponent),
    },
    {
        path: APP_ROUTE_TREE['STORY-LIST'],
        redirectTo: APP_ROUTE_TREE['STORYLIST'],
    },
    {
        path: 'about',
        loadComponent: () =>
            import('./pages/about/about.component').then((m) => m.AboutComponent),
    },
    {
        path: 'dmca',
        loadComponent: () =>
            import('./pages/dmca/dmca.component').then((m) => m.DmcaComponent),
    },
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
    },
];
