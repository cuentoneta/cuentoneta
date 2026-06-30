// Modelos
import type { StorylistImagery } from '@models/storylist.model';

// Tipos de Sanity (typegen)
import type { StorylistTeasersQueryResult } from '../sanity/types';

// Funciones
import { urlFor } from './functions';

type StorylistTeaserSource = StorylistTeasersQueryResult[number];

export function mapImagery(params: {
	featuredImage: StorylistTeaserSource['featuredImage'] | null;
	storyCoverImages: StorylistTeaserSource['storyCoverImages'];
}): StorylistImagery {
	const featuredImageUrl = params.featuredImage ? urlFor(params.featuredImage) : '';
	if (featuredImageUrl) {
		return { kind: 'representative', image: featuredImageUrl };
	}
	// Muestra las 3 primeras portadas en el orden de las historias de la colección, rellenando con '' si faltan.
	const covers = params.storyCoverImages.map((image) => urlFor(image));
	return { kind: 'sample', images: [covers[0] ?? '', covers[1] ?? '', covers[2] ?? ''] };
}
