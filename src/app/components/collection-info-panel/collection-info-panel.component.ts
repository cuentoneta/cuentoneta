// Core
import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

// Models
import type { Collection } from '@models/collection.model';

// Components
import { CollectionCoverComponent } from '../collection-cover/collection-cover.component';
import { TagComponent } from '../tag/tag.component';
import { TagsListComponent } from '../tags-list/tags-list.component';
import { CollectionInfoPanelSkeletonComponent } from './collection-info-panel-skeleton.component';

/**
 * Panel de información de una colección del Design System v3: portada, título, etiquetas y descripción,
 * en una columna. Existe porque la página de colección muestra el mismo bloque en dos lugares —la barra
 * lateral y el panel deslizable—, y tenerlo dos veces garantiza que diverjan.
 *
 * La portada resuelve las dos formas que declara el dominio: una imagen representativa, o el abanico de
 * tres portadas de obras de la colección.
 *
 * La descripción llega **saneada desde el backend** y se pinta como HTML; cuántas líneas se muestran lo
 * decide quien lo monta, porque depende del alto disponible en la columna que lo hospeda. Sin ese dato,
 * el panel no recorta.
 *
 * Sin colección, dibuja su propio esqueleto.
 */
@Component({
	selector: 'cuentoneta-collection-info-panel',
	imports: [CollectionCoverComponent, TagComponent, TagsListComponent, CollectionInfoPanelSkeletonComponent],
	host: { class: 'flex w-full flex-col gap-4' },
	template: `
		@if (collection(); as collection) {
			<cuentoneta-collection-cover [imagery]="collection.imagery" [priority]="priority()" />
			<div class="flex w-full flex-col gap-4">
				<div class="flex flex-col items-start gap-2">
					@if (showTitle()) {
						<p class="font-inter text-xl leading-7 font-bold text-neutral-900">{{ collection.title }}</p>
					}
					@if (collection.tags.length > 0) {
						<!-- Ancho completo: sin él la fila crece con su contenido y desborda la columna en vez de recortarse. -->
						<cuentoneta-tags-list class="w-full" data-testid="tags">
							@for (tag of collection.tags; track tag.slug) {
								<cuentoneta-tag [label]="tag.title" variant="filled" />
							}
						</cuentoneta-tags-list>
					}
				</div>
				<div [innerHTML]="safeDescription()" [class]="descriptionClasses()" data-testid="description"></div>
			</div>
		} @else {
			<cuentoneta-collection-info-panel-skeleton [descriptionLines]="descriptionLines() ?? 4" />
		}
	`,
})
export class CollectionInfoPanelComponent {
	public readonly collection = input<Collection>();

	/** El panel deslizable ya nombra la colección en su encabezado, y repetirlo sería anunciarlo dos veces. */
	public readonly showTitle = input(true);

	/** Sin valor, la descripción se muestra entera. */
	public readonly descriptionLines = input(undefined, {
		// Acotado a los enteros de [1, 10] para coincidir con el safelist `line-clamp-{1..10}` de
		// styles.css: la clase se construye dinámicamente, el escaneo estático de Tailwind no la detecta,
		// y un valor fuera de esa forma —un decimal, por caso— produciría una clase inexistente y un
		// recorte que desaparece sin que nada falle.
		transform: (value: number | undefined) =>
			value === undefined ? undefined : Math.min(10, Math.max(1, Math.trunc(value))),
	});

	/** Marca la portada como prioritaria: en la barra lateral entra above-the-fold. */
	public readonly priority = input(false);

	private readonly sanitizer = inject(DomSanitizer);

	// El backend entrega la descripción ya saneada por el pipeline compartido, y el brand del tipo es la
	// prueba de que pasó por ahí. Sin el bypass, el sanitizer de Angular vuelve a recortar una marcación
	// que ya está acotada a la allow-list, y el énfasis de la prosa se pierde.
	protected readonly safeDescription = computed(() => {
		const collection = this.collection();
		return collection ? this.sanitizer.bypassSecurityTrustHtml(collection.description) : undefined;
	});

	protected readonly descriptionClasses = computed(() => {
		const lines = this.descriptionLines();
		const base = 'font-inter text-sm leading-5 font-medium text-ellipsis text-neutral-700';
		return lines === undefined ? base : `${base} line-clamp-${lines}`;
	});
}
