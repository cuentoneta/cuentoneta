import { Component, Input } from '@angular/core';
import { Story } from '../../models/story.model';
import { NgIf } from '@angular/common';

@Component({
    selector: 'cuentoneta-story-edition-date-label[label]',
    templateUrl: './story-edition-date-label.component.html',
    styleUrls: ['./story-edition-date-label.component.scss'],
    standalone: true,
    imports: [NgIf],
})
export class StoryEditionDateLabelComponent {
    @Input() label: string | undefined;
    @Input() markAsNew: boolean = false;
}
