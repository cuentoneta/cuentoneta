import type { SanityFileAsset, Slug } from '@sanity-types';

// Fecha fija y reconocible en vez de la de hoy: `_createdAt` no siempre es ruido de sistema. La query
// de obra proyecta `coalesce(publishedAt, _createdAt)`, así que ante una obra sin fecha de publicación
// el valor se vuelve observable en el resultado, y una fecha variable haría fallar al azar.
const SYSTEM_TIMESTAMP = '1974-06-12T00:00:00Z';

export function documentSystemFields(id: string) {
	return {
		_id: id,
		_createdAt: SYSTEM_TIMESTAMP,
		_updatedAt: SYSTEM_TIMESTAMP,
		_rev: `rev-${id}`,
	} as const;
}

export function slugField(current: string): Slug {
	return { _type: 'slug', current };
}

export function documentReference(id: string, key?: string) {
	return { _type: 'reference' as const, _ref: id, ...(key !== undefined ? { _key: key } : {}) };
}

// Sanity marca el borrador de un documento con este prefijo de path en su `_id`.
export function asDraft<T extends { _id: string }>(document: T): T {
	return { ...document, _id: `drafts.${document._id}` };
}

// El `url` es un campo propio del documento de asset, no algo que resuelva el CDN al leer: por eso
// `asset->url` se puede derivar sin red, siempre que el documento esté en el dataset.
export function createFileAssetDocument({ ref, url }: { ref: string; url: string }): SanityFileAsset {
	const extension = url.split('.').pop() ?? 'bin';
	return {
		...documentSystemFields(ref),
		_type: 'sanity.fileAsset',
		assetId: ref,
		sha1hash: ref,
		extension,
		mimeType: `audio/${extension}`,
		size: 1024,
		path: `files/onoff/${ref}.${extension}`,
		url,
	};
}
