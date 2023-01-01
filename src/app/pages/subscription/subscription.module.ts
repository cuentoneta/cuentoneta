import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SubscriptionPageRoutingModule } from './subscription-routing.module';
import { SubscriptionPage } from './subscription';

@NgModule({
    imports: [CommonModule, IonicModule, SubscriptionPageRoutingModule],
    declarations: [SubscriptionPage]
})
export class SubscriptionModule {}
