// Estilos globales: Vite los procesa con PostCSS (.postcssrc.json → Tailwind v4).
import '../src/styles.css';
import '../src/assets/css/typography.css';

import { applicationConfig } from '@storybook/angular-vite';
import { provideLayout } from '../src/app/providers/layout.provider';

// `LayoutService` es un token sin factory: sin este provider, todo componente que lo inyecte cae en
// NG0201. La convención completa está en `.claude/references/testing.md`.
export const decorators = [applicationConfig({ providers: [provideLayout()] })];

export const tags = ['autodocs'];

export const parameters = {
	options: {
		storySort: {
			method: 'alphabetical', // or 'alphabetical-by-kind'
		},
	},
};
