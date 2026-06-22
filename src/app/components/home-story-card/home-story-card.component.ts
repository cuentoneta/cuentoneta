import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

import { StoryNavigationTeaserWithAuthor, StoryTeaserWithAuthor } from '@models/story.model';
import { AppRoutes } from '../../app.routes';
import { StoryMediaSelectorsComponent } from '../story-media-selectors/story-media-selectors.component';
import { ImageProfileComponent } from '../image-profile/image-profile.component';
import { HomeStoryCardSkeletonComponent } from './home-story-card-skeleton.component';

/**
 * Tarjeta de vista previa de una historia para la home (Design System v3). Derivada de
 * StoryCardTeaserV3 pero con un propósito propio: layout vertical angosto con la imagen, la
 * numeración y los selectores de multimedia apilados sobre un contenedor gris, el nombre del autor
 * y el título truncado a una sola línea.
 *
 * Decisiones de diseño tomadas del nodo de Figma:
 * - El título se trunca siempre a una línea.
 * - Los selectores de multimedia usan siempre el tema `solid` (recuadros blancos sobre el gris).
 * - El autor (avatar + nombre) se muestra siempre y enlaza a su perfil (`/author/:slug`).
 *
 * Patrón de tarjeta clickeable (sin wrapper `<a>`): el enlace de la historia se estira con un
 * pseudo-elemento (`after:absolute after:inset-0`) para cubrir toda la tarjeta, de modo que cualquier
 * sección navega a `/story/:slug`. El bloque del autor es un enlace propio elevado con `z-10`, por
 * encima del pseudo-elemento, para que la foto y el nombre naveguen a `/author/:slug`.
 */
@Component({
	selector: 'cuentoneta-home-story-card',
	imports: [
		NgOptimizedImage,
		RouterLink,
		StoryMediaSelectorsComponent,
		ImageProfileComponent,
		HomeStoryCardSkeletonComponent,
	],
	template: `
		@if (story(); as story) {
			<article class="relative flex w-full max-w-82.75 flex-col items-center gap-4">
				<div
					class="relative flex w-full items-center justify-center rounded-xl bg-neutral-100 py-5"
					data-testid="cover-container"
				>
					<!-- Imagen alusiva (o placeholder). Decorativa: el click se delega al enlace estirado de la historia. -->
					<div class="h-41 w-29.5 shrink-0 overflow-hidden rounded-lg bg-neutral-300">
						@if (coverImageUrl(); as url) {
							<img
								[ngSrc]="url"
								[width]="coverWidth"
								[height]="coverHeight"
								[priority]="priority()"
								alt=""
								class="h-full w-full object-cover"
								data-testid="cover-image"
							/>
						} @else {
							<div class="flex h-full w-full items-center justify-center" data-testid="cover-placeholder">
								<img [ngSrc]="'./assets/svg/cover-placeholder.svg'" width="60" height="60" alt="" />
							</div>
						}
					</div>
					@if (order() !== undefined) {
						<span class="source-serif-4xl absolute top-5 left-5.5 font-bold text-brand-500" data-testid="order">
							{{ order() }}
						</span>
					}
					@if (showMultimedia() && story.media.length > 0) {
						<div class="absolute top-5 right-4.5">
							<cuentoneta-story-media-selectors
								[media]="story.media"
								theme="solid"
								orientation="vertical"
								data-testid="media"
							/>
						</div>
					}
				</div>
				<div class="flex w-full flex-col gap-1">
					<!-- Autor: enlace propio a /author/:slug, elevado (z-10) por encima del enlace estirado. -->
					<a
						[routerLink]="['/', appRoutes.Author, story.author.slug]"
						class="relative z-10 flex min-w-0 items-center gap-2"
						data-testid="author"
					>
						<cuentoneta-image-profile
							[src]="story.author.imageUrl"
							[alt]="'Retrato de ' + story.author.name"
							size="small"
							class="shrink-0"
						/>
						<span class="truncate font-inter text-sm font-medium text-neutral-900">{{ story.author.name }}</span>
					</a>
					<!-- Enlace de la historia estirado con ::after para cubrir toda la tarjeta (sin wrapper <a>).
						 El truncate va en el span interno: el ::after se recortaría si el <a> tuviera overflow-hidden. -->
					<a
						[routerLink]="storyRouterLink()"
						[queryParams]="navigationParams()"
						class="block w-full min-w-0 after:absolute after:inset-0 after:content-['']"
					>
						<span class="block truncate font-inter text-lg font-bold text-neutral-900">{{ story.title }}</span>
					</a>
					<div class="flex items-center gap-2" data-testid="reading-time">
						@if (tagLabel()) {
							<span class="font-inter text-xs font-bold text-brand-500">{{ tagLabel() }}</span>
							<span class="font-inter text-xxs font-medium text-neutral-600" aria-hidden="true">•</span>
						}
						<span class="font-inter text-xs font-medium text-neutral-600">
							{{ story.approximateReadingTime }} minutos de lectura
						</span>
					</div>
				</div>
			</article>
		} @else {
			<cuentoneta-home-story-card-skeleton data-testid="skeleton" />
		}
	`,
	host: {
		class: 'block',
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeStoryCardComponent {
	protected readonly appRoutes = AppRoutes;

	// Dimensiones intrínsecas del cover (px). El tamaño visual se controla por CSS (h-41 w-29.5).
	protected readonly coverWidth = 118;
	protected readonly coverHeight = 164;

	// Inputs
	public readonly story = input<StoryTeaserWithAuthor | StoryNavigationTeaserWithAuthor>();
	public readonly order = input<number>();
	public readonly coverImageUrl = input<string>();
	// Marca el cover como prioritario (above-the-fold) para la carga de imágenes.
	public readonly priority = input<boolean>(false);
	public readonly tagLabel = input<string>();
	public readonly showMultimedia = input<boolean>(false);
	public readonly navigationParams = input<{ navigation: string; navigationSlug: string }>();

	protected readonly storyRouterLink = computed(() => ['/', this.appRoutes.Story, this.story()?.slug]);
}
