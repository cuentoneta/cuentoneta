import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { ListPage } from "./list";
import { ListPageRoutingModule } from "./list-routing.module";

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, ListPageRoutingModule],
  declarations: [ListPage],
  entryComponents: [],
})
export class ListModule {}
