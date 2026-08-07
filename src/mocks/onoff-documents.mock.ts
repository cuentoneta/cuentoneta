import { onoffAuthorDocument } from './onoff/author/author.document.projection';
import { onoffCollectionDocumentsMock } from './onoff/collection/collection.document.projection';
import {
	onoffNationalityDocumentsMock,
	onoffResourceTypeDocumentsMock,
	onoffTagDocumentsMock,
} from './onoff/document/support-documents.projection';
import { asDraft, slugField } from './onoff/document/sanity-document.factory';
import {
	onoffLiteraryWorkAssetDocumentsMock,
	onoffLiteraryWorkDocumentsMock,
	toLiteraryWorkDocument,
} from './onoff/literary-work/literary-work.document.projection';
import { multiSectionRawLiteraryWork } from './onoff-raw-literary-works.mock';

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

// El canon ya declara la obra de dos secciones como escenario del raw; acá se deriva su documento,
// más una colección que la referencia, para poder evaluar el recorte de la sección de apertura.
export const multiSectionLiteraryWorkDocument = toLiteraryWorkDocument(multiSectionRawLiteraryWork);

export const multiSectionCollectionDocument = {
	...onoffCollectionDocumentsMock[0],
	_id: 'onoff-collection-multi-seccion',
	slug: slugField('multi-seccion'),
	literaryWorks: [
		{
			_key: multiSectionLiteraryWorkDocument._id,
			_type: 'reference' as const,
			_ref: multiSectionLiteraryWorkDocument._id,
		},
	],
};

// El tipo de documento declara `coverImage` opcional; el raw nunca ejercitó esa rama porque las ocho
// obras del canon la traen.
export const coverlessLiteraryWorkDocument = (() => {
	const { coverImage: _cover, ...rest } = onoffLiteraryWorkDocumentsMock[0] ?? ({} as never);
	return rest;
})();

export const draftCollectionDocument = asDraft(onoffCollectionDocumentsMock[0] ?? ({ _id: '' } as never));
