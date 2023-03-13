import { Component, Input } from '@angular/core';
import { Author } from '../../models/author.model';

@Component({
    selector: 'cuentoneta-bio-summary-card[author]',
    templateUrl: './bio-summary-card.component.html',
    styleUrls: ['./bio-summary-card.component.scss'],
})
export class BioSummaryCardComponent {
    // @ts-ignore
    @Input() author: Author;
    @Input() summary: string | undefined;
}
