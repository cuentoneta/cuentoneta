import { applicationConfig, Meta } from '@storybook/angular-vite';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HeaderComponent } from './header.component';

export default {
	title: 'HeaderComponent',
	component: HeaderComponent,
	// Único componente de la app con animaciones declaradas: sin este provider, el renderer trata la
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
			table: { defaultValue: { summary: 'true' } },
		},
	},
} as Meta<HeaderComponent>;

export const Primary = {
	render: (args: HeaderComponent) => ({
		props: args,
	}),
	args: {},
};
