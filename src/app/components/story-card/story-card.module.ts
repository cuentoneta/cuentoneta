import { NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common'
import { StoryCardComponent } from './story-card.component';
import {NgxSkeletonLoaderModule} from "ngx-skeleton-loader";

@NgModule({
    declarations: [StoryCardComponent],
    exports: [StoryCardComponent],
    imports: [CommonModule, NgOptimizedImage, NgxSkeletonLoaderModule],
})
export class StoryCardModule {}
