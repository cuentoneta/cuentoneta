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
		<a [href]="resource.url" target="_blank" class="flex items-center justify-center">
			<img
				[src]="resource.resourceType.icon?.svg ?? ''"
				[height]="24"
				[width]="24"
				[alt]="resource.resourceType.title"
			/>
		</a>
	`,
	styleUrl: './resource.component.scss',
})
export class ResourceComponent implements OnInit {
	@Input({ required: true }) resource!: Resource;

	private tooltipDirective = inject(TooltipDirective);

	ngOnInit() {
		this.tooltipDirective.text = this.resource.title;
		this.tooltipDirective.position = 'bottom';
	}
}
