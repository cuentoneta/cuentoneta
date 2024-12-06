import { Component, computed, inject, input, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Tag } from '@models/tag.model';
import { TooltipDirective } from '../../directives/tooltip.directive';

@Component({
	selector: 'cuentoneta-badge',
	hostDirectives: [TooltipDirective],
	imports: [CommonModule, NgOptimizedImage],
	template: `
		<span class="inter-body-xs-bold flex items-center gap-1">
			@if (showIcon() && tag().icon; as icon) {
				<img [ngSrc]="iconUrl()" alt="" width="16" height="16" />
			}
			{{ tag().title }}
		</span>
	`,
	styles: `
		:host {
			@apply flex rounded bg-primary-200 px-4.5 py-0.5 uppercase hover:cursor-default;
		}
	`,
})
export class BadgeComponent implements OnInit {
	tag = input.required<Tag>();
	showIcon = input(false);
	iconUrl = computed(() => {
		if (!this.tag().icon?.name) {
			return '';
		}

		return `assets/icons/badges/${this.tag().icon?.name}.svg`;
	});

	private tooltipDirective = inject(TooltipDirective);

	ngOnInit() {
		this.tooltipDirective.text.set(this.tag().shortDescription);
		this.tooltipDirective.position.set('top');
	}
}
