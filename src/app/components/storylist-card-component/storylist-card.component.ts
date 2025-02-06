// Core
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

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
	imports: [CommonModule, BadgeComponent, RouterLink, NgxSkeletonLoaderModule, PortableTextParserComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<article class="shadow-lg hover:shadow-lg-hover">
			@if (storylist(); as storylist) {
				<a [routerLink]="['/' + appRoutes.StoryList, storylist.slug]" class="navigation-link">
					<section
						class="flex flex-col gap-4 rounded-t-2xl border-1 border-b-0 border-solid border-primary-300 px-4 pt-5"
					>
						<h1
							class="h3 cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap font-source-serif italic hover:text-interactive-500"
						>
							{{ storylist.title }}
						</h1>
						<cuentoneta-portable-text-parser
							[paragraphs]="storylist.description"
							class="inter-body-base-regular line-clamp-4 h-24 min-h-24 text-ellipsis text-gray-600"
						></cuentoneta-portable-text-parser>
						<hr class="text-gray-300" />
					</section>
					<footer
						class="flex justify-between rounded-b-2xl border-1 border-t-0 border-solid border-primary-300 px-5 pb-5 pt-4"
					>
						<div class="flex rounded bg-gray-200 px-4.5 py-0.5 uppercase hover:cursor-default">
							<span class="inter-body-xs-bold flex items-center gap-1">{{ storylist.count }} historias</span>
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
			@apply block rounded-2xl;
		}
	`,
})
export class StorylistCardComponent {
	storylist = input<StorylistTeaser>();
	protected readonly appRoutes = AppRoutes;
}
