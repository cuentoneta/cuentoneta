import { Component, computed, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

import type { Story } from '@models/story.model';
import { withSanityImageParams } from '@utils/sanity-image.utils';
import { AppRoutes } from '../../app.routes';
import { CoverImageComponent } from '../cover-image/cover-image.component';
import { ImageProfileComponent } from '../image-profile/image-profile.component';
import { TagComponent } from '../tag/tag.component';
import { TagsListComponent } from '../tags-list/tags-list.component';
import { StoryHeroHeaderSkeletonComponent } from './story-hero-header-skeleton.component';

/**
 * Hero de la página Story (Design System v3): banda superior del cuento con la MISMA portada de fondo
 * difuminada + capa de opacidad, y en primer plano la portada nítida (`CoverImage`), los tags (`TagsList`),
 * el autor (`ImageProfile` + nombre, enlace al perfil), el título y "Publicado en: <colección> (<año>)".
 *
 * Recibe el `Story` completo como único input; ausente ⇒ renderiza su propio skeleton.
 */
@Component({
	selector: 'cuentoneta-story-hero-header',
	imports: [
		NgOptimizedImage,
		RouterLink,
		CoverImageComponent,
		ImageProfileComponent,
		TagComponent,
		TagsListComponent,
		StoryHeroHeaderSkeletonComponent,
	],
	host: { class: 'relative block overflow-hidden bg-neutral-900' },
	template: `
		@if (story(); as story) {
			@if (backgroundImageUrl(); as backgroundImageUrl) {
				<img
					[ngSrc]="backgroundImageUrl"
					fill
					priority
					sizes="100vw"
					alt=""
					class="scale-105 object-cover blur-xl"
					data-testid="hero-background"
				/>
			}
			<div class="absolute inset-0 bg-neutral-950-70" data-testid="hero-overlay"></div>

			<div class="relative z-10 px-6 pt-28 pb-10">
				<div class="mx-auto flex w-full max-w-180 items-center gap-8">
					<cuentoneta-cover-image [src]="story.coverImage" [priority]="true" />
					<div class="flex min-w-0 flex-col items-start gap-2.5">
						<cuentoneta-tags-list data-testid="tags">
							@for (tag of story.tags; track tag.slug) {
								<cuentoneta-tag [label]="tag.title" variant="gray" />
							}
						</cuentoneta-tags-list>
						<a
							[routerLink]="['/', appRoutes.Author, story.author.slug]"
							class="group flex items-center gap-2"
							data-testid="author"
						>
							<cuentoneta-image-profile [src]="story.author.imageUrl" size="small" class="shrink-0" />
							<span class="font-inter text-sm font-medium text-neutral-50 group-hover:underline">{{
								story.author.name
							}}</span>
						</a>
						<h1 class="w-full font-inter text-2xl font-bold text-neutral-50">{{ story.title }}</h1>
						<p class="font-inter text-sm font-medium text-neutral-50" data-testid="publication">
							Publicado en: {{ story.originalPublication }}
						</p>
					</div>
				</div>
			</div>
		} @else {
			<cuentoneta-story-hero-header-skeleton data-testid="skeleton" />
		}
	`,
})
export class StoryHeroHeaderComponent {
	protected readonly appRoutes = AppRoutes;

	public readonly story = input<Story>();

	protected readonly backgroundImageUrl = computed(() =>
		withSanityImageParams(this.story()?.coverImage ?? '', { w: 1920 }),
	);
}
