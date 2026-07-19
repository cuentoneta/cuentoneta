import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { StorylistTeaser } from '@models/storylist.model';
import { AppRoutes } from '../../app.routes';
import { ImageProfileComponent } from '../image-profile/image-profile.component';
import { TagComponent } from '../tag/tag.component';

/**
 * Item compacto y navegable de una colección (Design System v3): ícono de biblioteca, nombre, categoría y
 * cantidad de historias. Pensado para listas como «Otras colecciones sugeridas» del sidebar de la CollectionPage.
 *
 * Se modela como un `<article>` con un único enlace real sobre el nombre, estirado con un pseudo-elemento
 * (`after:absolute after:inset-0`) para que toda la tarjeta sea clickeable sin inflar el nombre accesible del
 * link. El ícono lo resuelve `ImageProfile` (variante `collection`, decorativa) y la categoría `Tag`.
 */
@Component({
	selector: 'cuentoneta-navigable-collection-teaser',
	imports: [RouterLink, ImageProfileComponent, TagComponent],
	template: `
		<article class="relative flex items-center gap-3" data-testid="collection">
			<cuentoneta-image-profile variant="collection" size="medium" class="shrink-0" />
			<div class="flex min-w-0 flex-1 flex-col gap-1">
				<!-- Enlace real (nombre de la colección) estirado con ::after para cubrir toda la tarjeta. -->
				<a
					[routerLink]="['/', appRoutes.StoryList, collection().slug]"
					class="min-w-0 after:absolute after:inset-0 after:content-['']"
					data-testid="collection-link"
				>
					<span class="block truncate font-inter text-sm font-semibold text-neutral-900">{{ collection().title }}</span>
				</a>
				<div class="flex items-center gap-2" data-testid="meta">
					@if (collection().tags[0]; as tag) {
						<cuentoneta-tag [label]="tag.title" variant="soft" />
						<span class="font-inter text-xxs font-medium text-neutral-600" aria-hidden="true">•</span>
					}
					<span class="font-inter text-xs font-medium text-neutral-600">
						{{ collection().count }} {{ collection().count === 1 ? 'historia' : 'historias' }}
					</span>
				</div>
			</div>
		</article>
	`,
	host: {
		class: 'block',
	},
})
export class NavigableCollectionTeaserComponent {
	protected readonly appRoutes = AppRoutes;

	public readonly collection = input.required<StorylistTeaser>();
}
