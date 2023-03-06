import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeComponent } from './home.component';
import { HomeRoutingModule } from './home-routing.module';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { StoryCardModule } from '../../components/story-card/story-card.module';

@NgModule({
    declarations: [HomeComponent],
    imports: [CommonModule, HomeRoutingModule, NgxSkeletonLoaderModule, StoryCardModule],
})
export class HomeModule {}
