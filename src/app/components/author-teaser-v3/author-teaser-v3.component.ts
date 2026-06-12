import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AuthorTeaser } from '@models/author.model';
import { Tag } from '@models/tag.model';
import { AppRoutes } from '../../app.routes';

// Tamaño del avatar en px (Design System v3). La imagen se solicita al CDN a 2x (HiDPI).
const AVATAR_PX = 80;

/**
 * Vista previa de un autor enlazada a su perfil, según el Design System v3. Componente de
 * presentación reutilizable para listar y visualizar perfiles de autores: avatar, tags,
 * nombre + bandera de nacionalidad y cantidad de historias. Encapsula el enlace, el avatar con
 * su placeholder y el redimensionado de la imagen.
 */
@Component({
	selector: 'cuentoneta-author-teaser-v3',
	imports: [NgOptimizedImage, RouterLink],
	template: `
		<a [routerLink]="['/', appRoutes.Author, author().slug]" class="flex items-start gap-4" data-testid="author">
			<!-- Avatar del autor (o placeholder cuando no hay imagen). -->
			@if (imageUrl(); as url) {
				<img
					[ngSrc]="url"
					[alt]="'Retrato de ' + author().name"
					width="80"
					height="80"
					class="size-20 shrink-0 rounded-full object-cover"
				/>
			} @else {
				<div class="size-20 shrink-0 rounded-full bg-neutral-300"></div>
			}
			<div class="flex min-w-0 flex-1 flex-col gap-1 pt-1">
				@if (tags().length > 0) {
					<div class="flex flex-wrap items-center gap-1.5" data-testid="tags">
						@for (tag of tags(); track tag.slug) {
							<span class="rounded-sm bg-brand-50 px-2 py-1 font-inter text-xxs font-bold text-brand-500 uppercase">
								{{ tag.title }}
							</span>
						}
					</div>
				}
				<div class="flex items-center gap-2">
					<span class="overflow-hidden font-inter text-lg font-bold text-ellipsis whitespace-nowrap text-neutral-900">
						{{ author().name }}
					</span>
					@if (author().nationality.flag) {
						<img
							[ngSrc]="author().nationality.flag"
							[alt]="author().nationality.country"
							width="21"
							height="16"
							class="h-4 w-5.25 shrink-0 rounded-[2px] object-cover"
						/>
					}
				</div>
				@if (storyCount() !== undefined) {
					<span class="font-inter text-xs font-medium text-neutral-600" data-testid="story-count">
						{{ storyCount() }} {{ storyCount() === 1 ? 'historia' : 'historias' }}
					</span>
				}
			</div>
		</a>
	`,
	host: {
		class: 'block',
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthorTeaserV3Component {
	protected readonly appRoutes = AppRoutes;

	// Inputs
	readonly author = input.required<AuthorTeaser>();
	readonly tags = input<Tag[]>([]);
	readonly storyCount = input<number>();

	// El avatar se solicita al CDN de Sanity a 2x (HiDPI) del tamaño de display.
	// Idealmente esto lo resolvería un loader de imágenes en lugar del resize manual.
	readonly imageUrl = computed(() => {
		const author = this.author();
		if (!author.imageUrl) {
			return '';
		}
		const size = AVATAR_PX * 2;
		return `${author.imageUrl}?h=${size}&w=${size}`;
	});
}
