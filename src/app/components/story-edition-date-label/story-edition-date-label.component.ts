import { Component, input } from '@angular/core';

@Component({
	selector: 'cuentoneta-story-edition-date-label[label]',
	template: `
		@if (!!label) {
			<span class="inter-body-sm-bold flex items-center text-brand-500">
				<div class="mr-2 h-[12px] w-[2px] bg-brand-500" data-testid="visual-indicator"></div>
				{{ label() }}
			</span>
		}
		<!--ToDo: Extraer badge a nuevo componente-->
		@if (markAsNew()) {
			<div class="flex items-center rounded bg-brand-200">
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
})
export class StoryEditionDateLabelComponent {
	readonly label = input<string>();
	readonly markAsNew = input<boolean>(false);
}
