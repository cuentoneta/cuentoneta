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
		<div class="content horizontal-layout-spacing flex flex-col items-center gap-20 pt-44 pb-16">
			<div class="flex w-full flex-col items-center justify-between gap-10 md:flex-row md:gap-8">
				<div class="flex flex-col gap-4">
					<h1 class="font-source-serif text-4xl font-semibold text-neutral-900 md:text-6xl">
						Un espacio para explorar y descubrir nuevas historias
					</h1>
					<p class="font-inter text-xl font-medium text-neutral-600">
						Leé, descubrí y compartí relatos organizados en colecciones creadas para acercar la lectura digital a más
						personas.
					</p>
				</div>

				@if (covers().length > 0) {
					<div class="flex shrink-0 gap-4" data-testid="hero-covers">
						@for (cover of covers(); track cover) {
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
