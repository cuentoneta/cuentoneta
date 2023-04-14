import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

export const APP_ROUTE_TREE: { [key: string]: string } = {
  HOME: 'home',
  STORY: 'story',
  STORYLIST: 'story-list',
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
      import('./pages/story-list/story-list.module').then(
        (m) => m.StoryListModule
      ),
  },
  // {
  //   path: 'about',
  //   loadChildren: () => import('./pages/about/about.module').then((m) => m.AboutModule),
  // },
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
