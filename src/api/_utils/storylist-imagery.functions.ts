// Modelos
import type { StorylistImagery } from '@models/storylist.model';

// Tipos de Sanity
import type { SanityImageSource } from '@sanity/image-url';

// Funciones
import { urlFor } from './functions';

export function mapImagery(params: {
	featuredImage: SanityImageSource | null;
	storyCoverImages: readonly SanityImageSource[];
}): StorylistImagery {
	const featuredImageUrl = params.featuredImage ? urlFor(params.featuredImage) : '';
	if (featuredImageUrl) {
		return { kind: 'representative', image: featuredImageUrl };
	}
	// El abanico es de largo fijo: una portada faltante entra como cadena vacía en vez de correr las
	// demás, para que el slot vacío se renderice como placeholder y no desalinee la composición.
	const covers = params.storyCoverImages.map((image) => urlFor(image));
	return { kind: 'sample', images: [covers[0] ?? '', covers[1] ?? '', covers[2] ?? ''] };
}
