// Core
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

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
				<a [routerLink]="['/' + appRoutes.StoryList, storylist.slug]" class="flex items-start gap-5">
					<section
						class="relative flex h-48 items-end justify-center overflow-hidden rounded-xl bg-neutral-100 px-3 sm:flex-1"
					>
						@if (storylist.imagery.kind === 'representative') {
							<cuentoneta-cover-image [src]="storylist.imagery.image" class="-mb-2" />
						} @else {
							@for (image of storylist.imagery.images; track $index) {
								<cuentoneta-cover-image [src]="image" [class]="sampleImageClasses[$index]" />
							}
						}
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
export class CollectionTeaser {
	public readonly collection = input<StorylistTeaser>();
	protected readonly appRoutes = AppRoutes;

	// Posiciones de las portadas en visualización múltiple a partir de las imágenes alusivas de stories
	// [0] central al frente con bottom-bleed, [1] lateral izquierda y [2] derecha desplazadas, con borde neutral-100.
	// Se expresan las clases CSS en sampleImageClasses para hacer más sencilla la notación al iterar con @for
	protected readonly sampleImageClasses = [
		'absolute bottom-[-8px] left-1/2 z-20 -translate-x-1/2 border-[3px] border-neutral-100',
		'absolute top-[calc(50%_+_39.35px)] left-[calc(50%_-_82.75px)] z-10 -translate-x-1/2 -translate-y-1/2 border-[3px] border-neutral-100',
		'absolute top-[calc(50%_+_39.35px)] left-[calc(50%_+_83.03px)] z-10 -translate-x-1/2 -translate-y-1/2 border-[3px] border-neutral-100',
	] as const;
}
