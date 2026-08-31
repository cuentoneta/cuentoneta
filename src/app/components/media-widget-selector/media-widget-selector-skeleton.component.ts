import { Component } from '@angular/core';

import { SkeletonComponent } from '@components/skeleton/skeleton.component';

/**
 * Esqueleto de carga de `MediaWidgetSelector`. Reserva el alto del bloque —título, fila de formatos
 * y widget— para que su llegada no empuje al cuerpo de la obra.
 *
 * Dibuja el caso general, el de una obra con varios formatos: es el que ocupa más alto, y reservar de
 * menos hace saltar el layout mientras que reservar de más solo deja un hueco que se llena.
 */
@Component({
	selector: 'cuentoneta-media-widget-selector-skeleton',
	imports: [SkeletonComponent],
	host: { class: 'block' },
	template: `
		<div class="flex flex-col gap-5">
			<cuentoneta-skeleton class="h-7 w-2/3 bg-neutral-200" />
			<cuentoneta-skeleton appearance="square" class="h-10 w-48 rounded-full bg-neutral-200" />
			<cuentoneta-skeleton appearance="square" class="h-52 w-full rounded-xl bg-neutral-200" />
		</div>
	`,
})
export class MediaWidgetSelectorSkeleton {}
