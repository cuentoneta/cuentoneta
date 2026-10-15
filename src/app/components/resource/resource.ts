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
import type { Resource as ResourceModel } from '@models/resource.model';

// Directives
import { Tooltip } from '../../directives/tooltip.directive';
import { iconMappers } from '@app-models/icon.model';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { NgComponentOutlet } from '@angular/common';

/** Tamaños del enlace (Design System v3): md=48px, sm=40px. */
export type ResourceSize = 'md' | 'sm';

@Component({
	selector: 'cuentoneta-resource',
	hostDirectives: [Tooltip],
	imports: [NgComponentOutlet],
	template: `
		<a
			[href]="resource().url"
			[attr.title]="resource().title"
			[class]="linkClasses()"
			target="_blank"
			rel="noopener noreferrer"
		>
			@if (icon(); as icon) {
				<ng-container
					*ngComponentOutlet="NgIcon; inputs: { name: icon.name, size: iconSize() }; injector: icon.injector"
				/>
			}
		</a>
	`,
	host: {
		class: 'flex items-center justify-center',
	},
})
export class Resource {
	public readonly resource = input.required<ResourceModel>();

	public readonly size = input<ResourceSize>('md');

	private readonly sizeMap: Record<ResourceSize, { circle: string; icon: string }> = {
		md: { circle: 'h-12 w-12', icon: '22px' },
		sm: { circle: 'h-10 w-10', icon: '18px' },
	};

	private readonly iconSize = computed(() => this.sizeMap[this.size()].icon);

	private readonly linkClasses = computed(
		() =>
			`flex ${this.sizeMap[this.size()].circle} items-center justify-center rounded-full border-1 border-solid border-neutral-200 bg-neutral-100 hover:bg-neutral-200`,
	);

	private readonly icon = computed(() => {
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

	private readonly NgIcon = NgIcon;

	private readonly injector = inject(EnvironmentInjector);
	private readonly tooltipDirective = inject(Tooltip);

	private readonly syncTooltipEffect = effect(() => {
		this.tooltipDirective.text.set(this.resource().title);
		this.tooltipDirective.position.set('bottom');
	});
}
