// Core
import { Component, inject, input, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';

// Models
import { Resource } from '@models/resource.model';

// 3rd Party Modules
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

// Directives
import { TooltipDirective } from '../../directives/tooltip.directive';

@Component({
	selector: 'cuentoneta-resource',
	standalone: true,
	hostDirectives: [TooltipDirective],
	imports: [CommonModule, NgOptimizedImage, NgxSkeletonLoaderModule],
	template: `
		<a
			[href]="resource().url"
			target="_blank"
			class="flex h-12 w-12 items-center justify-center rounded-full border-1 border-solid border-gray-200 bg-gray-100 hover:bg-gray-200"
		>
			<!-- No utilizar ngSrc para este elemento de imagen, dado que se carga dinámicamente desde un campo en formato base64 -->
			<img
				[src]="resource().resourceType.icon.svg"
				[height]="24"
				[width]="24"
				[alt]="resource().resourceType.title"
				class="m-3 h-6 w-6"
			/>
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

	private tooltipDirective = inject(TooltipDirective);

	ngOnInit() {
		this.tooltipDirective.text.set(this.resource().title);
		this.tooltipDirective.position.set('bottom');
	}
}
