import { Component } from '@angular/core';

import { DividerComponent } from '@components/divider/divider.component';
import { LiteraryWorkHeroHeaderComponent } from '@components/literary-work-hero-header/literary-work-hero-header.component';
import { SkeletonComponent } from '@components/skeleton/skeleton.component';

/**
 * Silueta de carga de la página de lectura: el hero, la barra de lectura y las primeras líneas del
 * cuerpo. Vive junto a la página y no en el catálogo compartido porque reproduce **su** disposición,
 * que no sirve a ninguna otra pantalla.
 *
 * El hero dibuja su propio esqueleto cuando no recibe obra, así que se lo monta tal cual en vez de
 * reproducir su silueta acá.
 */
@Component({
	selector: 'cuentoneta-literary-work-page-skeleton',
	imports: [DividerComponent, LiteraryWorkHeroHeaderComponent, SkeletonComponent],
	host: { class: 'block w-full' },
	template: `
		<header class="flex flex-col gap-2">
			<cuentoneta-literary-work-hero-header />
		</header>
		<section class="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8">
			<div class="flex flex-col gap-7 pt-7">
				<div class="flex items-center justify-between">
					<cuentoneta-skeleton class="h-4 w-32 bg-neutral-200" />
					<cuentoneta-skeleton appearance="square" class="h-8 w-24 rounded-full bg-neutral-200" />
				</div>
				<cuentoneta-divider />
			</div>
			@for (line of bodyLines; track $index) {
				<cuentoneta-skeleton class="h-5 w-full bg-neutral-200" />
			}
		</section>
	`,
})
export class LiteraryWorkPageSkeleton {
	// Silueta de carga, no una medida del texto real: el largo del cuerpo recién se conoce cuando la
	// obra llegó.
	protected readonly bodyLines = Array.from({ length: 8 });
}
