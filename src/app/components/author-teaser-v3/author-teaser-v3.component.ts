import { Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AuthorTeaser } from '@models/author.model';
import { Tag } from '@models/tag.model';
import { AppRoutes } from '../../app.routes';
import { ImageProfileComponent } from '../image-profile/image-profile.component';
import { TagsListComponent } from '../tags-list/tags-list.component';
import { TagComponent } from '../tag/tag.component';

/**
 * Vista previa de un autor enlazada a su perfil, según el Design System v3. Componente de
 * presentación reutilizable para listar y visualizar perfiles de autores: avatar, tags,
 * nombre + bandera de nacionalidad y cantidad de historias.
 *
 * Se modela como un `<article>` (unidad autocontenida) con un único enlace real sobre el nombre del autor,
 * estirado con un pseudo-elemento (`after:absolute after:inset-0`) para que toda la tarjeta sea clickeable
 * sin inflar el nombre accesible del link. El avatar lo resuelve `ImageProfile` y los tags `TagsList`.
 */
@Component({
	selector: 'cuentoneta-author-teaser-v3',
	imports: [NgOptimizedImage, RouterLink, ImageProfileComponent, TagsListComponent, TagComponent],
	template: `
		<article class="relative flex items-start gap-4" data-testid="author">
			<cuentoneta-image-profile
				[src]="author().imageUrl"
				[alt]="'Retrato de ' + author().name"
				size="lg"
				class="shrink-0"
			/>
			<div class="flex min-w-0 flex-1 flex-col gap-1 pt-1">
				@if (tags().length > 0) {
					<cuentoneta-tags-list data-testid="tags">
						@for (tag of tags(); track tag.slug) {
							<cuentoneta-tag [label]="tag.title" variant="filled" />
						}
					</cuentoneta-tags-list>
				}
				<div class="flex min-w-0 items-center gap-2">
					<!-- Enlace real (nombre del autor) estirado con ::after para cubrir toda la tarjeta. -->
					<a
						[routerLink]="['/', appRoutes.Author, author().slug]"
						class="min-w-0 after:absolute after:inset-0 after:content-['']"
						data-testid="author-link"
					>
						<span class="block truncate font-inter text-lg font-bold text-neutral-900">{{ author().name }}</span>
					</a>
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
		</article>
	`,
	host: {
		class: 'block',
	},
})
export class AuthorTeaserV3Component {
	protected readonly appRoutes = AppRoutes;

	// Inputs
	public readonly author = input.required<AuthorTeaser>();
	public readonly tags = input<Tag[]>([]);
	public readonly storyCount = input<number>();
}
