export const extendedColors = {
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
	'zinc-300': '#d4d4d8', // Utilizado formato hexadecimal por limitaciones de ngx-skeleton-loader
};

export type ExtendedColors = keyof typeof extendedColors;
