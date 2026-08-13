import { applicationConfig, Meta, StoryObj } from '@storybook/angular-vite';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HeaderComponent } from './header.component';

export default {
	title: 'HeaderComponent',
	component: HeaderComponent,
	// El decorador de este componente declara animaciones: sin este provider, el renderer trata la
	// propiedad sintética `[@toggle]` como desconocida y aborta el montaje.
	decorators: [applicationConfig({ providers: [provideAnimations()] })],
	parameters: {
		docs: {
			description: {
				component: `<div><p>El <strong>HeaderComponent</strong> es el encabezado del sitio: logo, navegación principal y menú desplegable en viewports angostos. El input <code>isVisible</code> lo oculta al hacer scroll hacia abajo, con una transición de opacidad y desplazamiento.</p></div>`,
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
