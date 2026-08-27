import { Component, computed, input } from '@angular/core';

import { SkeletonComponent } from '@components/skeleton/skeleton.component';

/**
 * Estado de carga (esqueleto) de AuthorInfoPanelComponent. Replica su columna —retrato, nombre, país,
 * etiquetas y las líneas de la biografía— para que la sustitución por el panel real no mueva el layout.
 */
@Component({
	selector: 'cuentoneta-author-info-panel-skeleton',
	imports: [SkeletonComponent],
	host: { class: 'flex w-full flex-col gap-4', 'data-testid': 'author-info-panel-skeleton' },
	template: `
		<cuentoneta-skeleton appearance="square" class="size-30 rounded-full bg-neutral-300" />
		<div class="flex w-full flex-col gap-4">
			<div class="flex flex-col items-start gap-2">
				<cuentoneta-skeleton appearance="line" class="h-7 w-44 bg-neutral-300" />
				<cuentoneta-skeleton appearance="line" class="h-6 w-28 bg-neutral-300" />
				<cuentoneta-skeleton appearance="line" class="h-5.5 w-32 bg-neutral-300" />
			</div>
			<!-- Barra de 16 px con 4 px de separación: los 20 px de interlineado que usa la biografía real. -->
			<div class="flex w-full flex-col gap-1">
				@for (line of biographyPlaceholders(); track $index) {
					<cuentoneta-skeleton appearance="line" class="h-4 w-full bg-neutral-300" />
				}
			</div>
		</div>
	`,
})
export class AuthorInfoPanelSkeletonComponent {
	/**
	 * Cuántas líneas de biografía dibuja. Acotado a [1, 10] para coincidir con el recorte que admite el
	 * panel real.
	 */
	public readonly biographyLines = input(4, {
		transform: (value: number) => Math.min(10, Math.max(1, value)),
	});

	protected readonly biographyPlaceholders = computed(() => Array.from({ length: this.biographyLines() }));
}
