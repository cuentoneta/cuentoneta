import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Tag } from '@models/tag.model';
import { BypassHtmlSanitizerPipe } from '../../pipes/bypass-html-sanitizer.pipe';
import { TooltipDirective } from '../../directives/tooltip.directive';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';

@Component({
	selector: 'cuentoneta-badge',
	standalone: true,
	hostDirectives: [TooltipDirective],
	imports: [BypassHtmlSanitizerPipe, CommonModule, NgOptimizedImage, SvgIconComponent],
	template: `
		<span class="inter-body-xs-bold flex items-center gap-1">
			@if (showIcon && !!tag.icon) {
				<cuentoneta-svg-icon [svg]="tag.icon.svg" />
			}
			{{ tag.title }}
		</span>
	`,
	styles: `
		:host {
			@apply flex rounded bg-primary-200 px-4.5 py-0.5 uppercase hover:cursor-default;
		}
	`,
})
export class BadgeComponent implements OnInit {
	@Input({ required: true }) tag!: Tag;
	@Input() showIcon: boolean = false;

	private tooltipDirective = inject(TooltipDirective);

	ngOnInit() {
		this.tooltipDirective.text = this.tag.description;
		this.tooltipDirective.position = 'top';
	}
}
