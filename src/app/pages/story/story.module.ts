import { NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';

import { StoryRoutingModule } from './story-routing.module';
import { StoryComponent } from './story.component';
import { BioSummaryCardModule } from '../../components/bio-summary-card/bio-summary-card.module';

@NgModule({
    declarations: [StoryComponent],
    imports: [CommonModule, StoryRoutingModule, NgOptimizedImage, BioSummaryCardModule],
})
export class StoryModule {}
