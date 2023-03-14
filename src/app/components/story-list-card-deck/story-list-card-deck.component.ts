import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoryCardModule } from '../story-card/story-card.module';
import { RouterLink } from '@angular/router';
import { StoryList } from '../../models/storylist.model';

@Component({
    selector: 'cuentoneta-story-list-card-deck',
    standalone: true,
    imports: [CommonModule, StoryCardModule, RouterLink],
    templateUrl: './story-list-card-deck.component.html',
    styleUrls: ['./story-list-card-deck.component.scss'],
})
export class StoryListCardDeckComponent {
    @Input() storylist: StoryList | undefined;
    @Input() highlightFirstRow: boolean = false;
    @Input() displayTitle: boolean = true;
}
