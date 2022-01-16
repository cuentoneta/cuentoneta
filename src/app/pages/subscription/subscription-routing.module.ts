import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SubscriptionPage } from './subscription';

const routes: Routes = [
    {
        path: '',
        component: SubscriptionPage,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class SubscriptionPageRoutingModule {}
