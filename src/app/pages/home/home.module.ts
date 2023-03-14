import { NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';

import { HomeComponent } from './home.component';
import { HomeRoutingModule } from './home-routing.module';
import { StoryCardModule } from '../../components/story-card/story-card.module';
import { StoryListCardDeckComponent } from '../../components/story-list-card-deck/story-list-card-deck.component';

@NgModule({
    declarations: [HomeComponent],
    imports: [CommonModule, HomeRoutingModule, StoryCardModule, NgOptimizedImage, StoryListCardDeckComponent],
})
export class HomeModule {}
