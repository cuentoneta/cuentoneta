import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
        path: 'story',
        loadChildren: () => import('./pages/story/story.module').then((m) => m.StoryModule),
    },
    {
        path: 'list',
        loadChildren: () => import('./pages/list/list.module').then((m) => m.ListModule),
    },
    {
        path: 'about',
        loadChildren: () => import('./pages/about/about.module').then((m) => m.AboutModule),
    },
    {
        path: 'dmca',
        loadChildren: () => import('./pages/dmca/dmca.module').then((m) => m.DmcaModule),
    },
    {
        path: '',
        redirectTo: 'story',
        pathMatch: 'full',
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
