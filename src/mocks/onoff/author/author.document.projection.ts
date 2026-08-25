import type { Author } from '@sanity-types';
import { rawOnoffAuthor } from '../../onoff-raw-author.mock';
import { documentReference, documentSystemFields, slugField } from '../document/sanity-document.factory';
import { resourceTypeDocumentId, tagReference } from '../document/support-documents.projection';
import { cuentoRawTag, dramaPsicologicoRawTag } from '../../onoff-raw-tags.mock';

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
		// Se declaran acá y no se invierten del raw: todas las proyecciones que embeben un autor fijan
		// `'tags': []`, así que el crudo no transporta ninguna. La proyección de destacados de la página
		// de inicio es la primera que sí las dereferencia, y sin ellas esa rama quedaría muda en la
		// fixture. Un tag literario y uno de género, que es la mezcla que el modelo derivado produce.
		tags: [tagReference(cuentoRawTag.slug), tagReference(dramaPsicologicoRawTag.slug)],
	};
}

export const onoffAuthorDocument: Author = toAuthorDocument(rawOnoffAuthor);
