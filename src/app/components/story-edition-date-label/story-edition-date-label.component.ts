import { Component, Input } from '@angular/core';
import { Story } from '../../models/story.model';

@Component({
    selector: 'cuentoneta-story-edition-date-label[story]',
    templateUrl: './story-edition-date-label.component.html',
    styleUrls: ['./story-edition-date-label.component.scss'],
})
export class StoryEditionDateLabelComponent {
    @Input() story: Story | undefined;
    @Input() markAsNew: boolean = false;
}
