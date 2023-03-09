import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StoryRoutingModule } from './story-routing.module';
import { StoryComponent } from './story.component';

@NgModule({
    declarations: [StoryComponent],
    imports: [CommonModule, StoryRoutingModule],
})
export class StoryModule {}
