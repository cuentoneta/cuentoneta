import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SchedulePage } from './schedule';

const routes: Routes = [
  {
    path: ':day',
    component: SchedulePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SchedulePageRoutingModule { }
