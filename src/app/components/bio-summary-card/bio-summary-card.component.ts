// Core
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

// Modelos
import { Story } from '@models/story.model';

// Componentes
import { AuthorTeaserComponent } from '../author-teaser/author-teaser.component';
import { PortableTextParserComponent } from '../portable-text-parser/portable-text-parser.component';
import { ResourceComponent } from '../resource/resource.component';

@Component({
	selector: 'cuentoneta-bio-summary-card',
	template: `
		<section class="mb-4 grid grid-cols-[1fr] gap-4 sm:mb-8 sm:grid-cols-[auto_1fr]">
			<cuentoneta-author-teaser [author]="story().author" [variant]="'md'" />
			@if (resources.length > 0) {
				<div class="xs-max:col-start-1 xs-max:col-end-3 flex justify-start gap-4 sm:justify-end">
					@for (resource of resources(); track $index) {
						<cuentoneta-resource [resource]="resource" />
					}
				</div>
			}
		</section>
		<section class="font-inter text-base font-normal text-neutral-700">
			<cuentoneta-portable-text-parser [paragraphs]="story().author.biography" [classes]="'mb-4'" />
			<cuentoneta-portable-text-parser [paragraphs]="story().summary" [classes]="'mb-4 last:mb-0'" />
		</section>
	`,
	host: {
		class: 'rounded border-1 border-solid border-neutral-200 bg-neutral-100 p-6',
	},
	imports: [AuthorTeaserComponent, ResourceComponent, PortableTextParserComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BioSummaryCardComponent {
	public readonly story = input.required<Story>();
	protected readonly resources = computed(() => [
		...(this.story().resources ?? []),
		...(this.story().author.resources ?? []),
	]);
}
