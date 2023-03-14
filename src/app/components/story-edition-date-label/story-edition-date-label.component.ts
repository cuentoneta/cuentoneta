import { Component, Input } from '@angular/core';
import { Story } from '../../models/story.model';

@Component({
    selector: 'cuentoneta-story-edition-date-label[label]',
    templateUrl: './story-edition-date-label.component.html',
    styleUrls: ['./story-edition-date-label.component.scss'],
})
export class StoryEditionDateLabelComponent {
    @Input() label: string | undefined;
    @Input() markAsNew: boolean = false;
}
