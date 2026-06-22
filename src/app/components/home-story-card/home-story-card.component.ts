import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgOptimizedImage, NgTemplateOutlet } from '@angular/common';
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
 * - El autor (avatar + nombre como texto) se muestra siempre; el único enlace accesible es el de la
 *   historia (la imagen del cover es un target visual decorativo, oculto a tecnologías de asistencia).
 */
@Component({
	selector: 'cuentoneta-home-story-card',
	imports: [
		NgOptimizedImage,
		NgTemplateOutlet,
		RouterLink,
		StoryMediaSelectorsComponent,
		ImageProfileComponent,
		HomeStoryCardSkeletonComponent,
	],
	template: `
		@if (story(); as story) {
			<article class="flex w-full max-w-82.75 flex-col items-center gap-4">
				<div
					class="relative flex w-full items-center justify-center rounded-xl bg-neutral-100 py-5"
					data-testid="cover-container"
				>
					<ng-container [ngTemplateOutlet]="coverLink" />
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
					<div class="flex min-w-0 items-center gap-2" data-testid="author">
						<cuentoneta-image-profile
							[src]="story.author.imageUrl"
							[alt]="'Retrato de ' + story.author.name"
							size="small"
							class="shrink-0"
						/>
						<span class="truncate font-inter text-sm font-medium text-neutral-900">{{ story.author.name }}</span>
					</div>
					<a
						[routerLink]="storyRouterLink()"
						[queryParams]="navigationParams()"
						class="block w-full truncate font-inter text-lg font-bold text-neutral-900"
					>
						{{ story.title }}
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

		<!-- Enlace a la historia que envuelve la imagen del cover; decorativo (aria-hidden) para dejar el
			 título como único enlace accesible. -->
		<ng-template #coverLink>
			<a
				[routerLink]="storyRouterLink()"
				[queryParams]="navigationParams()"
				aria-hidden="true"
				tabindex="-1"
				class="shrink-0"
			>
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
			</a>
		</ng-template>
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
