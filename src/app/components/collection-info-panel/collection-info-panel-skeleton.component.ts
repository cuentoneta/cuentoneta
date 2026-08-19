import { Component, computed, input } from '@angular/core';

import { SkeletonComponent } from '@components/skeleton/skeleton.component';
import { CoverImageSkeletonComponent } from '../cover-image/cover-image-skeleton.component';

/**
 * Estado de carga (esqueleto) de CollectionInfoPanelComponent. Replica su columna —portada, título,
 * etiqueta y las líneas de la descripción— para que la sustitución por el panel real no mueva el layout.
 */
@Component({
	selector: 'cuentoneta-collection-info-panel-skeleton',
	imports: [SkeletonComponent, CoverImageSkeletonComponent],
	host: { class: 'flex w-full flex-col gap-4', 'data-testid': 'collection-info-panel-skeleton' },
	template: `
		<cuentoneta-cover-image-skeleton />
		<div class="flex w-full flex-col gap-4">
			<div class="flex flex-col items-start gap-2">
				<cuentoneta-skeleton appearance="line" class="h-7 w-40 bg-neutral-300" />
				<cuentoneta-skeleton appearance="line" class="h-6 w-24 bg-neutral-300" />
			</div>
			<!-- Barra de 16 px con 4 px de separación: los 20 px de interlineado que usa la descripción real. -->
			<div class="flex w-full flex-col gap-1">
				@for (line of descriptionPlaceholders(); track $index) {
					<cuentoneta-skeleton appearance="line" class="h-4 w-full bg-neutral-300" />
				}
			</div>
		</div>
	`,
})
export class CollectionInfoPanelSkeletonComponent {
	/**
	 * Cuántas líneas de descripción dibuja. Acotado a [1, 10] para coincidir con el recorte que admite
	 * el panel real.
	 */
	public readonly descriptionLines = input(4, {
		transform: (value: number) => Math.min(10, Math.max(1, value)),
	});

	protected readonly descriptionPlaceholders = computed(() => Array.from({ length: this.descriptionLines() }));
}
