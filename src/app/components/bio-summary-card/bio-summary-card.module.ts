import { NgModule } from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import { BioSummaryCardComponent } from './bio-summary-card.component';

@NgModule({
    imports: [CommonModule, NgOptimizedImage, BioSummaryCardComponent],
    exports: [BioSummaryCardComponent],
})
export class BioSummaryCardModule {}
