import { createGlobPatternsForDependencies } from '@nx/angular/tailwind';
import { join } from 'path';
import { Config } from 'tailwindcss/types/config';
import { extendedColors } from './theme.config';
import { screens } from './tailwind.screens';

export default {
	content: [join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'), ...createGlobPatternsForDependencies(__dirname)],
	theme: {
		colors: extendedColors,
		content: {
			blank: '""',
		},
		screens: screens,
		borderWidth: {
			0: '0',
			1: '1px',
			2: '2px',
			3: '3px',
			4: '4px',
		},
		extend: {
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
				15: '60px',
				18: '72px',
				'1/2': '50%',
				'5/4': '120%',
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
