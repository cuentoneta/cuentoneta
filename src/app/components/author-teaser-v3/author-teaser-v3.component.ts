import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AuthorTeaser } from '@models/author.model';
import { AppRoutes } from '../../app.routes';

/**
 * Vista previa de un autor (avatar + nombre) enlazada a su perfil, según el Design System v3.
 *
 * Es un componente de presentación reutilizable (StoryCardTeaserV3 y otras vistas). Encapsula el
 * enlace al perfil, el avatar con su fallback (placeholder) y el redimensionado de la imagen.
 */
@Component({
	selector: 'cuentoneta-author-teaser-v3',
	imports: [NgOptimizedImage, RouterLink],
	template: `
		<a [routerLink]="['/', appRoutes.Author, author().slug]" class="flex items-center gap-2" data-testid="author">
			@if (imageUrl()) {
				<img
					[ngSrc]="imageUrl()"
					[alt]="'Retrato de ' + author().name"
					width="24"
					height="24"
					class="h-6 w-6 rounded-full object-cover"
				/>
			} @else {
				<div class="h-6 w-6 rounded-full bg-neutral-300"></div>
			}
			<span class="font-inter text-sm font-medium text-neutral-900">{{ author().name }}</span>
		</a>
	`,
	host: {
		class: 'block',
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthorTeaserV3Component {
	protected readonly appRoutes = AppRoutes;

	readonly author = input.required<AuthorTeaser>();

	// El avatar se renderiza a 24px (h-6 w-6); se solicita al CDN de Sanity a 2x (HiDPI).
	// Idealmente esto lo resolvería un loader de imágenes en lugar del resize manual.
	private readonly avatarImageSize = 48;

	readonly imageUrl = computed(() => {
		const author = this.author();
		if (author.imageUrl) {
			const size = this.avatarImageSize;
			return `${author.imageUrl}?h=${size}&w=${size}`;
		}
		return '';
	});
}
