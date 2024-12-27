// Core
import { Component, computed, inject, input, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';

// Models
import { Resource } from '@models/resource.model';

// 3rd Party Modules
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

// Directives
import { TooltipDirective } from '../../directives/tooltip.directive';

@Component({
	selector: 'cuentoneta-resource',
	hostDirectives: [TooltipDirective],
	imports: [CommonModule, NgOptimizedImage, NgxSkeletonLoaderModule],
	template: `
		<a
			[href]="resource().url"
			target="_blank"
			class="flex h-12 w-12 items-center justify-center rounded-full border-1 border-solid border-gray-200 bg-gray-100 hover:bg-gray-200"
		>
			<img [ngSrc]="iconUrl()" [height]="24" [width]="24" [alt]="resource().resourceType.title" class="m-3 h-6 w-6" />
		</a>
	`,
	styles: `
		:host {
			@apply flex items-center justify-center;
		}
	`,
})
export class ResourceComponent implements OnInit {
	resource = input.required<Resource>();
	iconUrl = computed(() => {
		if (!this.resource().resourceType.icon.name) {
			return '';
		}

		return `assets/icons/resources/${this.resource().resourceType.icon.name}.svg`;
	});

	private tooltipDirective = inject(TooltipDirective);

	ngOnInit() {
		this.tooltipDirective.text.set(this.resource().title);
		this.tooltipDirective.position.set('bottom');
	}
}
