import { NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { StoryCardComponent } from './story-card.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { StoryEditionDateLabelModule } from '../story-edition-date-label/story-edition-date-label.module';
import { StoryCardSkeletonComponent } from '../story-card-skeleton/story-card-skeleton.component';

@NgModule({
    exports: [StoryCardComponent],
    imports: [CommonModule, NgOptimizedImage, NgxSkeletonLoaderModule, StoryEditionDateLabelModule, StoryCardSkeletonComponent, StoryCardComponent],
})
export class StoryCardModule {}
