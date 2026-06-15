import { Component, computed, effect, inject, input } from '@angular/core';
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
	template: ` <div [class]="sizeClasses()" class="flex items-center justify-center">
		<ng-icon
			[name]="iconName()"
			[size]="iconSize()"
			[attr.aria-label]="platform().title"
			[attr.data-testid]="'icon-' + platform().icon"
		/>
	</div>`,
})
export class MediaResourceTagComponent {
	readonly platform = input.required<MediaResourcePlatform>();
	readonly size = input<'md' | 'lg'>('md');
	readonly iconSize = computed(() => (this.size() === 'md' ? '32px' : '24px'));
	readonly sizeClasses = computed(() => (this.size() === 'md' ? 'h-6 w-6' : 'h-8 w-8'));

	readonly iconName = computed(() => {
		const icon = this.platform().icon;
		return Object.keys(icon)[0]; // Get the key name
	});

	private tooltipDirective = inject(TooltipDirective);

	private readonly syncTooltipEffect = effect(() => {
		this.tooltipDirective.text.set(this.platform().title);
		this.tooltipDirective.position.set('bottom');
	});
}
