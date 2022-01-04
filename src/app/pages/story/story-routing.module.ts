import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { StoryPage } from './story';
import { StoryResolver } from './story.resolver';

const routes: Routes = [
    {
        path: ':day',
        component: StoryPage,
        resolve: {
            story: StoryResolver,
        },
    },
    // TODO: Issue #37 - La navegación a story debe ser en base al cuento del día actual
    {
        path: '**',
        redirectTo: '4',
        pathMatch: 'full',
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class StoryPageRoutingModule {}
