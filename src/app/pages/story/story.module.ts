import { NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';

import { StoryRoutingModule } from './story-routing.module';
import { StoryComponent } from './story.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ShareContentComponent } from '../../components/share-content/share-content.component';
import { BioSummaryCardComponent } from 'src/app/components/bio-summary-card/bio-summary-card.component';
import { StoryNavigationBarComponent } from 'src/app/components/story-navigation-bar/story-navigation-bar.component';

@NgModule({
  declarations: [StoryComponent],
  imports: [
    CommonModule,
    StoryRoutingModule,
    NgOptimizedImage,
    NgxSkeletonLoaderModule,
    StoryNavigationBarComponent,
    BioSummaryCardComponent,
    ShareContentComponent,
  ],
})
export class StoryModule { }
