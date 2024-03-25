const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'), ...createGlobPatternsForDependencies(__dirname)],
	theme: {
		colors: {
			white: '#fff',
			black: '#000',
			'primary-100': 'hsl(9, 70%, 96%)',
			'primary-200': 'hsl(11, 78%, 93%)',
			'primary-300': 'hsl(24, 45%, 76%)',
			'primary-400': 'hsl(25, 45%, 62%)',
			'primary-500': 'hsl(21, 57%, 44%)',
			'gray-50': 'hsl(0, 0%, 98%)',
			'gray-100': 'hsl(240, 5%, 96%)',
			'gray-200': 'hsl(240, 6%, 90%)',
			'gray-300': 'hsl(240, 5%, 84%)',
			'gray-400': 'hsl(240, 5%, 65%)',
			'gray-500': 'hsl(240, 4%, 46%)',
			'gray-600': 'hsl(240, 5%, 34%)',
			'gray-700': 'hsl(240, 5%, 26%)',
			'gray-800': 'hsl(240, 5%, 20%)',
			'gray-900': 'hsl(240, 5%, 14%)',
			'interactive-500': 'hsl(212, 70%, 45%)',
			'interactive-600': 'hsl(212, 70%, 35%)',
		},
		content: {
			blank: '""',
		},
		screens: {
			xs: '0px',
			sm: '640px',
			md: '1024px',
			lg: '1280px',
			xl: '1536px',
		},
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
				0: 0,
			},
			gridTemplateRows: {
				'3-auto': 'repeat(3, auto)',
			},
		},
	},
	plugins: [{ cssnano: {} }],
};
