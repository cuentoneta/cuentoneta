// Core
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

// Router
import { RouterLink } from '@angular/router';
import { AppRoutes } from '../../app.routes';

// 3rd Party Modules
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

// Models
import { StorylistTeaser } from '@models/storylist.model';

// Components
import { BadgeComponent } from '../badge/badge.component';
import { PortableTextParserComponent } from '../portable-text-parser/portable-text-parser.component';

@Component({
	selector: 'cuentoneta-storylist-card',
	imports: [BadgeComponent, RouterLink, NgxSkeletonLoaderModule, PortableTextParserComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<article class="shadow-lg hover:shadow-lg-hover">
			@if (storylist(); as storylist) {
				<a [routerLink]="['/' + appRoutes.StoryList, storylist.slug]" class="navigation-link">
					<section class="flex flex-col gap-4 rounded-t-xl border-1 border-b-0 border-solid border-brand-300 px-4 pt-5">
						<h1
							class="h3 cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap font-source-serif italic text-neutral-900 hover:text-neutral-900/60"
						>
							{{ storylist.title }}
						</h1>
						<cuentoneta-portable-text-parser
							[paragraphs]="storylist.description"
							class="line-clamp-4 h-24 min-h-24 text-ellipsis font-inter text-base font-normal text-neutral-600"
						/>
						<hr class="text-neutral-300" />
					</section>
					<footer
						class="flex justify-between rounded-b-xl border-1 border-t-0 border-solid border-brand-300 px-5 pb-5 pt-4"
					>
						<div class="flex rounded bg-neutral-200 px-4.5 py-0.5 uppercase hover:cursor-default">
							<span class="flex items-center gap-1 font-inter text-xs font-bold">{{ storylist.count }} historias</span>
						</div>
						@if (!!storylist.tags && storylist.tags.length > 0) {
							<div class="flex">
								@for (tag of storylist.tags; track tag.slug) {
									<cuentoneta-badge [tag]="tag" [showIcon]="true" class="ml-3" />
								}
							</div>
						}
					</footer>
				</a>
			}
		</article>
	`,
	styles: `
		:host {
			@apply block rounded-xl bg-neutral-50 shadow-lg;
		}
	`,
})
export class StorylistCardComponent {
	readonly storylist = input<StorylistTeaser>();
	protected readonly appRoutes = AppRoutes;
}
