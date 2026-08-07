import type { Author } from '@sanity-types';
import { rawOnoffAuthor } from '../../onoff-raw-author.mock';
import { documentReference, documentSystemFields, slugField } from '../document/sanity-document.factory';
import { resourceTypeDocumentId } from '../document/support-documents.projection';

type RawAuthor = typeof rawOnoffAuthor;

// La query aplana la referencia de nacionalidad y la de tipo de recurso; el documento las guarda como
// referencias. Invertirlo obliga a emitir también esos documentos, porque una referencia que no
// resuelve contra el dataset no falla: `groq-js` la deja en null sin avisar.
export function toAuthorDocument(raw: RawAuthor): Author {
	return {
		...documentSystemFields(raw._id),
		_type: 'author',
		name: raw.name,
		slug: slugField(raw.slug),
		image: raw.image,
		nationality: documentReference(raw.nationality._id),
		bornOn: raw.bornOn ?? undefined,
		bornOnYear: raw.bornOnYear ?? undefined,
		diedOn: raw.diedOn ?? undefined,
		diedOnYear: raw.diedOnYear ?? undefined,
		biography: raw.biography,
		resources: (raw.resources ?? []).map((resource, index) => ({
			_type: 'resource' as const,
			_key: `resource-${index}`,
			title: resource.title,
			url: resource.url,
			resourceType: documentReference(resourceTypeDocumentId(resource.resourceType.slug)),
		})),
		// La query de autor proyecta `'tags': []` fijo, así que el raw no transporta ninguna que invertir.
		// El documento las declara opcionales, y dejarlas vacías es fiel a lo que el raw permite afirmar.
		tags: [],
	};
}

export const onoffAuthorDocument: Author = toAuthorDocument(rawOnoffAuthor);
