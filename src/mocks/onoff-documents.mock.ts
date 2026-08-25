import type { Collection, ContentCampaign, LandingPage, LiteraryWork, SanityFileAsset } from '@sanity-types';
import { onoffAuthorDocument } from './onoff/author/author.document.projection';
import { geometriasDelDesveloCollectionDocument } from './onoff/collection/geometrias-del-desvelo.collection.document';
import { inventarioDeLasPasionesCollectionDocument } from './onoff/collection/inventario-de-las-pasiones.collection.document';
import {
	onoffNationalityDocumentsMock,
	onoffResourceTypeDocumentsMock,
	onoffTagDocumentsMock,
} from './onoff/document/support-documents.projection';
import {
	asDraft,
	documentReference,
	documentSystemFields,
	slugField,
	withoutKey,
} from './onoff/document/sanity-document.factory';
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

// El recorte del extracto corta por doble salto de línea, así que el primer bloque de la sección de
// apertura no tiene por qué ser un párrafo de prosa: el schema no restringe el Markdown. Estas dos
// obras cubren los arranques que hoy nadie tiene, para que el corte se afirme sobre ellos en vez de
// descubrirse en una tarjeta.
export const quoteOpeningLiteraryWorkDocument: LiteraryWork = {
	...canonLiteraryWork,
	_id: 'onoff-literary-work-arranque-con-cita',
	slug: slugField('arranque-con-cita'),
	content: [
		{
			...canonLiteraryWork.content[0],
			_type: 'section',
			_key: 'section-1',
			epigraphs: [],
			body: '> Toda geometría empieza\n> por una línea que no existe.\n\nDespués vino el resto, que es prosa.',
		},
	],
};

export const headingOpeningLiteraryWorkDocument: LiteraryWork = {
	...canonLiteraryWork,
	_id: 'onoff-literary-work-arranque-con-encabezado',
	slug: slugField('arranque-con-encabezado'),
	content: [
		{
			...canonLiteraryWork.content[0],
			_type: 'section',
			_key: 'section-1',
			epigraphs: [],
			body: '## El primer umbral\n\nY recién entonces el párrafo que la tarjeta querría mostrar.',
		},
	],
};

// Un renglón en blanco delante del texto: artefacto de edición corriente, que el schema no impide.
// Sin el filtro de bloques vacíos, el corte devolvería la cadena vacía y la colección entera caería.
export const blankLeadingLineLiteraryWorkDocument: LiteraryWork = {
	...canonLiteraryWork,
	_id: 'onoff-literary-work-arranque-en-blanco',
	slug: slugField('arranque-en-blanco'),
	content: [
		{
			...canonLiteraryWork.content[0],
			_type: 'section',
			_key: 'section-1',
			epigraphs: [],
			body: '\n\nEl párrafo que la tarjeta tiene que mostrar igual.\n\nY el que queda afuera.',
		},
	],
};

// El mismo arranque, con fines de línea de Windows. Es la única razón por la que el corte de la query
// va anidado, y sin este documento esa rama no la ejercita nada: CI corre en Linux, así que el corpus
// llega con LF y un split simplificado quedaría verde hasta regenerar el corpus en Windows.
export const crlfOpeningLiteraryWorkDocument: LiteraryWork = {
	...canonLiteraryWork,
	_id: 'onoff-literary-work-arranque-crlf',
	slug: slugField('arranque-crlf'),
	content: [
		{
			...canonLiteraryWork.content[0],
			_type: 'section',
			_key: 'section-1',
			epigraphs: [],
			body: 'El párrafo que la tarjeta muestra.\r\n\r\nY el que el recorte deja afuera.',
		},
	],
};

export const nonProseOpeningCollectionDocument = {
	...canonCollection,
	_id: 'onoff-collection-arranques-no-prosa',
	slug: slugField('arranques-no-prosa'),
	literaryWorks: [
		quoteOpeningLiteraryWorkDocument,
		headingOpeningLiteraryWorkDocument,
		blankLeadingLineLiteraryWorkDocument,
		crlfOpeningLiteraryWorkDocument,
	].map((work) => ({
		_key: work._id,
		_type: 'reference' as const,
		_ref: work._id,
	})),
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

// `Rule.required()` valida la edición en el Studio, no el almacenamiento: el dataset real tiene cuentos
// publicados sin `badLanguage`, sin `originalPublication` y (en menor medida) sin `approximateReadingTime`.
// Este documento reproduce los tres huecos a la vez: los dos primeros por `withoutKey` sobre el canon, y
// el tercero por construcción — el canon es un `literaryWork`, que nunca declaró ese campo (usa
// `totalReadingTime`), así que nunca hizo falta quitarlo. También suma `author` (referencia única, propia
// del schema `story`) porque el canon trae `authors` (plural, de `literaryWork`), y así queda fiel a lo
// que cualquier proyección `author->` de las queries reales espera resolver.
export const incompleteLegacyStoryDocument = {
	...withoutKey(withoutKey(legacyStoryDocument, 'badLanguage'), 'originalPublication'),
	_id: 'onoff-story-campos-requeridos-incumplidos',
	slug: slugField('story-campos-requeridos-incumplidos'),
	author: documentReference(onoffAuthorDocument._id),
};

// La migración de cuentos a obras no da de baja el cuento de origen: emite la obra al lado, copiándole
// el slug tal cual. Este documento reproduce esa coexistencia contra una obra que el corpus ya modela,
// y es la única forma de exhibir un conteo por autor que cuente dos veces la misma obra. Comparte slug
// a propósito, así que **no** entra a `onoffDatasetMock`: lo suma el spec que lo necesita.
export const migratedStoryDocument = {
	...withoutKey(canonLiteraryWork, 'authors'),
	_id: 'onoff-story-migrada',
	_type: 'story' as const,
	author: documentReference(onoffAuthorDocument._id),
};

// El mismo autor, con una obra que todavía no migró: sin ella, un conteo que devolviera solo las obras
// literarias pasaría el caso de arriba por el motivo equivocado.
export const unmigratedStoryDocument = {
	...withoutKey(canonLiteraryWork, 'authors'),
	_id: 'onoff-story-sin-migrar',
	_type: 'story' as const,
	slug: slugField('story-sin-migrar'),
	author: documentReference(onoffAuthorDocument._id),
};

export const legacyStorylistDocument = {
	...canonCollection,
	_id: 'onoff-storylist',
	_type: 'storylist' as const,
	_updatedAt: LEGACY_UPDATED_AT,
	slug: slugField('storylist'),
};

// Las tres proyecciones de abajo dereferencian el cuento en vez de proyectarlo directo (`stories[]->`,
// `mostRead[]->`, `latestReads[]->`), así que necesitan un documento contenedor propio apuntando por
// `_ref` a `incompleteLegacyStoryDocument`. Cada uno es un escenario de un solo caso, sin otro
// consumidor, y por eso no se suma a `onoffDatasetMock`.

export const storylistWithIncompleteStoryDocument = {
	...documentSystemFields('onoff-storylist-campos-incumplidos'),
	_type: 'storylist' as const,
	slug: slugField('storylist-campos-incumplidos'),
	title: 'Storylist de prueba',
	stories: [documentReference(incompleteLegacyStoryDocument._id, 'story-incompleto')],
};

// El id es literal porque `rotatingContentQuery` filtra por `_id == 'rotatingContent'`: es un singleton.
export const rotatingContentWithIncompleteStoryDocument = {
	...documentSystemFields('rotatingContent'),
	_type: 'rotatingContent' as const,
	name: 'Contenido rotativo de prueba',
	mostRead: [documentReference(incompleteLegacyStoryDocument._id, 'story-incompleto')],
};

export const landingPageWithIncompleteStoryDocument = {
	...documentSystemFields('onoff-landing-page-campos-incumplidos'),
	_type: 'landingPage' as const,
	slug: slugField('landing-page-campos-incumplidos'),
	config: '1974-24',
	latestReads: [documentReference(incompleteLegacyStoryDocument._id, 'story-incompleto')],
};
