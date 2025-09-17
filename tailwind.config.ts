import { createGlobPatternsForDependencies } from '@nx/angular/tailwind';
import { join } from 'path';
import { Config } from 'tailwindcss/types/config';
import { extendedColors } from './theme.config';
import { VIEWPORT_WIDTHS_PX } from './src/app/utils/screen.utils';
import { HEADER_HEIGHT_STRING_PX } from './src/app/utils/spacing.utils';

export default {
	content: [join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'), ...createGlobPatternsForDependencies(__dirname)],
	safelist: [
		{
			pattern: /line-clamp-([12345678])/,
		},
	],
	theme: {
		colors: extendedColors,
		content: {
			blank: '""',
		},
		screens: VIEWPORT_WIDTHS_PX,
		borderWidth: {
			0: '0',
			1: '1px',
			2: '2px',
			3: '3px',
			4: '4px',
		},
		extend: {
			lineClamp: {
				7: '7',
				8: '8',
				9: '9',
				10: '10',
			},
			boxShadow: {
				lg: '0px 0px 8px rgba(63, 63, 70, 0.08)',
				'lg-hover': '0px 12px 16px rgba(63, 63, 70, 0.12)',
			},
			fontFamily: {
				inter: ['Inter', 'sans-serif'],
				'source-serif': ['Source Serif Pro', 'sans-serif'],
			},
			spacing: {
				4.5: '18px',
				14: '56px',
				15: '60px',
				18: '72px',
				25: '100px',
				'1/2': '50%',
				'5/4': '120%',
				// Tamaños específicos de layouts y componentes globales de la app
				'header-height': HEADER_HEIGHT_STRING_PX,
			},
			lineHeight: {
				0: '0',
			},
			gridTemplateRows: {
				'3-auto': 'repeat(3, auto)',
			},
		},
	},
	plugins: [],
} satisfies Config;
