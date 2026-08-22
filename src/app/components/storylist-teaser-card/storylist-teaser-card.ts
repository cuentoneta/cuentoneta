// Core
import { Component, input } from '@angular/core';

// Router
import { RouterLink } from '@angular/router';
import { AppRoutes } from '../../app.routes';

// Models
import type { StorylistTeaser } from '@models/storylist.model';

// Components
import { PortableTextParserComponent } from '../portable-text-parser/portable-text-parser.component';
import { CollectionCoverComponent } from '../collection-cover/collection-cover.component';

@Component({
	selector: 'cuentoneta-storylist-teaser-card',
	imports: [RouterLink, PortableTextParserComponent, CollectionCoverComponent],

	template: `
		<article>
			@if (collection(); as storylist) {
				<a [routerLink]="['/' + appRoutes.StoryList, storylist.slug]" class="flex items-start gap-5">
					<section class="flex h-48 items-end justify-center overflow-hidden rounded-xl bg-neutral-100 px-3 sm:flex-1">
						<cuentoneta-collection-cover [imagery]="storylist.imagery" />
					</section>
					<section class="flex flex-1 flex-col gap-1 overflow-hidden">
						<header
							class="hover:text-interactive-500 line-clamp-2 cursor-pointer font-inter text-lg leading-6 font-bold"
						>
							{{ storylist.title }}
						</header>
						<cuentoneta-portable-text-parser
							[classes]="'line-clamp-4'"
							[paragraphs]="[storylist.description[0]]"
							class="font-inter text-sm text-ellipsis text-neutral-700"
						/>
						<footer class="flex flex-col gap-1 font-inter text-xs text-neutral-600 sm:flex-row">
							@if (storylist.tags[0]) {
								<span class="font-inter text-xs font-bold text-brand-500"> {{ storylist.tags[0].title }} </span>
								<span class="hidden sm:inline">•</span>
							}
							<span>{{ storylist.count }} historias</span>
						</footer>
					</section>
				</a>
			}
		</article>
	`,
})
export class StorylistTeaserCard {
	public readonly collection = input<StorylistTeaser>();
	protected readonly appRoutes = AppRoutes;
}
