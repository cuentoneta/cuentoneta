import { Component, Input } from '@angular/core';
import { Story } from '../../models/story.model';

@Component({
    selector: 'cuentoneta-story-card',
    templateUrl: './story-card.component.html',
    styleUrls: ['./story-card.component.scss'],
})
export class StoryCardComponent {
    @Input() editionPrefix: string | undefined;
    @Input() story: Story | undefined;
}
