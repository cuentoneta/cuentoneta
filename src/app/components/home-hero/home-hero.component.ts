import { Component, input } from '@angular/core';

import { CoverImageComponent } from '@components/cover-image/cover-image.component';

/**
 * Encabezado de la página de inicio del Design System v3: la banda de fondo que abre la página, con
 * el título, la bajada y una muestra de portadas, y el carrusel de campañas proyectado debajo.
 *
 * El fondo es full-bleed y el contenido va enmarcado adentro, así que el host no puede vivir dentro
 * del contenedor angosto de la página.
 *
 * Las portadas son ilustrativas: no enlazan a ningún lado y su `alt` queda vacío, porque el título y
 * la bajada ya dicen todo lo que la banda comunica.
 */
@Component({
	selector: 'cuentoneta-home-hero',
	imports: [CoverImageComponent],
	template: `
		<div class="mx-auto flex w-full max-w-screen-lg flex-col items-center gap-20 px-5 pt-44 pb-16">
			<div class="flex w-full flex-col items-center justify-between gap-10 lg:flex-row lg:gap-8">
				<div class="flex flex-col gap-4">
					<h1 class="font-source-serif text-4xl font-semibold text-neutral-900 lg:text-6xl">
						Un espacio para explorar y descubrir nuevas obras
					</h1>
					<p class="font-inter text-xl font-medium text-neutral-600">
						Leé, descubrí y compartí relatos organizados en colecciones creadas para acercar la lectura digital a más
						personas.
					</p>
				</div>

				@if (covers().length > 0) {
					<!--
						La tira mide 386px rígidos y no encoge, así que solo aparece donde el hero es de dos columnas:
						en el diseño es el adorno de esa fila, y en una columna desbordaría el ancho del teléfono.
					-->
					<div class="hidden shrink-0 gap-4 md:flex" data-testid="hero-covers">
						@for (cover of covers(); track $index) {
							<cuentoneta-cover-image [src]="cover" [priority]="$first" />
						}
					</div>
				}
			</div>

			<ng-content />
		</div>
	`,
	host: {
		class: 'block bg-brand-200',
	},
})
export class HomeHeroComponent {
	/** Portadas ilustrativas de la banda; vacío deja el hero solo con su texto. */
	public readonly covers = input<readonly string[]>([]);
}
