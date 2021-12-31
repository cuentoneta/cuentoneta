import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

const routes: Routes = [
  {
    path: "story",
    loadChildren: () =>
      import("./pages/schedule/schedule.module").then((m) => m.ScheduleModule),
  },
  {
    path: "list",
    loadChildren: () =>
      import("./pages/list/list.module").then((m) => m.ListModule),
  },
  {
    path: "about",
    loadChildren: () =>
      import("./pages/about/about.module").then((m) => m.AboutModule),
  },
  {
    path: '',
    redirectTo: 'story/1',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
