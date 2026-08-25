import type { LandingPage } from '@sanity-types';
import { documentReference, documentSystemFields, slugField } from '../document/sanity-document.factory';
import { tagReference } from '../document/support-documents.projection';
import { onoffAuthorDocument } from '../author/author.document.projection';
import { cuentoRawTag, metaficcionRawTag } from '../../onoff-raw-tags.mock';
import { coleccionCompletaContentCampaignDocument } from './coleccion-completa-onoff.content-campaign.document';
import { palacioNueveFronterasContentCampaignDocument } from './el-palacio-de-las-nueve-fronteras.content-campaign.document';

// La semana ISO del `SYSTEM_TIMESTAMP` del corpus, para que el elenco siga hablando de un solo momento.
// Va literal y no calculada: el content lake guarda un string, y derivarla al importar metería una
// dependencia de cálculo de fechas en una capa que solo transcribe lo que Sanity tiene guardado.
const week = '1974-24';

// Sin `cards` ni `latestReads` a propósito: referencian agregados que el corpus no modela como documentos,
// y la guarda del generador aborta ante una referencia colgada. El porqué, en el README del corpus.
// `highlightedAuthors` sí entra: tanto el autor como las etiquetas existen como documentos del dataset.
export const onoffLandingPageDocument: LandingPage = {
	...documentSystemFields(`onoff-landing-page-${week}`),
	_type: 'landingPage',
	config: week,
	slug: slugField(week),
	campaigns: [
		{
			_key: 'coleccion-completa-onoff',
			_type: 'reference',
			_ref: coleccionCompletaContentCampaignDocument._id,
		},
		{
			_key: 'el-palacio-de-las-nueve-fronteras',
			_type: 'reference',
			_ref: palacioNueveFronterasContentCampaignDocument._id,
		},
	],
	highlightedAuthors: [
		{
			_key: 'francois-onoff',
			_type: 'highlightedAuthor',
			author: documentReference(onoffAuthorDocument._id),
			// Una etiqueta que el autor ya tiene y otra que no: la primera fuerza el descarte del duplicado
			// en la concatenación, la segunda comprueba que las puntuales encabecen la lista.
			additionalTags: [tagReference(cuentoRawTag.slug), tagReference(metaficcionRawTag.slug)],
		},
	],
};
