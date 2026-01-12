import { Component, input } from '@angular/core';

@Component({
	selector: 'cuentoneta-story-edition-date-label[label]',
	template: `
		@if (!!label) {
			<span class="flex items-center font-inter text-sm font-bold text-brand-500">
				<div class="mr-2 h-[12px] w-[2px] bg-brand-500" data-testid="visual-indicator"></div>
				{{ label() }}
			</span>
		}
		<!--ToDo: Extraer badge a nuevo componente-->
		@if (markAsNew()) {
			<div class="flex items-center rounded bg-brand-200">
				<p class="mx-4 my-1 font-inter text-xs font-bold">NUEVO</p>
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
