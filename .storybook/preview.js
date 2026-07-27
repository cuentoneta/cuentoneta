// Bajo el builder Vite los estilos globales se importan acá (antes los inyectaba la opción
// `styles` del executor @storybook/angular). Vite los procesa con PostCSS (.postcssrc.json → Tailwind v4).
import '../src/styles.css';
import '../src/assets/css/typography.css';

export const tags = ['autodocs'];

export const parameters = {
	options: {
		storySort: {
			method: 'alphabetical', // or 'alphabetical-by-kind'
		},
	},
};
