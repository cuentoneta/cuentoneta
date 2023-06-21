import { NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';

import { HomeComponent } from './home.component';
import { HomeRoutingModule } from './home-routing.module';
import { StorylistCardDeckComponent } from '../../components/story-list-card-deck/storylist-card-deck.component';
import { StoryCardComponent } from 'src/app/components/story-card/story-card.component';

@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    HomeRoutingModule,
    NgOptimizedImage,
    StoryCardComponent,
    StorylistCardDeckComponent,
  ],
})
export class HomeModule {}
