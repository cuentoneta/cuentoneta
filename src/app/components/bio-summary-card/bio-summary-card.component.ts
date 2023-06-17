import { Component, Input } from '@angular/core';
import { Author } from '../../models/author.model';
import { NgOptimizedImage, NgIf } from '@angular/common';

@Component({
    selector: 'cuentoneta-bio-summary-card[author]',
    templateUrl: './bio-summary-card.component.html',
    styleUrls: ['./bio-summary-card.component.scss'],
    standalone: true,
    imports: [NgOptimizedImage, NgIf],
})
export class BioSummaryCardComponent {
    // @ts-ignore
    @Input() author: Author;
    @Input() summary: string | undefined;
}
