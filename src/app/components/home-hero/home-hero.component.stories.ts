import { argsToTemplate, Meta, StoryObj } from '@storybook/angular-vite';

import { HomeHeroComponent } from './home-hero.component';
import { onoffImageAssets } from '@mocks/onoff-image-assets.mock';

// Tres portadas distintas del canon de Onoff. No se derivan del agregador de colecciones porque hoy
// tiene una sola colección con imagen editorial propia, y la banda quedaría mostrando la misma imagen
// tres veces: un estado que ninguna semana real produce.
const covers = [
	onoffImageAssets.geometriasDelDesveloCover.path,
	onoffImageAssets.neronCover.path,
	onoffImageAssets.lasEscalerasCover.path,
];

const meta: Meta<HomeHeroComponent> = {
	component: HomeHeroComponent,
	title: 'Componentes V3/HomeHero',
	parameters: {
		// Sin esto el canvas enmarca la banda con su padding y esconde justo lo que la define.
		layout: 'fullscreen',
		docs: {
			canvas: { sourceState: 'shown' },
			description: {
				component: `<div><p>El <strong>HomeHero</strong> es la banda que abre la página de inicio en el Design System v3: fondo <code>brand-200</code> a todo el ancho, con el <code>&lt;h1&gt;</code> de la página, su bajada y una muestra de portadas alineada a la derecha, y el carrusel de campañas proyectado debajo.</p><p>El fondo es full-bleed y el contenido va enmarcado adentro, así que el host vive fuera del contenedor angosto de la página. Las portadas son ilustrativas —no enlazan y su <code>alt</code> queda vacío— y las resuelve <a href="./?path=/docs/componentes-v3-coverimage--docs" target="_top"><strong>CoverImage</strong></a>; la página le pasa las de las colecciones destacadas que tienen imagen editorial propia, hasta tres, y ninguna si no hay.</p></div>`,
			},
		},
	},
	argTypes: {
		covers: {
			control: { type: 'object' },
			description: 'Portadas ilustrativas de la banda; vacío deja el hero solo con su texto',
			table: { type: { summary: 'readonly string[]' }, defaultValue: { summary: '[]' } },
		},
	},
};
export default meta;
type Story = StoryObj<HomeHeroComponent>;

export const Primary: Story = {
	render: (args) => ({
		props: args,
		template: `<cuentoneta-home-hero ${argsToTemplate(args)} />`,
	}),
	args: { covers },
	parameters: {
		docs: {
			description: {
				story: `<p>La forma que sirve la página de inicio cuando la semana trae colecciones con imagen editorial: título, bajada y tres portadas.</p><p><strong>Usos:</strong> el encabezado de la página de inicio.</p>`,
			},
		},
	},
};

export const SinPortadas: Story = {
	name: 'Sin portadas',
	render: (args) => ({
		props: args,
		template: `<cuentoneta-home-hero ${argsToTemplate(args)} />`,
	}),
	args: { covers: [] },
	parameters: {
		docs: {
			description: {
				story: `<p>Ninguna colección destacada tiene imagen editorial propia. La banda no reserva el hueco: el texto ocupa el ancho y la fila no queda coja.</p><p><strong>Usos:</strong> revisar la banda en una semana sin material ilustrativo.</p>`,
			},
		},
	},
};

export const ConContenidoProyectado: Story = {
	name: 'Con contenido proyectado',
	render: (args) => ({
		props: args,
		// El carrusel real se sustituye por un bloque de la misma caja: la story documenta la proyección,
		// no el carrusel, que tiene su propia entrada de catálogo.
		template: `
			<cuentoneta-home-hero ${argsToTemplate(args)}>
				<div class="flex h-90 w-full items-center justify-center rounded-[20px] bg-neutral-300 font-inter text-neutral-700">
					Carrusel de campañas
				</div>
			</cuentoneta-home-hero>
		`,
	}),
	args: { covers },
	parameters: {
		docs: {
			description: {
				story: `<p>El hueco proyectado, que en la página lo ocupa el carrusel de campañas. Muestra la separación entre el bloque de texto y lo que viene debajo, y que el fondo de la banda envuelve a los dos.</p><p><strong>Usos:</strong> verificar la caja del carrusel dentro de la banda sin montar el carrusel.</p>`,
			},
		},
	},
};
