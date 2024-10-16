// Core
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, NgOptimizedImage } from '@angular/common';

// 3rd party modules
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';

// Models
import { ContentCampaign, ContentCampaignViewport, ContentCampaignViewportKeys } from '@models/content-campaign.model';

// Components
import { PortableTextParserComponent } from '../portable-text-parser/portable-text-parser.component';

@Component({
	selector: 'cuentoneta-content-campaign-carousel',
	standalone: true,
	imports: [CommonModule, CarouselModule, NgOptimizedImage, RouterLink, PortableTextParserComponent],

	template: `
		<section class="block">
			<!-- TODO: Eliminar valor harcoded de 960px una vez actualizado el ancho máximo de pantalla -->
			<owl-carousel-o [options]="options" class="mx-auto block max-w-[960px]">
				@for (slide of slides(); track slide.slug) {
					<ng-template carouselSlide>
						<div class="slide">
							@for (viewport of viewports; track $index) {
								<a [routerLink]="slide.url" [ngClass]="viewportSpecificClasses[viewport]">
									<header class="mb-3">
										<h3 class="text-lg font-bold tracking-normal">
											<cuentoneta-portable-text-parser
												[paragraphs]="slide.contents[viewport].title"
											></cuentoneta-portable-text-parser>
										</h3>
										<h4 class="h4 subtitle text-gray-600">
											<cuentoneta-portable-text-parser
												[paragraphs]="slide.contents[viewport].subtitle"
											></cuentoneta-portable-text-parser>
										</h4>
									</header>
									<img
										[ngSrc]="slide.contents[viewport].imageUrl"
										[width]="slide.contents[viewport].imageWidth"
										[height]="slide.contents[viewport].imageHeight"
										[alt]="'Imagen de la campaña de contenido ' + slide.title"
										[ngClass]="
											'max-w-[' +
											slide.contents[viewport].imageWidth +
											'px] max-h-[' +
											slide.contents[viewport].imageHeight +
											'px] rounded-2xl'
										"
										class="rounded-2xl"
										priority
									/>
								</a>
							}
						</div>
					</ng-template>
				}
			</owl-carousel-o>
		</section>
	`,
})
export class ContentCampaignCarouselComponent {
	slides = input<ContentCampaign[]>([]);

	// Lista de viewports soportados por el componente.
	readonly viewports: ContentCampaignViewport[] = ContentCampaignViewportKeys;

	// Asigna las clases específicas de visibilidad para cada uno de los viewports soportados.
	readonly viewportSpecificClasses: { [key in ContentCampaignViewport]: string } = {
		xs: 'md:hidden',
		md: 'max-md:hidden',
	};

	// Opciones de configuración del carrusel de campañas de contenido.
	readonly options: OwlOptions = Object.assign({
		autoplay: true,
		autoplaySpeed: 1200,
		autoplayMouseleaveTimeout: 5000,
		loop: true,
		mouseDrag: false,
		dots: true,
		navSpeed: 500,
		margin: 12,
		responsive: {
			0: {
				items: 1,
			},
		},
		nav: false,
	});
}
