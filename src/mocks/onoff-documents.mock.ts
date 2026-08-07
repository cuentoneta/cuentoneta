import { onoffAuthorDocument } from './onoff/author/author.document.projection';
import { onoffCollectionDocumentsMock } from './onoff/collection/collection.document.projection';
import {
	onoffNationalityDocumentsMock,
	onoffResourceTypeDocumentsMock,
	onoffTagDocumentsMock,
} from './onoff/document/support-documents.projection';
import { asDraft } from './onoff/document/sanity-document.factory';
import {
	onoffLiteraryWorkAssetDocumentsMock,
	onoffLiteraryWorkDocumentsMock,
} from './onoff/literary-work/literary-work.document.projection';

export {
	onoffCollectionDocumentsMock,
	onoffLiteraryWorkDocumentsMock,
	onoffNationalityDocumentsMock,
	onoffResourceTypeDocumentsMock,
	onoffTagDocumentsMock,
};

export const onoffAuthorDocumentsMock = [onoffAuthorDocument];

// El dataset plano que consume `groq-js`: lleva todos los documentos, incluidos los de soporte y los
// de asset. Un documento que falte no hace fallar la evaluación — la dereferencia queda en null sin
// avisar—, así que conviene pedir el dataset entero y no armar subconjuntos por caso.
export const onoffDatasetMock: Record<string, unknown>[] = [
	...onoffLiteraryWorkDocumentsMock,
	...onoffCollectionDocumentsMock,
	...onoffAuthorDocumentsMock,
	...onoffTagDocumentsMock,
	...onoffNationalityDocumentsMock,
	...onoffResourceTypeDocumentsMock,
	...onoffLiteraryWorkAssetDocumentsMock,
];

// Escenarios de borde por spread sobre el canon, para que sigan al corpus.

export const emptyCollectionDocument = { ...onoffCollectionDocumentsMock[0], literaryWorks: [] };

// El tipo de documento declara `coverImage` opcional; el raw nunca ejercitó esa rama porque las ocho
// obras del canon la traen.
export const coverlessLiteraryWorkDocument = (() => {
	const { coverImage: _cover, ...rest } = onoffLiteraryWorkDocumentsMock[0] ?? ({} as never);
	return rest;
})();

export const draftCollectionDocument = asDraft(onoffCollectionDocumentsMock[0] ?? ({ _id: '' } as never));
