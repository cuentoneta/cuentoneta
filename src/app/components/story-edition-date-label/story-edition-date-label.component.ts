import { Component, Input } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';

@Component({
	selector: 'cuentoneta-story-edition-date-label[label]',
	templateUrl: './story-edition-date-label.component.html',
	styles: `
        :host {
            display: flex;
            justify-content: space-between;
        }
    `,
	standalone: true,
	imports: [CommonModule, NgIf],
})
export class StoryEditionDateLabelComponent {
	@Input() label: string | undefined;
	@Input() markAsNew: boolean = false;
}
