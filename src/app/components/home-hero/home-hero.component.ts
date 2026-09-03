import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

/**
 * Encabezado de la página de inicio del Design System v3: la banda que abre la página —con su trazo de
 * fondo, el título y la bajada— y el carrusel de campañas proyectado debajo.
 *
 * El fondo es full-bleed y el contenido va enmarcado adentro, así que el host no puede vivir dentro
 * del contenedor angosto de la página.
 */
@Component({
	selector: 'cuentoneta-home-hero',
	imports: [NgOptimizedImage],
	template: `
		<!--
			El trazo del diseño viaja como imagen y no como marcado: la curva no tiene semántica y su
			geometría es del diseño, así que exportarla evita reproducirla a mano y que se desvíe del mock.
			Se estira con la banda —igual que en el diseño, que la declara sin conservar proporción—, porque
			el alto de la banda lo fija su contenido y no una relación de aspecto.
		-->
		<img ngSrc="./assets/svg/home-hero-weave.svg" fill priority alt="" class="object-fill" data-testid="hero-weave" />

		<div class="relative z-content mx-auto flex w-full max-w-screen-lg flex-col items-center gap-20 px-5 pt-44 pb-16">
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

				<!-- TODO(#2414): restituir la muestra de portadas con el tratamiento visual del diseño.
				Se retira hasta entonces: tres portadas planas en fila quedaban lejos del mock, que las
				dibuja inclinadas, con lomo y sombra sobre una caja más ancha y más alta.

				@if (covers().length > 0) {
					<div class="hidden shrink-0 gap-4 md:flex" data-testid="hero-covers">
						@for (cover of covers(); track $index) {
							<cuentoneta-cover-image [src]="cover" [priority]="$first" />
						}
					</div>
				}
				-->
			</div>

			<ng-content />
		</div>
	`,
	host: {
		// El color de fondo se conserva bajo la imagen: cubre la banda mientras el trazo no cargó, y evita
		// un destello blanco en la primera pantalla.
		class: 'relative isolate block overflow-hidden bg-brand-200',
	},
})
export class HomeHeroComponent {
	// TODO(#2414): vuelve junto con la muestra de portadas.
	// public readonly covers = input<readonly string[]>([]);
}
