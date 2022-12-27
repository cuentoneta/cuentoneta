import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { DmcaPage } from './dmca';
import { DmcaPageRoutingModule } from './dmca-routing.module';

@NgModule({
    imports: [CommonModule, FormsModule, IonicModule, DmcaPageRoutingModule],
    declarations: [DmcaPage],
    bootstrap: [DmcaPage],
})
export class DmcaModule {}
