// Crea un tipo basado en las claves del objeto
export type Viewport = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export const VIEWPORT_WIDTHS_NUMERIC: Record<Viewport, number> = {
	xs: 0,
	sm: 768,
	md: 960,
	lg: 1240,
	xl: 1536,
};

/**
 * Compara dos viewports por ancho, al estilo de un comparador: negativo si `current` es menor que `test`,
 * positivo si es mayor, cero si son equivalentes. Lanza ante un viewport que no esté en la escala.
 */
export function compareViewports(current: Viewport, test: Viewport): number {
	const currentWidth = VIEWPORT_WIDTHS_NUMERIC[current];
	const testWidth = VIEWPORT_WIDTHS_NUMERIC[test];

	if (currentWidth === undefined) {
		throw new Error(`Viewport inválido: ${current}`);
	}

	if (testWidth === undefined) {
		throw new Error(`Viewport inválido: ${test}`);
	}

	return currentWidth - testWidth;
}

export const VIEWPORT_WIDTHS_PX: Record<Viewport, string> = {
	xs: '0px',
	sm: '768px',
	md: '960px',
	lg: '1240px',
	xl: '1536px',
};
