import { NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';

import { HomeComponent } from './home.component';
import { HomeRoutingModule } from './home-routing.module';
import { StoryListCardDeckComponent } from '../../components/story-list-card-deck/story-list-card-deck.component';
import { StoryCardComponent } from 'src/app/components/story-card/story-card.component';

@NgModule({
    declarations: [HomeComponent],
    imports: [
        CommonModule, 
        HomeRoutingModule, 
        NgOptimizedImage, 
        StoryCardComponent, 
        StoryListCardDeckComponent],
})
export class HomeModule { }
