import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

export const APP_ROUTE_TREE: { [key: string]: string } = {
  HOME: 'home',
  STORY: 'story',
  STORYLIST: 'storylist',
  'STORY-LIST': 'story-list', // Ruta definida por cuestiones de retrocompatibilidad. Redirecciona a /storylist - RO | 2023-06-21
};

const routes: Routes = [
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
  // {
  //   path: 'dmca',
  //   loadChildren: () => import('./pages/dmca/dmca.module').then((m) => m.DmcaModule),
  // },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      onSameUrlNavigation: 'reload',
      scrollPositionRestoration: 'enabled',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule { }
