import {
	Component,
	computed,
	createEnvironmentInjector,
	effect,
	EnvironmentInjector,
	inject,
	input,
} from '@angular/core';
import { Tag } from '@models/tag.model';
import { TooltipDirective } from '../../directives/tooltip.directive';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { iconMappers } from '@models/icon.model';
import { NgComponentOutlet } from '@angular/common';

@Component({
	selector: 'cuentoneta-badge',
	hostDirectives: [TooltipDirective],
	imports: [NgComponentOutlet],
	template: `
		<span class="flex items-center gap-1 font-inter text-xs font-bold">
			@if (showIcon() && icon(); as icon) {
				<ng-container *ngComponentOutlet="NgIcon; inputs: { name: icon.name }; injector: icon.injector" />
			}
			{{ tag().title }}
		</span>
	`,
	host: {
		class: 'flex rounded bg-brand-200 px-4.5 py-0.5 uppercase hover:cursor-default',
	},
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
	private tooltipDirective = inject(TooltipDirective);

	private readonly syncTooltipEffect = effect(() => {
		this.tooltipDirective.text.set(this.tag().shortDescription);
		this.tooltipDirective.position.set('top');
	});
}
