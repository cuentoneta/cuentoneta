import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { LiteraryWorkNavigationTeaserWithAuthors, LiteraryWorkTeaser } from '@models/literary-work.model';
import { AppRoutes } from '../../app.routes';
import { ImageProfileComponent } from '../image-profile/image-profile.component';
import { CoverImageComponent } from '../cover-image/cover-image.component';
import { LiteraryWorkHomeCardTeaserSkeletonComponent } from './literary-work-home-card-teaser-skeleton.component';

/**
 * Tarjeta de vista previa de una obra para la home (Design System v3). Layout vertical angosto con la
 * imagen y la numeración apiladas sobre un contenedor gris, la autoría (1..N) y el título truncado a
 * una sola línea.
 *
 * Decisiones de diseño tomadas del nodo de Figma:
 * - El título se trunca siempre a una línea.
 * - La autoría (avatar + nombre) se muestra siempre y cada integrante enlaza a su perfil (`/author/:slug`).
 *
 * Patrón de tarjeta clickeable (sin wrapper `<a>`): el enlace de la obra se estira con un
 * pseudo-elemento (`after:absolute after:inset-0`) para cubrir toda la tarjeta, de modo que cualquier
 * sección navega a `/read/:slug`. El bloque de cada autor es un enlace propio elevado con `z-10`, por
 * encima del pseudo-elemento, para que la foto y el nombre naveguen a `/author/:slug`.
 */
@Component({
	selector: 'cuentoneta-literary-work-home-card-teaser',
	imports: [RouterLink, ImageProfileComponent, LiteraryWorkHomeCardTeaserSkeletonComponent, CoverImageComponent],
	template: `
		@if (literaryWork(); as literaryWork) {
			<article class="relative flex w-full max-w-82.75 flex-col items-center gap-4">
				<div
					class="relative flex w-full items-center justify-center rounded-xl bg-neutral-100 py-5"
					data-testid="cover-container"
				>
					<cuentoneta-cover-image [src]="coverImageUrl()" [priority]="priority()" />
					@if (order() !== undefined) {
						<span class="source-serif-4xl absolute top-5 left-5.5 font-bold text-brand-500" data-testid="order">
							{{ order() }}
						</span>
					}
				</div>
				<div class="flex w-full flex-col gap-1">
					<!-- Autoría 1..N: cada autor es un enlace propio a /author/:slug, elevado (z-10) por encima
						 del enlace estirado de la obra. -->
					@for (author of literaryWork.authors; track author.slug) {
						<a
							[routerLink]="['/', appRoutes.Author, author.slug]"
							class="group relative z-10 flex min-w-0 items-center gap-2"
							data-testid="author"
						>
							<cuentoneta-image-profile [src]="author.imageUrl" size="small" class="shrink-0" />
							<span class="truncate font-inter text-sm font-medium text-neutral-900 group-hover:underline">{{
								author.name
							}}</span>
						</a>
					}
					<!-- Enlace de la obra estirado con ::after para cubrir toda la tarjeta (sin wrapper <a>).
						 El truncate va en el span interno: el ::after se recortaría si el <a> tuviera overflow-hidden. -->
					<a
						[routerLink]="literaryWorkRouterLink()"
						[queryParams]="navigationParams()"
						[attr.aria-label]="literaryWork.title"
						class="block w-full min-w-0 after:absolute after:inset-0 after:content-['']"
					>
						<span class="block truncate font-inter text-lg font-bold text-neutral-900">{{ literaryWork.title }}</span>
					</a>
					<div class="flex items-center gap-2" data-testid="reading-time">
						@if (tagLabel()) {
							<span class="font-inter text-xs font-bold text-brand-500">{{ tagLabel() }}</span>
							<span class="font-inter text-xxs font-medium text-neutral-600" aria-hidden="true">•</span>
						}
						<span class="font-inter text-xs font-medium text-neutral-600">
							{{ literaryWork.totalReadingTime }} minutos de lectura
						</span>
					</div>
				</div>
			</article>
		} @else {
			<cuentoneta-literary-work-home-card-teaser-skeleton data-testid="skeleton" />
		}
	`,
	host: {
		class: 'block',
	},
})
export class LiteraryWorkHomeCardTeaserComponent {
	protected readonly appRoutes = AppRoutes;

	// Inputs
	public readonly literaryWork = input<LiteraryWorkNavigationTeaserWithAuthors | LiteraryWorkTeaser>();
	public readonly order = input<number>();
	// Marca el cover como prioritario (above-the-fold) para la carga de imágenes.
	public readonly priority = input<boolean>(false);
	public readonly tagLabel = input<string>();
	public readonly navigationParams = input<{ navigation: string; navigationSlug: string }>();

	protected readonly coverImageUrl = computed(() => this.literaryWork()?.coverImage);
	protected readonly literaryWorkRouterLink = computed(() => ['/', this.appRoutes.Read, this.literaryWork()?.slug]);
}
