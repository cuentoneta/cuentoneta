import { Component, Input } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';

@Component({
	selector: 'cuentoneta-story-edition-date-label[label]',
	template: `
		@if (!!label) {
			<span class="flex items-center text-primary-500 max-sm:inter-body-xs-bold sm:inter-body-sm-bold">
				<div class="bg-primary-500 mr-2 h-[12px] w-[2px]"></div>
				{{ label }}
			</span>
		}
		<!--ToDo: Extraer badge a nuevo componente-->
		@if (markAsNew) {
			<div class="flex items-center bg-primary-200 rounded">
				<label class="inter-body-xs-bold my-1 mx-4">NUEVO</label>
			</div>
		}
	`,
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
