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
    loadChildren: () =>
      import('./pages/home/home.module').then((m) => m.HomeModule),
  },
  {
    path: APP_ROUTE_TREE['STORY'],
    loadChildren: () =>
      import('./pages/story/story.module').then((m) => m.StoryModule),
  },
  {
    path: APP_ROUTE_TREE['STORYLIST'],
    loadChildren: () =>
      import('./pages/storylist/storylist.module').then(
        (m) => m.StorylistModule
      ),
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
export class AppRoutingModule {}
