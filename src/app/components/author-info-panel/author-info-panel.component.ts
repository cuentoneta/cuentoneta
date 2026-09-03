// Core
import { Component, computed, inject, input, output } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';

// Models
import type { Author } from '@models/author.model';

// Directives
import { ClampOverflowDirective } from '../../directives/clamp-overflow.directive';

// Components
import { ButtonComponent } from '../button/button.component';
import { ImageProfileComponent } from '../image-profile/image-profile.component';
import { TagComponent } from '../tag/tag.component';
import { TagsListComponent } from '../tags-list/tags-list.component';
import { AuthorInfoPanelSkeletonComponent } from './author-info-panel-skeleton.component';

/**
 * Panel de perfil de un autor del Design System v3: retrato, nombre, país, etiquetas y biografía, en una
 * columna. Existe porque la página de autor muestra el mismo bloque en dos lugares —la barra lateral y el
 * panel deslizable—, y tenerlo dos veces garantiza que diverjan.
 *
 * La biografía llega **saneada desde el backend** y se pinta como HTML; cuántas líneas se muestran lo
 * decide quien lo monta, porque depende del alto disponible en la columna que lo hospeda. Sin ese dato,
 * el panel no recorta.
 *
 * Sin autor, dibuja su propio esqueleto.
 */
@Component({
	selector: 'cuentoneta-author-info-panel',
	imports: [
		ButtonComponent,
		ClampOverflowDirective,
		ImageProfileComponent,
		NgOptimizedImage,
		TagComponent,
		TagsListComponent,
		AuthorInfoPanelSkeletonComponent,
	],
	host: { class: 'flex w-full flex-col gap-4' },
	template: `
		@if (author(); as author) {
			<cuentoneta-image-profile [src]="author.imageUrl" [alt]="'Retrato de ' + author.name" size="xl" />
			<div class="flex w-full flex-col gap-4">
				<div class="flex flex-col items-start gap-2">
					@if (showName()) {
						<h1 class="font-inter text-xl leading-7 font-bold text-neutral-900">{{ author.name }}</h1>
					}
					<p class="flex items-center gap-2 font-inter text-base leading-6 font-medium text-neutral-700">
						@if (author.nationality.flag) {
							<img
								[ngSrc]="author.nationality.flag"
								class="h-4 w-5.25 shrink-0 rounded-[2px] object-cover"
								width="21"
								height="16"
								alt=""
							/>
						}
						{{ author.nationality.country }}
					</p>
					@if (author.tags.length > 0) {
						<!-- Ancho completo: sin él la fila crece con su contenido y desborda la columna en vez de recortarse. -->
						<cuentoneta-tags-list class="w-full" data-testid="tags">
							@for (tag of author.tags; track tag.slug) {
								<cuentoneta-tag [label]="tag.title" variant="filled" />
							}
						</cuentoneta-tags-list>
					}
				</div>
				<div
					[innerHTML]="safeBiography()"
					[class]="biographyClasses()"
					#clamp="cuentonetaClampOverflow"
					cuentonetaClampOverflow
					data-biography
					data-testid="biography"
				></div>
				@if (showReadMore() && clamp.isOverflowing()) {
					<button (click)="readMore.emit()" cuentoneta-button variant="outline" type="button" class="w-full">
						Leer más
					</button>
				}
			</div>
		} @else {
			<cuentoneta-author-info-panel-skeleton [biographyLines]="biographyLines() ?? 4" />
		}
	`,
})
export class AuthorInfoPanelComponent {
	public readonly author = input<Author>();

	/**
	 * El nombre se emite como encabezado de primer nivel de la página. El panel deslizable monta el mismo
	 * componente y ya nombra al autor en su etiqueta accesible: repetirlo daría dos `h1` con el mismo texto.
	 */
	public readonly showName = input(true);

	/** Sin valor, la biografía se muestra entera. */
	public readonly biographyLines = input(undefined, {
		// Acotado a los enteros de [1, 10] para coincidir con el safelist `line-clamp-{1..10}` de
		// styles.css: la clase se construye dinámicamente, el escaneo estático de Tailwind no la detecta,
		// y un valor fuera de esa forma —un decimal, por caso— produciría una clase inexistente y un
		// recorte que desaparece sin que nada falle.
		transform: (value: number | undefined) =>
			value === undefined ? undefined : Math.min(10, Math.max(1, Math.trunc(value))),
	});

	/**
	 * Ofrece el acceso a la biografía completa. Aparece solo si además la biografía desborda su recorte,
	 * así que vive fuera del elemento medido: adentro cambiaría lo que se mide. Sin recorte la medición es
	 * siempre falsa, de modo que un montaje sin `biographyLines` no necesita apagarlo.
	 */
	public readonly showReadMore = input(false);

	/** La persona usuaria pidió leer la biografía completa. Quién la muestra es de quien lo monta. */
	public readonly readMore = output<void>();

	private readonly sanitizer = inject(DomSanitizer);

	// El backend entrega la biografía ya saneada por el pipeline compartido, y el brand del tipo es la
	// prueba de que pasó por ahí. Sin el bypass, el sanitizer de Angular vuelve a recortar una marcación
	// que ya está acotada a la allow-list, y el énfasis de la prosa se pierde.
	protected readonly safeBiography = computed(() => {
		const author = this.author();
		return author ? this.sanitizer.bypassSecurityTrustHtml(author.biography) : undefined;
	});

	protected readonly biographyClasses = computed(() => {
		const lines = this.biographyLines();
		const base = 'font-inter text-sm leading-5 font-medium text-ellipsis text-neutral-700';
		return lines === undefined ? base : `${base} line-clamp-${lines}`;
	});
}
