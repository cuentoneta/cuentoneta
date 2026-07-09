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
	// Muestra las 3 primeras portadas en el orden de las historias de la colección, rellenando con '' si faltan.
	const covers = params.storyCoverImages.map((image) => urlFor(image));
	return { kind: 'sample', images: [covers[0] ?? '', covers[1] ?? '', covers[2] ?? ''] };
}
