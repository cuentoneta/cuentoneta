import { Component, input } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';

@Component({
	selector: 'cuentoneta-story-edition-date-label[label]',
	template: `
		@if (!!label) {
			<span class="max-sm:inter-body-xs-bold sm:inter-body-sm-bold flex items-center text-primary-500">
				<div class="mr-2 h-[12px] w-[2px] bg-primary-500"></div>
				{{ label() }}
			</span>
		}
		<!--ToDo: Extraer badge a nuevo componente-->
		@if (markAsNew()) {
			<div class="flex items-center rounded bg-primary-200">
				<p class="inter-body-xs-bold mx-4 my-1">NUEVO</p>
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
	label = input<string>();
	markAsNew = input<boolean>(false);
}
