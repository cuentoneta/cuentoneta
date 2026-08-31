/**
 * Resuelve la leyenda que va sobre la imagen de Open Graph a partir de los parámetros del pedido.
 *
 * El nombre de la colección gana sobre el par autor + título, y ambos sobre la marca: el pedido que
 * comparte una colección entera no tiene una obra que nombrar. Un parámetro presente pero vacío no
 * cuenta como provisto.
 */
export function resolveOgText(params: { collection?: string; author?: string; title?: string }): string {
	if (params.collection) {
		return params.collection;
	}

	if (params.author && params.title) {
		return `${params.title} - ${params.author}`;
	}

	return 'La Cuentoneta';
}
