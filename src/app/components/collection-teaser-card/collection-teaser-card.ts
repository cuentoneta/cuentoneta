// Core
import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

// Router
import { RouterLink } from '@angular/router';
import { AppRoutes } from '../../app.routes';

// Models
import type { CollectionTeaser } from '@models/collection.model';

// Components
import { CoverImageComponent } from '../cover-image/cover-image.component';

@Component({
	selector: 'cuentoneta-collection-teaser-card',
	imports: [RouterLink, CoverImageComponent],

	template: `
		<article>
			@if (collection(); as collection) {
				<a [routerLink]="['/' + appRoutes.Collection, collection.slug]" class="flex items-start gap-5">
					<section
						class="relative isolate flex h-48 items-end justify-center overflow-hidden rounded-xl bg-neutral-100 px-3 sm:flex-1"
					>
						@if (collection.imagery.kind === 'representative') {
							<cuentoneta-cover-image [src]="collection.imagery.image" class="-mb-2" />
						} @else {
							@for (image of collection.imagery.images; track $index) {
								<cuentoneta-cover-image [src]="image" [class]="sampleImageClasses[$index]" />
							}
						}
					</section>
					<section class="flex flex-1 flex-col gap-1 overflow-hidden">
						<header
							class="hover:text-interactive-500 line-clamp-2 cursor-pointer font-inter text-lg leading-6 font-bold"
						>
							{{ collection.title }}
						</header>
						<div
							[innerHTML]="safeDescription()"
							class="line-clamp-4 font-inter text-sm text-ellipsis text-neutral-700"
							data-testid="description"
						></div>
						<footer class="flex flex-col gap-1 font-inter text-xs text-neutral-600 sm:flex-row">
							@if (collection.tags[0]) {
								<span class="font-inter text-xs font-bold text-brand-500"> {{ collection.tags[0].title }} </span>
								<span class="hidden sm:inline">•</span>
							}
							<span>{{ collection.count }} {{ collection.count === 1 ? 'obra' : 'obras' }}</span>
						</footer>
					</section>
				</a>
			}
		</article>
	`,
})
export class CollectionTeaserCard {
	public readonly collection = input<CollectionTeaser>();
	protected readonly appRoutes = AppRoutes;

	private readonly sanitizer = inject(DomSanitizer);

	// El backend entrega la descripción ya saneada por el pipeline compartido, y el brand del tipo es la
	// prueba de que pasó por ahí. Sin el bypass, el sanitizer de Angular vuelve a recortar una marcación
	// que ya está acotada a la allow-list, y el énfasis de la prosa se pierde.
	protected readonly safeDescription = computed(() => {
		const collection = this.collection();
		return collection ? this.sanitizer.bypassSecurityTrustHtml(collection.description) : undefined;
	});

	// Posiciones de las portadas en visualización múltiple a partir de las imágenes alusivas de las obras
	// [0] central al frente con bottom-bleed, [1] lateral izquierda y [2] derecha desplazadas, con borde neutral-100.
	// Se expresan las clases CSS en sampleImageClasses para hacer más sencilla la notación al iterar con @for
	protected readonly sampleImageClasses = [
		'absolute bottom-[-8px] left-1/2 z-raised -translate-x-1/2 border-[3px] border-neutral-100',
		'absolute top-[calc(50%_+_39.35px)] left-[calc(50%_-_82.75px)] z-content -translate-x-1/2 -translate-y-1/2 border-[3px] border-neutral-100',
		'absolute top-[calc(50%_+_39.35px)] left-[calc(50%_+_83.03px)] z-content -translate-x-1/2 -translate-y-1/2 border-[3px] border-neutral-100',
	] as const;
}
