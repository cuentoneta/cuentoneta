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

// Design System V3 - Spacing
export const spacing = {
	1: '0.25rem', // 4px
	1.5: '0.375rem', // 6px
	2: '0.5rem', // 8px
	2.5: '0.625rem', // 10px
	3: '0.75rem', // 12px
	4: '1rem', // 16px
	4.5: '1.125rem', // 18px
	5: '1.25rem', // 20px
	6: '1.5rem', // 24px
	7: '1.75rem', // 28px
	8: '2rem', // 32px
	9: '2.25rem', // 36px
	10: '2.5rem', // 40px
	12: '3rem', // 48px
	14: '3.5rem', // 56px
	16: '4rem', // 64px
	20: '5rem', // 80px
	24: '6rem', // 96px
	28: '7rem', // 112px
	32: '8rem', // 128px
	36: '9rem', // 144px
	40: '10rem', // 160px
	44: '11rem', // 176px
	48: '12rem', // 192px
	52: '13rem', // 208px
};

// Design System V3 - Border Radius
export const borderRadius = {
	none: '0px',
	DEFAULT: '4px', // 'rounded' class
	sm: '4px',
	md: '6px',
	lg: '8px',
	xl: '12px',
	full: '1000px',
};

// Design System V3 - Blur
export const blur = {
	xl: '24px',
};

// Design System V3 - Typography (Inter)
export const fontSize: Record<string, [string, { lineHeight: string }]> = {
	xxs: ['0.625rem', { lineHeight: '0.875rem' }], // 10px/14px
	xs: ['0.75rem', { lineHeight: '1rem' }], // 12px/16px
	sm: ['0.875rem', { lineHeight: '1.25rem' }], // 14px/20px
	base: ['1rem', { lineHeight: '1.5rem' }], // 16px/24px
	lg: ['1.125rem', { lineHeight: '1.75rem' }], // 18px/28px
	xl: ['1.25rem', { lineHeight: '1.75rem' }], // 20px/28px
	'2xl': ['1.5rem', { lineHeight: '2rem' }], // 24px/32px
	'4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px/40px
	'6xl': ['3.25rem', { lineHeight: '3.625rem' }], // 52px/58px
};
