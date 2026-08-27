/**
 * Tamaños de ventana compartidos por los e2e que dependen de una disposición concreta.
 */
import { VIEWPORT_WIDTHS_NUMERIC } from '@utils/screen.utils';

/**
 * Ancho que garantiza la disposición de escritorio: la que reparte el contenido en dos columnas y monta
 * lo que solo existe a partir del breakpoint `lg`.
 *
 * Se toma el ancho de `xl` y no el borde exacto de `lg` porque `setViewportSize` fija el tamaño de la
 * ventana con la barra de scroll incluida: al ras del breakpoint, el ancho útil queda por debajo.
 */
export const DESKTOP_VIEWPORT = Object.freeze({ width: VIEWPORT_WIDTHS_NUMERIC.xl, height: 900 });
