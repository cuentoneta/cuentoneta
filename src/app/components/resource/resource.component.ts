import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Resource } from '@models/resource.model';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

// Directivas
import { TooltipDirective } from '../../directives/tooltip.directive';

@Component({
	selector: 'cuentoneta-resource',
	standalone: true,
	hostDirectives: [TooltipDirective],
	imports: [CommonModule, NgOptimizedImage, NgxSkeletonLoaderModule],
	template: `
		<a
			[href]="resource.url"
			target="_blank"
			class="bg-gray-100 border-1 border-solid border-gray-200 w-12 h-12 rounded-full flex items-center justify-center hover:bg-gray-200"
		>
			<!-- No utilizar ngSrc para este elemento de imagen, dado que se carga dinámicamente desde un campo en formato base64 -->
			<img
				[src]="resource.resourceType.icon?.svg ?? ''"
				[height]="24"
				[width]="24"
				[alt]="resource.resourceType.title"
				class="m-3 w-6 h-6"
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
	@Input({ required: true }) resource!: Resource;

	private tooltipDirective = inject(TooltipDirective);

	ngOnInit() {
		this.tooltipDirective.text = this.resource.title;
		this.tooltipDirective.position = 'bottom';
	}
}
