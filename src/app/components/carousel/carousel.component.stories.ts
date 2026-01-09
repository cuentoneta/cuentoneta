import { applicationConfig, Meta, StoryObj } from '@storybook/angular';
import { provideRouter } from '@angular/router';

import { CarouselComponent } from './carousel.component';
import { contentCampaignMock } from '@mocks/content-campaign.mock';
import { ContentCampaign } from '@models/content-campaign.model';

const meta: Meta<CarouselComponent> = {
	component: CarouselComponent,
	title: 'Componentes/Carousel',
	decorators: [
		applicationConfig({
			providers: [provideRouter([])],
		}),
	],
	parameters: {
		docs: {
			description: {
				component: `<div>
					<p>El componente **CarouselComponent** es un carousel de contenido interactivo que permite mostrar campañas de contenido destacado con navegación automática y manual.</p>
					<h4>Características:</h4>
					<ul>
						<li>Reproducción automática con pausa al hacer hover o durante interacción táctil</li>
						<li>Navegación por gestos táctiles (swipe izquierda/derecha)</li>
						<li>Navegación por teclado (flechas izquierda/derecha)</li>
						<li>Indicadores de progreso clickeables</li>
						<li>Controles de navegación (solo en desktop)</li>
						<li>Soporte para imágenes responsive (mobile/desktop)</li>
						<li>Respeta preferencias de reducción de movimiento del usuario</li>
					</ul>
					<h4>Accesibilidad:</h4>
					<ul>
						<li>Atributos ARIA completos para lectores de pantalla</li>
						<li>Navegación por teclado</li>
						<li>Focus visible para navegación</li>
						<li>Soporte para <code>prefers-reduced-motion</code></li>
					</ul>
				</div>`,
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
	},
};

export default meta;
type Story = StoryObj<CarouselComponent>;

// Historia principal con documentación
export const Default: Story = {
	args: {
		slides: contentCampaignMock,
		transitionDuration: 600,
	},
	parameters: {
		docs: {
			description: {
				story: 'Carousel con configuración por defecto mostrando múltiples campañas de contenido.',
			},
		},
	},
};

// Carousel con una sola diapositiva
export const SingleSlide: Story = {
	args: {
		slides: [contentCampaignMock[0]],
		transitionDuration: 600,
	},
	parameters: {
		docs: {
			description: {
				story:
					'Carousel con una única diapositiva. Los controles de navegación e indicadores se ocultan automáticamente.',
			},
		},
	},
};

// Carousel con transición rápida
export const FastTransition: Story = {
	args: {
		slides: contentCampaignMock,
		transitionDuration: 300,
	},
	parameters: {
		docs: {
			description: {
				story: 'Carousel con transición rápida de 300ms.',
			},
		},
	},
};

// Carousel con transición lenta
export const SlowTransition: Story = {
	args: {
		slides: contentCampaignMock,
		transitionDuration: 1200,
	},
	parameters: {
		docs: {
			description: {
				story: 'Carousel con transición lenta de 1200ms.',
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
	args: {
		slides: extendedSlidesMock,
		transitionDuration: 600,
	},
	parameters: {
		docs: {
			description: {
				story: 'Carousel con tres diapositivas para demostrar la navegación cíclica.',
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
				story: 'Carousel interactivo con instrucciones de uso. Prueba las diferentes formas de navegación.',
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
				story:
					'Comparativa del carousel en vista desktop (960px) y mobile (375px) para visualizar las diferencias de diseño responsivo.',
			},
		},
	},
};
