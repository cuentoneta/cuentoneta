import { Component, computed, inject, input, OnInit } from '@angular/core';
import { TooltipDirective } from '../../directives/tooltip.directive';
import { NgIcon } from '@ng-icons/core';

export interface MediaResourcePlatform {
	title: string;
	icon: Record<string, string>;
}

@Component({
	selector: 'cuentoneta-media-resource-tag',
	imports: [NgIcon],
	hostDirectives: [TooltipDirective],
	template: ` <div [class]="size()" class="flex items-center justify-center">
		<ng-icon
			[name]="iconName()"
			[size]="iconSize()"
			[attr.aria-label]="platform().title"
			[attr.data-testid]="'icon-' + platform().icon"
		/>
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
	readonly platform = input.required<MediaResourcePlatform>();
	readonly size = input<'md' | 'lg'>('md');
	readonly iconSize = computed(() => (this.size() === 'md' ? '32px' : '24px'));

	readonly iconName = computed(() => {
		const icon = this.platform().icon;
		return Object.keys(icon)[0]; // Get the key name
	});

	private tooltipDirective = inject(TooltipDirective);

	ngOnInit() {
		this.tooltipDirective.text.set(this.platform().title);
		this.tooltipDirective.position.set('bottom');
	}
}
