import { NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';

import { StoryRoutingModule } from './story-routing.module';
import { StoryComponent } from './story.component';
import { BioSummaryCardModule } from '../../components/bio-summary-card/bio-summary-card.module';
import { StoryNavigationBarModule } from '../../components/story-navigation-bar/story-navigation-bar.module';
import {NgxSkeletonLoaderModule} from "ngx-skeleton-loader";

@NgModule({
    declarations: [StoryComponent],
    imports: [CommonModule, StoryRoutingModule, NgOptimizedImage, BioSummaryCardModule, StoryNavigationBarModule, NgxSkeletonLoaderModule],
})
export class StoryModule {}
