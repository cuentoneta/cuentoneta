import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { StoryPage } from './story';
import { StoryResolver } from './story.resolver';

const routes: Routes = [
    {
        path: ':day/:edition',
        component: StoryPage,
        resolve: {
            story: StoryResolver,
        },
    },
    // Si no se provee el día de la historia deseada, con el parámetro :day siendo null
    // el resolver se encarga de obtener la historia del último día vigente
    {
        path: '',
        component: StoryPage,
        resolve: {
            story: StoryResolver,
        },
    },
    {
        path: '**',
        redirectTo: '',
        pathMatch: 'full',
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class StoryPageRoutingModule {}
