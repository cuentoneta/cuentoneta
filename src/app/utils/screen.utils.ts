// Crea un tipo basado en las claves del objeto
export type Viewport = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export const VIEWPORT_WIDTHS_NUMERIC: Record<Viewport, number> = {
	xs: 0,
	sm: 768,
	md: 960,
	lg: 1280,
	xl: 1536,
};

export const VIEWPORT_WIDTHS_PX: Record<Viewport, string> = {
	xs: '0px',
	sm: '768px',
	md: '960px',
	lg: '1280px',
	xl: '1536px',
};
