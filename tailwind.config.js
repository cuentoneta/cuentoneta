const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'), ...createGlobPatternsForDependencies(__dirname)],
	theme: {
		colors: {
			'primary-500': 'hsl(21, 57%, 44%)',
			'gray-50': 'hsl(0, 0%, 98%)',
			'gray-600': 'hsl(240, 5%, 34%)',
		},
		screens: {
			sm: '640px',
			md: '1024px',
			lg: '1280px',
			xl: '1536px',
		},
		extend: {
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
