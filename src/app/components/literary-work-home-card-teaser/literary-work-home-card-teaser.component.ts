import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { LiteraryWorkNavigationTeaserWithAuthors, LiteraryWorkTeaser } from '@models/literary-work.model';
import { AppRoutes } from '../../app.routes';
import type { NavigationParams } from '@app-utils/navigation-params';
import { MediaSelectorsComponent } from '../media-selectors/media-selectors.component';
import { ImageProfileComponent } from '../image-profile/image-profile.component';
import { CoverImageComponent } from '../cover-image/cover-image.component';
import { LiteraryWorkHomeCardTeaserSkeletonComponent } from './literary-work-home-card-teaser-skeleton.component';

/**
 * Tarjeta de vista previa de una obra para la home (Design System v3). Derivada de
 * LiteraryWorkCardTeaser pero con un propósito propio: layout vertical angosto con la imagen, la
 * numeración y los selectores de multimedia apilados sobre un contenedor gris, el nombre del autor
 * y el título truncado a una sola línea.
 *
 * Decisiones de diseño tomadas del nodo de Figma:
 * - El título se trunca siempre a una línea.
 * - Los selectores de multimedia usan siempre el tema `solid` (recuadros blancos sobre el gris).
 * - El autor (avatar + nombre) se muestra siempre y enlaza a su perfil (`/author/:slug`).
 *
 * Patrón de tarjeta clickeable (sin wrapper `<a>`): el enlace de la obra se estira con un
 * pseudo-elemento (`after:absolute after:inset-0`) para cubrir toda la tarjeta, de modo que cualquier
 * sección navega a `/read/:slug`. El bloque del autor es un enlace propio elevado a `z-content`, por
 * encima del pseudo-elemento, para que la foto y el nombre naveguen a `/author/:slug`.
 */
@Component({
	selector: 'cuentoneta-literary-work-home-card-teaser',
	imports: [
		RouterLink,
		MediaSelectorsComponent,
		ImageProfileComponent,
		LiteraryWorkHomeCardTeaserSkeletonComponent,
		CoverImageComponent,
	],
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
					@if (showMultimedia() && literaryWork.mediaSources.length > 0) {
						<div class="absolute top-5 right-4.5">
							<cuentoneta-media-selectors
								[media]="literaryWork.mediaSources"
								theme="solid"
								orientation="vertical"
								data-testid="media"
							/>
						</div>
					}
				</div>
				<div class="flex w-full flex-col gap-1">
					<!-- Autor: enlace propio a /author/:slug, elevado a z-content por encima del enlace estirado. -->
					@let author = literaryWork.authors[0];
					<a
						[routerLink]="['/', appRoutes.Author, author.slug]"
						class="group relative z-content flex min-w-0 items-center gap-2"
						data-testid="author"
					>
						<cuentoneta-image-profile [src]="author.imageUrl" size="small" class="shrink-0" />
						<span class="truncate font-inter text-sm font-medium text-neutral-900 group-hover:underline">{{
							author.name
						}}</span>
					</a>
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
		// `isolate` confina la elevación del enlace del autor sobre el enlace estirado de la obra: es un
		// orden entre hermanos de esta tarjeta y no tiene por qué existir en el contexto raíz.
		class: 'isolate block',
	},
})
export class LiteraryWorkHomeCardTeaserComponent {
	protected readonly appRoutes = AppRoutes;

	// Inputs
	public readonly literaryWork = input<LiteraryWorkTeaser | LiteraryWorkNavigationTeaserWithAuthors>();
	public readonly order = input<number>();
	// Marca el cover como prioritario (above-the-fold) para la carga de imágenes.
	public readonly priority = input<boolean>(false);
	public readonly tagLabel = input<string>();
	public readonly showMultimedia = input<boolean>(false);
	public readonly navigationParams = input<NavigationParams>();

	protected readonly coverImageUrl = computed(() => this.literaryWork()?.coverImage);
	protected readonly literaryWorkRouterLink = computed(() => ['/', this.appRoutes.Read, this.literaryWork()?.slug]);
}
