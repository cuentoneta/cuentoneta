import type { Collection, ContentCampaign, LandingPage, LiteraryWork, SanityFileAsset } from '@sanity-types';
import { onoffAuthorDocument } from './onoff/author/author.document.projection';
import { geometriasDelDesveloCollectionDocument } from './onoff/collection/geometrias-del-desvelo.collection.document';
import { inventarioDeLasPasionesCollectionDocument } from './onoff/collection/inventario-de-las-pasiones.collection.document';
import {
	onoffNationalityDocumentsMock,
	onoffResourceTypeDocumentsMock,
	onoffTagDocumentsMock,
} from './onoff/document/support-documents.projection';
import { asDraft, slugField, withoutKey } from './onoff/document/sanity-document.factory';
import { coleccionCompletaContentCampaignDocument } from './onoff/landing-page/coleccion-completa-onoff.content-campaign.document';
import { palacioNueveFronterasContentCampaignDocument } from './onoff/landing-page/el-palacio-de-las-nueve-fronteras.content-campaign.document';
import { onoffLandingPageDocument } from './onoff/landing-page/onoff.landing-page.document';
import { elOdioLiteraryWorkDocument } from './onoff/literary-work/el-odio.literary-work.document';
import { elPalacioDeLasNueveFronterasLiteraryWorkDocument } from './onoff/literary-work/el-palacio-de-las-nueve-fronteras.literary-work.document';
import { elTratadoDeLosPlaceresLiteraryWorkDocument } from './onoff/literary-work/el-tratado-de-los-placeres.literary-work.document';
import { geometriaAudioAssetDocument } from './onoff/literary-work/geometria.audio-asset.document';
import { geometriaLiteraryWorkDocument } from './onoff/literary-work/geometria.literary-work.document';
import { lasDosAntorchasLiteraryWorkDocument } from './onoff/literary-work/las-dos-antorchas.literary-work.document';
import { lasEscalerasLiteraryWorkDocument } from './onoff/literary-work/las-escaleras.literary-work.document';
import { losPeldanosLiteraryWorkDocument } from './onoff/literary-work/los-peldanos.literary-work.document';
import { neronLiteraryWorkDocument } from './onoff/literary-work/neron.literary-work.document';
import { palacioNueveFronterasSectionTitle } from './onoff/literary-work/el-palacio-de-las-nueve-fronteras.epigraph';
import {
	palacioFirstSectionReadingTime,
	palacioMultiSectionTotalReadingTime,
	palacioSecondSectionBody,
	palacioSecondSectionReadingTime,
	palacioSecondSectionTitle,
} from './onoff/literary-work/el-palacio-de-las-nueve-fronteras.multi-section';

export const onoffAuthorDocumentsMock = [onoffAuthorDocument];

// El orden espeja al de `onoffRawLiteraryWorksMock`, que es el que consumen los specs por índice.
export const onoffLiteraryWorkDocumentsMock: LiteraryWork[] = [
	elPalacioDeLasNueveFronterasLiteraryWorkDocument,
	geometriaLiteraryWorkDocument,
	losPeldanosLiteraryWorkDocument,
	lasEscalerasLiteraryWorkDocument,
	elOdioLiteraryWorkDocument,
	elTratadoDeLosPlaceresLiteraryWorkDocument,
	lasDosAntorchasLiteraryWorkDocument,
	neronLiteraryWorkDocument,
];

export const onoffCollectionDocumentsMock: Collection[] = [
	geometriasDelDesveloCollectionDocument,
	inventarioDeLasPasionesCollectionDocument,
];

// `geometria` es la única obra con grabación, así que su asset es el único que el corpus necesita: sin
// él en el dataset, `audioFile.asset->url` resolvería a null sin que nada falle.
export const onoffLiteraryWorkAssetDocumentsMock: SanityFileAsset[] = [geometriaAudioAssetDocument];

// El orden es el que la landing declara en su array de referencias, que es el que la query preserva.
export const onoffContentCampaignDocumentsMock: ContentCampaign[] = [
	coleccionCompletaContentCampaignDocument,
	palacioNueveFronterasContentCampaignDocument,
];

export const onoffLandingPageDocumentsMock: LandingPage[] = [onoffLandingPageDocument];

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
	...onoffContentCampaignDocumentsMock,
	...onoffLandingPageDocumentsMock,
];

// Escenarios de borde por spread sobre el canon, para que sigan al corpus. Cada uno estrena `_id` y
// slug: compartiéndolos, sumarlos a `onoffDatasetMock` duplicaría el `_id` y el resultado de la query
// pasaría a depender del orden del array. El borrador es la excepción, y a propósito: un borrador de
// Sanity es el mismo documento con el prefijo `drafts.`, así que convive con su publicado.

const canonCollection = geometriasDelDesveloCollectionDocument;
const canonLiteraryWork = elPalacioDeLasNueveFronterasLiteraryWorkDocument;

export const emptyCollectionDocument = {
	...canonCollection,
	_id: 'onoff-collection-sin-obras',
	slug: slugField('sin-obras'),
	literaryWorks: [],
};

export const multiSectionLiteraryWorkDocument: LiteraryWork = {
	...canonLiteraryWork,
	_id: 'onoff-literary-work-el-palacio-de-las-nueve-fronteras-multi',
	totalReadingTime: palacioMultiSectionTotalReadingTime,
	content: [
		{
			...canonLiteraryWork.content[0],
			_type: 'section',
			_key: 'section-1',
			title: palacioNueveFronterasSectionTitle,
			epigraphs: [],
			readingTime: palacioFirstSectionReadingTime,
		},
		{
			_type: 'section',
			_key: 'section-2',
			title: palacioSecondSectionTitle,
			epigraphs: [],
			body: palacioSecondSectionBody,
			readingTime: palacioSecondSectionReadingTime,
		},
	],
};

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

// Documentos de los tipos previos (`story`, `storylist`), derivados del canon cambiándoles el `_type`.
// El corpus modela la era `LiteraryWork`, así que no los tiene, y las queries que todavía leen esos
// tipos —el sitemap— se quedarían sin fixture. La derivación vale mientras la query proyecte campos
// que ambos schemas declaran igual; una que lea campos propios del tipo previo necesita su documento.
// Todos llevan una fecha de escritura distinta de la de creación: compartiéndolas, una proyección que
// tomara la equivocada quedaría indistinguible de la correcta.
const LEGACY_UPDATED_AT = '2026-08-13T06:07:43Z';

export const legacyStoryDocument = {
	...canonLiteraryWork,
	_id: 'onoff-story-publicada',
	_type: 'story' as const,
	_updatedAt: LEGACY_UPDATED_AT,
	slug: slugField('story-publicada'),
};

// La fecha de publicación es opcional, y la query del sitemap cae a la de creación cuando falta.
export const undatedLegacyStoryDocument = {
	...withoutKey(legacyStoryDocument, 'publishedAt'),
	_id: 'onoff-story-sin-fecha',
	slug: slugField('story-sin-fecha'),
};

export const legacyStorylistDocument = {
	...canonCollection,
	_id: 'onoff-storylist',
	_type: 'storylist' as const,
	_updatedAt: LEGACY_UPDATED_AT,
	slug: slugField('storylist'),
};
