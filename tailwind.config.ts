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
			pattern: /line-clamp-(1|2|3|4|5|6|7|8|9|10)/,
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
				4: '4',
				5: '5',
				6: '6',
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
				4.5: '1.125rem',
				14: '3.50rem',
				15: '3.75rem',
				18: '4.50rem',
				22: '5.50rem',
				25: '6.25rem',
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
