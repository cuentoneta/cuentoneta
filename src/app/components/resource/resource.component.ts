// Core
import { Component, computed, inject, input, OnInit } from '@angular/core';

// Models
import { Resource } from '@models/resource.model';

// 3rd Party Modules
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

// Directives
import { TooltipDirective } from '../../directives/tooltip.directive';
import { iconMappers } from '@models/icon.model';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidAddressBook, faSolidEnvelope, faSolidGlobe, faSolidMedal } from '@ng-icons/font-awesome/solid';
import {
	simpleBlogger,
	simpleDiscord,
	simpleSubstack,
	simpleWattpad,
	simpleWikisource,
	simpleX,
	simpleYoutube,
} from '@ng-icons/simple-icons';
import { faBrandAmazon, faBrandInstagram, faBrandWikipediaW } from '@ng-icons/font-awesome/brands';

@Component({
	selector: 'cuentoneta-resource',
	hostDirectives: [TooltipDirective],
	imports: [NgIcon, NgxSkeletonLoaderModule, NgIcon],
	providers: [
		provideIcons({
			faBrandAmazon,
			faBrandInstagram,
			faBrandWikipediaW,
			faSolidAddressBook,
			faSolidEnvelope,
			faSolidGlobe,
			faSolidMedal,
			simpleBlogger,
			simpleDiscord,
			simpleSubstack,
			simpleWattpad,
			simpleWikisource,
			simpleYoutube,
			simpleX,
		}),
	],
	template: `
		<a
			[href]="resource().url"
			target="_blank"
			class="flex h-12 w-12 items-center justify-center rounded-full border-1 border-solid border-gray-200 bg-gray-100 hover:bg-gray-200"
		>
			@if (iconName(); as iconName) {
				<ng-icon [name]="iconName" size="22px" />
			}
		</a>
	`,
	styles: `
		:host {
			@apply flex items-center justify-center;
		}
	`,
})
export class ResourceComponent implements OnInit {
	readonly resource = input.required<Resource>();
	readonly iconName = computed(() => {
		if (!this.resource().resourceType.slug) {
			return '';
		}
		return iconMappers.find((resource) => resource.name === this.resource().resourceType.slug)?.ngIconsName ?? '';
	});

	private tooltipDirective = inject(TooltipDirective);

	ngOnInit() {
		this.tooltipDirective.text.set(this.resource().title);
		this.tooltipDirective.position.set('bottom');
	}
}
