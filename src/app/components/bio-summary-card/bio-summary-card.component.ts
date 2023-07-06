// Core
import { Component, Input } from '@angular/core';
import { NgOptimizedImage, NgIf, CommonModule } from '@angular/common';

// Modelos
import { Story } from '@models/story.model';

@Component({
    selector: 'cuentoneta-bio-summary-card',
    templateUrl: './bio-summary-card.component.html',
    styleUrls: ['./bio-summary-card.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        NgOptimizedImage,
        NgIf
    ],
})
export class BioSummaryCardComponent {
    @Input({required: true}) story!: Story;
}
