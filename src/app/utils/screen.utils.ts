// Crea un tipo basado en las claves del objeto
export type Viewport = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export const VIEWPORT_WIDTHS_NUMERIC: Record<Viewport, number> = {
	xs: 0,
	sm: 768,
	md: 960,
	lg: 1240,
	xl: 1536,
};

export const VIEWPORT_WIDTHS_PX: Record<Viewport, string> = {
	xs: '0px',
	sm: '768px',
	md: '960px',
	lg: '1240px',
	xl: '1536px',
};

/**
 * Compara dos viewports por su ancho. Negativo si `current` es más angosto que `test`, positivo si es
 * más ancho, 0 si son iguales. Lanza ante un viewport inválido.
 *
 * Fuente única de la comparación: la consumen tanto el real (`WindowLayoutService`) como el doble
 * (`ControllableLayoutService`), de modo que su comportamiento —incluido el error— sea idéntico por
 * construcción y no por convención.
 */
export function compareViewports(current: Viewport, test: Viewport): number {
	const currentWidth = VIEWPORT_WIDTHS_NUMERIC[current];
	const testWidth = VIEWPORT_WIDTHS_NUMERIC[test];

	if (currentWidth === undefined || testWidth === undefined) {
		throw new Error(`Viewport inválido: ${test}`);
	}

	return currentWidth - testWidth;
}
