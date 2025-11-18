// Core
import {
	Component,
	computed,
	createEnvironmentInjector,
	EnvironmentInjector,
	inject,
	input,
	OnInit,
} from '@angular/core';

// Models
import { Resource } from '@models/resource.model';

// 3rd Party Modules
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

// Directives
import { iconMappers } from '@models/icon.model';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { NgComponentOutlet } from '@angular/common';
import { A11yTooltipModule, provideA11yTooltip } from '@a11y-ngx/tooltip';

@Component({
	selector: 'cuentoneta-resource',
	imports: [NgxSkeletonLoaderModule, NgComponentOutlet, A11yTooltipModule],
	providers: [
		provideA11yTooltip({
			offsetSize: 10,
			safeSpace: { top: 65, left: 50 },
		}),
	],
	template: `
		<a
			[tooltip]="resource().title"
			[href]="resource().url"
			[attr.title]="resource().title"
			target="_blank"
			class="flex h-12 w-12 items-center justify-center rounded-full border-1 border-solid border-gray-200 bg-gray-100 hover:bg-gray-200"
		>
			@if (icon(); as icon) {
				<ng-container *ngComponentOutlet="NgIcon; inputs: { name: icon.name, size: '22px' }; injector: icon.injector" />
			}
		</a>
	`,
	styles: `
		:host {
			@apply flex items-center justify-center;
		}
	`,
})
export class ResourceComponent {
	readonly resource = input.required<Resource>();
	readonly icon = computed(() => {
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

	readonly NgIcon = NgIcon;

	private injector = inject(EnvironmentInjector);
}
