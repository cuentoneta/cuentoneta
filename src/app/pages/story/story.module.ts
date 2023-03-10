import { NgModule } from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';

import { StoryRoutingModule } from './story-routing.module';
import { StoryComponent } from './story.component';

@NgModule({
    declarations: [StoryComponent],
    imports: [CommonModule, StoryRoutingModule, NgOptimizedImage],
})
export class StoryModule {}
