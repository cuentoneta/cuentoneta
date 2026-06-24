import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TagComponent } from '@components/tag/tag.component';
import { Storylist } from '@models/storylist.model';
import { StorylistTitleSkeleton } from './storylist-title-skeleton';

@Component({
	selector: 'cuentoneta-storylist-title',
	imports: [TagComponent, StorylistTitleSkeleton],
	template: `
		@defer (when storylist()) {
			<div class="flex flex-col gap-5">
				<h1 class="h1 font-source-serif text-3xl italic">
					{{ storylist()?.title }}
				</h1>
				<div class="flex gap-2">
					<div class="flex rounded bg-neutral-200 px-4.5 py-0.5 uppercase hover:cursor-default">
						<span class="flex items-center gap-1 font-inter text-xs font-bold">{{ storylist()?.count }} textos</span>
					</div>
					@for (tag of storylist()?.tags; track tag.slug) {
						<cuentoneta-tag [label]="tag.title" variant="filled" />
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
	public readonly storylist = input<Storylist>();
}
