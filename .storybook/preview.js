// Estilos globales: Vite los procesa con PostCSS (.postcssrc.json → Tailwind v4).
import '../src/styles.css';
import '../src/assets/css/typography.css';

import { applicationConfig } from '@storybook/angular-vite';
import { provideLayout } from '../src/app/providers/layout.provider';

// `LayoutService` es un token sin factory, así que un componente que lo inyecte no renderiza sin
// este provider — falla el inject() del constructor y el canvas queda en NG0201, no en un error de
// la story. Va el servicio real y no el doble: el canvas es un navegador de verdad, así que el
// catálogo responde al ancho como el sitio. Storybook acumula los `applicationConfig`, de modo que
// los providers propios de cada story siguen vigentes.
export const decorators = [applicationConfig({ providers: [provideLayout()] })];

export const tags = ['autodocs'];

export const parameters = {
	options: {
		storySort: {
			method: 'alphabetical', // or 'alphabetical-by-kind'
		},
	},
};
