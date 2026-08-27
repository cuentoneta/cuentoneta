import { Meta, StoryObj } from '@storybook/angular-vite';

import { HomeHeroComponent } from './home-hero.component';

const meta: Meta<HomeHeroComponent> = {
	component: HomeHeroComponent,
	title: 'Componentes V3/HomeHero',
	parameters: {
		// Sin esto el canvas enmarca la banda con su padding y esconde justo lo que la define.
		layout: 'fullscreen',
		docs: {
			canvas: { sourceState: 'shown' },
			description: {
				component: `<div><p>El <strong>HomeHero</strong> es la banda que abre la página de inicio en el Design System v3: fondo <code>brand-200</code> a todo el ancho, con el trazo del diseño detrás, el <code>&lt;h1&gt;</code> de la página y su bajada, y el carrusel de campañas proyectado debajo.</p><p>El fondo es full-bleed y el contenido va enmarcado adentro, así que el host vive fuera del contenedor angosto de la página. La muestra de portadas que el diseño ubica a la derecha del título está retirada hasta resolver su tratamiento visual.</p></div>`,
			},
		},
	},
};
export default meta;
type Story = StoryObj<HomeHeroComponent>;

export const Primary: Story = {
	render: () => ({
		template: `<cuentoneta-home-hero />`,
	}),
	parameters: {
		docs: {
			description: {
				story: `<p>La banda tal como la sirve la página de inicio: trazo de fondo, título y bajada, con el texto ocupando el ancho.</p><p><strong>Usos:</strong> el encabezado de la página de inicio.</p>`,
			},
		},
	},
};

export const ConContenidoProyectado: Story = {
	name: 'Con contenido proyectado',
	render: () => ({
		// El carrusel real se sustituye por un bloque de la misma caja: la story documenta la proyección,
		// no el carrusel, que tiene su propia entrada de catálogo.
		template: `
			<cuentoneta-home-hero>
				<div class="flex h-90 w-full items-center justify-center rounded-[20px] bg-neutral-300 font-inter text-neutral-700">
					Carrusel de campañas
				</div>
			</cuentoneta-home-hero>
		`,
	}),
	parameters: {
		docs: {
			description: {
				story: `<p>El hueco proyectado, que en la página lo ocupa el carrusel de campañas. Muestra la separación entre el bloque de texto y lo que viene debajo, y que el fondo de la banda envuelve a los dos.</p><p><strong>Usos:</strong> verificar la caja del carrusel dentro de la banda sin montar el carrusel.</p>`,
			},
		},
	},
};
