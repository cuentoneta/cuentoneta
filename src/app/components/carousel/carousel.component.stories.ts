import { applicationConfig, argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { provideRouter } from '@angular/router';

import { CarouselComponent } from './carousel.component';
import { CarouselSkeletonComponent } from './carousel-skeleton.component';
import { contentCampaignMock } from '@mocks/content-campaign.mock';
import { ContentCampaign } from '@models/content-campaign.model';

const meta: Meta<CarouselComponent> = {
	component: CarouselComponent,
	title: 'Componentes V3/Carousel',
	decorators: [
		applicationConfig({
			providers: [provideRouter([])],
		}),
	],
	parameters: {
		docs: {
			canvas: {
				sourceState: 'shown',
			},
			description: {
				component: `<div><p>El componente <strong>CarouselComponent</strong> es un carousel de contenido interactivo que muestra campañas de contenido destacado con navegación automática y manual. Compone <strong>CarouselIndicator</strong> (indicadores de progreso clickeables) y <strong>CarouselControls</strong> (controles de navegación, solo en desktop).</p><p><strong>Características:</strong> reproducción automática con pausa al hacer hover o durante interacción táctil; navegación por gestos táctiles (swipe) y por teclado (flechas ← →); indicadores de progreso clickeables; controles de navegación solo en desktop; imágenes responsive (mobile/desktop); respeta <code>prefers-reduced-motion</code>.</p><p><strong>Accesibilidad:</strong> atributos ARIA completos para lectores de pantalla, navegación por teclado y focus visible.</p></div>`,
			},
		},
		layout: 'padded',
	},
	argTypes: {
		slides: {
			control: { type: 'object' },
			description: 'Array de campañas de contenido a mostrar en el carousel',
			table: {
				type: { summary: 'ContentCampaign[]' },
				defaultValue: { summary: '[]' },
			},
		},
		transitionDuration: {
			control: { type: 'number', min: 200, max: 1500, step: 100 },
			description: 'Duración de la transición entre diapositivas en milisegundos',
			table: {
				type: { summary: 'number' },
				defaultValue: { summary: '600' },
			},
		},
		autoPlayInterval: {
			control: { type: 'number', min: 1000, max: 10000, step: 500 },
			description: 'Intervalo de reproducción automática entre diapositivas en milisegundos',
			table: {
				type: { summary: 'number' },
				defaultValue: { summary: '5000' },
			},
		},
	},
};

export default meta;
type Story = StoryObj<CarouselComponent>;

export const Default: Story = {
	name: 'Por defecto',
	render: (args) => ({ props: args, template: `<cuentoneta-carousel ${argsToTemplate(args)} />` }),
	args: {
		slides: contentCampaignMock,
		transitionDuration: 600,
	},
	parameters: {
		docs: {
			description: {
				story: `<p>Carousel con configuración por defecto mostrando múltiples campañas de contenido.</p><p><strong>Usos:</strong> Home, en la sección de campañas de contenido destacado.</p>`,
			},
		},
	},
};

export const SingleSlide: Story = {
	name: 'Diapositiva única',
	render: (args) => ({ props: args, template: `<cuentoneta-carousel ${argsToTemplate(args)} />` }),
	args: {
		slides: [contentCampaignMock[0]],
		transitionDuration: 600,
	},
	parameters: {
		docs: {
			description: {
				story: `<p>Carousel con una única diapositiva. Los controles de navegación e indicadores se ocultan automáticamente y se pausa la reproducción.</p><p><strong>Usos:</strong> Home cuando hay una sola campaña activa.</p>`,
			},
		},
	},
};

export const FastTransition: Story = {
	name: 'Transición rápida',
	render: (args) => ({ props: args, template: `<cuentoneta-carousel ${argsToTemplate(args)} />` }),
	args: {
		slides: contentCampaignMock,
		transitionDuration: 300,
	},
	parameters: {
		docs: {
			description: {
				story: `<p>Carousel con transición rápida de 300ms.</p><p><strong>Usos:</strong> referencia para ajustar la velocidad de transición a un ritmo más ágil.</p>`,
			},
		},
	},
};

export const SlowTransition: Story = {
	name: 'Transición lenta',
	render: (args) => ({ props: args, template: `<cuentoneta-carousel ${argsToTemplate(args)} />` }),
	args: {
		slides: contentCampaignMock,
		transitionDuration: 1200,
	},
	parameters: {
		docs: {
			description: {
				story: `<p>Carousel con transición lenta de 1200ms.</p><p><strong>Usos:</strong> referencia para una transición más pausada y enfática.</p>`,
			},
		},
	},
};

const extendedSlidesMock: ContentCampaign[] = [
	...contentCampaignMock,
	{
		title: 'Geometrías del desvelo',
		slug: 'geometrias-del-desvelo',
		description: [
			{
				style: 'normal',
				_key: 'ab12cd34ef56',
				markDefs: [],
				children: [
					{
						text: 'Shannon despierta a las tres y media. Nunca duerme más de dos horas.',
						_key: '78ab90cd12ef',
						_type: 'span',
						marks: [],
					},
				],
				_type: 'block',
			},
		],
		url: '../storylist/geometrias-del-desvelo',
		contents: {
			xs: {
				imageUrl: 'assets/img/mocks/banners/banner-geometrias-del-desvelo-mobile.png',
				imageWidth: 540,
				imageHeight: 220,
			},
			md: {
				imageUrl: 'assets/img/mocks/banners/banner-geometrias-del-desvelo-desktop.png',
				imageWidth: 1240,
				imageHeight: 360,
			},
		},
	},
	{
		title: 'Onoff, la voz de las fronteras',
		slug: 'onoff-autor-en-foco',
		description: [
			{
				style: 'normal',
				_key: '34ef56ab78cd',
				markDefs: [],
				children: [
					{
						text: 'Ocho obras donde ninguna ley vale del todo y ninguna lengua se habla por completo.',
						_key: '90cd12ef34ab',
						_type: 'span',
						marks: [],
					},
				],
				_type: 'block',
			},
		],
		url: '../author/francois-onoff',
		contents: {
			xs: {
				imageUrl: 'assets/img/mocks/banners/banner-onoff-autor-mobile.png',
				imageWidth: 540,
				imageHeight: 220,
			},
			md: {
				imageUrl: 'assets/img/mocks/banners/banner-onoff-autor-desktop.png',
				imageWidth: 1240,
				imageHeight: 360,
			},
		},
	},
];

export const MultipleSlides: Story = {
	name: 'Múltiples diapositivas',
	render: (args) => ({ props: args, template: `<cuentoneta-carousel ${argsToTemplate(args)} />` }),
	args: {
		slides: extendedSlidesMock,
		transitionDuration: 600,
	},
	parameters: {
		docs: {
			description: {
				story: `<p>Carousel con cuatro diapositivas para demostrar la navegación cíclica.</p><p><strong>Usos:</strong> Home cuando hay varias campañas activas en rotación.</p>`,
			},
		},
	},
};

export const Interactive: Story = {
	name: 'Interactivo',
	render: (args) => ({
		props: args,
		template: `
			<div class="space-y-4">
				<div class="text-sm text-neutral-600 mb-4">
					<p><strong>Instrucciones de interacción:</strong></p>
					<ul class="list-disc list-inside mt-2 space-y-1">
						<li>Usa las flechas del teclado (← →) para navegar</li>
						<li>Haz clic en los indicadores para ir a una diapositiva específica</li>
						<li>Desliza horizontalmente en dispositivos táctiles</li>
						<li>Pasa el mouse sobre el carousel para pausar la reproducción automática</li>
					</ul>
				</div>
				<cuentoneta-carousel [slides]="slides" [transitionDuration]="transitionDuration" />
			</div>
		`,
	}),
	args: {
		slides: contentCampaignMock,
		transitionDuration: 600,
	},
	parameters: {
		docs: {
			// El render envuelve al carousel en un andamiaje de instrucciones; ocultamos el código para no exponerlo como uso copiable.
			canvas: { sourceState: 'none' },
			description: {
				story: `<p>Carousel interactivo con instrucciones de uso. Probá las diferentes formas de navegación (teclado, indicadores, swipe, hover).</p><p><strong>Usos:</strong> verificación manual de las interacciones del componente.</p>`,
			},
		},
	},
};

export const DesktopAndMobile: Story = {
	name: 'Escritorio y móvil',
	render: (args) => ({
		props: args,
		template: `
			<div class="flex flex-col gap-8 p-4">
				<div>
					<h3 class="text-lg font-semibold text-neutral-700 mb-3">Desktop (960px)</h3>
					<div style="width: 1240px; max-width: 100%; justify-self: center;">
						<cuentoneta-carousel [slides]="slides" [transitionDuration]="transitionDuration" />
					</div>
				</div>

				<div>
					<h3 class="text-lg font-semibold text-neutral-700 mb-3">Mobile (375px)</h3>
					<div style="width: 375px; justify-self: center;">
						<cuentoneta-carousel [slides]="slides" [transitionDuration]="transitionDuration" />
					</div>
				</div>
			</div>
		`,
	}),
	args: {
		slides: contentCampaignMock,
		transitionDuration: 600,
	},
	parameters: {
		layout: 'fullscreen',
		docs: {
			// El render envuelve al carousel en un andamiaje comparativo desktop/mobile; ocultamos el código para no exponerlo como uso copiable.
			canvas: { sourceState: 'none' },
			description: {
				story: `<p>Comparativa del carousel en vista desktop (960px) y mobile (375px) para visualizar las diferencias de diseño responsivo.</p><p><strong>Usos:</strong> referencia de comportamiento responsive entre breakpoints.</p>`,
			},
		},
	},
};

export const Estados: StoryObj<CarouselComponent & { loading: boolean }> = {
	decorators: [moduleMetadata({ imports: [CarouselSkeletonComponent] })],
	argTypes: { loading: { control: 'boolean', name: 'Cargando' } },
	render: (args) => ({
		props: args,
		template: `
			@if (loading) {
				<cuentoneta-carousel-skeleton />
			} @else {
				<cuentoneta-carousel [slides]="slides" [transitionDuration]="transitionDuration" />
			}
		`,
	}),
	args: {
		loading: true,
		slides: contentCampaignMock,
		transitionDuration: 600,
	},
	parameters: {
		docs: { description: { story: 'Activá/desactivá "Cargando" para alternar entre el estado real y el skeleton.' } },
	},
};
