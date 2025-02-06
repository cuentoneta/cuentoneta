import { Component, inject, input, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { TooltipDirective } from '../../directives/tooltip.directive';

export interface MediaResourcePlatform {
	title: string;
	icon: string;
}

@Component({
	selector: 'cuentoneta-media-resource-tag',
	imports: [CommonModule, NgOptimizedImage],
	hostDirectives: [TooltipDirective],
	template: ` <div [class]="size()" class="flex items-center justify-center">
		<img [alt]="platform().title" [ngSrc]="platform().icon" width="24" height="24" />
	</div>`,
	styles: `
		.md {
			@apply h-6 w-6;
		}

		.lg {
			@apply h-8 w-8;
		}
	`,
})
export class MediaResourceTagComponent implements OnInit {
	platform = input.required<MediaResourcePlatform>();
	size = input<'md' | 'lg'>('md');

	private tooltipDirective = inject(TooltipDirective);

	ngOnInit() {
		this.tooltipDirective.text.set(this.platform().title);
		this.tooltipDirective.position.set('bottom');
	}
}
