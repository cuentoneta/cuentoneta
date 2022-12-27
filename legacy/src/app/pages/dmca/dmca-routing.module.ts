import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DmcaPage } from './dmca';

const routes: Routes = [
    {
        path: '',
        component: DmcaPage,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class DmcaPageRoutingModule {}
