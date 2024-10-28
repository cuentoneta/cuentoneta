// Core
import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, NgOptimizedImage } from '@angular/common';

// 3rd party modules
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';

// Models
import { ContentCampaign, ContentCampaignViewport } from '@models/content-campaign.model';

// Services
import { ThemeService } from '../../providers/theme.service';

// Components
import { PortableTextParserComponent } from '../portable-text-parser/portable-text-parser.component';

@Component({
	selector: 'cuentoneta-content-campaign-carousel',
	standalone: true,
	imports: [CommonModule, CarouselModule, NgOptimizedImage, RouterLink, PortableTextParserComponent],

	template: `
		<section class="block">
			<owl-carousel-o [options]="options" class="mx-auto block">
				@for (slide of slides(); track slide.slug) {
					<ng-template carouselSlide>
						<div class="slide">
							<a [routerLink]="slide.url" [ngClass]="viewportSpecificClasses[viewport]">
								<header class="mb-3">
									<h2 class="text-lg font-bold tracking-normal">
										<cuentoneta-portable-text-parser
											[paragraphs]="slide.contents[viewport].title"
										></cuentoneta-portable-text-parser>
									</h2>
									<h3 class="h4 subtitle text-gray-600">
										<cuentoneta-portable-text-parser
											[paragraphs]="slide.contents[viewport].subtitle"
										></cuentoneta-portable-text-parser>
									</h3>
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
						</div>
					</ng-template>
				}
			</owl-carousel-o>
		</section>
	`,
})
export class ContentCampaignCarouselComponent {
	private themeService = inject(ThemeService);

	slides = input<ContentCampaign[]>([]);

	// Viewport para el que debe renderizarse el contenido.
	viewport: ContentCampaignViewport = this.themeService.viewport;

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
