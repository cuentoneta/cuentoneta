export const extendedColors = {
	// Colores base
	white: '#fff',
	black: '#000',

	// Sistema de colores legacy
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
	'zinc-200': '#e4e4e7', // Utilizado formato hexadecimal por limitaciones de ngx-skeleton-loader
	'zinc-300': '#d4d4d8', // Utilizado formato hexadecimal por limitaciones de ngx-skeleton-loader

	// Design System v3 - Colores de marca
	'brand-50': 'hsl(12, 60%, 97%)',
	'brand-100': 'hsl(11, 50%, 96%)',
	'brand-200': 'hsl(11, 78%, 93%)',
	'brand-300': 'hsl(24, 45%, 76%)',
	'brand-400': 'hsl(25, 45%, 62%)',
	'brand-500': 'hsl(21, 57%, 44%)',

	// Design System v3 - Colores neutrales
	'neutral-50': 'hsl(0, 0%, 98%)',
	'neutral-100': 'hsl(0, 0%, 96%)',
	'neutral-150': 'hsl(0, 0%, 94%)',
	'neutral-200': 'hsl(0, 0%, 90%)',
	'neutral-300': 'hsl(0, 0%, 83%)',
	'neutral-400': 'hsl(0, 0%, 64%)',
	'neutral-500': 'hsl(0, 0%, 45%)',
	'neutral-600': 'hsl(0, 0%, 32%)',
	'neutral-700': 'hsl(0, 0%, 25%)',
	'neutral-800': 'hsl(0, 0%, 15%)',
	'neutral-900': 'hsl(0, 0%, 9%)',
	'neutral-950': 'hsl(0, 0%, 4%)',

	// Design System v3 - Variantes con opacidad
	'white-15': 'hsla(0, 0%, 100%, 0.15)',
	'neutral-950-40': 'hsla(0, 0%, 4%, 0.4)',
	'neutral-950-70': 'hsla(0, 0%, 4%, 0.7)',
};

export type ExtendedColors = keyof typeof extendedColors;
