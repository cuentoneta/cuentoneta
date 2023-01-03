import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { StoryPage } from './story';

const routes: Routes = [
    {
        path: ':day/:edition',
        component: StoryPage,
    },
    // Si no se provee el día de la historia deseada, con el parámetro :day siendo null
    // el resolver se encarga de obtener la historia del último día vigente
    {
        path: '',
        component: StoryPage,
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
