// Core
import {
	Component,
	computed,
	createEnvironmentInjector,
	effect,
	EnvironmentInjector,
	inject,
	input,
} from '@angular/core';

// Models
import { Resource } from '@models/resource.model';

// Directives
import { TooltipDirective } from '../../directives/tooltip.directive';
import { iconMappers } from '@models/icon.model';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { NgComponentOutlet } from '@angular/common';

@Component({
	selector: 'cuentoneta-resource',
	hostDirectives: [TooltipDirective],
	imports: [NgComponentOutlet],
	template: `
		<a
			[href]="resource().url"
			[attr.title]="resource().title"
			target="_blank"
			class="flex h-12 w-12 items-center justify-center rounded-full border-1 border-solid border-neutral-200 bg-neutral-100 hover:bg-neutral-200"
		>
			@if (icon(); as icon) {
				<ng-container *ngComponentOutlet="NgIcon; inputs: { name: icon.name, size: '22px' }; injector: icon.injector" />
			}
		</a>
	`,
	host: {
		class: 'flex items-center justify-center',
	},
})
export class ResourceComponent {
	public readonly resource = input.required<Resource>();
	protected readonly icon = computed(() => {
		if (!this.resource()?.resourceType?.slug) {
			return null;
		}
		const foundIcon = iconMappers.find((iconMap) => iconMap.name === this.resource().resourceType.slug)?.ngIconsName;
		if (!foundIcon) {
			return null;
		}

		return {
			name: Object.keys(foundIcon)[0],
			injector: createEnvironmentInjector([provideIcons(foundIcon)], this.injector),
		};
	});

	protected readonly NgIcon = NgIcon;

	private injector = inject(EnvironmentInjector);
	private tooltipDirective = inject(TooltipDirective);

	private readonly syncTooltipEffect = effect(() => {
		this.tooltipDirective.text.set(this.resource().title);
		this.tooltipDirective.position.set('bottom');
	});
}
