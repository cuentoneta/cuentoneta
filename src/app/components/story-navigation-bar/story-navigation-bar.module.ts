import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoryNavigationBarComponent } from './story-navigation-bar.component';
import { RouterLink } from '@angular/router';
import { StoryEditionDateLabelModule } from '../story-edition-date-label/story-edition-date-label.module';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@NgModule({
    declarations: [StoryNavigationBarComponent],
    imports: [CommonModule, RouterLink, StoryEditionDateLabelModule, NgxSkeletonLoaderModule],
    exports: [StoryNavigationBarComponent],
})
export class StoryNavigationBarModule {}
