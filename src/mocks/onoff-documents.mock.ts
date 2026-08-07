import { onoffAuthorDocument } from './onoff/author/author.document.projection';
import { toCollectionDocument } from './onoff/collection/collection.document.projection';
import {
	onoffNationalityDocumentsMock,
	onoffResourceTypeDocumentsMock,
	onoffTagDocumentsMock,
} from './onoff/document/support-documents.projection';
import { asDraft, slugField, withoutKey } from './onoff/document/sanity-document.factory';
import {
	onoffLiteraryWorkAssetDocumentsMock,
	onoffLiteraryWorkDocumentsMock,
	toLiteraryWorkDocument,
} from './onoff/literary-work/literary-work.document.projection';
import { multiSectionRawLiteraryWork } from './onoff-raw-literary-works.mock';
import { onoffRawCollectionsMock } from './onoff-raw-collections.mock';
import type { Collection } from '@sanity-types';

export const onoffAuthorDocumentsMock = [onoffAuthorDocument];

// Se declara acá y no en el módulo de proyección porque es el agregado que consumen los specs de fuera
// de `src/mocks`, y re-exportarlo sería un barrel.
export const onoffCollectionDocumentsMock: Collection[] = onoffRawCollectionsMock.map(toCollectionDocument);

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

// Escenarios de borde por spread sobre el canon, para que sigan al corpus. Cada uno estrena `_id` y
// slug: compartiéndolos, sumarlos a `onoffDatasetMock` duplicaría el `_id` y el resultado de la query
// pasaría a depender del orden del array. El borrador es la excepción, y a propósito: un borrador de
// Sanity es el mismo documento con el prefijo `drafts.`, así que convive con su publicado.

function first<T>(documents: T[], label: string): T {
	const [document] = documents;
	if (!document) {
		throw new Error(`El corpus de Onoff no declara ningún documento de ${label}`);
	}
	return document;
}

const canonCollection = first(onoffCollectionDocumentsMock, 'colección');
const canonLiteraryWork = first(onoffLiteraryWorkDocumentsMock, 'obra');

export const emptyCollectionDocument = {
	...canonCollection,
	_id: 'onoff-collection-sin-obras',
	slug: slugField('sin-obras'),
	literaryWorks: [],
};

// El canon ya declara la obra de dos secciones como escenario del raw; acá se deriva su documento,
// más una colección que la referencia, para poder evaluar el recorte de la sección de apertura.
export const multiSectionLiteraryWorkDocument = toLiteraryWorkDocument(multiSectionRawLiteraryWork);

export const multiSectionCollectionDocument = {
	...canonCollection,
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
	const rest = withoutKey(canonLiteraryWork, 'coverImage');
	return { ...rest, _id: 'onoff-obra-sin-portada', slug: slugField('sin-portada') };
})();

export const draftCollectionDocument = asDraft(canonCollection);

// `config` es opcional en el documento, y la query lo resuelve con `coalesce`; el canon nunca lo omite.
export const configlessCollectionDocument = {
	...withoutKey(canonCollection, 'config'),
	_id: 'onoff-collection-sin-config',
	slug: slugField('sin-config'),
};
