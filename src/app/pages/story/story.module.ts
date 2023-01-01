import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { StoryPage } from './story';
import { StoryPageRoutingModule } from './story-routing.module';

@NgModule({
    imports: [CommonModule, FormsModule, IonicModule, StoryPageRoutingModule],
    declarations: [StoryPage]
})
export class StoryModule {}
