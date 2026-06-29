// Sanity utils
import type { SanityImageSource } from '@sanity/image-url';

// Modelos
import type { StorylistImagery } from '@models/storylist.model';

// Funciones
import { urlFor } from './functions';

// Hash determinista del _id para sembrar la selección de portadas (sin Math.random/Date.now → SSR-safe).
function hashString(value: string): number {
	let hash = 0;
	for (let i = 0; i < value.length; i++) {
		hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
	}
	return hash;
}

// Fisher-Yates con LCG (Numerical Recipes): mismo seed → mismo orden, en servidor y cliente.
function seededShuffle<T>(arr: T[], seed: number): T[] {
	const result = [...arr];
	let state = seed;
	for (let i = result.length - 1; i > 0; i--) {
		state = (state * 1664525 + 1013904223) >>> 0;
		const j = state % (i + 1);
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}

export function mapImagery(params: {
	id: string;
	featuredImage: SanityImageSource | null;
	storyCoverImages: SanityImageSource[];
}): StorylistImagery {
	const featuredImageUrl = params.featuredImage ? urlFor(params.featuredImage) : '';
	if (featuredImageUrl) {
		return { kind: 'representative', image: featuredImageUrl };
	}
	const shuffled = seededShuffle(
		params.storyCoverImages.map((image) => urlFor(image)),
		hashString(params.id),
	);
	return { kind: 'sample', images: [shuffled[0] ?? '', shuffled[1] ?? '', shuffled[2] ?? ''] };
}
