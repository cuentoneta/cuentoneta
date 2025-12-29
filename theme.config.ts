export const extendedColors = {
	// Colores base
	white: '#fff',
	black: '#000',

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
