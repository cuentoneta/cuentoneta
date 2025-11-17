import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BadgeComponent } from '@components/badge/badge.component';
import { Storylist } from '@models/storylist.model';
import { StorylistTitleSkeleton } from './storylist-title-skeleton';

@Component({
	selector: 'cuentoneta-storylist-title',
	imports: [BadgeComponent, StorylistTitleSkeleton],
	template: `
		@defer (when storylist()) {
			<div class="flex flex-col gap-5">
				<h1 class="h1 font-source-serif text-3xl italic">
					{{ storylist()?.title }}
				</h1>
				<div class="flex gap-2">
					<div class="flex rounded bg-gray-200 px-4.5 py-0.5 uppercase hover:cursor-default">
						<span class="inter-body-xs-bold flex items-center gap-1">{{ storylist()?.count }} textos</span>
					</div>
					@for (tag of storylist()?.tags; track tag.slug) {
						<cuentoneta-badge
							[tag]="tag"
							[showIcon]="true"
							[tooltip]="tag.shortDescription"
							[tooltipConfig]="{ asLabel: true, useBootstrapStyles: true }"
						/>
					}
				</div>
			</div>
		} @loading (minimum 500ms) {
			<cuentoneta-storylist-title-skeleton />
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StorylistTitle {
	readonly storylist = input<Storylist>();
}
