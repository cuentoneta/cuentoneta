import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { StoryPage } from "./story";
import { StoryResolver } from "./story.resolver";

const routes: Routes = [
  {
    path: ":day",
    component: StoryPage,
    resolve: {
      story: StoryResolver,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StoryPageRoutingModule {}
