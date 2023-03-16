import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StoryListRoutingModule } from './story-list-routing.module';
import { StoryListComponent } from './story-list.component';

@NgModule({
    declarations: [StoryListComponent],
    imports: [CommonModule, StoryListRoutingModule],
})
export class StoryListModule {}
