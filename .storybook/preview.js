// Estilos globales: Vite los procesa con PostCSS (.postcssrc.json → Tailwind v4).
import '../src/styles.css';
import '../src/assets/css/typography.css';

import { applicationConfig } from '@storybook/angular-vite';
import { provideStorybookPreview } from '../src/testing/storybook-preview.provider';

// El set y su porqué viven en el módulo importado, que además un spec puede montar.
// La convención de qué va acá y qué en cada story está en `.claude/references/testing.md`.
export const decorators = [applicationConfig({ providers: [provideStorybookPreview()] })];

export const tags = ['autodocs'];

export const parameters = {
	options: {
		storySort: {
			method: 'alphabetical', // or 'alphabetical-by-kind'
		},
	},
};
