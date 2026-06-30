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

// Historia principal con documentación
export const Default: Story = {
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

// Carousel con una sola diapositiva
export const SingleSlide: Story = {
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

// Carousel con transición rápida
export const FastTransition: Story = {
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

// Carousel con transición lenta
export const SlowTransition: Story = {
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

// Múltiples diapositivas de ejemplo
const extendedSlidesMock: ContentCampaign[] = [
	...contentCampaignMock,
	{
		title: 'Cuentos Clásicos Argentinos',
		slug: 'cuentos-clasicos-argentinos',
		description: [
			{
				style: 'normal',
				_key: 'abc123',
				markDefs: [],
				children: [
					{
						text: 'Una selección de los mejores cuentos de la literatura argentina.',
						_key: 'def456',
						_type: 'span',
						marks: [],
					},
				],
				_type: 'block',
			},
		],
		url: '../storylist/cuentos-clasicos-argentinos',
		contents: {
			xs: {
				imageUrl:
					'https://cdn.sanity.io/images/s4dbqkc5/development/d1954f5948a07ec4f02c9c621f664e42bbe61ce9-540x220.jpg',
				imageWidth: 540,
				imageHeight: 220,
			},
			md: {
				imageUrl:
					'https://cdn.sanity.io/images/s4dbqkc5/development/ec31c09f54fe53f4de213075d2e73e61805fbf4f-960x280.jpg',
				imageWidth: 960,
				imageHeight: 280,
			},
		},
	},
];

// Carousel con múltiples diapositivas
export const MultipleSlides: Story = {
	render: (args) => ({ props: args, template: `<cuentoneta-carousel ${argsToTemplate(args)} />` }),
	args: {
		slides: extendedSlidesMock,
		transitionDuration: 600,
	},
	parameters: {
		docs: {
			description: {
				story: `<p>Carousel con tres diapositivas para demostrar la navegación cíclica.</p><p><strong>Usos:</strong> Home cuando hay varias campañas activas en rotación.</p>`,
			},
		},
	},
};

// Historia interactiva para documentación
export const Interactive: Story = {
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
			description: {
				story: `<p>Carousel interactivo con instrucciones de uso. Probá las diferentes formas de navegación (teclado, indicadores, swipe, hover).</p><p><strong>Usos:</strong> verificación manual de las interacciones del componente.</p>`,
			},
		},
	},
};

// Vista comparativa Desktop y Mobile
export const DesktopAndMobile: Story = {
	render: (args) => ({
		props: args,
		template: `
			<div class="flex flex-col gap-8 p-4">
				<!-- Desktop View -->
				<div>
					<h3 class="text-lg font-semibold text-neutral-700 mb-3">Desktop (960px)</h3>
					<div style="width: 1240px; max-width: 100%; justify-self: center;">
						<cuentoneta-carousel [slides]="slides" [transitionDuration]="transitionDuration" />
					</div>
				</div>

				<!-- Mobile View -->
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
			description: {
				story: `<p>Comparativa del carousel en vista desktop (960px) y mobile (375px) para visualizar las diferencias de diseño responsivo.</p><p><strong>Usos:</strong> referencia de comportamiento responsive entre breakpoints.</p>`,
			},
		},
	},
};

// Switch "Cargando" para alternar real↔skeleton en el mismo slot y evaluar la transición/alineación.
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
