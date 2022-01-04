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
    // TODO: Issue #37 - La navegación a story debe ser en base al cuento del día actual

    {
        path: '',
        redirectTo: 'story/4',
        pathMatch: 'full',
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
