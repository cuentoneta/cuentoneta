import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StoryListRoutingModule } from './story-list-routing.module';
import { StoryListComponent } from './story-list.component';
import {StoryListCardDeckComponent} from "../../components/story-list-card-deck/story-list-card-deck.component";

@NgModule({
    declarations: [StoryListComponent],
    imports: [CommonModule, StoryListRoutingModule, StoryListCardDeckComponent],
})
export class StoryListModule {}
