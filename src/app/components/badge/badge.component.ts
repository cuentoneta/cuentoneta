import {
	Component,
	computed,
	createEnvironmentInjector,
	EnvironmentInjector,
	inject,
	input,
	OnInit,
} from '@angular/core';
import { Tag } from '@models/tag.model';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { iconMappers } from '@models/icon.model';
import { NgComponentOutlet } from '@angular/common';

@Component({
	selector: 'cuentoneta-badge',
	imports: [NgComponentOutlet],
	template: `
		<span class="inter-body-xs-bold flex items-center gap-1">
			@if (showIcon() && icon(); as icon) {
				<ng-container *ngComponentOutlet="NgIcon; inputs: { name: icon.name }; injector: icon.injector" />
			}
			{{ tag().title }}
		</span>
	`,
	styles: `
		:host {
			@apply flex rounded bg-primary-200 px-4.5 py-0.5 uppercase hover:cursor-default;
		}
	`,
})
export class BadgeComponent {
	readonly tag = input.required<Tag>();
	readonly showIcon = input(false);
	readonly icon = computed(() => {
		if (!this.tag().slug) {
			return null;
		}

		const foundIcon = iconMappers.find((tag) => tag.name === this.tag().slug)?.ngIconsName;

		if (!foundIcon) {
			return null;
		}

		return {
			name: Object.keys(foundIcon)[0],
			injector: createEnvironmentInjector([provideIcons(foundIcon)], this.injector),
		};
	});

	readonly NgIcon = NgIcon;

	private injector = inject(EnvironmentInjector);
}
