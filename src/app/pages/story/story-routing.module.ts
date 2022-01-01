import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { StoryPage } from './story';

const routes: Routes = [
  {
    path: ':day',
    component: StoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StoryPageRoutingModule { }
