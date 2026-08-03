// Estilos globales: Vite los procesa con PostCSS (.postcssrc.json → Tailwind v4).
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
