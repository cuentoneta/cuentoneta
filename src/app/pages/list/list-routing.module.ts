import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ListPage } from "./list";

const routes: Routes = [
  {
    path: "",
    component: ListPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListPageRoutingModule {}
