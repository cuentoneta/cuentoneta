// Core
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

// Router
import { RouterLink } from '@angular/router';
import { AppRoutes } from '../../app.routes';

// Models
import { StorylistTeaser } from '@models/storylist.model';

// Components
import { PortableTextParserComponent } from '../portable-text-parser/portable-text-parser.component';
import { CoverImageComponent } from '../cover-image/cover-image.component';

@Component({
	selector: 'cuentoneta-collection-teaser',
	imports: [RouterLink, PortableTextParserComponent, CoverImageComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<article>
			@if (collection(); as storylist) {
				<a [routerLink]="['/' + appRoutes.StoryList, storylist.slug]" class="navigation-link flex items-start gap-5">
					<section
						class="relative flex h-[192px] items-end justify-center overflow-hidden rounded-xl bg-neutral-100 px-3 sm:flex-1"
					>
						@if (isFanout()) {
							@let covers = fanoutCovers();
							<cuentoneta-cover-image
								[src]="covers.left"
								class="absolute top-[calc(50%_+_39.35px)] left-[calc(50%_-_82.75px)] z-10 -translate-x-1/2 -translate-y-1/2 border-[3px] border-neutral-100"
							/>
							<cuentoneta-cover-image
								[src]="covers.right"
								class="absolute top-[calc(50%_+_39.35px)] left-[calc(50%_+_83.03px)] z-10 -translate-x-1/2 -translate-y-1/2 border-[3px] border-neutral-100"
							/>
							<cuentoneta-cover-image
								[src]="covers.front"
								class="absolute bottom-[-8px] left-1/2 z-20 -translate-x-1/2 border-[3px] border-neutral-100"
							/>
						} @else {
							<cuentoneta-cover-image [src]="storylist.featuredImage" class="-mb-2" />
						}
					</section>
					<section class="flex flex-1 flex-col gap-1 overflow-hidden">
						<header
							class="hover:text-interactive-500 line-clamp-2 cursor-pointer font-inter text-lg font-bold sm:line-clamp-1"
						>
							{{ storylist.title }}
						</header>
						<cuentoneta-portable-text-parser
							[classes]="'line-clamp-4 sm:line-clamp-3'"
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
export class CollectionTeaser {
	public readonly collection = input<StorylistTeaser>();
	protected readonly appRoutes = AppRoutes;

	protected readonly coverImages = computed(() => this.collection()?.coverImages ?? []);

	// Cada portada es la imagen del autor del texto, así que portadas distintas implican autores distintos: el
	// abanico (variante Multiple) representa colecciones multi-autor. No se usa config.showAuthors: esa flag
	// controla los nombres en los teasers, no las portadas.
	protected readonly isFanout = computed(() => new Set(this.coverImages().filter(Boolean)).size >= 2);

	// Cada slot toma su portada por posición; un slot sin portada queda en '' y CoverImage muestra el placeholder.
	protected readonly fanoutCovers = computed(() => {
		const covers = this.coverImages();
		return { left: covers.at(1) ?? '', front: covers.at(0) ?? '', right: covers.at(2) ?? '' };
	});
}
