/**
 * Aserción de apilamiento contra la barra de navegación fija: quién responde al hit-test sobre la franja
 * que ocupa la barra, una vez que la página scrolleó.
 *
 * Es la única forma de discriminar el defecto. Una aserción sobre el `z-index` declarado pasaría igual con
 * el defecto presente, porque los valores conviven sin conflicto aparente hasta que el navegador resuelve
 * el apilamiento — y esa resolución solo existe en un navegador real, con el CSS compilado.
 */
import type { Page } from '@playwright/test';

import { VIEWPORT_WIDTHS_NUMERIC } from '@utils/screen.utils';

export const VIEWPORT_HEIGHT = 900;

// El apilamiento no depende del ancho, pero la geometría sí: al angostarse, el contenido pisa la franja de
// la barra con otro de sus elementos. Se toma el punto más ancho de cada banda del Design System, el mismo
// criterio con que `WindowLayoutService` las clasifica.
export const STACKING_VIEWPORTS = Object.freeze([
	{ name: 'xs', width: VIEWPORT_WIDTHS_NUMERIC.sm - 1 },
	{ name: 'sm', width: VIEWPORT_WIDTHS_NUMERIC.md - 1 },
	{ name: 'lg', width: VIEWPORT_WIDTHS_NUMERIC.xl - 1 },
] as const);

const NAV_SELECTOR = 'cuentoneta-header';

// Alcanza para que el contenido se desplace bajo la barra y se queda corto del umbral con el que
// LayoutService la oculta: con la barra retraída no habría franja que disputar y el caso pasaría en vacío.
const SCROLL_OFFSET = 100;

// Se muestrea a lo ancho de la barra —logo, centro y zona de enlaces— porque cada ancho la solapa con una
// parte distinta del contenido.
const SAMPLE_RATIOS = [0.1, 0.3, 0.5, 0.7, 0.9];

export type StackingReport = {
	scrollY: number;
	navHeight: number;
	/** Quién responde en cada punto muestreado: `nav`, o el nombre del elemento que se le puso encima. */
	owners: string[];
};

/**
 * Scrollea la ruta ya cargada y devuelve quién responde sobre la franja de la barra en cada punto.
 *
 * Incluye los dos controles positivos —scroll efectivo y alto de barra no nulo— para que quien afirme
 * pueda descartar el caso vacío: "nadie tapa la barra" se cumple igual con la página sin scrollear o con
 * la barra retraída a alto cero.
 */
export async function navStackingReport(page: Page): Promise<StackingReport> {
	await page.evaluate((offset) => window.scrollTo(0, offset), SCROLL_OFFSET);

	// Medido: Firefox responde el elemento raíz si el hit-test corre antes de componer el scroll, y el caso
	// fallaría por esa carrera y no por el apilamiento. Se espera a que el punto resuelva a algún elemento
	// del contenido — sea la barra o quien la tape, que es justamente lo que se discrimina.
	await page.waitForFunction((selector) => {
		const nav = document.querySelector(selector);
		if (!nav) {
			return false;
		}
		const { top, bottom, width } = nav.getBoundingClientRect();
		const element = document.elementFromPoint(width / 2, (top + bottom) / 2);
		return element !== null && element !== document.documentElement && element !== document.body;
	}, NAV_SELECTOR);

	return page.evaluate(
		({ selector, ratios }) => {
			const nav = document.querySelector(selector);
			if (!nav) {
				throw new Error('No se encontró la barra de navegación');
			}
			const { top, bottom, width } = nav.getBoundingClientRect();
			const y = (top + bottom) / 2;
			return {
				scrollY: window.scrollY,
				navHeight: bottom - top,
				owners: ratios.map((ratio) => {
					const element = document.elementFromPoint(width * ratio, y);
					if (!element) {
						return 'ninguno';
					}
					if (element.closest(selector)) {
						return 'nav';
					}
					// Nombra a quien tapa la barra: el mensaje de fallo señala al componente culpable en vez
					// de decir solamente que alguien está encima.
					const intruder = element.closest('[class*="cuentoneta-"], cuentoneta-header, [data-testid]');
					return (intruder ?? element).tagName.toLowerCase();
				}),
			};
		},
		{ selector: NAV_SELECTOR, ratios: SAMPLE_RATIOS },
	);
}

/** Lo que `owners` tiene que valer cuando la barra responde en todos los puntos muestreados. */
export const NAV_OWNS_EVERY_SAMPLE = SAMPLE_RATIOS.map(() => 'nav');
