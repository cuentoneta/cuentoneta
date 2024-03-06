const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'), ...createGlobPatternsForDependencies(__dirname)],
	theme: {
		colors: {
			'primary-500': 'hsl(21, 57%, 44%)',
			'gray-50': 'hsl(0, 0%, 98%)',
			'gray-100': 'hsl(240, 5%, 96%)',
			'gray-200': 'hsl(240, 6%, 90%)',
			'gray-600': 'hsl(240, 5%, 34%)',
			'gray-700': 'hsl(240, 5%, 26%)',
		},
		screens: {
			sm: '640px',
			md: '1024px',
			lg: '1280px',
			xl: '1536px',
		},
		borderWidth: {
			1: '1px',
			3: '3px',
		},
		extend: {
			boxShadow: {
				'lg': '0px 0px 8px rgba(63, 63, 70, 0.08)'
			},
			fontFamily: {
				inter: ['Inter', 'sans-serif'],
				'source-serif': ['Source Serif Pro', 'sans-serif'],
			},
			spacing: {
				15: '60px',
			},
		},
	},
	plugins: [],
};
