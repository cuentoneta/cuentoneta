import { Component, computed, inject, input, OnInit } from '@angular/core';
import { Tag } from '@models/tag.model';
import { TooltipDirective } from '../../directives/tooltip.directive';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { iconMappers } from '@models/icon.model';
import {
	faSolidBook,
	faSolidBookBookmark,
	faSolidGlobe,
	faSolidPeopleGroup,
	faSolidStar,
	faSolidTrophy,
} from '@ng-icons/font-awesome/solid';

@Component({
	selector: 'cuentoneta-badge',
	hostDirectives: [TooltipDirective],
	imports: [NgIcon],
	providers: [
		provideIcons({ faSolidBook, faSolidBookBookmark, faSolidGlobe, faSolidPeopleGroup, faSolidStar, faSolidTrophy }),
	],
	template: `
		<span class="inter-body-xs-bold flex items-center gap-1">
			@if (showIcon() && tag().icon; as icon) {
				@if (iconName(); as iconName) {
					<ng-icon [name]="iconName" size="12px" />
				}
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
	readonly tag = input.required<Tag>();
	readonly showIcon = input(false);
	readonly iconName = computed(() => {
		if (!this.tag().slug) {
			return '';
		}

		return iconMappers.find((tag) => tag.name === this.tag().slug)?.ngIconsName ?? '';
	});

	private tooltipDirective = inject(TooltipDirective);

	ngOnInit() {
		this.tooltipDirective.text.set(this.tag().shortDescription);
		this.tooltipDirective.position.set('top');
	}
}
