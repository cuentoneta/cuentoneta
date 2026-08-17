import { Meta, StoryObj } from '@storybook/angular-vite';
import { HeaderComponent } from './header.component';

export default {
	title: 'HeaderComponent',
	component: HeaderComponent,
	parameters: {
		docs: {
			description: {
				component: `<div><p>El <strong>HeaderComponent</strong> es el encabezado del sitio: logo, navegación principal y menú desplegable en viewports angostos. El input <code>isVisible</code> lo oculta al hacer scroll hacia abajo, colapsando alto, opacidad y desplazamiento en una transición que respeta <code>prefers-reduced-motion</code>. Al ocultarse deja además de recibir foco y clics, para que la barra que la interfaz declara ausente tampoco exista para el teclado ni para el puntero.</p></div>`,
			},
		},
	},
	argTypes: {
		isVisible: {
			control: { type: 'boolean' },
			description: 'Muestra u oculta el encabezado; al ocultarse cierra el menú desplegable',
			table: { type: { summary: 'boolean' }, defaultValue: { summary: 'true' } },
		},
	},
} as Meta<HeaderComponent>;

export const Primary: StoryObj<HeaderComponent> = {
	render: (args) => ({ props: args }),
	args: { isVisible: true },
	parameters: {
		docs: {
			description: {
				story: `<p>Encabezado visible, que es como se sirve en todas las páginas. Alterná el control para ver la transición de ocultamiento, la misma que dispara el scroll hacia abajo.</p><p><strong>Usos:</strong> todas las páginas del sitio, montado por el layout raíz.</p>`,
			},
		},
	},
};

export const Oculto: StoryObj<HeaderComponent> = {
	render: (args) => ({ props: args }),
	args: { isVisible: false },
	parameters: {
		docs: {
			description: {
				story: `<p>Encabezado oculto, el estado al que llega el scroll hacia abajo en viewports angostos. La barra no responde al puntero ni entra en el orden de tabulación: tabulando desde acá el foco pasa de largo hacia el contenido de la página. Es el único lugar donde ese estado se puede recorrer con teclado en un viewport ancho, porque en el sitio solo ocurre en <code>xs</code>.</p><p><strong>Usos:</strong> todas las páginas del sitio, montado por el layout raíz.</p>`,
			},
		},
	},
};
